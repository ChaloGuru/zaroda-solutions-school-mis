import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, Lock, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import zarodaLogo from '@/assets/zaroda-logo.png';
import { mapAuthError } from '@/lib/validation';

const SuperAdminLogin = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Sign in the user
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (error) {
        toast({
          title: "Login failed",
          description: mapAuthError(error),
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Verify user has admin role
      if (data.user) {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (roleError || !roleData) {
          await supabase.auth.signOut();
          toast({
            title: "Access denied",
            description: "You do not have administrator privileges.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }
    
      toast({
        title: "Login successful!",
        description: "Welcome to the Admin Dashboard.",
      });
      
      navigate('/super-admin');
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: mapAuthError(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          Back to Home
        </Link>

        <div className="bg-card rounded-2xl border border-border shadow-card p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/">
              <img src={zarodaLogo} alt="Zaroda Solutions" className="h-16 mx-auto mb-4" />
            </Link>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="text-primary" size={24} />
              <h1 className="text-2xl md:text-3xl font-bold">Admin Login</h1>
            </div>
            <p className="text-muted-foreground">
              Access the Super Admin Dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@zaroda.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
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
              {isSubmitting ? 'Logging in...' : 'Access Dashboard'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Not an admin?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                School Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
