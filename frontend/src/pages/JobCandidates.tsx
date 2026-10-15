import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import { Loader2, AlertCircle, ArrowLeft, Users, Calendar, CheckCircle2 } from 'lucide-react';
import { EvaluationReportModal } from './Dashboard';
import type { AssessmentRecord } from './Dashboard';

const JobCandidates: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  
  const [candidates, setCandidates] = useState<AssessmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedReport, setSelectedReport] = useState<AssessmentRecord | null>(null);

  useEffect(() => {
    if (user?.role !== 'recruiter') {
      navigate('/');
      return;
    }

    const fetchCandidates = async () => {
      setIsLoading(true);
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

    fetchCandidates();
  }, [jobId, token, user, navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <Loader2 className="w-10 h-10 text-accent-seafoam animate-spin" />
        <p className="text-sm font-semibold text-primary-dark">Loading candidate pipeline...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-300">
      <div className="flex items-center space-x-4 mb-6">
        <button 
          onClick={() => navigate('/')}
          className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-primary-dark shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-primary-dark flex items-center">
            <Users className="w-6 h-6 mr-2 text-accent-teal" /> Job Pipeline
          </h2>
          <p className="text-slate-500 text-sm mt-1">Candidates who have completed the assessment for this role.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center border border-red-100">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-accent-teal/20 shadow-sm p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-semibold">Candidate</th>
                <th className="pb-3 font-semibold">Contact Info</th>
                <th className="pb-3 font-semibold text-center">AI Score</th>
                <th className="pb-3 font-semibold">Date Evaluated</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-primary-dark">
              {candidates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 bg-slate-50/50 rounded-xl">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="w-8 h-8 text-slate-300 mb-2" />
                      <p>No candidates have taken the assessment for this job yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                candidates.map((cand) => (
                  <tr key={cand.id} className="hover:bg-slate-50/50 transition duration-150">
                    <td className="py-4 font-semibold">
                      {cand.candidate_name}
                      {cand.evaluation?.overallScore > 80 && (
                        <span className="inline-flex items-center ml-2 text-xxs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Top Match
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-slate-500 text-xs">
                      {cand.candidate_email}
                    </td>
                    <td className="py-4">
                      <div className="flex justify-center">
                        <span className="inline-flex items-center justify-center w-12 h-8 text-sm font-bold text-primary-dark bg-accent-seafoam/35 border border-accent-seafoam rounded-lg">
                          {cand.score}/{cand.max_score}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-xs text-slate-500 font-medium flex items-center mt-2">
                      <Calendar className="w-3 h-3 mr-1.5" /> {new Date(cand.taken_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => setSelectedReport(cand)}
                        className="inline-flex items-center px-4 py-2 bg-primary-dark text-white font-bold text-xs rounded-lg hover:bg-primary-dark/90 transition shadow-sm"
                      >
                        View AI Report
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
