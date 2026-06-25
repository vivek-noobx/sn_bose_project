import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { addJobsToCollection, searchMatchingJobs, deleteJobFromCollection } from '../services/chromaService';
import { get } from '../services/db';

// Mock Data representing external API jobs
const MOCK_JOBS = [
  {
    id: "job_1",
    title: "Senior React Developer",
    description: "We are looking for a Senior React Developer to build scalable web applications. Must have strong experience with React, TypeScript, and state management libraries. Experience with Tailwind CSS is a plus.",
    skills: ["React", "TypeScript", "Tailwind CSS", "JavaScript", "Frontend Development"]
  },
  {
    id: "job_2",
    title: "Backend Node.js Engineer",
    description: "Join our core infrastructure team to build robust APIs using Node.js and Express. Strong knowledge of RESTful services, database design (MongoDB/PostgreSQL), and serverless architecture is required.",
    skills: ["Node.js", "Express", "MongoDB", "PostgreSQL", "REST API", "Backend"]
  },
  {
    id: "job_3",
    title: "Data Scientist / AI Engineer",
    description: "Exciting opportunity for a Data Scientist to work on GenAI solutions. Must be proficient in Python, PyTorch, LangChain, and vector databases like ChromaDB or Pinecone.",
    skills: ["Python", "PyTorch", "Machine Learning", "LangChain", "Vector Databases", "AI"]
  },
  {
    id: "job_4",
    title: "Full Stack Developer",
    description: "Looking for a versatile full stack developer comfortable with both React and Node.js. You will be responsible for end-to-end feature delivery in our SaaS product.",
    skills: ["React", "Node.js", "TypeScript", "Full Stack", "MongoDB", "AWS"]
  }
];

export const seedJobs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const count = await addJobsToCollection(MOCK_JOBS);
    res.status(200).json({ message: `Successfully seeded ${count} jobs into ChromaDB.` });
  } catch (error: any) {
    console.error("Error seeding jobs:", error);
    res.status(500).json({ error: "Failed to seed jobs.", details: error.message });
  }
};

