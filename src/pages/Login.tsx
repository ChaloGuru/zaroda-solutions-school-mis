import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Mail, Lock, Hash, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext, UserRole, getDashboardForRole } from '@/context/AuthContext';
import zarodaLogo from '@/assets/zaroda-logo.png';

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'superadmin', label: 'SuperAdmin' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'hoi', label: 'HOI (Head of Institution)' },
  { value: 'dhoi', label: 'DHOI (Deputy Head)' },
  { value: 'student', label: 'Student' },
  { value: 'parent', label: 'Parent' },
];

const Login = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
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

  const handleRoleChange = (value: string) => {
    setSelectedRole(value as UserRole);
    setFormData({ schoolCode: '', email: '', password: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      toast({ title: 'Please select a role', description: 'Choose your role from the dropdown above.', variant: 'destructive' });
      return;
    }

    if (!formData.email.trim() || !formData.password.trim()) {
      toast({ title: 'Missing fields', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = login(selectedRole as UserRole, formData.email, formData.password, formData.schoolCode);
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

  const showSchoolCode = selectedRole === 'superadmin';
  const isDhoiRole = selectedRole === 'dhoi';
  const isTeacherRole = selectedRole === 'teacher';
  const isPlaceholderRole = selectedRole === 'student' || selectedRole === 'parent';
  const isHoiRole = selectedRole === 'hoi';

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

          <div className="mb-6">
            <Label>Select Your Role</Label>
            <Select onValueChange={handleRoleChange} value={selectedRole}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Choose your role..." />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isTeacherRole && (
            <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg mb-6 border border-purple-200 dark:border-purple-800">
              <Info size={20} className="text-purple-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-1">
                  Teacher accounts are created by the SuperAdmin, HOI, or DHOI
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  Your login credentials (email and password) are assigned by your institution. Use those details to log in below.
                </p>
              </div>
            </div>
          )}

          {isPlaceholderRole && (
            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg mb-6">
              <Info size={20} className="text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">
                Contact your administrator to get your account. Self-registration for this role is not available yet.
              </p>
            </div>
          )}

          {isDhoiRole && (
            <div className="flex items-start gap-3 p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg mb-6 border border-indigo-200 dark:border-indigo-800">
              <Info size={20} className="text-indigo-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-1">
                  DHOI accounts are created by the HOI or SuperAdmin
                </p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400">
                  Your login credentials (email and password) are assigned by the Head of Institution or SuperAdmin. Use those details to log in below.
                </p>
              </div>
            </div>
          )}

          {isHoiRole && (
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg mb-6 border border-blue-200 dark:border-blue-800">
              <Info size={20} className="text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                  HOI accounts are created by the SuperAdmin
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Your login credentials (email and password) are assigned by the SuperAdmin. Use those details to log in below.
                </p>
              </div>
            </div>
          )}

          {selectedRole && !isPlaceholderRole && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {showSchoolCode && (
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
              )}

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

              {selectedRole === 'superadmin' && (
                <p className="text-center text-sm text-muted-foreground">
                  SuperAdmin access is restricted. Contact system administrator if needed.
                </p>
              )}
            </form>
          )}

          {!selectedRole && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              Please select your role above to continue.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
