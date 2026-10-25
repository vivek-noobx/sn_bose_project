import React from 'react';
import { Brain, Target, ClipboardCheck, BarChart3, type LucideIcon } from 'lucide-react';

interface StatItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

const statsData: StatItem[] = [
  {
    icon: Brain,
    title: 'AI Resume Analysis',
    description: 'Intelligent skill extraction',
  },
  {
    icon: Target,
    title: 'Semantic Matching',
    description: 'Vector-based job matching',
  },
  {
    icon: ClipboardCheck,
    title: 'Adaptive Assessments',
    description: 'Multi-format evaluations',
  },
  {
    icon: BarChart3,
    title: 'Candidate Insights',
    description: 'Structured profile analytics',
  },
];

export const StatsSection: React.FC = () => {
  return (
    <section id="stats" className="bg-black border-y border-white/5 py-12 md:py-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="p-6 md:p-8 border-l border-orange-500/30 first:border-l-0 hover:bg-white/5 transition-all duration-300 rounded-xl group"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4 text-orange-400 group-hover:text-amber-400 group-hover:border-orange-500/40 group-hover:bg-orange-500/15 transition-all duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-white font-semibold text-base md:text-lg tracking-tight mb-1">
                  {stat.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
