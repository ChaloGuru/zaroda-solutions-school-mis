import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import zarodaLogo from '@/assets/zaroda-logo.png';

const Contact = () => {
  const contactOptions = [
    {
      icon: Mail,
      title: 'Email Us',
      description: 'Send us an email and we\'ll respond within 24 hours',
      value: 'info@zarodasolutions.co.ke',
      href: 'mailto:info@zarodasolutions.co.ke',
      buttonText: 'Send Email',
      color: 'primary',
    },
    {
      icon: Phone,
      title: 'Call Us',
      description: 'Speak directly with our support team',
      value: '+254 781 230 805',
      href: 'tel:+254781230805',
      buttonText: 'Call Now',
      color: 'teal',
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      description: 'Quick responses via WhatsApp messaging',
      value: '+254 781 230 805',
      href: 'https://wa.me/254781230805?text=Hello%20Zaroda%20Solutions,%20I%20would%20like%20to%20inquire%20about%20your%20services.',
      buttonText: 'Chat on WhatsApp',
      color: 'secondary',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container-max section-padding py-12">
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          Back to Home
        </Link>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Link to="/">
              <img src={zarodaLogo} alt="Zaroda Solutions" className="h-16 mx-auto mb-2" />
              <p className="text-base font-bold tracking-wide mb-4" style={{ color: '#1a5276' }}>ZARODA SOLUTIONS</p>
            </Link>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Get in <span className="text-primary">Touch</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions about our services? Want to discuss pricing for your school? 
              Choose your preferred way to reach us.
            </p>
          </div>

          {/* Contact Options */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {contactOptions.map((option, index) => (
              <div
                key={option.title}
                className="bg-card rounded-2xl border border-border p-6 text-center hover:border-primary/30 transition-all duration-300 shadow-card animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-16 h-16 rounded-xl bg-${option.color}/10 flex items-center justify-center mx-auto mb-4`}>
                  <option.icon className={`text-${option.color}`} size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">{option.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{option.description}</p>
                <p className="font-medium text-foreground mb-4">{option.value}</p>
                <Button
                  asChild
                  variant={option.color === 'primary' ? 'hero' : option.color === 'teal' ? 'teal' : 'heroOutline'}
                  className="w-full"
                >
                  <a href={option.href} target={option.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
                    {option.buttonText}
                  </a>
                </Button>
              </div>
            ))}
          </div>

          {/* Location Card */}
          <div className="bg-card rounded-2xl border border-border p-8 shadow-card">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="text-primary" size={32} />
              </div>
              <div className="text-center md:text-left flex-1">
                <h3 className="text-xl font-bold mb-2">Our Location</h3>
                <p className="text-muted-foreground">Nairobi, Kenya</p>
                <p className="text-sm text-muted-foreground mt-2">
                  We serve schools across all 47 counties in Kenya
                </p>
              </div>
              <div className="flex gap-3">
                <Button asChild variant="heroOutline">
                  <Link to="/signup">Get Started</Link>
                </Button>
                <Button asChild variant="hero">
                  <Link to="/#pricing">View Pricing</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* FAQ Teaser */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">
              Looking for quick answers?{' '}
              <Link to="/#features" className="text-primary hover:underline font-medium">
                Explore our features
              </Link>
              {' '}or{' '}
              <Link to="/#pricing" className="text-primary hover:underline font-medium">
                view pricing
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
