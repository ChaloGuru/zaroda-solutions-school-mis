import { MapPin, Mail, Phone, Target, Eye, Heart, Shield, DollarSign, Users, FileCheck, Wifi } from 'lucide-react';
import zarodaLogo from '@/assets/zaroda-logo.png';

const AboutUs = () => {
  const values = [
    {
      icon: Users,
      title: 'Accessibility',
      description: 'Designed so every school, regardless of location, staffing, or resources, can easily adopt and use it.',
    },
    {
      icon: Shield,
      title: 'Accountability',
      description: 'Supporting transparent fee management, attendance tracking, and reporting—aligned with TSC, MoE, and BOM expectations.',
    },
    {
      icon: DollarSign,
      title: 'Affordability',
      description: 'Built to fit the budgets of both public and private institutions while providing premium value.',
    },
    {
      icon: Heart,
      title: 'Inclusivity',
      description: 'Designed for ECDE, Primary and Junior school teachers.',
    },
    {
      icon: FileCheck,
      title: 'Compliance',
      description: 'Supporting CBC requirements, Ministry of Education reporting formats, and school audit processes.',
    },
    {
      icon: Wifi,
      title: 'Reliability',
      description: 'Stable, secure, and always available—even for schools with limited internet access.',
    },
  ];

  return (
    <section id="about" className="section-padding bg-background">
      <div className="container-max">
        {/* Header with Logo */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <img src={zarodaLogo} alt="Zaroda Solutions" className="h-20 mx-auto mb-6" />
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-kenya-green/10 rounded-full text-kenya-green font-medium text-sm mb-6">
            About Us
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Empowering Kenya's <span className="text-primary">Schools</span>
          </h2>
        </div>
        {/* Motto */}
        <div className="text-center mb-16">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-kenya-green via-kenya-red to-kenya-black blur-xl opacity-20"></div>
            <div className="relative bg-gradient-to-r from-kenya-green via-kenya-red to-kenya-black p-1 rounded-2xl">
              <div className="bg-background px-8 py-6 rounded-2xl">
                <div className="text-sm font-medium text-muted-foreground mb-2 tracking-wider uppercase">
                  Our Motto
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-kenya-green via-kenya-red to-kenya-black bg-clip-text text-transparent">
                  Empowering schools with technology
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-card rounded-2xl p-8 border border-border hover:border-kenya-green/30 transition-all duration-300 shadow-card">
            <div className="w-14 h-14 rounded-xl bg-kenya-green/10 flex items-center justify-center mb-6">
              <Target className="text-kenya-green" size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-kenya-green">Our</span> Mission
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              To provide a simple, affordable, and reliable digital management system that enhances accountability, 
              improves learning delivery, and supports the administrative needs of Kenya's public and private ECDE, 
              Primary, and Junior schools.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 border border-border hover:border-kenya-red/30 transition-all duration-300 shadow-card">
            <div className="w-14 h-14 rounded-xl bg-kenya-red/10 flex items-center justify-center mb-6">
              <Eye className="text-kenya-red" size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-kenya-red">Our</span> Vision
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              To be the leading digital platform enabling efficient, transparent, and data-driven management 
              in public and private schools across Kenya.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">
            Our <span className="text-primary">Core Values</span>
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <div
                key={value.title}
                className="group bg-card rounded-xl p-6 border border-border hover:border-primary/30 transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <value.icon className="text-primary" size={24} />
                </div>
                <h4 className="font-bold mb-2">{value.title}</h4>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Brand Story */}
        <div className="bg-gradient-to-r from-kenya-black via-kenya-red to-kenya-green p-1 rounded-2xl mb-16">
          <div className="bg-card rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl font-bold mb-6 text-center">
              Our <span className="text-primary">Story</span>
            </h3>
            <div className="max-w-3xl mx-auto space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Across Kenya, thousands of schools work tirelessly to deliver quality education with limited resources. 
                Administrators juggle paperwork, teachers struggle with manual records, and parents depend on 
                inconsistent channels for updates.
              </p>
              <p>
                <strong className="text-foreground">Zaroda Solutions</strong> is built to bridge this gap.
              </p>
              <p>
                Built with the realities of Kenyan schools in mind, Zaroda Solutions offers an easy-to-use, 
                affordable, and dependable digital platform that helps schools manage attendance, assessments, 
                communication, finances, and reporting—all in one place.
              </p>
              <p>
                Whether in rural villages or busy towns, it ensures every school can operate smoothly, 
                transparently, and efficiently.
              </p>
              <p className="text-foreground font-semibold text-center pt-4">
                Zaroda Solutions supports the entire ecosystem around learners—because education is a shared responsibility.
              </p>
            </div>
          </div>
        </div>

        {/* Brand Promise */}
        <div className="bg-primary/5 rounded-2xl p-8 md:p-12 text-center mb-16">
          <h3 className="text-2xl font-bold mb-4">
            Our <span className="text-primary">Promise</span>
          </h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            To simplify the work of school administrators and teachers—so they can focus on the core mandate: Facilitate learning.
          </p>
        </div>

        {/* Contact Details */}
        <div className="bg-card rounded-2xl p-8 border border-border shadow-card">
          <h3 className="text-2xl font-bold text-center mb-8">
            <span className="text-primary">Contact</span> Us
          </h3>
          <div className="grid sm:grid-cols-3 gap-6">
            <a 
              href="mailto:info@zarodasolutions.co.ke" 
              className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-primary/10 transition-colors group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Mail size={24} />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="font-medium">oduorongo@gmail.com</div>
              </div>
            </a>

            <a 
              href="tel:+254724282065" 
              className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-primary/10 transition-colors group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Phone size={24} />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Phone</div>
                <div className="font-medium">+254 724 282 065</div>
              </div>
            </a>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin size={24} />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Location</div>
                <div className="font-medium">Nairobi, Kenya</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
