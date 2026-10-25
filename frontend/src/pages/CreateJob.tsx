import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import { Briefcase, Building2, AlignLeft, Tags, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';

const CreateJob: React.FC = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  
  const [companyName, setCompanyName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not a recruiter
  if (user?.role !== 'recruiter') {
    return (
      <div className="max-w-md mx-auto my-12 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-12 text-center space-y-4">
        <p className="text-red-400 font-bold">Unauthorized. Recruiters only.</p>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="text-orange-400 hover:underline text-sm font-medium"
        >
          Go back to Dashboard
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ company_name: companyName, title, description, skills })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create job');
      }

      // Success
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300 font-sans pb-12">
      <div className="flex items-center space-x-4 mb-6">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-2 bg-white/[0.04] border border-white/[0.06] text-gray-400 hover:text-white rounded-lg transition-colors"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-white">Post a New Job</h2>
          <p className="text-gray-500 text-sm mt-1">
            Create a custom job description. AI assessments will automatically adapt to it.
          </p>
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold rounded-xl flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center">
                <Building2 className="w-4 h-4 mr-2 text-orange-400" /> Company Name
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 text-white placeholder-gray-600 rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 font-medium transition-all focus:outline-none"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center">
                <Briefcase className="w-4 h-4 mr-2 text-orange-400" /> Job Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 text-white placeholder-gray-600 rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 font-medium transition-all focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center">
              <Tags className="w-4 h-4 mr-2 text-orange-400" /> Required Skills
            </label>
            <input
              type="text"
              required
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. React, Node.js, TypeScript (comma separated)"
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 text-white placeholder-gray-600 rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 font-medium transition-all focus:outline-none"
            />
            <p className="text-xs text-gray-500 font-medium">Candidates with these skills will be matched to your job.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center">
              <AlignLeft className="w-4 h-4 mr-2 text-orange-400" /> Job Description
            </label>
            <textarea
              required
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the role, responsibilities, and specific technologies. The AI will use this exact text to formulate test scenarios."
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 text-white placeholder-gray-600 rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 font-medium transition-all focus:outline-none resize-y"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-white/[0.06] flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:opacity-95 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin text-white" />
                  Posting Job...
                </>
              ) : (
                'Publish Job & Start Matching'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJob;
