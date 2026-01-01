import { Button } from '@/components/ui/button';
import { Sparkles, Clock, Shield, Zap } from 'lucide-react';
import { useState } from 'react';
import TrialSignupDialog from './TrialSignupDialog';

const TrustBar = () => {
  const [trialOpen, setTrialOpen] = useState(false);
  
  const benefits = [
    { icon: Clock, text: '14-Day Free Trial' },
    { icon: Shield, text: 'No Credit Card Required' },
    { icon: Zap, text: 'Setup in 5 Minutes' },
  ];

  return (
    <section className="py-10 sm:py-14 bg-gradient-to-r from-kenya-black via-kenya-red to-kenya-green relative overflow-hidden">
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-kenya-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-kenya-white rounded-full blur-3xl" />
      </div>
      
      <div className="container-max px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Left content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-kenya-white/20 rounded-full text-kenya-white text-sm font-medium mb-3">
              <Sparkles size={16} className="animate-pulse-slow" />
              Limited Time Offer
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-kenya-white mb-2">
              Transform Your School Today!
            </h3>
            <p className="text-kenya-white/80 max-w-md">
              Join 500+ Kenyan schools already using Zaroda to simplify administration and boost learning outcomes.
            </p>
          </div>
          
          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {benefits.map((benefit) => (
              <div key={benefit.text} className="flex items-center gap-2 text-kenya-white">
                <div className="w-8 h-8 rounded-full bg-kenya-white/20 flex items-center justify-center">
                  <benefit.icon size={16} />
                </div>
                <span className="text-sm font-medium">{benefit.text}</span>
              </div>
            ))}
          </div>
          
          {/* CTA Button */}
          <Button 
            onClick={() => setTrialOpen(true)}
            size="lg" 
            className="bg-kenya-white text-kenya-black hover:bg-kenya-white/90 font-bold shadow-lg whitespace-nowrap"
          >
            Start Free Trial
          </Button>
        </div>
      </div>
      
      <TrialSignupDialog open={trialOpen} onOpenChange={setTrialOpen} />
    </section>
  );
};

export default TrustBar;