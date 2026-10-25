import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const CTASection: React.FC = () => {
  return (
    <section id="cta" className="relative bg-black py-28 md:py-36 overflow-hidden">
      {/* Dramatic gradient orb backgrounds */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[120px] opacity-100"
        style={{
          background: 'radial-gradient(circle, rgba(234, 88, 12, 0.2) 0%, rgba(220, 38, 38, 0.08) 40%, transparent 70%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-100"
        style={{
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 60%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 w-[350px] h-[350px] rounded-full blur-[100px] opacity-100"
        style={{
          background: 'radial-gradient(circle, rgba(249, 115, 22, 0.12) 0%, transparent 60%)',
        }}
      />

      {/* Subtle top border glow */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Sparkle Badge */}
        <div className="inline-flex items-center gap-2 border border-orange-500/30 bg-orange-500/10 text-orange-400 rounded-full px-4 py-1.5 text-sm font-medium mb-8 backdrop-blur-sm">
          <Sparkles className="w-4 h-4" />
          <span>Start your journey today</span>
        </div>

        {/* Heading */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-6">
          Ready to Make Hiring{' '}
          <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-amber-300 bg-clip-text text-transparent">
            Smarter?
          </span>
        </h2>

        {/* Description */}
        <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto mb-10">
          Whether you're looking for your next opportunity or searching for exceptional talent,
          TalentAI helps bring the right people and opportunities together.
        </p>

        {/* Two CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Get Started
          </Link>
          <Link
            to="/login"
            className="border border-white/20 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/5 hover:border-white/30 transition-all duration-300"
          >
            Login
          </Link>
        </div>
      </div>

      {/* Subtle bottom border glow */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
    </section>
  );
};

export default CTASection;
