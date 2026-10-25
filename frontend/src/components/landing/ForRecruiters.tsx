import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Users, BarChart3, Briefcase, Star } from 'lucide-react';

export const ForRecruiters: React.FC = () => {
  const recruiterFeatures = [
    'Create and manage job postings',
    'Discover relevant candidate profiles',
    'Review technical assessment results',
    'Make informed screening decisions',
  ];

  return (
    <section id="for-recruiters" className="relative bg-black py-24 md:py-32 overflow-hidden">
      {/* Background radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[140px] opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.4) 0%, rgba(234, 88, 12, 0.1) 70%, transparent 100%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side: Content */}
          <div className="flex flex-col items-start order-2 lg:order-1">
            <span className="text-amber-400 font-bold text-sm tracking-widest uppercase mb-3">
              FOR RECRUITERS
            </span>

            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-8">
              Find Exceptional Talent, Efficiently
            </h2>

            {/* Feature List */}
            <ul className="space-y-4 mb-10 w-full">
              {recruiterFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-gray-300 leading-relaxed font-normal">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <Link
              to="/register"
              className="inline-flex items-center justify-center bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              Find Talent →
            </Link>
          </div>

          {/* Right Side: Glassmorphism Dashboard Preview */}
          <div className="relative group order-1 lg:order-2">
            {/* Ambient glow behind card */}
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-amber-600/20 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition duration-700 pointer-events-none" />

            <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-2xl">
              {/* Decorative Header */}
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                  <span className="ml-2 text-xs font-mono text-gray-500">recruiter_dashboard.tsx</span>
                </div>
                <div className="hidden sm:grid grid-cols-3 gap-1 opacity-30">
                  {[...Array(9)].map((_, i) => (
                    <span key={i} className="w-1 h-1 rounded-full bg-amber-400" />
                  ))}
                </div>
              </div>

              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-white font-semibold text-lg">Candidate Pipeline</h4>
                  <p className="text-xs text-gray-400">3 candidates matched to your roles</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/[0.02] border border-white/[0.06] px-3 py-1.5 rounded-lg">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>Active Pipeline</span>
                </div>
              </div>

              {/* Mock Candidate List */}
              <div className="space-y-3 mb-6">
                {/* Candidate 1 */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5 flex items-center justify-between hover:border-amber-500/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-white">
                      SC
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-white">Sarah Chen</h5>
                      <p className="text-[11px] text-gray-400">Full-Stack Engineer</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                      95%
                    </span>
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                </div>

                {/* Candidate 2 */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5 flex items-center justify-between hover:border-amber-500/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center text-xs font-bold text-white">
                      JR
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-white">James Rivera</h5>
                      <p className="text-[11px] text-gray-400">ML Engineer</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                      88%
                    </span>
                  </div>
                </div>

                {/* Candidate 3 */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5 flex items-center justify-between hover:border-amber-500/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-orange-500/20 to-red-500/20 border border-orange-500/30 flex items-center justify-center text-xs font-bold text-white">
                      LP
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-white">Lisa Park</h5>
                      <p className="text-[11px] text-gray-400">Backend Developer</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-full">
                      82%
                    </span>
                  </div>
                </div>
              </div>

              {/* Assessment Score Summary Bar */}
              <div className="bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold tracking-wider uppercase text-gray-400 flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                    Average Assessment Score
                  </span>
                  <span className="text-sm font-bold text-amber-400">87%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-orange-400 rounded-full"
                    style={{ width: '87%' }}
                  />
                </div>
              </div>

              {/* View All Button */}
              <div className="mt-4 flex justify-center">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                  <span>2 active job postings</span>
                  <span className="text-gray-600">•</span>
                  <span>3 candidates in pipeline</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForRecruiters;
