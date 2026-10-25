import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const productLinks = [
  { name: 'Features', href: '#features' },
  { name: 'How It Works', href: '#how-it-works' },
  { name: 'For Candidates', href: '#for-candidates' },
  { name: 'For Recruiters', href: '#for-recruiters' },
];

const getStartedLinks = [
  { name: 'Sign Up', to: '/register' },
  { name: 'Login', to: '/login' },
];

const techStack = ['React', 'TypeScript', 'Node.js', 'LangChain', 'ChromaDB'];

export const Footer: React.FC = () => {
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.getElementById(href.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-black border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-8 py-16">
        {/* Top Section: 4-Column Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {/* Column 1: Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-400 p-[1px] flex items-center justify-center">
                <div className="w-full h-full bg-black/90 rounded-[7px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                </div>
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Talent<span className="bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">AI</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              AI-Powered Resume Intelligence & Adaptive Job Matching System. Connecting talent with opportunity through intelligent automation.
            </p>
          </div>

          {/* Column 2: Product */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Product</h3>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => handleAnchorClick(e, link.href)}
                    className="text-gray-500 hover:text-white text-sm transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Get Started */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Get Started</h3>
            <ul className="space-y-3">
              {getStartedLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.to}
                    className="text-gray-500 hover:text-white text-sm transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Technology */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Technology</h3>
            <ul className="space-y-3">
              {techStack.map((tech) => (
                <li key={tech}>
                  <span className="text-gray-500 text-sm">{tech}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} TalentAI. All rights reserved.
          </p>
          <p className="text-gray-600 text-sm flex items-center gap-1.5">
            Built with
            <Sparkles className="w-3.5 h-3.5 text-orange-500/50" />
            AI
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
