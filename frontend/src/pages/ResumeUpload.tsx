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
    setParsedData(null); // Reset old data
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
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to process resume');
      }

      const result = await response.json();
      setParsedData(result.data);
      setResumeData(result.data); // persist globally
    } catch (err: any) {
      setError(err.message || 'An error occurred while connecting to the server.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans text-primary-dark">
      <div>
        <h2 className="text-2xl font-bold text-primary-dark">Upload Resume</h2>
        <p className="text-slate-500">Upload candidate resumes for AI analysis and parsing.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-accent-teal/20 p-8">
        {!file ? (
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer ${
              isDragging
                ? 'border-accent-seafoam bg-accent-mint/30'
                : 'border-slate-300 hover:border-accent-teal hover:bg-slate-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileInput}
              accept=".pdf,application/pdf"
            />
            
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className={`p-4 rounded-full ${isDragging ? 'bg-accent-mint text-primary-dark' : 'bg-slate-100 text-slate-500'}`}>
                <UploadCloud className="w-8 h-8" />
              </div>
              <div>
                <p className="text-lg font-semibold text-primary-dark">
                  Click or drag and drop to upload
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  PDF format up to 10MB
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-accent-teal/30 bg-accent-mint/20 rounded-xl p-6 relative">
            <button 
              onClick={removeFile}
              disabled={isProcessing}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 bg-white rounded-full shadow-sm disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <FileIcon className="w-8 h-8 text-primary-dark" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-primary-dark flex items-center">
                  {file.name}
                  <CheckCircle2 className="w-4 h-4 ml-2 text-emerald-600" />
                </h4>
                <p className="text-sm text-slate-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            
            {!parsedData && (
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={processResume}
                  disabled={isProcessing}
                  className="px-6 py-2 bg-accent-seafoam hover:bg-accent-seafoam/90 text-primary-dark rounded-xl font-bold transition-all shadow-sm flex items-center disabled:opacity-70"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin text-primary-dark" />
                      Parsing with AI...
                    </>
                  ) : (
                    'Process Resume'
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center border border-red-100">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Render Parsed JSON Data */}
      {parsedData && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-xl font-black text-primary-dark">Extraction Results</h3>
          
          <div className="grid grid-cols-1 gap-6">
            
            {/* Skills */}
            <div className="bg-white rounded-xl shadow-sm border border-accent-teal/20 p-6">
              <h4 className="text-base font-bold text-primary-dark mb-4 flex items-center">
                <Code className="w-5 h-5 mr-2 text-accent-teal" /> Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {parsedData.skills.length > 0 ? parsedData.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-accent-mint text-primary-dark rounded-full text-xs font-bold border border-accent-seafoam/20">
                    {skill}
                  </span>
                )) : <span className="text-slate-500 text-sm">No skills found.</span>}
              </div>
            </div>

            {/* Experience */}
            <div className="bg-white rounded-xl shadow-sm border border-accent-teal/20 p-6">
              <h4 className="text-base font-bold text-primary-dark mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-accent-teal" /> Experience
              </h4>
              <div className="space-y-6">
                {parsedData.experience.length > 0 ? parsedData.experience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-accent-mint pl-4">
                    <h5 className="font-bold text-sm text-primary-dark">{exp.role}</h5>
                    <div className="flex items-center text-xs text-slate-500 mb-2 mt-0.5">
                      <span className="font-bold text-slate-700 mr-2">{exp.company}</span>
                      <span>• {exp.duration}</span>
                    </div>
                    <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                      {exp.highlights.map((highlight, hIndex) => (
                        <li key={hIndex}>{highlight}</li>
                      ))}
                    </ul>
                  </div>
                )) : <span className="text-slate-500 text-sm">No experience found.</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Education */}
              <div className="bg-white rounded-xl shadow-sm border border-accent-teal/20 p-6">
                <h4 className="text-base font-bold text-primary-dark mb-4 flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-accent-teal" /> Education
                </h4>
                <div className="space-y-4">
                  {parsedData.education.length > 0 ? parsedData.education.map((edu, index) => (
                    <div key={index}>
                      <h5 className="font-bold text-sm text-primary-dark">{edu.degree}</h5>
                      <p className="text-xs text-slate-600 mt-0.5">{edu.institution}</p>
                      {edu.year && <p className="text-xxs text-slate-400 mt-1">{edu.year}</p>}
                    </div>
                  )) : <span className="text-slate-500 text-sm">No education found.</span>}
                </div>
              </div>

              {/* Projects */}
              <div className="bg-white rounded-xl shadow-sm border border-accent-teal/20 p-6">
                <h4 className="text-base font-bold text-primary-dark mb-4 flex items-center">
                  <Code className="w-5 h-5 mr-2 text-accent-teal" /> Projects
                </h4>
                <div className="space-y-4">
                  {parsedData.projects.length > 0 ? parsedData.projects.map((proj, index) => (
                    <div key={index}>
                      <h5 className="font-bold text-sm text-primary-dark">{proj.title}</h5>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{proj.description}</p>
                    </div>
                  )) : <span className="text-slate-500 text-sm">No projects found.</span>}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200 mt-6">
              <button
                onClick={() => navigate('/matches', { state: { resumeData: parsedData } })}
                className="px-6 py-3 bg-accent-seafoam text-primary-dark rounded-xl font-bold hover:bg-accent-seafoam/90 transition-all shadow-md flex items-center"
              >
                Find Job Matches
                <ArrowRight className="w-5 h-5 ml-2 text-primary-dark" />
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