export const createJob = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { company_name, title, description, skills } = req.body;
    
    if (!company_name || !title || !description || !skills) {
      res.status(400).json({ error: 'All fields are required.' });
      return;
    }

    const jobId = `job_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Store in SQLite
    const { run } = await import('../services/db');
    await run(
      'INSERT INTO jobs (id, recruiter_id, company_name, title, description, skills) VALUES (?, ?, ?, ?, ?, ?)',
      [jobId, userId, company_name, title, description, skills]
    );

    // Store in ChromaDB for semantic matching
    const skillsArray = skills.split(',').map((s: string) => s.trim()).filter(Boolean);
    const jobObject = {
      id: jobId,
      title,
      description,
      skills: skillsArray,
      company_name
    };
    
    // We update chromaService to optionally accept company_name metadata
    await addJobsToCollection([jobObject]);

    res.status(201).json({
      message: 'Job created successfully',
      job: jobObject
    });
  } catch (error: any) {
    console.error("Error creating job:", error);
    res.status(500).json({ error: "Failed to create job.", details: error.message });
  }
};

export const getRecruiterJobs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { all } = await import('../services/db');
    const jobs = await all('SELECT * FROM jobs WHERE recruiter_id = ? ORDER BY created_at DESC', [userId]);

    res.status(200).json({
      message: 'Jobs retrieved successfully',
      data: jobs
    });
  } catch (error: any) {
    console.error("Error retrieving jobs:", error);
    res.status(500).json({ error: "Failed to retrieve jobs.", details: error.message });
  }
};

export const matchJobs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    let resumeData = req.body?.resumeData;
    const userId = req.user?.id;
    
    // If resumeData is not in request body, retrieve latest from database
    if (!resumeData && userId) {
      const storedResume = await get(
        'SELECT parsed_json FROM resumes WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
        [userId]
      );
      if (storedResume) {
        resumeData = JSON.parse(storedResume.parsed_json);
      }
    }

    if (!resumeData) {
      res.status(400).json({ error: "resumeData is required. Please upload a resume first." });
      return;
    }

    // Combine candidate profile into a rich text representation for embedding
    const profileString = `
      Skills: ${resumeData.skills?.join(", ") || ""}
      Experience: ${resumeData.experience?.map((e: any) => `${e.role} at ${e.company}. ${e.highlights?.join(" ")}`).join("\n") || ""}
      Education: ${resumeData.education?.map((e: any) => `${e.degree} at ${e.institution}`).join("\n") || ""}
      Projects: ${resumeData.projects?.map((p: any) => `${p.title}: ${p.description}`).join("\n") || ""}
    `;

    const searchResults = await searchMatchingJobs(profileString, 3);
    
    // Format results to include match score
    const formattedMatches = searchResults.ids[0].map((id, index) => {
      const distance = searchResults.distances ? searchResults.distances[0][index] : 0;
      const score = Math.max(0, Math.round((1 - (distance || 0)) * 100)); // basic approximation for cosine distance
      
      return {
        id,
        score,
        metadata: searchResults.metadatas[0][index],
        document: searchResults.documents[0][index]
      };
    });

    // Sort by score descending
    formattedMatches.sort((a, b) => b.score - a.score);

    res.status(200).json({
      message: "Job matching complete.",
      matches: formattedMatches
    });

  } catch (error: any) {
    console.error("Error matching jobs:", error);
    res.status(500).json({ error: "Failed to match jobs.", details: error.message });
  }
};

export const deleteJob = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const jobId = req.params.id as string;

    if (!userId || req.user?.role !== 'recruiter') {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { get, run } = await import('../services/db');
    
    // Check if the job belongs to this recruiter
    const job = await get('SELECT * FROM jobs WHERE id = ? AND recruiter_id = ?', [jobId, userId]);
    if (!job) {
      res.status(404).json({ error: 'Job not found or unauthorized to delete.' });
      return;
    }

    // Delete from SQLite
    await run('DELETE FROM jobs WHERE id = ?', [jobId]);

    // Delete from ChromaDB
    await deleteJobFromCollection(jobId);

    res.status(200).json({ message: 'Job successfully deleted.' });
  } catch (error: any) {
    console.error("Error deleting job:", error);
    res.status(500).json({ error: "Failed to delete job.", details: error.message });
  }
};

export const getJobCandidates = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const jobId = req.params.id as string;

    if (!userId || req.user?.role !== 'recruiter') {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { get, all } = await import('../services/db');
    
    // Verify job ownership
    const job = await get('SELECT * FROM jobs WHERE id = ? AND recruiter_id = ?', [jobId, userId]);
    if (!job) {
      res.status(404).json({ error: 'Job not found or unauthorized to access.' });
      return;
    }

    // Get assessments for this job joined with user details and parsed resume json
    // Since evaluations are stored as JSON strings, we'll parse them in JS map
    const candidatesQuery = `
      SELECT 
        a.*,
        u.name as candidate_name,
        u.email as candidate_email,
        r.parsed_json as resume_data,
        r.file_name as resume_file_name
      FROM assessments a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN resumes r ON a.resume_id = r.id
      WHERE a.job_id = ?
      ORDER BY a.score DESC
    `;

    const candidates = await all(candidatesQuery, [jobId]);

    // Parse JSON strings back into objects
    const formattedCandidates = candidates.map((cand: any) => ({
      ...cand,
      questions: JSON.parse(cand.questions || '{}'),
      answers: JSON.parse(cand.answers || '{}'),
      evaluation: JSON.parse(cand.evaluation || '{}'),
      resume_data: cand.resume_data ? JSON.parse(cand.resume_data) : null
    }));

    res.status(200).json({
      message: 'Job candidates retrieved successfully',
      data: formattedCandidates
    });
  } catch (error: any) {
    console.error("Error retrieving job candidates:", error);
    res.status(500).json({ error: "Failed to retrieve job candidates.", details: error.message });
  }
};
