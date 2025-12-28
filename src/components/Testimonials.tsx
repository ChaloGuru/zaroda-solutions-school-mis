import { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      quote:
        "Zaroda has transformed how we manage our 15 schools across the region. What used to take days now takes hours. The multi-tenant feature alone saved us countless hours of administrative work.",
      author: 'Dr. Margaret Ochieng',
      role: 'Principal, Sunrise Academy Network',
      image: null,
    },
    {
      quote:
        "The parent portal has dramatically improved our communication with families. We've seen a 40% increase in parent engagement since implementing Zaroda.",
      author: 'James Mwangi',
      role: 'Director, Valley View Schools',
      image: null,
    },
    {
      quote:
        "From fee collection to grade management, everything is now automated. Our teachers can focus on what they do best—teaching.",
      author: 'Sarah Kimani',
      role: 'Head Teacher, Metro Learning Center',
      image: null,
    },
  ];

  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () =>
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section id="testimonials" className="section-padding bg-background">
      <div className="container-max">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm mb-6">
            Testimonials
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Loved by <span className="text-primary">Educators</span> Everywhere
          </h2>
          <p className="text-lg text-muted-foreground">
            See what school leaders have to say about their experience with Zaroda Solutions.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative bg-card rounded-3xl p-8 sm:p-12 border border-border shadow-card">
            {/* Quote icon */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Quote className="text-primary-foreground" size={24} />
            </div>

            <div className="text-center pt-4">
              <blockquote className="text-xl sm:text-2xl text-foreground leading-relaxed mb-8 animate-fade-up">
                "{testimonials[current].quote}"
              </blockquote>

              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground">
                  {testimonials[current].author.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-lg">
                    {testimonials[current].author}
                  </div>
                  <div className="text-muted-foreground">
                    {testimonials[current].role}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={prev}
                className="w-12 h-12 rounded-full border border-border hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center group"
              >
                <ChevronLeft className="text-muted-foreground group-hover:text-primary transition-colors" />
              </button>

              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrent(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      index === current
                        ? 'bg-primary w-8'
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={next}
                className="w-12 h-12 rounded-full border border-border hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center group"
              >
                <ChevronRight className="text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
