import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useResume } from '../context/ResumeContext';
import { API_BASE_URL } from '../config/api';
import { 
  Users, FileText, CheckCircle2, AlertCircle, Loader2, Award, 
  TrendingUp, Calendar, ChevronRight, X, Briefcase, Plus, Trash2
} from 'lucide-react';

interface ResumeData {
  fileName: string;
  parsedData: {
    skills: string[];
    education: Array<{ institution: string; degree: string; year?: string }>;
    projects: Array<{ title: string; description: string }>;
    experience: Array<{ company: string; role: string; duration: string; highlights: string[] }>;
  };
  createdAt: string;
}

export interface AssessmentRecord {
  id: string;
  user_id: string;
  candidate_name?: string;
  candidate_email?: string;
  test_title: string;
  job_role: string;
  score: number;
  max_score: number;
  questions: any;
  answers: any;
  evaluation: {
    overallScore: number;
    maxScore: number;
    questionEvaluations: Array<{ id: string; score: number; passed: boolean; feedback: string }>;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
  taken_at: string;
}

interface CandidateRecord {
  id: string;
  name: string;
  email: string;
  resume: ResumeData | null;
}

const Dashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { setResumeData } = useResume();
  const navigate = useNavigate();

  const [resume, setResume] = useState<ResumeData | null>(null);
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  
  // Modal states for report viewing
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentRecord | null>(null);
  
  // Recruiter view state: selected candidate details
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateRecord | null>(null);

  const isRecruiter = user?.role === 'recruiter';

