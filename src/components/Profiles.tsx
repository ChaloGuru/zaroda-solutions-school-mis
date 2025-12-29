import { Users, GraduationCap, UserCheck, Building } from 'lucide-react';

const Profiles = () => {
  const profiles = [
    {
      icon: Building,
      title: 'Administrators',
      description: 'Complete oversight of school operations, finance, and reporting.',
      features: ['Dashboard analytics', 'Financial reports', 'Staff management'],
      color: 'primary',
    },
    {
      icon: GraduationCap,
      title: 'Teachers',
      description: 'Streamlined tools for attendance, grading, and communication.',
      features: ['Grade management', 'Attendance tracking', 'Lesson planning'],
      color: 'secondary',
    },
    {
      icon: Users,
      title: 'Parents',
      description: 'Stay connected with real-time updates on your child\'s progress.',
      features: ['Fee payments', 'Progress reports', 'Direct messaging'],
      color: 'accent',
    },
    {
      icon: UserCheck,
      title: 'Students',
      description: 'Access assignments, grades, and learning resources.',
      features: ['Assignment portal', 'Grade viewer', 'Resource library'],
      color: 'teal',
    },
  ];

  return (
    <section id="profiles" className="section-padding bg-muted/30">
      <div className="container-max">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full text-accent font-medium text-sm mb-6">
            <Users size={16} />
            User Profiles
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Designed for{' '}
            <span className="text-primary">Everyone in Education</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Zaroda Solutions supports the entire ecosystem around learners—because 
            education is a shared effort.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {profiles.map((profile, index) => (
            <div
              key={profile.title}
              className="group bg-card rounded-2xl p-6 border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-card animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 ${
                  profile.color === 'primary'
                    ? 'bg-primary/10 text-primary'
                    : profile.color === 'secondary'
                    ? 'bg-secondary/10 text-secondary'
                    : profile.color === 'accent'
                    ? 'bg-accent/10 text-accent'
                    : 'bg-teal/10 text-teal'
                }`}
              >
                <profile.icon size={28} strokeWidth={1.5} />
              </div>

              <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                {profile.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {profile.description}
              </p>

              <ul className="space-y-2">
                {profile.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* School category note */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-card rounded-full border border-border">
            <span className="text-sm text-muted-foreground">Available for:</span>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              Public Schools
            </span>
            <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-medium">
              Private Schools
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profiles;
