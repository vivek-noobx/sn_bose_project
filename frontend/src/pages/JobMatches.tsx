import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useResume } from '../context/ResumeContext';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import { Loader2, Database, AlertCircle, Percent, ArrowLeft, ClipboardList } from 'lucide-react';

interface MatchResult {
  id: string;
  score: number;
  metadata: {
    title: string;
    description: string;
    skills: string;
    company_name?: string;
  };
}

const JobMatches: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resumeData: contextResumeData } = useResume();
  const { token } = useAuth();
  
  // Prefer global context; accept router state as fallback
  const resumeData = contextResumeData ?? location.state?.resumeData;

  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, [resumeData, token]);

  const fetchMatches = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/jobs/match`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ resumeData })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch matches.');
      setMatches(data.matches || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedJobs = async () => {
    if (!token) return;
    setIsSeeding(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/jobs/seed`, { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to seed jobs.');
      alert('Mock jobs seeded successfully to ChromaDB!');
      fetchMatches();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Job Matches</h2>
          <p className="text-gray-500">Semantic AI matching against our job database.</p>
        </div>
        <button
          onClick={handleSeedJobs}
          disabled={isSeeding}
          className="px-4 py-2 bg-white/[0.04] border border-white/[0.06] text-gray-300 hover:bg-white/[0.08] rounded-xl text-sm font-semibold transition-colors flex items-center disabled:opacity-50"
        >
          {isSeeding ? <Loader2 className="w-4 h-4 mr-2 animate-spin text-orange-400" /> : <Database className="w-4 h-4 mr-2 text-orange-400" />}
          Seed Mock Jobs
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 text-red-400 rounded-xl flex items-center border border-red-500/20">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-16 text-center flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
          <h3 className="text-lg font-bold text-white">Calculating semantic matches...</h3>
          <p className="text-gray-500 text-sm mt-2 font-medium">Running vector similarity search across all open positions.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <button 
            onClick={() => navigate(-1)}
            className="text-sm text-gray-500 hover:text-white flex items-center mb-6 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </button>

          {matches.length === 0 ? (
            <div className="bg-white/[0.03] p-12 rounded-2xl border border-white/[0.06] text-center space-y-4">
              <p className="text-gray-500 font-medium">No job matches found in the vector database.</p>
              <button 
                onClick={handleSeedJobs}
                className="px-5 py-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-orange-500/20"
              >
                Seed Mock Jobs First
              </button>
            </div>
          ) : (
            matches.map((match) => (
              <div key={match.id} className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6 flex flex-col md:flex-row md:items-center gap-6 hover:border-orange-500/20 transition-colors">
                
                {/* Match Score Circle */}
                <div className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-full border-4 border-orange-500/30 bg-orange-500/5">
                  <span className="text-2xl font-black text-white flex items-center">
                    {match.score}<Percent className="w-4 h-4 text-gray-400" />
                  </span>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Match</span>
                </div>

                {/* Job Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-white mb-1">{match.metadata.title}</h3>
                  {match.metadata.company_name && (
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{match.metadata.company_name}</p>
                  )}
                  <p className="text-sm text-gray-400 mb-3 leading-relaxed line-clamp-2">{match.metadata.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {match.metadata.skills.split(', ').map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-white/5 text-gray-300 rounded-lg text-xs font-bold border border-white/10">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <button 
                    onClick={() => navigate('/dashboard/assessment', { state: { resumeData, jobId: match.id, jobRole: match.metadata.title, jobDescription: match.metadata.description } })}
                    className="w-full md:w-auto px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white rounded-xl font-bold transition-all flex items-center shadow-lg shadow-orange-500/20"
                  >
                    <ClipboardList className="w-4 h-4 mr-2" />
                    Take Assessment
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default JobMatches;
