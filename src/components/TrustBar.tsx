const TrustBar = () => {
  const partners = [
    'Greenwood Academy',
    'St. Patrick\'s High',
    'Sunrise International',
    'Valley View Schools',
    'Metro Learning Center',
    'Heritage Prep',
  ];

  return (
    <section className="py-12 sm:py-16 bg-muted/30 border-y border-border">
      <div className="container-max px-4 sm:px-6 lg:px-8">
        <p className="text-center text-muted-foreground font-medium mb-8">
          Trusted by leading educational institutions
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 lg:gap-16">
          {partners.map((partner, index) => (
            <div
              key={partner}
              className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-8 h-8 rounded bg-foreground/10 flex items-center justify-center">
                <span className="text-sm font-bold text-foreground/60">
                  {partner.charAt(0)}
                </span>
              </div>
              <span className="text-sm font-medium text-foreground/60 hidden sm:block">
                {partner}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
