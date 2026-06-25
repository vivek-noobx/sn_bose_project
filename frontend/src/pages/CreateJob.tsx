import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Building2, AlignLeft, Tags, Loader2, ArrowLeft } from 'lucide-react';

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
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <p className="text-red-500 font-bold">Unauthorized. Recruiters only.</p>
        <button onClick={() => navigate('/')} className="text-accent-teal hover:underline">Go back to Dashboard</button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:5001/api/jobs', {
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
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center space-x-4 mb-6">
        <button 
          onClick={() => navigate('/')}
          className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-primary-dark"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-primary-dark">Post a New Job</h2>
          <p className="text-slate-500 text-sm mt-1">Create a custom job description. AI assessments will automatically adapt to it.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-accent-teal/20 shadow-sm p-6 md:p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-bold rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center">
                <Building2 className="w-4 h-4 mr-2" /> Company Name
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-teal text-primary-dark font-medium transition-shadow"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center">
                <Briefcase className="w-4 h-4 mr-2" /> Job Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-teal text-primary-dark font-medium transition-shadow"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center">
              <Tags className="w-4 h-4 mr-2" /> Required Skills
            </label>
            <input
              type="text"
              required
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. React, Node.js, TypeScript (comma separated)"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-teal text-primary-dark font-medium transition-shadow"
            />
            <p className="text-xxs text-slate-400 font-bold">Candidates with these skills will be matched to your job.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center">
              <AlignLeft className="w-4 h-4 mr-2" /> Job Description
            </label>
            <textarea
              required
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the role, responsibilities, and specific technologies. The AI will use this exact text to formulate test scenarios."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-teal text-primary-dark font-medium transition-shadow resize-y"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-8 py-3 bg-accent-seafoam text-primary-dark font-bold rounded-xl shadow-md hover:bg-accent-seafoam/90 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
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
