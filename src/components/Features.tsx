import { Building2, CreditCard, MessageCircle, Calendar } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Building2,
      title: 'Multi-School Sync',
      description:
        'Manage multiple branches from one login. Centralize operations while maintaining individual school autonomy.',
      color: 'primary',
    },
    {
      icon: CreditCard,
      title: 'Automated Billing',
      description:
        'Seamless fee collection with automated invoicing, payment reminders, and comprehensive financial reporting.',
      color: 'secondary',
    },
    {
      icon: MessageCircle,
      title: 'Parent-Teacher Portal',
      description:
        'Real-time communication and grade tracking. Keep parents engaged with their child\'s academic journey.',
      color: 'accent',
    },
    {
      icon: Calendar,
      title: 'Timetable Generation',
      description:
        'Automatically generate and manage class timetables. Avoid conflicts and optimize teacher schedules effortlessly.',
      color: 'primary',
    },
  ];

  return (
    <section id="features" className="section-padding bg-background">
      <div className="container-max">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full text-secondary font-medium text-sm mb-6">
            Powerful Features
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Everything You Need to{' '}
            <span className="text-primary">Run Your School</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From admissions to alumni management, Zaroda provides a comprehensive 
            suite of tools designed specifically for modern educational institutions.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative bg-card rounded-2xl p-8 border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-card animate-fade-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Icon container */}
              <div
                className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:animate-float ${
                  feature.color === 'primary'
                    ? 'bg-primary/10 text-primary'
                    : feature.color === 'secondary'
                    ? 'bg-secondary/10 text-secondary'
                    : 'bg-accent/10 text-accent'
                }`}
              >
                <feature.icon size={32} strokeWidth={1.5} />
              </div>

              <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Decorative gradient */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
