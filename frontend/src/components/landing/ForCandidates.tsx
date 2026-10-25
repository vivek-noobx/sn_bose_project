import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Sparkles, TrendingUp, Award } from 'lucide-react';

export const ForCandidates: React.FC = () => {
  const candidateFeatures = [
    'Understand your skills through AI-powered resume analysis',
    'Discover relevant job opportunities',
    'Demonstrate your technical skills',
    'Access a more intelligent recruitment experience',
  ];

  return (
    <section id="for-candidates" className="relative bg-black py-24 md:py-32 overflow-hidden">
      {/* Background radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[140px] opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(234, 88, 12, 0.4) 0%, rgba(245, 158, 11, 0.1) 70%, transparent 100%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side: Visual Glassmorphism Mock Resume Preview Card */}
          <div className="relative group">
            {/* Ambient subtle glow behind card */}
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 via-amber-500/10 to-orange-600/20 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition duration-700 pointer-events-none" />

            <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-2xl">
              {/* Decorative Header Dots */}
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                  <span className="ml-2 text-xs font-mono text-gray-500">resume_analysis_v2.pdf</span>
                </div>
                {/* Decorative Matrix Dots */}
                <div className="hidden sm:grid grid-cols-3 gap-1 opacity-30">
                  {[...Array(9)].map((_, i) => (
                    <span key={i} className="w-1 h-1 rounded-full bg-orange-400" />
                  ))}
                </div>
              </div>

              {/* Candidate Info Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center font-bold text-white text-base">
                    AM
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg flex items-center gap-2">
                      Alex Morgan
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        AI Parsed
                      </span>
                    </h4>
                    <p className="text-xs text-gray-400">Senior Full-Stack & ML Specialist</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/[0.02] border border-white/[0.06] px-3 py-1.5 rounded-lg self-start sm:self-auto">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Resume Score: 94/100</span>
                </div>
              </div>

              {/* Match Percentage Indicator Box */}
              <div className="bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] rounded-xl p-4 sm:p-5 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold tracking-wider uppercase text-gray-400 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
                    Target Job Semantic Match
                  </span>
                  <span className="text-xs font-medium text-amber-300/90">Top 5% Candidate</span>
                </div>

                <div className="flex items-baseline justify-between mb-3">
                  <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-amber-300 bg-clip-text text-transparent font-black text-3xl sm:text-4xl">
                    92% Match
                  </span>
                  <span className="text-xs text-gray-400">Lead AI Solutions Architect</span>
                </div>

                {/* Micro Progress Bar */}
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-600 via-amber-500 to-amber-400 rounded-full"
                    style={{ width: '92%' }}
                  />
                </div>
              </div>

              {/* Skills Tags Section */}
              <div className="mb-6">
                <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-orange-400" />
                  Verified Core Skills
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                    Python
                  </span>
                  <span className="bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                    React
                  </span>
                  <span className="bg-purple-500/15 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                    Machine Learning
                  </span>
                  <span className="bg-blue-500/15 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                    TypeScript
                  </span>
                  <span className="bg-orange-500/15 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                    Vector Embeddings
                  </span>
                </div>
              </div>

              {/* Mock Resume Skeleton Lines */}
              <div className="space-y-2 pt-2 border-t border-white/[0.04]">
                <div className="h-2 bg-white/10 rounded-full w-full" />
                <div className="h-2 bg-white/10 rounded-full w-5/6" />
                <div className="h-2 bg-white/5 rounded-full w-3/4" />
              </div>
            </div>
          </div>

          {/* Right Side: Content */}
          <div className="flex flex-col items-start">
            <span className="text-orange-400 font-bold text-sm tracking-widest uppercase mb-3">
              FOR CANDIDATES
            </span>

            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-8">
              Your Skills Deserve the Right Opportunity
            </h2>

            {/* Feature List */}
            <ul className="space-y-4 mb-10 w-full">
              {candidateFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                  <span className="text-gray-300 leading-relaxed font-normal">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <Link
              to="/register"
              className="inline-flex items-center justify-center bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              Explore Opportunities →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForCandidates;
