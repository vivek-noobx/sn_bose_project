import React, { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { UploadCloud, File as FileIcon, X, CheckCircle2, AlertCircle, Loader2, Briefcase, GraduationCap, Code, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useResume, type ParsedResume } from '../context/ResumeContext';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

const ResumeUpload: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedResume | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { setResumeData } = useResume();
  const { token } = useAuth();

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      setFile(null);
      return false;
    }
    setError(null);
    setFile(selectedFile);
    setParsedData(null);
    return true;
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    setParsedData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processResume = async () => {
    if (!file || !token) return;
    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload-resume`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to process resume');
      }

      const result = await response.json();
      setParsedData(result.data);
      setResumeData(result.data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while connecting to the server.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans">
      <div>
        <h2 className="text-2xl font-bold text-white">Upload Resume</h2>
        <p className="text-gray-500">Upload candidate resumes for AI analysis and parsing.</p>
      </div>

      <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-8">
        {!file ? (
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer ${
              isDragging
                ? 'border-orange-500/50 bg-orange-500/5'
                : 'border-white/10 hover:border-orange-500/30 hover:bg-white/[0.02]'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileInput} accept=".pdf,application/pdf" />
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className={`p-4 rounded-full ${isDragging ? 'bg-orange-500/10 text-orange-400' : 'bg-white/[0.04] text-gray-500'}`}>
                <UploadCloud className="w-8 h-8" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white">Click or drag and drop to upload</p>
                <p className="text-sm text-gray-500 mt-1">PDF format up to 10MB</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-6 relative">
            <button onClick={removeFile} disabled={isProcessing} className="absolute top-4 right-4 text-gray-500 hover:text-white p-1 bg-white/5 rounded-full disabled:opacity-50 transition">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-[#0a0a0a] rounded-lg">
                <FileIcon className="w-8 h-8 text-orange-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-white flex items-center">
                  {file.name}
                  <CheckCircle2 className="w-4 h-4 ml-2 text-emerald-400" />
                </h4>
                <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            {!parsedData && (
              <div className="mt-6 flex justify-end">
                <button onClick={processResume} disabled={isProcessing} className="px-6 py-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-orange-500/20 flex items-center disabled:opacity-70">
                  {isProcessing ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />Parsing with AI...</>) : ('Process Resume')}
                </button>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 text-red-400 rounded-xl flex items-center border border-red-500/20">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>

      {parsedData && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-xl font-black text-white">Extraction Results</h3>
          <div className="grid grid-cols-1 gap-6">
            {/* Skills */}
            <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-6">
              <h4 className="text-base font-bold text-white mb-4 flex items-center">
                <Code className="w-5 h-5 mr-2 text-orange-400" /> Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {parsedData.skills.length > 0 ? parsedData.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-orange-500/10 text-orange-300 rounded-full text-xs font-bold border border-orange-500/20">{skill}</span>
                )) : <span className="text-gray-500 text-sm">No skills found.</span>}
              </div>
            </div>

            {/* Experience */}
            <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-6">
              <h4 className="text-base font-bold text-white mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-orange-400" /> Experience
              </h4>
              <div className="space-y-6">
                {parsedData.experience.length > 0 ? parsedData.experience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-orange-500/30 pl-4">
                    <h5 className="font-bold text-sm text-white">{exp.role}</h5>
                    <div className="flex items-center text-xs text-gray-500 mb-2 mt-0.5">
                      <span className="font-bold text-gray-400 mr-2">{exp.company}</span>
                      <span>• {exp.duration}</span>
                    </div>
                    <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                      {exp.highlights.map((highlight, hIndex) => (<li key={hIndex}>{highlight}</li>))}
                    </ul>
                  </div>
                )) : <span className="text-gray-500 text-sm">No experience found.</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Education */}
              <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-6">
                <h4 className="text-base font-bold text-white mb-4 flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-orange-400" /> Education
                </h4>
                <div className="space-y-4">
                  {parsedData.education.length > 0 ? parsedData.education.map((edu, index) => (
                    <div key={index}>
                      <h5 className="font-bold text-sm text-white">{edu.degree}</h5>
                      <p className="text-xs text-gray-500 mt-0.5">{edu.institution}</p>
                      {edu.year && <p className="text-xs text-gray-600 mt-1">{edu.year}</p>}
                    </div>
                  )) : <span className="text-gray-500 text-sm">No education found.</span>}
                </div>
              </div>

              {/* Projects */}
              <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-6">
                <h4 className="text-base font-bold text-white mb-4 flex items-center">
                  <Code className="w-5 h-5 mr-2 text-orange-400" /> Projects
                </h4>
                <div className="space-y-4">
                  {parsedData.projects.length > 0 ? parsedData.projects.map((proj, index) => (
                    <div key={index}>
                      <h5 className="font-bold text-sm text-white">{proj.title}</h5>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{proj.description}</p>
                    </div>
                  )) : <span className="text-gray-500 text-sm">No projects found.</span>}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/[0.06] mt-6">
              <button onClick={() => navigate('/dashboard/matches', { state: { resumeData: parsedData } })} className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-orange-500/20 flex items-center">
                Find Job Matches
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
