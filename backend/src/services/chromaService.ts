import { ChromaClient } from 'chromadb';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

// Note: Ensure your ChromaDB server is running locally on port 8000
const client = new ChromaClient({
  path: "http://localhost:8000"
});

const COLLECTION_NAME = "jobs_collection";

export const getEmbeddings = () => {
  return new GoogleGenerativeAIEmbeddings({
    model: 'gemini-embedding-001',
    apiKey: process.env.GEMINI_API_KEY,
  });
};

export const initChromaCollection = async () => {
  try {
    const collection = await client.getOrCreateCollection({
      name: COLLECTION_NAME,
      metadata: { "hnsw:space": "cosine" },
      embeddingFunction: { generate: async () => [] }
    });
    return collection;
  } catch (error) {
    console.error("Error initializing Chroma collection:", error);
    throw error;
  }
};

export const addJobsToCollection = async (jobs: any[]) => {
  const collection = await initChromaCollection();
  const embeddings = getEmbeddings();

  const ids = jobs.map(job => job.id);
  const documents = jobs.map(job => `${job.title}\n${job.description}\n${job.skills.join(", ")}`);
  const metadatas = jobs.map(job => {
    const meta: any = {
      title: job.title,
      description: job.description,
      skills: job.skills.join(", ")
    };
    if (job.company_name) meta.company_name = job.company_name;
    return meta;
  });

  // Generate embeddings using Gemini
  const vectors = await embeddings.embedDocuments(documents);

  await collection.add({
    ids,
    embeddings: vectors,
    metadatas,
    documents
  });

  return ids.length;
};

export const deleteJobFromCollection = async (jobId: string) => {
  try {
    const collection = await initChromaCollection();
    await collection.delete({ ids: [jobId] });
    return true;
  } catch (error) {
    console.error(`Error deleting job ${jobId} from Chroma collection:`, error);
    // Ignore error if job not found in Chroma
    return false;
  }
};

export const searchMatchingJobs = async (candidateProfile: string, nResults: number = 3) => {
  const collection = await initChromaCollection();
  const embeddings = getEmbeddings();

  // Generate embedding for the candidate
  const queryVector = await embeddings.embedQuery(candidateProfile);

  // Search ChromaDB
  const results = await collection.query({
    queryEmbeddings: [queryVector],
    nResults: nResults,
  });

  return results;
};
