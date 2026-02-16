import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  School, 
  User, 
  Phone, 
  Mail, 
  Settings,
  LogOut,
  Building2,
  Users,
  BookOpen,
} from 'lucide-react';
import zarodaLogo from '@/assets/zaroda-logo.png';

const Dashboard = () => {
  const { currentUser, logout } = useAuthContext();
  const { toast } = useToast();

  const handleSignOut = () => {
    logout();
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container-max section-padding !py-0">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <img src={zarodaLogo} alt="Zaroda Solutions" className="h-12 w-auto" />
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {currentUser.fullName || currentUser.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut size={16} className="mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container-max section-padding">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {currentUser.fullName?.split(' ')[0] || 'Teacher'}!</h1>
          <p className="text-muted-foreground">Manage your teaching profile and resources</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="text-primary" size={24} />
                Teacher Profile
              </CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide">Full Name</Label>
                  <p className="font-medium text-lg">{currentUser.fullName}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide">School Code</Label>
                  <p className="font-mono text-lg bg-muted px-3 py-1 rounded inline-block">{currentUser.schoolCode}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide">Email</Label>
                  <p className="flex items-center gap-2">
                    <Mail size={14} className="text-muted-foreground" />
                    {currentUser.email}
                  </p>
                </div>
                {currentUser.phone && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Phone</Label>
                    <p className="flex items-center gap-2">
                      <Phone size={14} className="text-muted-foreground" />
                      {currentUser.phone}
                    </p>
                  </div>
                )}
              </div>

              {currentUser.subject && (
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide">Subject</Label>
                  <p className="flex items-center gap-2">
                    <BookOpen size={14} className="text-muted-foreground" />
                    {currentUser.subject}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="text-primary" size={20} />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/">
                    <School size={16} className="mr-2" />
                    View Homepage
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  <Users size={16} className="mr-2" />
                  My Classes (Coming Soon)
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  <BookOpen size={16} className="mr-2" />
                  Reports (Coming Soon)
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg text-primary">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Contact our support team for assistance with your account.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/contact">Contact Support</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
