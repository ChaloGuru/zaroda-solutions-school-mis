import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import zarodaLogo from '@/assets/zaroda-logo.png';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser: user, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Solutions', href: '#features' },
    { name: 'About Us', href: '#about' },
    { name: 'Multi-Tenant', href: '#multi-tenant' },
    { name: 'Sports', href: '/sports' },
    { name: 'Elections', href: '/elections' },
    { name: 'Finance', href: '#pricing' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Pricing', href: '#pricing' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-md shadow-soft'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18">
          <a href="#" className="flex items-center gap-1.5 group shrink-0">
            <img 
              src={zarodaLogo} 
              alt="Zaroda Solutions" 
              className="h-10 sm:h-12 w-auto transition-transform group-hover:scale-105 object-contain"
            />
            <span className="text-sm sm:text-base font-bold tracking-wide whitespace-nowrap" style={{ color: '#1a5276' }}>ZARODA SOLUTIONS</span>
          </a>

          <nav className="hidden xl:flex items-center gap-3 mx-4">
            {navLinks.map((link) => (
              link.href.startsWith('/') ? (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-muted-foreground hover:text-primary transition-colors font-medium text-sm whitespace-nowrap"
                >
                  {link.name}
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-muted-foreground hover:text-primary transition-colors font-medium text-sm whitespace-nowrap"
                >
                  {link.name}
                </a>
              )
            ))}
          </nav>

          <div className="hidden xl:flex items-center gap-2 shrink-0">
            {!loading && (
              user ? (
                <Button asChild variant="hero" size="sm">
                  <Link to="/dashboard">
                    <LayoutDashboard size={16} className="mr-1.5" />
                    Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="login" size="sm">
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild variant="signup" size="sm">
                    <Link to="/signup">Sign Up</Link>
                  </Button>
                </>
              )
            )}
          </div>

          <button
            className="xl:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="xl:hidden py-4 border-t border-border animate-fade-up">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                link.href.startsWith('/') ? (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors font-medium py-1.5"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ) : (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors font-medium py-1.5"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                )
              ))}
              <div className="flex gap-3 pt-4">
                {!loading && (
                  user ? (
                    <Button asChild variant="hero" size="default" className="flex-1">
                      <Link to="/dashboard">
                        <LayoutDashboard size={18} className="mr-2" />
                        Dashboard
                      </Link>
                    </Button>
                  ) : (
                    <>
                      <Button asChild variant="login" size="default" className="flex-1">
                        <Link to="/login">Login</Link>
                      </Button>
                      <Button asChild variant="signup" size="default" className="flex-1">
                        <Link to="/signup">Sign Up</Link>
                      </Button>
                    </>
                  )
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
