import React from 'react';
import { FileText, GitCompareArrows, Code, Users, type LucideIcon } from 'lucide-react';

interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

const featuresData: FeatureItem[] = [
  {
    icon: FileText,
    title: 'AI Resume Intelligence',
    description: 'Extract skills, education, projects and experience from uploaded resumes using AI.',
  },
  {
    icon: GitCompareArrows,
    title: 'Semantic Job Matching',
    description: 'Match candidates with relevant opportunities using embeddings and vector similarity rather than relying only on keyword matching.',
  },
  {
    icon: Code,
    title: 'Adaptive Technical Assessments',
    description: 'Evaluate candidates through MCQs, coding questions and open-ended technical scenarios.',
  },
  {
    icon: Users,
    title: 'Intelligent Candidate Insights',
    description: 'Help recruiters review structured candidate profiles and assessment results.',
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="relative bg-black py-24 md:py-32 overflow-hidden">
      {/* Background subtle radial gradient orb (~5-10% opacity) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[850px] h-[600px] md:h-[850px] rounded-full blur-3xl opacity-70"
        style={{
          background: 'radial-gradient(circle, rgba(249, 115, 22, 0.08) 0%, rgba(245, 158, 11, 0.04) 45%, transparent 70%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-white text-center tracking-tight">
            Everything You Need for{' '}
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-amber-300 bg-clip-text text-transparent">
              Smarter
            </span>{' '}
            Recruitment
          </h2>
          <p className="mt-4 text-gray-400 text-center max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            Powerful AI-driven tools designed to streamline recruitment workflows, evaluate real technical capabilities, and match top talent with ideal opportunities.
          </p>
        </div>

        {/* 2x2 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuresData.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8 hover:border-orange-500/20 hover:bg-white/[0.06] transform hover:scale-[1.02] transition-all duration-300 overflow-hidden"
              >
                {/* Subtle top gradient glow line */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent group-hover:via-orange-500/40 transition-all duration-300" />

                {/* Icon Container */}
                <div className="inline-flex items-center justify-center bg-orange-500/10 p-3 rounded-xl text-orange-400 group-hover:text-amber-400 group-hover:bg-orange-500/15 transition-colors mb-6">
                  <Icon className="w-6 h-6" />
                </div>

                {/* Title */}
                <h3 className="text-xl md:text-2xl font-bold text-white mb-3 tracking-tight">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-400 leading-relaxed text-base">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
