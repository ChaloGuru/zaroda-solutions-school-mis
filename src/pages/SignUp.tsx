import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, School, User, Mail, Phone, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import zarodaLogo from '@/assets/zaroda-logo.png';

const counties = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa', 
  'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 
  'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos', 
  'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a', 
  'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 
  'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi', 'Trans-Nzoia', 
  'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
];

const schoolCategories = [
  { id: 'all', label: 'All (ECDE, Primary & Junior School)' },
  { id: 'ecde', label: 'ECDE' },
  { id: 'primary', label: 'Primary' },
  { id: 'junior', label: 'Junior School' },
];

const SignUp = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: '',
    schoolCode: '',
    contactName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    county: '',
    subCounty: '',
    zone: '',
    schoolType: '',
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (categoryId === 'all') {
      if (checked) {
        setSelectedCategories(['all']);
      } else {
        setSelectedCategories([]);
      }
    } else {
      let newCategories = selectedCategories.filter(c => c !== 'all');
      if (checked) {
        newCategories = [...newCategories, categoryId];
      } else {
        newCategories = newCategories.filter(c => c !== categoryId);
      }
      setSelectedCategories(newCategories);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (selectedCategories.length === 0) {
      toast({
        title: "Category required",
        description: "Please select at least one school category.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // First, create the school record
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .insert({
          school_code: formData.schoolCode,
          name: formData.schoolName,
          school_type: formData.schoolType,
          county: formData.county,
          sub_county: formData.subCounty,
          zone: formData.zone,
          categories: selectedCategories.includes('all') 
            ? ['ecde', 'primary', 'junior'] 
            : selectedCategories,
          contact_name: formData.contactName,
          contact_email: formData.email,
          contact_phone: formData.phone,
        })
        .select()
        .single();

      if (schoolError) {
        if (schoolError.code === '23505') {
          toast({
            title: "School already exists",
            description: "A school with this code is already registered.",
            variant: "destructive",
          });
        } else {
          throw schoolError;
        }
        setIsSubmitting(false);
        return;
      }

      // Then sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: formData.contactName,
          },
        },
      });

      if (authError) {
        // Delete the school if auth fails
        await supabase.from('schools').delete().eq('id', schoolData.id);
        throw authError;
      }

      // Link profile to school
      if (authData.user) {
        await supabase
          .from('profiles')
          .update({ school_id: schoolData.id })
          .eq('user_id', authData.user.id);
      }

      toast({
        title: "Account created successfully!",
        description: "Welcome to Zaroda Solutions. You can now log in.",
      });
      
      navigate('/login');
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Error creating account",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
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
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Create Your Account</h1>
            <p className="text-muted-foreground">
              Join thousands of schools using Zaroda Solutions
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* School Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <School className="text-primary" size={20} />
                School Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="schoolName">School Name *</Label>
                  <Input
                    id="schoolName"
                    name="schoolName"
                    placeholder="e.g., Nairobi Primary School"
                    value={formData.schoolName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="schoolCode">School Code *</Label>
                  <Input
                    id="schoolCode"
                    name="schoolCode"
                    placeholder="e.g., 12345"
                    value={formData.schoolCode}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="schoolType">School Type *</Label>
                  <Select onValueChange={(value) => handleSelectChange('schoolType', value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label>School Category * (Select one or more)</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {schoolCategories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={category.id}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                        />
                        <Label htmlFor={category.id} className="text-sm font-normal cursor-pointer">
                          {category.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="county">County *</Label>
                  <Select onValueChange={(value) => handleSelectChange('county', value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select county" />
                    </SelectTrigger>
                    <SelectContent>
                      {counties.map((county) => (
                        <SelectItem key={county} value={county.toLowerCase()}>
                          {county}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subCounty">Sub-County *</Label>
                  <Input
                    id="subCounty"
                    name="subCounty"
                    placeholder="e.g., Westlands"
                    value={formData.subCounty}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="zone">Zone *</Label>
                  <Input
                    id="zone"
                    name="zone"
                    placeholder="e.g., Parklands Zone"
                    value={formData.zone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <User className="text-primary" size={20} />
                Contact Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="contactName">Contact Person Name *</Label>
                  <Input
                    id="contactName"
                    name="contactName"
                    placeholder="e.g., John Kamau"
                    value={formData.contactName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
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
                  <Label htmlFor="phone">Phone Number *</Label>
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

                <div>
                  <Label htmlFor="password">Password *</Label>
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
                      minLength={8}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-10"
                      required
                      minLength={8}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Log in
              </Link>
            </p>

            <p className="text-xs text-center text-muted-foreground">
              By signing up, you agree to our{' '}
              <a href="#" className="text-primary hover:underline">Terms of Service</a> and{' '}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
