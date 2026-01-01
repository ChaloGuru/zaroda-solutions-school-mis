import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, School, User, Mail, Phone, MapPin } from 'lucide-react';

interface TrialSignupDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const TrialSignupDialog = ({ trigger, open: controlledOpen, onOpenChange }: TrialSignupDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (onOpenChange || (() => {})) : setInternalOpen;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    schoolName: '',
    schoolType: '',
    schoolLevel: '',
    contactName: '',
    email: '',
    phone: '',
    county: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: "Welcome to Zaroda Solutions!",
      description: "Your 14-day free trial has started. Check your email for login details.",
    });

    setOpen(false);
    setIsSubmitting(false);
    setFormData({
      schoolName: '',
      schoolType: '',
      schoolLevel: '',
      contactName: '',
      email: '',
      phone: '',
      county: '',
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Sparkles className="text-teal" size={24} />
            Start Your 14-Day Free Trial
          </DialogTitle>
          <p className="text-center text-muted-foreground">
            No credit card required. Full access to all features.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* School Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <School size={16} className="text-primary" />
              School Information
            </div>

            <div className="space-y-2">
              <Label htmlFor="schoolName">School Name *</Label>
              <Input
                id="schoolName"
                placeholder="e.g., Sunrise Primary School"
                value={formData.schoolName}
                onChange={(e) => handleChange('schoolName', e.target.value)}
                required
                maxLength={100}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="schoolType">School Type *</Label>
                <Select
                  value={formData.schoolType}
                  onValueChange={(value) => handleChange('schoolType', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schoolLevel">School Level *</Label>
                <Select
                  value={formData.schoolLevel}
                  onValueChange={(value) => handleChange('schoolLevel', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ecde">ECDE</SelectItem>
                    <SelectItem value="primary">Primary</SelectItem>
                    <SelectItem value="junior">Junior School</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="county" className="flex items-center gap-1">
                <MapPin size={14} />
                County *
              </Label>
              <Input
                id="county"
                placeholder="e.g., Nairobi"
                value={formData.county}
                onChange={(e) => handleChange('county', e.target.value)}
                required
                maxLength={50}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <User size={16} className="text-primary" />
              Contact Information
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactName">Your Name *</Label>
              <Input
                id="contactName"
                placeholder="e.g., John Kamau"
                value={formData.contactName}
                onChange={(e) => handleChange('contactName', e.target.value)}
                required
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1">
                <Mail size={14} />
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g., admin@school.ac.ke"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-1">
                <Phone size={14} />
                Phone Number *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="e.g., 0712 345 678"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                required
                maxLength={15}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="teal"
            className="w-full mt-6"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Starting Trial...
              </>
            ) : (
              <>
                <Sparkles size={18} className="mr-2" />
                Start 14-Day Free Trial
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TrialSignupDialog;
