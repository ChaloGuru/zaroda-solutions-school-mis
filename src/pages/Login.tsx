import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Mail, Lock, Hash, User, Phone, BookOpen, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext, UserRole, getDashboardForRole, TeacherSignupData, GradeLevel, GRADE_LEVELS } from '@/context/AuthContext';
import zarodaLogo from '@/assets/zaroda-logo.png';

type FormMode = 'login' | 'signup';

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
  const [formMode, setFormMode] = useState<FormMode>('login');
  const [formData, setFormData] = useState({
    schoolCode: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    subject: '',
    grade: '' as string,
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login, signup, currentUser } = useAuthContext();

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
    setFormMode('login');
    setFormData({ schoolCode: '', email: '', password: '', fullName: '', phone: '', subject: '', grade: '' });
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
      if (selectedRole === 'teacher' && formMode === 'signup') {
        if (!formData.fullName.trim() || !formData.schoolCode.trim() || !formData.subject.trim() || !formData.phone.trim() || !formData.grade) {
          toast({ title: 'Missing fields', description: 'Please fill in all required fields.', variant: 'destructive' });
          setIsSubmitting(false);
          return;
        }
        const signupData: TeacherSignupData = {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          schoolCode: formData.schoolCode,
          subject: formData.subject,
          phone: formData.phone,
          grade: formData.grade as GradeLevel,
        };
        const result = signup(signupData);
        if (result.success) {
          toast({ title: 'Account created!', description: 'Welcome to Zaroda Solutions.' });
        } else {
          toast({ title: 'Sign up failed', description: result.error, variant: 'destructive' });
        }
      } else {
        const result = login(selectedRole as UserRole, formData.email, formData.password, formData.schoolCode);
        if (result.success) {
          toast({ title: 'Login successful!', description: 'Welcome back to Zaroda Solutions.' });
        } else {
          toast({ title: 'Login failed', description: result.error, variant: 'destructive' });
        }
      }
    } catch {
      toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const showSchoolCode = selectedRole === 'superadmin' || (selectedRole === 'teacher' && formMode === 'signup');
  const showLoginSignupToggle = selectedRole === 'teacher';
  const isDhoiRole = selectedRole === 'dhoi';
  const isPlaceholderRole = selectedRole === 'student' || selectedRole === 'parent';
  const isHoiRole = selectedRole === 'hoi';
  const showTeacherSignupFields = selectedRole === 'teacher' && formMode === 'signup';

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
              <img src={zarodaLogo} alt="Zaroda Solutions" className="h-16 mx-auto mb-4" />
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {formMode === 'signup' ? 'Create Teacher Account' : 'Welcome Back'}
            </h1>
            <p className="text-muted-foreground">
              {formMode === 'signup' ? 'Sign up for your teacher account' : 'Log in to your Zaroda account'}
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

          {showLoginSignupToggle && (
            <div className="flex gap-2 mb-6">
              <Button
                type="button"
                variant={formMode === 'login' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => setFormMode('login')}
              >
                Log In
              </Button>
              <Button
                type="button"
                variant={formMode === 'signup' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => setFormMode('signup')}
              >
                Sign Up
              </Button>
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
                  DHOI accounts are created by the HOI
                </p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400">
                  Your login credentials (email and password) are assigned by the Head of Institution. Use those details to log in below.
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
              {showTeacherSignupFields && (
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}

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
                  {formMode === 'login' && (
                    <a href="#" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </a>
                  )}
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

              {showTeacherSignupFields && (
                <>
                  <div>
                    <Label>Grade / Class Assigned</Label>
                    <Select onValueChange={(value) => setFormData({ ...formData, grade: value })} value={formData.grade}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select grade..." />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADE_LEVELS.map((g) => (
                          <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        placeholder="e.g., Mathematics"
                        value={formData.subject}
                        onChange={handleChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+254 7XX XXX XXX"
                        value={formData.phone}
                        onChange={handleChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? (formMode === 'signup' ? 'Creating Account...' : 'Logging in...')
                  : (formMode === 'signup' ? 'Create Account' : 'Log In')
                }
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
