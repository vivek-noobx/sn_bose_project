import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface Education {
  institution: string;
  degree: string;
  year?: string;
}

interface Project {
  title: string;
  description: string;
}

interface Experience {
  company: string;
  role: string;
  duration: string;
  highlights: string[];
}

export interface ParsedResume {
  skills: string[];
  education: Education[];
  projects: Project[];
  experience: Experience[];
}

interface ResumeContextType {
  resumeData: ParsedResume | null;
  setResumeData: (data: ParsedResume | null) => void;
  
  // Assessment Persistence
  activeTest: any | null;
  setActiveTest: (test: any | null) => void;
  testAnswers: Record<string, string>;
  setTestAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  timeRemaining: number | null;
  setTimeRemaining: React.Dispatch<React.SetStateAction<number | null>>;
  candidateEmail: string | null;
  setCandidateEmail: (email: string | null) => void;
}

const ResumeContext = createContext<ResumeContextType>({
  resumeData: null,
  setResumeData: () => {},
  activeTest: null,
  setActiveTest: () => {},
  testAnswers: {},
  setTestAnswers: () => {},
  timeRemaining: null,
  setTimeRemaining: () => {},
  candidateEmail: null,
  setCandidateEmail: () => {},
});

export const useResume = () => useContext(ResumeContext);

export const ResumeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [resumeData, setResumeData] = useState<ParsedResume | null>(null);
  const [activeTest, setActiveTest] = useState<any | null>(null);
  const [testAnswers, setTestAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [candidateEmail, setCandidateEmail] = useState<string | null>(null);

  // Global countdown timer for the assessment
  useEffect(() => {
    let interval: any;
    if (activeTest && timeRemaining !== null && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev !== null && prev > 0 ? prev - 1 : 0);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTest, timeRemaining]);

  return (
    <ResumeContext.Provider value={{
      resumeData, setResumeData,
      activeTest, setActiveTest,
      testAnswers, setTestAnswers,
      timeRemaining, setTimeRemaining,
      candidateEmail, setCandidateEmail
    }}>
      {children}
    </ResumeContext.Provider>
  );
};
