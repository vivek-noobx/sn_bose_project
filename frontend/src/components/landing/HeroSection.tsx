import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Brain, FileText, Briefcase, Award, CheckCircle2, ChevronRight, Code } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const handleScrollToFeatures = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById('features');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.hash = '#features';
    }
  };

  const skillTags = [
    { name: 'Python', style: { top: '34%', left: '2%', animation: 'heroFloat1 5.5s ease-in-out infinite 0.2s' } },
    { name: 'React', style: { bottom: '26%', left: '8%', animation: 'heroFloat3 6.2s ease-in-out infinite 0.9s' } },
    { name: 'SQL', style: { top: '10%', right: '28%', animation: 'heroFloat2 5.8s ease-in-out infinite 1.4s' } },
    { name: 'Node.js', style: { top: '38%', right: '4%', animation: 'heroFloat1 6.6s ease-in-out infinite 0.7s' } },
    { name: 'TypeScript', style: { bottom: '12%', left: '32%', animation: 'heroFloat2 6.0s ease-in-out infinite 0.4s' } },
    { name: 'Docker', style: { bottom: '30%', right: '8%', animation: 'heroFloat3 5.4s ease-in-out infinite 1.1s' } },
  ];

  const particleDots = [
    { top: '14%', left: '22%', size: 'w-1.5 h-1.5', opacity: 'opacity-40' },
    { top: '22%', right: '16%', size: 'w-2 h-2', opacity: 'opacity-50' },
    { top: '48%', left: '12%', size: 'w-1 h-1', opacity: 'opacity-60' },
    { top: '65%', right: '24%', size: 'w-2 h-2', opacity: 'opacity-30' },
    { bottom: '22%', left: '26%', size: 'w-1.5 h-1.5', opacity: 'opacity-40' },
    { bottom: '15%', right: '36%', size: 'w-1 h-1', opacity: 'opacity-50' },
    { top: '78%', left: '6%', size: 'w-2 h-2', opacity: 'opacity-35' },
    { top: '8%', left: '46%', size: 'w-1.5 h-1.5', opacity: 'opacity-45' },
  ];

  return (
    <section
      id="hero"
      className="relative min-h-screen bg-black overflow-hidden flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8"
    >
      {/* Custom Keyframe Animations */}
      <style>{`
        @keyframes heroFloat1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(0.6deg); }
        }
        @keyframes heroFloat2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(12px) rotate(-0.6deg); }
        }
        @keyframes heroFloat3 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-9px); }
        }
        @keyframes heroPulseGlow {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 35px rgba(249, 115, 22, 0.45), inset 0 0 15px rgba(245, 158, 11, 0.25);
          }
          50% {
            transform: scale(1.06);
            box-shadow: 0 0 65px rgba(249, 115, 22, 0.75), inset 0 0 25px rgba(245, 158, 11, 0.45);
          }
        }
        @keyframes heroDash {
          to { stroke-dashoffset: -24; }
        }
        .hero-line-animated {
          animation: heroDash 3s linear infinite;
        }
      `}</style>

      {/* Layered Gradient Orbs */}
      {/* 1. Large Red/Orange radial gradient orb (top-right area, opacity ~20-30%) */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          top: '-10%',
          right: '-5%',
          width: '680px',
          height: '680px',
          background: 'radial-gradient(circle, rgba(234, 88, 12, 0.26) 0%, rgba(220, 38, 38, 0.16) 42%, rgba(0, 0, 0, 0) 70%)',
          filter: 'blur(80px)',
          zIndex: 0,
        }}
        aria-hidden="true"
      />

      {/* 2. Smaller Amber glow (bottom-left area, opacity ~15%) */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          bottom: '-8%',
          left: '-6%',
          width: '520px',
          height: '520px',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, rgba(217, 119, 6, 0.08) 48%, rgba(0, 0, 0, 0) 72%)',
          filter: 'blur(90px)',
          zIndex: 0,
        }}
        aria-hidden="true"
      />

      {/* 3. Subtle Purple/Indigo accent (top-left area, opacity ~10%) */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          top: '5%',
          left: '2%',
          width: '440px',
          height: '440px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.06) 45%, rgba(0, 0, 0, 0) 70%)',
          filter: 'blur(100px)',
          zIndex: 0,
        }}
        aria-hidden="true"
      />

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-7xl w-full mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
        {/* Left Side: Text Content (~55% width on desktop) */}
        <div className="w-full lg:w-[55%] flex flex-col items-start text-left">
          {/* Badge / Pill */}
          <div className="border border-orange-500/30 bg-orange-500/10 text-orange-400 rounded-full px-4 py-1 text-sm inline-flex items-center gap-2 mb-6 backdrop-blur-sm shadow-sm shadow-orange-500/10">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span className="font-medium tracking-wide">AI-Powered Recruitment Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] mb-6">
            Smarter Hiring. Better Talent. Powered by{' '}
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-amber-400 bg-clip-text text-transparent">
              AI.
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-lg text-gray-400 max-w-xl leading-relaxed mb-10">
            Transform recruitment with AI-powered resume intelligence, semantic job matching, and adaptive technical assessments. Find the right talent without the traditional hiring complexity.
          </p>

          {/* Two CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
            <Link
              to="/register"
              className="bg-gradient-to-r from-orange-600 to-amber-500 text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] transition duration-200 flex items-center justify-center gap-2"
            >
              <span>Get Started</span>
              <Sparkles className="w-5 h-5" />
            </Link>

            <a
              href="#features"
              onClick={handleScrollToFeatures}
              className="border border-white/20 text-white px-8 py-4 rounded-full hover:bg-white/5 text-lg font-semibold transition duration-200 flex items-center justify-center gap-2 group"
            >
              <span>Explore TalentAI</span>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 group-hover:text-white transition-all" />
            </a>
          </div>
        </div>

        {/* Right Side: AI-Themed Interactive Visual (~45% width, hidden on mobile) */}
        <div className="hidden lg:flex lg:w-[45%] relative items-center justify-center min-h-[580px] w-full select-none">
          {/* Visual Container */}
          <div className="relative w-full max-w-[560px] h-[580px] flex items-center justify-center">
            {/* SVG Background Connection Lines */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
              viewBox="0 0 560 580"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="heroNeuralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="heroGlowLine" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.6" />
                </linearGradient>
              </defs>

              {/* Line 1: Central Brain -> Mini Resume Card (Top Left) */}
              <path
                d="M 280 290 Q 210 200 150 140"
                stroke="url(#heroNeuralGrad)"
                strokeWidth="1.5"
                strokeDasharray="6 6"
                className="hero-line-animated"
              />

              {/* Line 2: Central Brain -> Assessment Card (Top Right) */}
              <path
                d="M 280 290 Q 360 210 410 150"
                stroke="url(#heroNeuralGrad)"
                strokeWidth="1.5"
                strokeDasharray="6 6"
                className="hero-line-animated"
              />

              {/* Line 3: Central Brain -> Job Match Card (Bottom Right) */}
              <path
                d="M 280 290 Q 360 380 400 430"
                stroke="url(#heroNeuralGrad)"
                strokeWidth="1.5"
                strokeDasharray="6 6"
                className="hero-line-animated"
              />

              {/* Line 4: Central Brain -> Skill Node (Bottom Left) */}
              <path
                d="M 280 290 Q 210 370 170 410"
                stroke="url(#heroGlowLine)"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.4"
              />
            </svg>

            {/* Subtle Particle Dots */}
            {particleDots.map((dot, idx) => (
              <div
                key={idx}
                className={`absolute ${dot.size} ${dot.opacity} bg-orange-500/40 rounded-full blur-[0.5px] pointer-events-none animate-pulse`}
                style={{
                  top: dot.top,
                  left: dot.left,
                  right: dot.right,
                  bottom: dot.bottom,
                  animationDelay: `${idx * 0.4}s`,
                }}
                aria-hidden="true"
              />
            ))}

            {/* Central Glowing AI Brain */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              {/* Outer decorative dashed orbit */}
              <div className="absolute w-44 h-44 rounded-full border border-orange-500/20 border-dashed animate-[spin_25s_linear_infinite] pointer-events-none" />

              {/* Middle pulse ring */}
              <div className="absolute w-32 h-32 rounded-full border border-amber-400/30 animate-ping opacity-25 pointer-events-none" />

              {/* Glowing Core Sphere */}
              <div
                className="w-24 h-24 rounded-full bg-gradient-to-tr from-orange-600 via-amber-500 to-amber-300 p-[2px] flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-105"
                style={{
                  animation: 'heroPulseGlow 3.5s ease-in-out infinite',
                }}
              >
                <div className="w-full h-full bg-black/85 backdrop-blur-xl rounded-full flex flex-col items-center justify-center shadow-inner">
                  <Brain className="w-9 h-9 text-orange-400 drop-shadow-[0_0_12px_rgba(249,115,22,0.8)]" />
                </div>
              </div>

              {/* Brain Caption Pill */}
              <div className="mt-3 px-3 py-1 rounded-full bg-black/80 border border-orange-500/30 backdrop-blur-md shadow-lg flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-semibold text-orange-300 tracking-wider uppercase">
                  Neural Engine Active
                </span>
              </div>
            </div>

            {/* Floating Glassmorphic Card 1: Mini Resume Card (Top Left) */}
            <div
              className="absolute top-4 left-0 w-64 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl z-20"
              style={{ animation: 'heroFloat1 6.5s ease-in-out infinite' }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white leading-tight">Sarah Chen</h2>
                    <p className="text-[10px] text-gray-400">Senior Full-Stack</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Parsed
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="text-[11px] text-gray-300 font-medium flex items-center justify-between">
                  <span>Experience:</span>
                  <span className="text-gray-400">7+ Years</span>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[10px] bg-white/5 text-gray-300 px-2 py-0.5 rounded border border-white/5">React</span>
                  <span className="text-[10px] bg-white/5 text-gray-300 px-2 py-0.5 rounded border border-white/5">Python</span>
                  <span className="text-[10px] bg-white/5 text-gray-300 px-2 py-0.5 rounded border border-white/5">AWS</span>
                </div>
              </div>
            </div>

            {/* Floating Glassmorphic Card 2: Adaptive Assessment Card (Top Right) */}
            <div
              className="absolute top-8 right-0 w-56 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 shadow-2xl z-20"
              style={{ animation: 'heroFloat3 5.8s ease-in-out infinite 0.6s' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Code className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h2 className="text-[11px] font-bold text-white leading-tight">Adaptive Test</h2>
                  <p className="text-[9px] text-gray-400">System Architecture</p>
                </div>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-[10px] text-gray-400">Benchmark Score</span>
                <span className="text-xs font-bold text-amber-400">98 / 100</span>
              </div>
              <div className="mt-2 text-[10px] text-emerald-400 flex items-center gap-1 font-medium bg-emerald-500/10 rounded px-2 py-0.5 border border-emerald-500/20">
                <Award className="w-3 h-3" /> Top 2% Percentile
              </div>
            </div>

            {/* Floating Glassmorphic Card 3: Job Match Card (Bottom Right) */}
            <div
              className="absolute bottom-6 right-0 w-64 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl z-20"
              style={{ animation: 'heroFloat2 7.2s ease-in-out infinite 0.3s' }}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white leading-tight">Lead AI Architect</h2>
                    <p className="text-[10px] text-gray-400">Global FinTech</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                    95% Match
                  </span>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="w-full bg-white/10 rounded-full h-2 mb-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-orange-500 to-amber-400 h-2 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.6)]"
                  style={{ width: '95%' }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-gray-400">
                <span>Semantic & Skill Fit</span>
                <span className="text-emerald-400 font-semibold">Exceptional</span>
              </div>
            </div>

            {/* Floating Skill Tags */}
            {skillTags.map((skill) => (
              <div
                key={skill.name}
                className="absolute z-15 bg-white/5 border border-white/10 text-gray-300 rounded-full px-3 py-1 text-xs font-mono backdrop-blur-sm shadow-sm hover:border-orange-500/40 hover:text-white transition-colors cursor-default"
                style={skill.style}
              >
                {skill.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
