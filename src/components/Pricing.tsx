import { Check, Users, GraduationCap, BookOpen, School } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Pricing = () => {
  const pricingTiers = [
    {
      level: 'ECDE Level',
      icon: Users,
      description: 'Early childhood development education centers',
      tiers: [
        { range: '1-100', price: 500 },
        { range: '101-200', price: 1000 },
        { range: '201-300', price: 1500 },
        { range: '301-400', price: 2000 },
        { range: '401+', price: 2500 },
      ],
    },
    {
      level: 'Primary School',
      icon: BookOpen,
      description: 'Primary level educational institutions',
      popular: true,
      tiers: [
        { range: '1-300', price: 500 },
        { range: '301-600', price: 1500 },
        { range: '601-900', price: 2000 },
        { range: '901-1200', price: 2500 },
        { range: '1201+', price: 3000 },
      ],
    },
    {
      level: 'Junior School',
      icon: GraduationCap,
      description: 'Junior secondary school level',
      tiers: [
        { range: '1-100', price: 500 },
        { range: '101-200', price: 1500 },
        { range: '201-300', price: 2000 },
        { range: '301-400', price: 2500 },
        { range: '401+', price: 3000 },
      ],
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
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pay per learner, per year. Prices in KSH. Scale as your institution grows.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-teal/10 border border-teal/20">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-teal"></span>
            </span>
            <span className="text-teal font-semibold">14-Day Free Trial</span>
            <span className="text-muted-foreground">— No credit card required</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {pricingTiers.map((tier, index) => (
            <div
              key={tier.level}
              className={`relative bg-card rounded-2xl p-6 lg:p-8 shadow-soft transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fade-up ${
                tier.popular ? 'ring-2 ring-primary' : 'border border-border'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  tier.popular ? 'bg-primary text-primary-foreground' : 'bg-teal/10 text-teal'
                }`}>
                  <tier.icon size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{tier.level}</h3>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                </div>
              </div>

              {/* Price Tiers */}
              <div className="space-y-3 mb-6">
                {tier.tiers.map((t) => (
                  <div
                    key={t.range}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
                  >
                    <span className="text-muted-foreground font-medium">
                      {t.range} learners
                    </span>
                    <span className="text-foreground font-bold">
                      KSH {t.price.toLocaleString()}/yr
                    </span>
                  </div>
                ))}
              </div>

              {/* Features */}
              <div className="space-y-2 mb-6">
                {features.slice(0, tier.popular ? 6 : 4).map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm">
                    <Check size={16} className="text-teal flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                variant={tier.popular ? 'hero' : 'heroOutline'}
                className="w-full"
              >
                Get Started
              </Button>
            </div>
          ))}
        </div>

        {/* Individual Teacher Plan */}
        <div className="bg-gradient-to-r from-primary/5 via-teal/5 to-blue/5 rounded-2xl p-8 lg:p-12 border border-border animate-fade-up">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-teal/10 flex items-center justify-center">
                <School size={32} className="text-teal" />
              </div>
            </div>
            <div className="flex-1 text-center lg:text-left">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Individual Teacher Plan
              </h3>
              <p className="text-muted-foreground max-w-2xl">
                Are you a class teacher in a school that hasn't adopted the system yet? 
                Subscribe individually at <span className="text-primary font-bold">KSH 300/= per stream annually</span> and 
                manage your single stream efficiently.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Button variant="teal" size="lg">
                Subscribe Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
