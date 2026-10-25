import React from 'react';
import {
  User,
  Briefcase,
  Upload,
  Brain,
  ClipboardList,
  Award,
  UserPlus,
  FilePlus,
  Users,
  BarChart3,
  CheckCircle,
  type LucideIcon,
} from 'lucide-react';

interface TimelineStep {
  number: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

const candidateSteps: TimelineStep[] = [
  {
    number: 1,
    title: 'Upload Resume',
    description: 'Upload your existing resume in PDF, DOCX, or text format to get started.',
    icon: Upload,
  },
  {
    number: 2,
    title: 'AI Extracts Information',
    description: 'Our AI engine extracts your skills, work history, education, and credentials.',
    icon: Brain,
  },
  {
    number: 3,
    title: 'Discover Relevant Jobs',
    description: 'Explore curated job recommendations ranked by semantic vector similarity.',
    icon: Briefcase,
  },
  {
    number: 4,
    title: 'Complete Assessments',
    description: 'Demonstrate your capabilities through adaptive technical evaluations.',
    icon: ClipboardList,
  },
  {
    number: 5,
    title: 'Receive Results',
    description: 'Get verified skill scores and direct visibility to prospective employers.',
    icon: Award,
  },
];

const recruiterSteps: TimelineStep[] = [
  {
    number: 1,
    title: 'Create Account',
    description: 'Set up your recruiter profile and company workspace in minutes.',
    icon: UserPlus,
  },
  {
    number: 2,
    title: 'Publish Opportunities',
    description: 'Post open roles with custom required skills and technical criteria.',
    icon: FilePlus,
  },
  {
    number: 3,
    title: 'Review Candidates',
    description: 'Browse ranked candidates with AI-generated skill summaries and match scores.',
    icon: Users,
  },
  {
    number: 4,
    title: 'Evaluate Results',
    description: 'Inspect comprehensive candidate assessment metrics and code submissions.',
    icon: BarChart3,
  },
  {
    number: 5,
    title: 'Better Hiring Decisions',
    description: 'Make confident, objective hiring decisions backed by verified data.',
    icon: CheckCircle,
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="relative bg-black py-24 md:py-32 overflow-hidden">
      {/* Subtle background gradient accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-60"
        style={{
          background: 'radial-gradient(circle, rgba(234, 88, 12, 0.07) 0%, rgba(245, 158, 11, 0.03) 50%, transparent 70%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-60"
        style={{
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.07) 0%, rgba(234, 88, 12, 0.03) 50%, transparent 70%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-white text-center tracking-tight">
            How{' '}
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-amber-300 bg-clip-text text-transparent">
              TalentAI
            </span>{' '}
            Works
          </h2>
          <p className="mt-4 text-gray-400 text-center max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            A seamless, transparent journey connecting skilled candidates with forward-thinking recruiters through intelligent automation.
          </p>
        </div>

        {/* Two Journey Tracks Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Candidate Journey */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                <User className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-orange-400 tracking-tight">
                For Candidates
              </h3>
            </div>

            <div className="space-y-0">
              {candidateSteps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div key={step.number} className="flex flex-col">
                    <div className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:border-orange-500/20 hover:bg-white/[0.06] transition-all duration-300 group">
                      <div className="flex items-start sm:items-center gap-4">
                        {/* Step number circle */}
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-sm">
                          {step.number}
                        </div>

                        {/* Icon */}
                        <div className="p-2 rounded-lg bg-white/[0.04] text-gray-400 group-hover:text-orange-400 transition-colors shrink-0">
                          <StepIcon className="w-5 h-5 text-gray-400 group-hover:text-orange-400 transition-colors" />
                        </div>

                        {/* Step details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-semibold text-base tracking-tight">
                            {step.title}
                          </h4>
                          <p className="text-gray-400 text-sm mt-0.5 leading-snug">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Connecting line between steps */}
                    {index < candidateSteps.length - 1 && (
                      <div className="w-px h-6 bg-gradient-to-b from-orange-500/50 to-transparent mx-auto my-1" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recruiter Journey */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Briefcase className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold text-amber-400 tracking-tight">
                For Recruiters
              </h3>
            </div>

            <div className="space-y-0">
              {recruiterSteps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div key={step.number} className="flex flex-col">
                    <div className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:border-orange-500/20 hover:bg-white/[0.06] transition-all duration-300 group">
                      <div className="flex items-start sm:items-center gap-4">
                        {/* Step number circle */}
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-sm">
                          {step.number}
                        </div>

                        {/* Icon */}
                        <div className="p-2 rounded-lg bg-white/[0.04] text-gray-400 group-hover:text-amber-400 transition-colors shrink-0">
                          <StepIcon className="w-5 h-5 text-gray-400 group-hover:text-amber-400 transition-colors" />
                        </div>

                        {/* Step details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-semibold text-base tracking-tight">
                            {step.title}
                          </h4>
                          <p className="text-gray-400 text-sm mt-0.5 leading-snug">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Connecting line between steps */}
                    {index < recruiterSteps.length - 1 && (
                      <div className="w-px h-6 bg-gradient-to-b from-orange-500/50 to-transparent mx-auto my-1" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
