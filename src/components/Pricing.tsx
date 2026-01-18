import { Check, Users, GraduationCap, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import TrialSignupDialog from './TrialSignupDialog';

const Pricing = () => {
  const schoolLevels = [
    {
      level: 'ECDE Level',
      icon: Users,
      description: 'Early childhood development education centers',
      examples: ['PP1', 'PP2', 'Nursery'],
    },
    {
      level: 'Primary School',
      icon: BookOpen,
      description: 'Primary level educational institutions',
      popular: true,
      examples: ['Grade 1-6', 'Class 1-6'],
    },
    {
      level: 'Junior School',
      icon: GraduationCap,
      description: 'Junior secondary school level',
      examples: ['Grade 7-9', 'JSS'],
    },
  ];

  const features = [
    'Multi-school management',
    'Automated billing & reports',
    'Parent-Teacher portal',
    'Grade tracking system',
    'Real-time notifications',
    'Data backup & security',
  ];

  return (
    <section id="pricing" className="py-20 lg:py-32 bg-muted/30">
      <div className="container-max section-padding">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-up">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Affordable Plans for Every School
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Pay per stream at <span className="text-primary font-bold">KSH 2,088/-</span> annually. Maximum 80 learners per stream.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-teal/10 border border-teal/20">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal"></span>
              </span>
              <span className="text-teal font-semibold">14-Day Free Trial</span>
              <span className="text-muted-foreground">— No credit card required</span>
            </div>
            <TrialSignupDialog />
          </div>
        </div>

        {/* Pricing Highlight */}
        <div className="bg-gradient-to-r from-primary/10 via-teal/10 to-blue/10 rounded-2xl p-8 lg:p-12 border border-border mb-16 animate-fade-up">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary text-primary-foreground mb-6">
              <Sparkles size={40} />
            </div>
            <h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              KSH 2,088<span className="text-xl font-normal text-muted-foreground">/stream/year</span>
            </h3>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-6">
              Class teacher can subscribe the stream at <span className="text-primary font-semibold">KSH 2,088/-</span> per year or HOI can subscribe a school category e.g JS, Primary, ECDE at <span className="text-primary font-semibold">KSH 2,088/-</span> per stream per year. Maximum 80 learners per stream.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
                  <Check size={16} className="text-teal flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
            <TrialSignupDialog />
          </div>
        </div>

        {/* School Levels */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-foreground mb-2">Works for All School Levels</h3>
          <p className="text-muted-foreground">ECDE, Primary, and Junior schools are managed separately</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {schoolLevels.map((level, index) => (
            <div
              key={level.level}
              className={`relative bg-card rounded-2xl p-6 lg:p-8 shadow-soft transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fade-up ${
                level.popular ? 'ring-2 ring-primary' : 'border border-border'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {level.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  level.popular ? 'bg-primary text-primary-foreground' : 'bg-teal/10 text-teal'
                }`}>
                  <level.icon size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{level.level}</h3>
                  <p className="text-sm text-muted-foreground">{level.description}</p>
                </div>
              </div>

              {/* Price Display */}
              <div className="text-center py-6 mb-4 rounded-xl bg-muted/50">
                <span className="text-3xl font-bold text-foreground">KSH 2,088</span>
                <span className="text-muted-foreground">/stream/yr</span>
                <p className="text-sm text-muted-foreground mt-1">Max 80 learners per stream</p>
              </div>

              {/* Examples */}
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-2">Includes:</p>
                <div className="flex flex-wrap gap-2">
                  {level.examples.map((example) => (
                    <span key={example} className="px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground">
                      {example}
                    </span>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2 mb-6">
                {features.slice(0, level.popular ? 6 : 4).map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm">
                    <Check size={16} className="text-teal flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                asChild
                variant={level.popular ? 'hero' : 'heroOutline'}
                className="w-full"
              >
                <Link to="/signup">Get Started</Link>
              </Button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Pricing;
