import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, Lock, Hash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext, getDashboardForRole } from '@/context/AuthContext';
import zarodaLogo from '@/assets/zaroda-logo.png';

const Login = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    schoolCode: '',
    email: '',
    password: '',
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login, currentUser } = useAuthContext();

  useEffect(() => {
    if (currentUser) {
      navigate(getDashboardForRole(currentUser.role), { replace: true });
    }
  }, [currentUser, navigate]);

  if (currentUser) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.schoolCode.trim()) {
      toast({ title: 'Missing school code', description: 'Please enter your school code.', variant: 'destructive' });
      return;
    }

    if (!formData.email.trim() || !formData.password.trim()) {
      toast({ title: 'Missing fields', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = login(formData.email, formData.password, formData.schoolCode);
      if (result.success) {
        toast({ title: 'Login successful!', description: 'Welcome back to Zaroda Solutions.' });
      } else {
        toast({ title: 'Login failed', description: result.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          Back to Home
        </Link>

        <div className="bg-card rounded-2xl border border-border shadow-card p-8 md:p-12">
          <div className="text-center mb-8">
            <Link to="/">
              <img src={zarodaLogo} alt="Zaroda Solutions" className="h-16 mx-auto mb-2" />
              <p className="text-base font-bold tracking-wide mb-2" style={{ color: '#1a5276' }}>ZARODA SOLUTIONS</p>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Welcome Back
            </h1>
            <p className="text-muted-foreground">
              Log in to your Zaroda account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="schoolCode">School Code</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="schoolCode"
                  name="schoolCode"
                  type="text"
                  placeholder="Enter your school code"
                  value={formData.schoolCode}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@school.ac.ke"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-sm text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Log In'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
