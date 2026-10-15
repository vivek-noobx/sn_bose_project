import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useResume } from '../context/ResumeContext';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import {
  Loader2, AlertCircle, Sparkles, ChevronRight,
  ChevronLeft, CheckCircle2, Code, MessageSquare, ListChecks,
  Clock, Trophy, RotateCcw, Maximize2, Minimize2, Play, Send
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Question {
  type: 'mcq' | 'coding' | 'scenario';
  id: string;
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  options?: string[];
  correctAnswer?: string;
  language?: string;
  starterCode?: string;
  expectedOutput?: string;
  testCases?: Array<{
    input: string;
    expectedOutput: string;
    isHidden: boolean;
  }>;
  context?: string;
}

interface GeneratedTest {
  testTitle: string;
  jobRole: string;
  totalMarks: number;
  estimatedDurationMinutes: number;
  questions: Question[];
}

interface EvaluationReport {
  overallScore: number;
  maxScore: number;
  questionEvaluations: Array<{
    id: string;
    score: number;
    passed: boolean;
    feedback: string;
  }>;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  hard: 'bg-red-50 text-red-700 border-red-200',
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  mcq: <ListChecks className="w-4 h-4" />,
  coding: <Code className="w-4 h-4" />,
  scenario: <MessageSquare className="w-4 h-4" />,
};

// ── Setup Form ────────────────────────────────────────────────────────────────

interface SetupFormProps {
  resumeData: any;
  onGenerate: (jobDescription: string) => void;
  isLoading: boolean;
  error: string | null;
  initialJobDesc?: string;
}

const SetupForm: React.FC<SetupFormProps> = ({ resumeData, onGenerate, isLoading, error, initialJobDesc }) => {
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState(initialJobDesc || '');

  const quickFills = [
    { label: 'Senior React Developer', value: 'Senior React Developer with 4+ years of experience building scalable SPAs using React, TypeScript, and modern state management. Must be proficient in REST APIs and Agile methodologies.' },
    { label: 'Backend Node.js Engineer', value: 'Backend Engineer with strong Node.js, Express, and MongoDB skills. Experience with microservices, Docker, and cloud deployment is required.' },
    { label: 'Full Stack Developer', value: 'Full Stack Developer comfortable with React on the frontend and Node.js/Python on the backend. Experience with PostgreSQL and AWS is a plus.' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 font-sans text-primary-dark">
      <div>
        <h2 className="text-2xl font-bold text-primary-dark">Skill Assessments</h2>
        <p className="text-slate-500">Generate an AI-powered adaptive test tailored to your resume and job role.</p>
      </div>

      {!resumeData && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">No resume data found</p>
            <p className="text-sm text-amber-700 mt-0.5">Please upload and parse a resume first for the most accurate assessment.</p>
            <button onClick={() => navigate('/upload')} className="mt-2 text-sm text-amber-800 font-bold underline">
              Go to Upload →
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-accent-teal/20 p-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-primary-dark mb-2">Job Description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={6}
            placeholder="Paste the job description here... e.g., 'Senior React Developer with 4+ years experience in TypeScript, GraphQL, and AWS...'"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-primary-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-seafoam focus:border-transparent resize-none transition"
          />
        </div>

        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Fill</p>
          <div className="flex flex-wrap gap-2">
            {quickFills.map((qf) => (
              <button
                key={qf.label}
                onClick={() => setJobDescription(qf.value)}
                className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-primary-dark rounded-lg transition font-semibold border border-slate-200"
              >
                {qf.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center border border-red-100">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={() => onGenerate(jobDescription)}
          disabled={isLoading || !jobDescription.trim()}
          className="w-full py-3 bg-accent-seafoam hover:bg-accent-seafoam/90 text-primary-dark rounded-xl font-bold transition-all shadow-md flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin text-primary-dark" />
              Generating Adaptive Test with AI...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2 text-primary-dark" />
              Generate My Assessment
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ── Quiz Interface ────────────────────────────────────────────────────────────

interface QuizInterfaceProps {
  test: GeneratedTest;
  jobId: string;
  jobRole: string;
  jobDescription: string;
  onReset: () => void;
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({ test, jobId, jobRole, jobDescription, onReset }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { testAnswers: answers, setTestAnswers, timeRemaining, setTimeRemaining } = useResume();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationReport | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const question = test.questions[currentIndex];
  const total = test.questions.length;
  const progress = ((currentIndex + 1) / total) * 100;

  const setAnswer = (id: string, value: string) =>
    setTestAnswers((prev) => ({ ...prev, [id]: value }));

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (timeRemaining === 0 && !evaluation && !isSubmitting) {
      handleSubmitTest();
    }
  }, [timeRemaining]);

  const handleSubmitTest = async () => {
    if (isSubmitting || !token) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/assessment/submit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          test,
          answers,
          jobId,
          jobRole,
          jobDescription
        })
      });

      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error || 'Failed to grade assessment.');

      setEvaluation(resJson.data.evaluation);
      setTimeRemaining(null); // stop countdown
    } catch (err: any) {
      setSubmitError(err.message || 'Error grading assessment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <div className="max-w-md mx-auto text-center space-y-4 py-16 font-sans text-primary-dark">
        <Loader2 className="w-12 h-12 text-accent-seafoam animate-spin mx-auto" />
        <h3 className="text-xl font-bold">Grading Assessment with AI...</h3>
        <p className="text-sm text-slate-500">
          Gemini is analyzing your code syntax, checking compiler results, and grading your scenario answers.
        </p>
      </div>
    );
  }

  if (evaluation) {
    const earned = evaluation.overallScore;
    const max = evaluation.maxScore;
    const pct = Math.round((earned / max) * 100);
    const grade = pct >= 80 ? 'Excellent' : pct >= 60 ? 'Good' : pct >= 40 ? 'Average' : 'Needs Improvement';
    const gradeColor = pct >= 80 ? 'text-emerald-600' : pct >= 60 ? 'text-blue-600' : pct >= 40 ? 'text-amber-600' : 'text-red-600';

    return (
      <div className="max-w-4xl mx-auto space-y-6 py-6 font-sans text-primary-dark">
        <div className="bg-white rounded-2xl shadow-sm border border-accent-teal/20 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-mint/30 mb-4">
            <Trophy className="w-8 h-8 text-primary-dark" />
          </div>
          <h2 className="text-2xl font-black text-primary-dark mb-1">Assessment Evaluation</h2>
          <p className="text-slate-500 mb-8">{test.testTitle}</p>

          <div className={`text-6xl font-black mb-2 ${gradeColor}`}>{pct}%</div>
          <div className={`text-xl font-bold mb-2 ${gradeColor}`}>{grade}</div>
          <p className="text-slate-500 text-sm mb-6">{earned} / {max} marks</p>

          {/* Strengths and Weaknesses grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-8">
            <div className="p-5 bg-emerald-50/30 border border-emerald-100 rounded-xl">
              <h4 className="font-bold text-emerald-800 text-sm mb-3 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Strengths
              </h4>
              <ul className="list-disc list-inside text-xs text-slate-700 space-y-1.5">
                {evaluation.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="p-5 bg-red-50/20 border border-red-100 rounded-xl">
              <h4 className="font-bold text-red-800 text-sm mb-3 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1.5" /> Areas for Growth
              </h4>
              <ul className="list-disc list-inside text-xs text-slate-700 space-y-1.5">
                {evaluation.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          </div>

          {/* Recommendations */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl text-left mb-8">
            <h4 className="font-bold text-primary-dark text-sm mb-3">Actionable Recommendations</h4>
            <ul className="list-disc list-inside text-xs text-slate-600 space-y-1.5">
              {evaluation.recommendations.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>

          {/* Details list */}
          <div className="text-left border-t border-slate-100 pt-8 mb-8">
            <h4 className="font-bold text-base text-primary-dark mb-4">Question Breakdown</h4>
            <div className="space-y-4">
              {test.questions.map((q, idx) => {
                const qEval = evaluation.questionEvaluations.find(e => e.id === q.id);
                return (
                  <div key={q.id} className="p-4 rounded-xl border border-slate-100 bg-slate-5/40">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xxs font-bold text-slate-400 uppercase tracking-wide">Q{idx + 1} • {q.type}</span>
                        <h5 className="font-bold text-sm text-primary-dark mt-0.5">{q.question}</h5>
                      </div>
                      <span className={`text-xs px-2.5 py-0.5 rounded font-bold ${qEval?.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {qEval?.score} pts
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 italic bg-white p-2.5 rounded border border-slate-100 leading-relaxed">
                      AI Feedback: {qEval?.feedback}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 bg-primary-dark text-white rounded-xl text-sm font-semibold hover:bg-primary-dark/90 transition-all shadow-sm"
            >
              Back to Dashboard
            </button>
            <button
              onClick={onReset}
              className="flex items-center px-6 py-2.5 bg-accent-seafoam text-primary-dark rounded-xl text-sm font-bold hover:bg-accent-seafoam/90 transition-all shadow-sm"
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Take Another Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Format time (MM:SS)
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 font-sans text-primary-dark">
      {submitError && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center border border-red-100">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <p className="text-sm">{submitError}</p>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-accent-teal/20 p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-primary-dark truncate">{test.testTitle}</h2>
          <span className={`text-sm flex-shrink-0 ml-4 font-mono font-bold ${timeRemaining !== null && timeRemaining < 300 ? 'text-red-500 animate-pulse' : 'text-slate-600'}`}>
            <Clock className="w-4 h-4 inline-block mr-1 text-primary-dark" />
            {formatTime(timeRemaining)}
          </span>
        </div>
        <p className="text-sm text-slate-500 mb-4">{test.jobRole} · {test.totalMarks} marks total</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-slate-100 rounded-full h-2">
            <div
              className="bg-accent-seafoam h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm text-slate-500 font-bold flex-shrink-0">{currentIndex + 1}/{total}</span>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-accent-teal/20 p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-mint text-primary-dark rounded-lg text-xs font-bold border border-accent-teal/15 uppercase tracking-wider">
            {TYPE_ICONS[question.type]} {question.type === 'mcq' ? 'Multiple Choice' : question.type === 'coding' ? 'Coding' : 'Scenario'}
          </span>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border capitalize ${DIFFICULTY_COLORS[question.difficulty]}`}>
            {question.difficulty}
          </span>
          <span className="text-xs text-slate-400 ml-auto font-medium">{question.topic}</span>
        </div>

        {question.type === 'mcq' && <MCQCard q={question} answer={answers[question.id]} setAnswer={setAnswer} />}
        {question.type === 'coding' && <EnhancedCodingCard q={question} answer={answers[question.id]} setAnswer={setAnswer} token={token} />}
        {question.type === 'scenario' && <ScenarioCard q={question} answer={answers[question.id]} setAnswer={setAnswer} />}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="flex items-center px-4 py-2 text-primary-dark border border-slate-200 rounded-xl hover:bg-slate-50 transition disabled:opacity-40 font-bold"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Previous
        </button>

        {currentIndex < total - 1 ? (
          <button
            onClick={() => setCurrentIndex((i) => i + 1)}
            className="flex items-center px-6 py-2 bg-primary-dark text-white rounded-xl hover:bg-primary-dark/90 transition font-bold shadow-sm"
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        ) : (
          <button
            onClick={handleSubmitTest}
            className="flex items-center px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-bold shadow-sm animate-pulse"
          >
            Submit Test <CheckCircle2 className="w-4 h-4 ml-2" />
          </button>
        )}
      </div>

      {/* Question Navigator Dots */}
      <div className="flex flex-wrap justify-center gap-2 pt-2">
        {test.questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(i)}
            className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
              i === currentIndex
                ? 'bg-accent-seafoam text-primary-dark shadow-md scale-110 border border-accent-seafoam'
                : answers[q.id]
                ? 'bg-accent-mint text-primary-dark border border-accent-teal/30'
                : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

// ── Sub-Question Components ───────────────────────────────────────────────────

const MCQCard: React.FC<{ q: Question; answer?: string; setAnswer: (id: string, v: string) => void }> = ({ q, answer, setAnswer }) => (
  <div>
    <p className="text-primary-dark font-semibold text-lg mb-6 leading-relaxed">{q.question}</p>
    <div className="space-y-3">
      {(q.options ?? []).map((opt, i) => (
        <button
          key={i}
          onClick={() => setAnswer(q.id, opt)}
          className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all font-semibold text-sm ${
            answer === opt
              ? 'border-accent-seafoam bg-accent-mint text-primary-dark'
              : 'border-slate-200 hover:border-accent-teal/40 hover:bg-slate-50 text-slate-700'
          }`}
        >
          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-3 ${
            answer === opt ? 'bg-primary-dark text-white' : 'bg-slate-200 text-slate-600'
          }`}>
            {String.fromCharCode(65 + i)}
          </span>
          {opt}
        </button>
      ))}
    </div>
  </div>
);

const EnhancedCodingCard: React.FC<{ q: Question; answer?: string; setAnswer: (id: string, v: string) => void; token: string | null }> = ({ q, answer, setAnswer, token }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);

  const publicTestCases = q.testCases?.filter(tc => !tc.isHidden) || [];

  const handleRun = async (submitAll = false) => {
    if (!answer?.trim() || !token) return;
    setIsEvaluating(true);
    setResults(null);
    setEvalError(null);
    try {
      const testCasesToRun = submitAll ? q.testCases : publicTestCases;
      const res = await fetch(`${API_BASE_URL}/api/evaluate-code`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: answer,
          language: q.language || 'javascript',
          testCases: testCasesToRun
        })
      });
      if (!res.ok) throw new Error('Evaluation failed');
      const data = await res.json();
      setResults(data.data.results);
    } catch (err: any) {
      setEvalError(err.message || 'Error running code');
    } finally {
      setIsEvaluating(false);
    }
  };

  const editorContent = (
    <div className={`flex flex-col ${isFullscreen ? 'h-full bg-slate-900 rounded-xl overflow-hidden shadow-2xl' : ''}`}>
      <div className="flex-none h-12 bg-slate-800 flex items-center justify-between px-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-xs font-mono text-slate-400 px-2 py-1 bg-slate-700/50 rounded">{q.language ?? 'code'}</span>
        </div>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
      
      <div className="flex-1 relative bg-slate-900 min-h-[280px]">
        {/* Line Numbers */}
        <div className="absolute left-0 top-0 bottom-0 w-10 bg-slate-800/50 border-r border-slate-800 text-right pr-2 pt-4 font-mono text-xs text-slate-600 select-none overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => <div key={i} className="leading-6">{i + 1}</div>)}
        </div>
        <textarea
          value={answer || q.starterCode || ''}
          onChange={(e) => setAnswer(q.id, e.target.value)}
          spellCheck={false}
          className="absolute inset-0 w-full h-full pl-12 pr-4 pt-4 pb-4 bg-transparent text-emerald-400 font-mono text-xs leading-6 focus:outline-none focus:ring-0 resize-none z-10"
        />
      </div>

      <div className="flex-none bg-slate-800 p-3 flex justify-between items-center border-t border-slate-700">
        <div className="flex gap-1.5">
          {publicTestCases.map((_tc, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`px-3 py-1.5 text-xxs font-bold rounded transition ${activeTab === idx ? 'bg-slate-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
            >
              Case {idx + 1}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleRun(false)} disabled={isEvaluating} className="flex items-center px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg transition disabled:opacity-50">
            {isEvaluating ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Play className="w-4 h-4 mr-1.5 text-accent-seafoam" />}
            Run Code
          </button>
          {isFullscreen && (
            <button onClick={() => { handleRun(true); setIsFullscreen(false); }} disabled={isEvaluating} className="flex items-center px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition disabled:opacity-50">
              <Send className="w-4 h-4 mr-1.5" /> Submit
            </button>
          )}
        </div>
      </div>
      
      {/* Test Case Display */}
      {publicTestCases.length > 0 && (
        <div className="flex-none bg-slate-900 border-t border-slate-700 p-4 min-h-[120px]">
          <div className="text-xxs font-mono text-slate-400 mb-1">Input:</div>
          <div className="bg-slate-800/80 px-3 py-2 rounded text-xs font-mono text-slate-300 mb-3">{publicTestCases[activeTab].input}</div>
          <div className="text-xxs font-mono text-slate-400 mb-1">Expected Output:</div>
          <div className="bg-slate-800/80 px-3 py-2 rounded text-xs font-mono text-slate-300">{publicTestCases[activeTab].expectedOutput}</div>
          
          {results && results[activeTab] && (
            <div className={`mt-3 px-3 py-2 rounded border text-xs ${results[activeTab].passed ? 'bg-emerald-900/20 border-emerald-800/50 text-emerald-400' : 'bg-red-900/20 border-red-800/50 text-red-400'}`}>
              <div className="text-xxs font-black mb-1 uppercase tracking-wider">{results[activeTab].passed ? 'Passed' : 'Failed'}</div>
              <div className="font-mono">Actual: {results[activeTab].actualOutput}</div>
              {results[activeTab].error && <div className="text-xxs mt-1 text-red-300 font-mono">{results[activeTab].error}</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col p-4 animate-in fade-in duration-250">
        <div className="flex-1 flex gap-4 min-h-0">
          <div className="w-1/3 bg-slate-900 rounded-xl p-6 overflow-y-auto border border-slate-800 flex flex-col text-slate-300">
            <h2 className="text-lg font-bold text-white mb-4">Coding Question</h2>
            <div className="prose prose-invert max-w-none mb-6">
              <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-line">{q.question}</p>
              {q.expectedOutput && (
                <div className="mt-4 p-4 bg-slate-850 border border-slate-700/60 rounded-lg text-xs">
                  <span className="font-semibold text-slate-400">Expected criteria:</span> <span className="text-slate-300">{q.expectedOutput}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0 flex flex-col">
            {editorContent}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-primary-dark font-semibold text-lg mb-4 leading-relaxed">{q.question}</p>
      {editorContent}
      {evalError && <p className="text-red-500 text-sm mt-2">{evalError}</p>}
    </div>
  );
};

const ScenarioCard: React.FC<{ q: Question; answer?: string; setAnswer: (id: string, v: string) => void }> = ({ q, answer, setAnswer }) => (
  <div>
    <div className="mb-5 p-4 bg-accent-mint/30 border border-accent-teal/20 rounded-xl">
      <p className="text-xs font-bold text-primary-dark/80 uppercase tracking-wider mb-1">Scenario Context</p>
      <p className="text-xs text-slate-600 leading-relaxed">{q.context ?? 'Consider a real-world professional scenario.'}</p>
    </div>
    <p className="text-primary-dark font-semibold text-lg mb-4 leading-relaxed">{q.question}</p>
    <textarea
      value={answer || ''}
      onChange={(e) => setAnswer(q.id, e.target.value)}
      rows={7}
      placeholder="Write your detailed architectural or professional response here..."
      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-primary-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-seafoam focus:border-transparent resize-none transition"
    />
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────

const Assessment: React.FC = () => {
  const location = useLocation();
  const { 
    resumeData: contextResumeData, 
    activeTest: test, 
    setActiveTest: setTest,
    setTimeRemaining,
    setTestAnswers
  } = useResume();
  const { token } = useAuth();
  
  const resumeData = contextResumeData ?? location.state?.resumeData ?? null;
  
  // Job details passed from matches page
  const jobId = location.state?.jobId || 'job_1';
  const jobRole = location.state?.jobRole || 'Software Developer';
  const initialJobDesc = location.state?.jobDescription || '';

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const hasAutoGenerated = useRef(false);

  const handleGenerate = async (jobDescription: string) => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/generate-test`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ resumeData, jobDescription }),
      });

      const resJson = await res.json();
      if (!res.ok) {
        throw new Error(resJson.error || 'Failed to generate test');
      }

      setTest(resJson.data);
      setTimeRemaining(resJson.data.estimatedDurationMinutes * 60);
      setTestAnswers({});
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token && initialJobDesc && !hasAutoGenerated.current && !test) {
      hasAutoGenerated.current = true;
      handleGenerate(initialJobDesc);
    }
  }, [token, initialJobDesc, test]);

  if (test) {
    return (
      <QuizInterface 
        test={test} 
        jobId={jobId}
        jobRole={jobRole}
        jobDescription={initialJobDesc || test.jobRole}
        onReset={() => {
          setTest(null);
          setTimeRemaining(null);
          setTestAnswers({});
        }} 
      />
    );
  }

  return (
    <SetupForm
      resumeData={resumeData}
      onGenerate={handleGenerate}
      isLoading={isLoading}
      error={error}
      initialJobDesc={initialJobDesc}
    />
  );
};

export default Assessment;
