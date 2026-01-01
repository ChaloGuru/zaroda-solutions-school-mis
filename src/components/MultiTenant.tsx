import { Button } from '@/components/ui/button';
import { ArrowRight, Building, Users, Globe, Shield } from 'lucide-react';
import zarodaLogo from '@/assets/zaroda-logo.png';
const MultiTenant = () => {
  const benefits = [
    {
      icon: Building,
      title: 'Unlimited Schools',
      description: 'Add as many branches as you need without additional setup',
    },
    {
      icon: Users,
      title: 'Role-Based Access',
      description: 'Granular permissions for admins, teachers, and staff',
    },
    {
      icon: Globe,
      title: 'Centralized Dashboard',
      description: 'View all schools from a single, unified interface',
    },
    {
      icon: Shield,
      title: 'Data Isolation',
      description: 'Each school\'s data remains private and secure',
    },
  ];

  return (
    <section id="multi-tenant" className="section-padding bg-muted/30">
      <div className="container-max">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm">
              Enterprise Ready
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Built for Scale:{' '}
              <span className="text-primary">One Platform, Infinite Possibilities</span>
            </h2>

            <p className="text-lg text-muted-foreground">
              Whether you're running a single private school or managing a nationwide 
              chain of educational institutions, Zaroda's multi-tenant architecture 
              grows with you. No migrations, no headaches.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div
                  key={benefit.title}
                  className="flex items-start gap-4 animate-fade-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                    <benefit.icon size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{benefit.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="hero" size="lg">
              Explore Enterprise Plans
              <ArrowRight className="ml-2" size={18} />
            </Button>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl blur-2xl" />
            
            <div className="relative bg-background rounded-2xl border border-border p-6 shadow-card">
              {/* Mock dashboard header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <img src={zarodaLogo} alt="Zaroda" className="h-8 w-auto" />
                  <span className="font-semibold">Zaroda Dashboard</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-secondary" />
                </div>
              </div>

              {/* Mock schools list */}
              <div className="space-y-3">
                {['Main Campus', 'North Branch', 'East Campus', 'South Academy'].map(
                  (school, index) => (
                    <div
                      key={school}
                      className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                        index === 0
                          ? 'bg-primary/10 border border-primary/20'
                          : 'bg-muted/50 hover:bg-muted'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                          index === 0
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted-foreground/20 text-muted-foreground'
                        }`}
                      >
                        {school.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{school}</div>
                        <div className="text-xs text-muted-foreground">
                          {1200 - index * 200} students
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          index === 0
                            ? 'bg-secondary/20 text-secondary'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {index === 0 ? 'Active' : 'Connected'}
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Add school button */}
              <button className="w-full mt-4 py-3 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-colors font-medium">
                + Add New School
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MultiTenant;
