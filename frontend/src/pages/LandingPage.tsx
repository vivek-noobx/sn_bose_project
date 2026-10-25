import React from 'react';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import StatsSection from '../components/landing/StatsSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorks from '../components/landing/HowItWorks';
import ForCandidates from '../components/landing/ForCandidates';
import ForRecruiters from '../components/landing/ForRecruiters';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';

const LandingPage: React.FC = () => {
  return (
    <div className="bg-black min-h-screen font-sans overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorks />
      <ForCandidates />
      <ForRecruiters />
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;
