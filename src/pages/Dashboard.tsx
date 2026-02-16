import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  School, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Settings,
  LogOut,
  Building2,
  Users,
  BookOpen,
  Edit2,
  Save,
  X
} from 'lucide-react';
import zarodaLogo from '@/assets/zaroda-logo.png';

const Dashboard = () => {
  const { user, profile, school, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    contact_name: '',
    contact_email: '',
    contact_phone: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (school) {
      setEditData({
        contact_name: school.contact_name || '',
        contact_email: school.contact_email || '',
        contact_phone: school.contact_phone || '',
      });
    }
  }, [school]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSave = async () => {
    if (!school) return;
    setIsSaving(true);

    try {
      // TODO: Call Replit backend: PUT /api/schools/:id
      // const response = await fetch(`${API_BASE}/schools/${school.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(editData)
      // });

      toast({
        title: "Settings saved",
        description: "Your school information has been updated.",
      });
      setIsEditing(false);
      // Reload the page to get fresh data
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error saving",
        description: "Connection error. Please check Replit backend.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const formatCategories = (categories: string[] | null) => {
    if (!categories || categories.length === 0) return 'Not specified';
    return categories.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container-max section-padding !py-0">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <img src={zarodaLogo} alt="Zaroda Solutions" className="h-12 w-auto" />
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {profile?.full_name || user.email}
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.full_name?.split(' ')[0] || 'Admin'}!</h1>
          <p className="text-muted-foreground">Manage your school information and settings</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* School Info Card */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="text-primary" size={24} />
                  School Information
                </CardTitle>
                <CardDescription>Details about your registered school</CardDescription>
              </div>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit2 size={16} className="mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    <X size={16} className="mr-2" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    <Save size={16} className="mr-2" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {school ? (
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">School Name</Label>
                      <p className="font-medium text-lg">{school.name}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">School Code</Label>
                      <p className="font-mono text-lg bg-muted px-3 py-1 rounded inline-block">{school.school_code}</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">Type</Label>
                      <p className="capitalize">{school.school_type || 'Not specified'}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">Categories</Label>
                      <p>{formatCategories(school.categories)}</p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <MapPin size={18} className="text-primary" />
                      Location
                    </h4>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label className="text-muted-foreground text-xs uppercase tracking-wide">County</Label>
                        <p className="capitalize">{school.county || 'Not specified'}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground text-xs uppercase tracking-wide">Sub-County</Label>
                        <p>{school.sub_county || 'Not specified'}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground text-xs uppercase tracking-wide">Zone</Label>
                        <p>{school.zone || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <User size={18} className="text-primary" />
                      Contact Information
                    </h4>
                    {isEditing ? (
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <Label htmlFor="contact_name">Contact Name</Label>
                          <Input
                            id="contact_name"
                            value={editData.contact_name}
                            onChange={(e) => setEditData({ ...editData, contact_name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="contact_email">Email</Label>
                          <Input
                            id="contact_email"
                            type="email"
                            value={editData.contact_email}
                            onChange={(e) => setEditData({ ...editData, contact_email: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="contact_phone">Phone</Label>
                          <Input
                            id="contact_phone"
                            value={editData.contact_phone}
                            onChange={(e) => setEditData({ ...editData, contact_phone: e.target.value })}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-muted-foreground text-xs uppercase tracking-wide">Name</Label>
                          <p>{school.contact_name}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground text-xs uppercase tracking-wide">Email</Label>
                          <p className="flex items-center gap-2">
                            <Mail size={14} className="text-muted-foreground" />
                            {school.contact_email}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground text-xs uppercase tracking-wide">Phone</Label>
                          <p className="flex items-center gap-2">
                            <Phone size={14} className="text-muted-foreground" />
                            {school.contact_phone || 'Not specified'}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground text-xs uppercase tracking-wide">Registered</Label>
                          <p className="flex items-center gap-2">
                            <Calendar size={14} className="text-muted-foreground" />
                            {new Date(school.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">No school information found.</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats & Actions */}
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
                  Manage Users (Coming Soon)
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
