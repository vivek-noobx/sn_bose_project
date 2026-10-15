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
      fetchMatches(); // Refetch
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-primary-dark">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-primary-dark">Job Matches</h2>
          <p className="text-slate-500">Semantic AI matching against our job database.</p>
        </div>
        <button
          onClick={handleSeedJobs}
          disabled={isSeeding}
          className="px-4 py-2 bg-primary-dark text-white rounded-xl text-sm font-semibold hover:bg-primary-dark/95 transition-colors flex items-center shadow-sm disabled:opacity-50"
        >
          {isSeeding ? <Loader2 className="w-4 h-4 mr-2 animate-spin text-white" /> : <Database className="w-4 h-4 mr-2 text-accent-seafoam" />}
          Seed Mock Jobs
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center border border-red-100">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-accent-teal/20 p-16 text-center flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-accent-seafoam animate-spin mb-4" />
          <h3 className="text-lg font-bold text-primary-dark">Calculating semantic matches...</h3>
          <p className="text-slate-500 text-sm mt-2 font-medium">Running vector similarity search across all open positions.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <button 
            onClick={() => navigate(-1)}
            className="text-sm text-slate-500 hover:text-primary-dark flex items-center mb-6 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </button>

          {matches.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-accent-teal/20 text-center space-y-4">
              <p className="text-slate-500 font-medium">No job matches found in the vector database.</p>
              <button 
                onClick={handleSeedJobs}
                className="px-5 py-2 bg-accent-seafoam text-primary-dark font-bold text-sm rounded-xl hover:bg-accent-seafoam/90 transition-all shadow-sm"
              >
                Seed Mock Jobs First
              </button>
            </div>
          ) : (
            matches.map((match) => (
              <div key={match.id} className="bg-white rounded-2xl shadow-sm border border-accent-teal/20 p-6 flex flex-col md:flex-row md:items-center gap-6 hover:border-accent-seafoam transition-colors">
                
                {/* Match Score Circle */}
                <div className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-full border-4 border-accent-mint bg-accent-mint/30">
                  <span className="text-2xl font-black text-primary-dark flex items-center">
                    {match.score}<Percent className="w-4 h-4 text-primary-dark" />
                  </span>
                  <span className="text-xxs font-bold text-slate-500 uppercase tracking-wider mt-1">Match</span>
                </div>

                {/* Job Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-primary-dark mb-1">{match.metadata.title}</h3>
                  {match.metadata.company_name && (
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{match.metadata.company_name}</p>
                  )}
                  <p className="text-sm text-slate-500 mb-3 leading-relaxed line-clamp-2">{match.metadata.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {match.metadata.skills.split(', ').map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-accent-mint text-primary-dark rounded-lg text-xxs font-bold border border-accent-teal/15">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <button 
                    onClick={() => navigate('/assessment', { state: { resumeData, jobId: match.id, jobRole: match.metadata.title, jobDescription: match.metadata.description } })}
                    className="w-full md:w-auto px-5 py-2.5 bg-accent-seafoam text-primary-dark rounded-xl font-bold hover:bg-accent-seafoam/90 transition-colors flex items-center shadow-sm"
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