  useEffect(() => {
    fetchDashboardData();
  }, [user, token]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch assessment history
      const historyRes = await fetch(`${API_BASE_URL}/api/assessment/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setAssessments(historyData.data || []);
      }

      if (isRecruiter) {
        // 2. Fetch candidates list for recruiter
        const candRes = await fetch(`${API_BASE_URL}/api/auth/candidates`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (candRes.ok) {
          const candData = await candRes.json();
          setCandidates(candData.data || []);
        }
        
        // 3. Fetch recruiter's posted jobs
        const jobsRes = await fetch(`${API_BASE_URL}/api/jobs/recruiter`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          setMyJobs(jobsData.data || []);
        }
      } else {
        // 2. Fetch candidate's resume profile
        const resumeRes = await fetch(`${API_BASE_URL}/api/resume`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resumeRes.ok) {
          const resJson = await resumeRes.json();
          setResume(resJson.data);
          setResumeData(resJson.data.parsedData); // sync context
        }
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError('Could not establish connection to server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to delete this job opening? This cannot be undone.')) {
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMyJobs(prev => prev.filter(job => job.id !== jobId));
      } else {
        alert('Failed to delete job.');
      }
    } catch (err) {
      console.error('Error deleting job:', err);
      alert('An error occurred while deleting the job.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
        <p className="text-sm font-semibold text-gray-400">Loading dashboard workspace...</p>
      </div>
    );
  }

  // ── RENDER RECRUITER DASHBOARD ───────────────────────────────────────────────
  if (isRecruiter) {
    // Stats calculations
    const totalCands = candidates.length;
    const completedTests = assessments.length;
    const avgPercentage = completedTests > 0 
      ? Math.round(assessments.reduce((acc, curr) => acc + (curr.score / curr.max_score), 0) / completedTests * 100)
      : 0;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-2xl font-black text-white">Recruiter Dashboard</h2>
            <p className="text-gray-500">Manage candidates, view assessments, and post new jobs.</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard/create-job')}
            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:from-orange-500 hover:to-amber-400 transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Post New Job
          </button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard 
            title="Active Job Postings" 
            value={myJobs.length.toString()} 
            icon={<Briefcase className="w-8 h-8" />} 
          />
          <StatCard 
            title="Total Candidates" 
            value={totalCands.toString()} 
            icon={<Users className="w-8 h-8" />} 
          />
          <StatCard 
            title="Assessments Conducted" 
            value={completedTests.toString()} 
            icon={<CheckCircle2 className="w-8 h-8" />} 
          />
          <StatCard 
            title="Average Assessment Grade" 
            value={`${avgPercentage}%`} 
            icon={<TrendingUp className="w-8 h-8" />} 
          />
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-8">
          
          {/* Candidates List Table */}
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Candidates Overview</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/[0.06]">
                  <thead>
                    <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Name</th>
                      <th className="pb-3 font-semibold">Email</th>
                      <th className="pb-3 font-semibold">Resume Status</th>
                      <th className="pb-3 font-semibold text-center">Test Count</th>
                      <th className="pb-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] text-sm text-gray-300">
                    {candidates.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-gray-500">
                          No candidates registered in the system yet.
                        </td>
                      </tr>
                    ) : (
                      candidates.map((cand) => {
                        const candAssessments = assessments.filter(a => a.user_id === cand.id);
                        return (
                          <tr key={cand.id} className="hover:bg-white/[0.02] transition duration-150">
                            <td className="py-3.5 font-semibold text-white">{cand.name}</td>
                            <td className="py-3.5 text-gray-400">{cand.email}</td>
                            <td className="py-3.5">
                              {cand.resume ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Parsed: {cand.resume.fileName}
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                                  No Resume Uploaded
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 font-bold text-center text-white">{candAssessments.length}</td>
                            <td className="py-3.5">
                              <button
                                onClick={() => setSelectedCandidate(cand)}
                                className="inline-flex items-center text-sm font-bold text-orange-400 hover:text-orange-300 transition-colors"
                              >
                                Review <ChevronRight className="w-4 h-4 ml-1" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* My Job Postings */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">My Job Postings</h3>
              <div className="space-y-4">
                {myJobs.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-6 border border-dashed border-white/10 rounded-xl">
                    You haven't posted any custom jobs yet.
                  </p>
                ) : (
                  myJobs.map((job) => (
                    <div key={job.id} className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-white">{job.title}</h4>
                        <p className="text-xs text-gray-400">{job.company_name} • <span className="text-gray-600">Posted on {new Date(job.created_at).toLocaleDateString()}</span></p>
                      </div>
                      <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <button
                          onClick={() => navigate(`/dashboard/job-candidates/${job.id}`)}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-1.5 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-lg hover:bg-orange-500/20 text-xs font-bold transition-colors"
                        >
                          <Users className="w-3.5 h-3.5 mr-1.5" /> Pipeline
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 text-xs font-bold transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Evaluations */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Recent Tests Evaluated</h3>
            <div className="space-y-4">
              {assessments.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">No test scores recorded yet.</p>
              ) : (
                assessments.slice(0, 5).map((record) => (
                  <div 
                    key={record.id} 
                    className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition cursor-pointer flex justify-between items-center gap-4"
                    onClick={() => setSelectedAssessment(record)}
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-white truncate">{record.candidate_name || 'Candidate'}</h4>
                      <p className="text-xs text-gray-400 truncate">{record.test_title}</p>
                      <p className="text-xs text-gray-600 mt-1 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" /> {new Date(record.taken_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-bold bg-orange-500/15 border border-orange-500/30 text-orange-400 px-2.5 py-1 rounded-lg whitespace-nowrap">
                        {record.score}/{record.max_score}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Candidate Detail Drawer / Modal */}
        {selectedCandidate && (
          <CandidateDetailModal 
            candidate={selectedCandidate} 
            assessments={assessments.filter(a => a.user_id === selectedCandidate.id)}
            onClose={() => setSelectedCandidate(null)}
            onOpenReport={(report) => {
              setSelectedCandidate(null);
              setSelectedAssessment(report);
            }}
          />
        )}

        {/* Evaluation Report Modal */}
        {selectedAssessment && (
          <EvaluationReportModal 
            record={selectedAssessment} 
            onClose={() => {
              setSelectedAssessment(null);
              if (selectedCandidate) {
                // If candidate detail was open, reopen it
                setSelectedCandidate(selectedCandidate);
              }
            }} 
          />
        )}
      </div>
    );
  }

  // ── RENDER CANDIDATE DASHBOARD ───────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white">Welcome back, {user?.name}!</h2>
        <p className="text-gray-500">Track your credentials, resume details, and AI skill tests here.</p>
      </div>

      {!resume ? (
        // Prompt Upload
        <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-8 text-center max-w-2xl">
          <div className="inline-flex items-center justify-center p-4 bg-orange-500/10 text-orange-400 rounded-full mb-4 shadow-sm">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Build Your AI Job Match Profile</h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
            Upload your resume in PDF format. Our LLM parser will extract structured skills, projects, and experiences to feed your job search!
          </p>
          <button 
            onClick={() => navigate('/dashboard/upload')}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:from-orange-500 hover:to-amber-400 transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Upload Your Resume
          </button>
        </div>
      ) : (
        // Render Profile Summary and History
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Resume Summary Panel */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-orange-400" /> Profile Summary
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Parsed from: {resume.fileName}</p>
                </div>
                <button
                  onClick={() => navigate('/dashboard/upload')}
                  className="text-xs font-bold text-orange-400 hover:text-orange-300 underline transition-colors"
                >
                  Update Resume
                </button>
              </div>

              {/* Skills Section */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5">Extracted Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {resume.parsedData.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-orange-500/10 text-orange-300 border border-orange-500/20 text-xs font-semibold rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience Highlights */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Recent Experience</h4>
                <div className="space-y-4">
                  {resume.parsedData.experience.slice(0, 2).map((exp, idx) => (
                    <div key={idx} className="border-l-2 border-orange-500/30 pl-4">
                      <h5 className="font-bold text-sm text-white">{exp.role}</h5>
                      <p className="text-xs text-gray-400">{exp.company} • {exp.duration}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education Highlights */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Education</h4>
                <div className="space-y-3">
                  {resume.parsedData.education.map((edu, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="font-bold text-white">{edu.degree}</span> - <span className="text-gray-400">{edu.institution}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.06] flex justify-end">
                <button
                  onClick={() => navigate('/dashboard/matches')}
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/20 hover:from-orange-500 hover:to-amber-400 transition-all"
                >
                  Find Job Matches
                </button>
              </div>
            </div>
          </div>

          {/* Candidate Assessment History list */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                <Award className="w-5 h-5 mr-2 text-orange-400" /> Skill Assessments
              </h3>
            </div>

            <div className="space-y-4">
              {assessments.length === 0 ? (
                <div className="text-center py-8 bg-white/[0.02] rounded-xl border border-dashed border-white/10">
                  <p className="text-xs text-gray-500 max-w-xs mx-auto">
                    You haven't taken any custom assessments yet. Find job matches to start testing.
                  </p>
                </div>
              ) : (
                assessments.map((a) => (
                  <div key={a.id} className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] flex flex-col space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-white leading-snug">{a.test_title}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">{a.job_role}</p>
                      </div>
                      <span className="text-xs font-bold bg-orange-500/15 border border-orange-500/30 text-orange-400 px-2.5 py-1 rounded-lg">
                        {a.score}/{a.max_score}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{new Date(a.taken_at).toLocaleDateString()}</span>
                      <button
                        onClick={() => setSelectedAssessment(a)}
                        className="text-orange-400 hover:text-orange-300 font-bold underline transition-colors"
                      >
                        View AI Report
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Evaluation Report Modal */}
      {selectedAssessment && (
        <EvaluationReportModal record={selectedAssessment} onClose={() => setSelectedAssessment(null)} />
      )}
    </div>
  );
};

// ── SUBCOMPONENTS ────────────────────────────────────────────────────────────

const StatCard = ({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) => (
  <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 flex items-center space-x-4">
    <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl">
      {icon}
    </div>
    <div>
      <p className="text-gray-500 uppercase text-xs tracking-wider font-bold">{title}</p>
      <p className="text-white text-2xl font-black mt-1">{value}</p>
    </div>
  </div>
);

// ── RECRUITER CANDIDATE DETAILS MODAL ─────────────────────────────────────────
interface CandidateDetailModalProps {
  candidate: CandidateRecord;
  assessments: AssessmentRecord[];
  onClose: () => void;
  onOpenReport: (report: AssessmentRecord) => void;
}

const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({ candidate, assessments, onClose, onOpenReport }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111] border border-white/[0.08] rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between bg-[#0d0d0d]">
          <div>
            <h3 className="text-xl font-bold text-white">{candidate.name}</h3>
            <p className="text-sm text-gray-500">{candidate.email}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-300">
          {/* Left Side: parsed resume */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 pb-2 border-b border-white/[0.06]">
              Resume Profile Details
            </h4>
            
            {candidate.resume ? (
              <>
                <div>
                  <h5 className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-2">Technical Skills</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.resume.parsedData.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-orange-500/10 text-orange-300 border border-orange-500/20 text-xs font-semibold rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-2">Experience History</h5>
                  <div className="space-y-3">
                    {candidate.resume.parsedData.experience.map((exp, idx) => (
                      <div key={idx} className="text-sm">
                        <span className="font-bold text-white">{exp.role}</span> at <span className="font-semibold text-gray-300">{exp.company}</span>
                        <p className="text-xs text-gray-500 mt-0.5">{exp.duration}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-2">Key Projects</h5>
                  <div className="space-y-3">
                    {candidate.resume.parsedData.projects.map((proj, idx) => (
                      <div key={idx} className="text-sm">
                        <h6 className="font-bold text-white">{proj.title}</h6>
                        <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-xl">
                No resume parsed for this candidate yet.
              </div>
            )}
          </div>

          {/* Right Side: assessments */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 pb-2 border-b border-white/[0.06]">
              Assessment Performance
            </h4>

            {assessments.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                Candidate has not taken any skill assessments yet.
              </div>
            ) : (
              <div className="space-y-4">
                {assessments.map((a) => (
                  <div key={a.id} className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-sm text-white truncate">{a.test_title}</h5>
                      <p className="text-xs text-gray-400 capitalize">{a.job_role}</p>
                      <span className="text-xs text-gray-600 mt-1 block">
                        {new Date(a.taken_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className="text-xs font-bold bg-orange-500/15 border border-orange-500/30 text-orange-400 px-2.5 py-0.5 rounded-lg">
                        {a.score}/{a.max_score}
                      </span>
                      <button
                        onClick={() => onOpenReport(a)}
                        className="text-xs font-bold text-orange-400 hover:text-orange-300 underline transition-colors"
                      >
                        View AI Report
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.06] flex justify-end bg-[#0d0d0d]">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ── EVALUATION REPORT DETAILED MODAL ─────────────────────────────────────────
interface EvaluationReportModalProps {
  record: AssessmentRecord;
  onClose: () => void;
}

export const EvaluationReportModal: React.FC<EvaluationReportModalProps> = ({ record, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'questions'>('overview');
  const [selectedQuestionIdx, setSelectedQuestionIdx] = useState(0);

  const evalReport = record.evaluation;
  const gradePct = Math.round((record.score / record.max_score) * 100);

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111] border border-white/[0.08] rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between bg-[#0d0d0d]">
          <div>
            <h3 className="text-lg font-black text-white truncate">{record.test_title}</h3>
            <p className="text-xs text-gray-500 capitalize">{record.job_role} • Evaluated by TalentAI LLM</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/[0.06] bg-[#0d0d0d]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3.5 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-orange-500 text-white font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            Performance Summary
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-6 py-3.5 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'questions'
                ? 'border-orange-500 text-white font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            Question Analysis
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 text-gray-300">
          
          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Score breakdown bar */}
              <div className="flex flex-col md:flex-row items-center gap-8 bg-orange-500/5 border border-orange-500/20 rounded-2xl p-6">
                <div className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-full border-4 border-orange-500/40 bg-[#0d0d0d] shadow-lg shadow-orange-500/10">
                  <span className="text-2xl font-black text-white">{gradePct}%</span>
                  <span className="text-xs font-bold text-gray-500 mt-0.5">Grade</span>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h4 className="text-lg font-bold text-white">Score details: {record.score} / {record.max_score} marks</h4>
                  <p className="text-sm text-gray-400 mt-1">
                    This skill score represents a combined assessment of Multiple Choice Question (MCQ) autogrades, 
                    AI code performance executions, and situational scenario feedback.
                  </p>
                </div>
              </div>

              {/* Strengths and Weaknesses grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Strengths */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-5">
                  <h4 className="font-bold text-emerald-400 text-sm mb-3 uppercase tracking-wider flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Candidate Strengths
                  </h4>
                  <ul className="list-disc list-inside text-sm text-emerald-200/90 space-y-2">
                    {evalReport.strengths?.map((str, idx) => <li key={idx}>{str}</li>) || <li>Analytical approach demonstrated.</li>}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-5">
                  <h4 className="font-bold text-red-400 text-sm mb-3 uppercase tracking-wider flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" /> Areas for Improvement
                  </h4>
                  <ul className="list-disc list-inside text-sm text-red-200/90 space-y-2">
                    {evalReport.weaknesses?.map((wk, idx) => <li key={idx}>{wk}</li>) || <li>Could improve depth of answers.</li>}
                  </ul>
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                <h4 className="font-bold text-white text-sm mb-3 uppercase tracking-wider">
                  Actionable Recommendations
                </h4>
                <ul className="list-disc list-inside text-sm text-gray-300 space-y-2">
                  {evalReport.recommendations?.map((rec, idx) => <li key={idx}>{rec}</li>) || <li>Continue practicing language semantics.</li>}
                </ul>
              </div>
            </div>
          )}

          {/* Tab 2: Questions analysis */}
          {activeTab === 'questions' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[50vh] min-h-[350px]">
              {/* Question list selector */}
              <div className="border border-white/[0.06] rounded-xl overflow-y-auto divide-y divide-white/[0.06] bg-[#0d0d0d]">
                {record.questions.questions.map((q: any, idx: number) => {
                  const qEval = evalReport.questionEvaluations?.find(qe => qe.id === q.id);
                  const isCorrect = qEval?.passed ?? false;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setSelectedQuestionIdx(idx)}
                      className={`w-full text-left p-3.5 transition flex justify-between items-start ${
                        selectedQuestionIdx === idx ? 'bg-white/[0.04] shadow-sm font-bold border-l-4 border-orange-500' : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <span className="text-xs font-bold text-gray-500 block uppercase">Question {idx + 1} ({q.type})</span>
                        <span className="text-sm text-white block truncate mt-0.5">{q.question}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                        isCorrect ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {qEval?.score ?? 0}pts
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected question analysis panel */}
              <div className="md:col-span-2 border border-white/[0.06] rounded-xl p-5 overflow-y-auto flex flex-col bg-[#0d0d0d]">
                {(() => {
                  const q = record.questions.questions[selectedQuestionIdx];
                  const qEval = evalReport.questionEvaluations?.find(qe => qe.id === q.id);
                  const candidateAnswer = record.answers[q.id];

                  return (
                    <div className="space-y-4">
                      {/* Q header */}
                      <div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block">{q.type} Question • Difficulty {q.difficulty}</span>
                        <h4 className="text-base font-bold text-white mt-1">{q.question}</h4>
                      </div>

                      {/* Display scenario details if scenario */}
                      {q.type === 'scenario' && q.context && (
                        <div className="bg-white/[0.02] border border-white/[0.06] p-3.5 rounded-lg text-xs text-gray-300">
                          <span className="font-bold text-gray-500 block mb-1">SCENARIO CONTEXT</span>
                          {q.context}
                        </div>
                      )}

                      {/* Candidate response */}
                      <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Submitted Response</h5>
                        {q.type === 'coding' ? (
                          <pre className="font-mono text-xs text-emerald-400 bg-black/60 border border-white/[0.06] p-3 rounded-lg overflow-x-auto">
                            {candidateAnswer || '// No answer submitted.'}
                          </pre>
                        ) : (
                          <p className="text-sm text-gray-300 leading-relaxed font-mono whitespace-pre-line bg-black/40 p-3 rounded-lg border border-white/[0.06]">
                            {candidateAnswer || 'No answer submitted.'}
                          </p>
                        )}
                      </div>

                      {/* AI evaluation result */}
                      <div className={`p-4 rounded-xl border ${qEval?.passed ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-red-500/10 border-red-500/20 text-red-300'}`}>
                        <h5 className="text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center">
                          {qEval?.passed ? (
                            <span className="text-emerald-400 font-extrabold flex items-center"><CheckCircle2 className="w-4 h-4 mr-1.5" /> AI Feedback (Passed)</span>
                          ) : (
                            <span className="text-red-400 font-extrabold flex items-center"><AlertCircle className="w-4 h-4 mr-1.5" /> AI Feedback (Incorrect/Needs Work)</span>
                          )}
                        </h5>
                        <p className="text-sm leading-relaxed text-gray-300">{qEval?.feedback || 'No feedback logged.'}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.06] flex justify-end bg-[#0d0d0d]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
