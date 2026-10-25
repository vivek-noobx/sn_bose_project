import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import { Loader2, AlertCircle, ArrowLeft, Users, Calendar, CheckCircle2 } from 'lucide-react';
import { EvaluationReportModal } from './Dashboard';
import type { AssessmentRecord } from './Dashboard';

interface CandidateWithResume extends AssessmentRecord {
  resume_data?: {
    skills?: string[];
    education?: any[];
    projects?: any[];
    experience?: any[];
  } | null;
  resume_file_name?: string | null;
}

const JobCandidates: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  
  const [candidates, setCandidates] = useState<CandidateWithResume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedReport, setSelectedReport] = useState<AssessmentRecord | null>(null);

  useEffect(() => {
    if (user && user.role !== 'recruiter') {
      navigate('/dashboard');
      return;
    }

    const fetchCandidates = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/candidates`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || 'Failed to fetch candidates');
        setCandidates(data.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchCandidates();
    }
  }, [jobId, token, user, navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4 font-sans">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
        <p className="text-sm font-semibold text-white">Loading candidate pipeline...</p>
      </div>
    );
  }

  const avgScore = candidates.length > 0
    ? Math.round(candidates.reduce((sum, c) => sum + (c.score / (c.max_score || 100)) * 100, 0) / candidates.length)
    : 0;

  const topMatchesCount = candidates.filter(
    (c) => (c.evaluation?.overallScore ?? Math.round((c.score / (c.max_score || 100)) * 100)) >= 80
  ).length;

  const parsedResumesCount = candidates.filter((c) => !!c.resume_data).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-300 font-sans">
      <div className="flex items-center space-x-4 mb-6">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-2 bg-white/[0.04] border border-white/[0.06] text-gray-400 hover:text-white rounded-lg transition-colors"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-white flex items-center">
              <Users className="w-6 h-6 mr-2 text-orange-400" /> Job Pipeline
            </h2>
            <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full px-3 py-0.5 text-xs font-bold">
              Pipeline
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Candidates who have completed the assessment for this role.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 text-red-400" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* Stats bar */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="space-y-1">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Candidates</p>
          <p className="text-white font-bold text-2xl">{candidates.length}</p>
        </div>
        <div className="space-y-1">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Average Score</p>
          <p className="text-white font-bold text-2xl">{avgScore}%</p>
        </div>
        <div className="space-y-1">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Top Matches (80%+)</p>
          <p className="text-white font-bold text-2xl">{topMatchesCount}</p>
        </div>
        <div className="space-y-1">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Resumes Parsed</p>
          <p className="text-white font-bold text-2xl">{parsedResumesCount}</p>
        </div>
      </div>

      {/* Candidates List / Cards */}
      <div className="space-y-4">
        {candidates.length === 0 ? (
          <div className="bg-white/[0.01] border-2 border-dashed border-white/10 rounded-2xl p-12 text-center text-gray-500 space-y-3">
            <Users className="w-10 h-10 mx-auto text-gray-600 mb-2" />
            <p className="font-medium text-base">No candidates have taken the assessment for this job yet.</p>
            <p className="text-xs text-gray-600">Once candidates match and complete their adaptive assessment, they will appear in this pipeline.</p>
          </div>
        ) : (
          candidates.map((cand) => {
            const hasResume = !!cand.resume_data;
            const skillsList: string[] = cand.resume_data?.skills || [];
            const percentage = Math.round((cand.score / (cand.max_score || 100)) * 100);
            const isTopMatch = (cand.evaluation?.overallScore ?? percentage) >= 80;

            return (
              <div 
                key={cand.id} 
                className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:border-orange-500/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  {/* Top row: Name, Email & Status Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-white font-semibold text-base">
                      {cand.candidate_name || 'Anonymous Candidate'}
                    </span>
                    <span className="text-gray-500 text-xs">• {cand.candidate_email}</span>
                    
                    {hasResume ? (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Resume Parsed
                      </span>
                    ) : (
                      <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" /> No Resume
                      </span>
                    )}

                    {isTopMatch && (
                      <span className="bg-orange-500/15 text-orange-400 border border-orange-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center">
                        Top Match
                      </span>
                    )}
                  </div>

                  {/* Skills Row */}
                  {skillsList.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {skillsList.slice(0, 6).map((skill, sIdx) => (
                        <span 
                          key={sIdx} 
                          className="bg-white/5 text-gray-300 border border-white/10 rounded-full text-xs px-2.5 py-0.5"
                        >
                          {skill}
                        </span>
                      ))}
                      {skillsList.length > 6 && (
                        <span className="text-gray-500 text-xs px-1">+{skillsList.length - 6} more</span>
                      )}
                    </div>
                  )}

                  {/* Date row */}
                  <div className="flex items-center text-gray-500 text-xs">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-gray-500" />
                    <span>Evaluated on {new Date(cand.taken_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Right side: Score & Action button */}
                <div className="flex items-center gap-4 flex-shrink-0 self-end md:self-center">
                  <div className="text-right">
                    <span className="bg-orange-500/15 text-orange-400 border border-orange-500/30 font-bold px-3 py-1.5 rounded-xl text-sm inline-flex items-center">
                      {cand.score} / {cand.max_score} pts
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedReport(cand)}
                    className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 hover:opacity-95 transition-all flex items-center"
                  >
                    View AI Report
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedReport && (
        <EvaluationReportModal 
          record={selectedReport} 
          onClose={() => setSelectedReport(null)} 
        />
      )}
    </div>
  );
};

export default JobCandidates;
