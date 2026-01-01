import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import heroImage from '@/assets/hero-classroom.jpg';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Kenya flag stripe accent at top */}
      <div className="absolute top-0 left-0 right-0 h-1 flex">
        <div className="flex-1 bg-kenya-black" />
        <div className="flex-1 bg-kenya-red" />
        <div className="flex-1 bg-kenya-green" />
      </div>
      
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-maroon-light via-background to-teal-light opacity-50" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-kenya-green/10 rounded-full blur-3xl" />

      <div className="container-max section-padding relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-kenya-green/10 rounded-full text-kenya-green font-medium text-sm animate-fade-up border border-kenya-green/20">
              <span className="w-2 h-2 bg-kenya-green rounded-full animate-pulse-slow" />
              🇰🇪 Trusted by 500+ Schools in Kenya
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight animate-fade-up animation-delay-100">
              Smart. Simple.{' '}
              <span className="text-primary">School Management.</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl animate-fade-up animation-delay-200">
              Empowering every school with digital tools for real learning. Zaroda Solutions 
              simplifies school life through technology—making administration faster, 
              communication stronger, and education smarter.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-up animation-delay-300">
              <Button variant="hero" size="xl">
                Get Started
                <ArrowRight className="ml-2" size={20} />
              </Button>
              <Button variant="outline" size="xl" className="group">
                <Play className="mr-2 group-hover:scale-110 transition-transform" size={20} />
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4 animate-fade-up animation-delay-400">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-bold text-muted-foreground"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-500 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Rated 4.9/5 from 2,000+ reviews
                </p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative animate-fade-up animation-delay-200">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-2xl" />
            <div className="relative rounded-2xl overflow-hidden shadow-card">
              <img
                src={heroImage}
                alt="Kenyan students in a classroom raising their hands"
                className="w-full h-auto object-cover"
              />
              {/* Overlay stats card */}
              <div className="absolute bottom-6 left-6 right-6 bg-background/90 backdrop-blur-md rounded-xl p-4 shadow-soft">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">500+</div>
                    <div className="text-xs text-muted-foreground">Schools</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-secondary">1M+</div>
                    <div className="text-xs text-muted-foreground">Students</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent">99.9%</div>
                    <div className="text-xs text-muted-foreground">Uptime</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
