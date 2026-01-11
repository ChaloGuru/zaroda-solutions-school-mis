import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Shield, 
  LogOut, 
  Search, 
  MoreVertical, 
  CheckCircle, 
  XCircle, 
  Pause,
  School,
  Users,
  MapPin,
  Phone,
  Mail,
  ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import zarodaLogo from '@/assets/zaroda-logo.png';

interface SchoolData {
  id: string;
  name: string;
  school_code: string;
  school_type: string | null;
  county: string | null;
  sub_county: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  status: string | null;
  categories: string[] | null;
  created_at: string;
}

const SuperAdmin = () => {
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<SchoolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; school: SchoolData | null }>({ open: false, school: null });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    filterSchools();
  }, [schools, searchTerm, statusFilter]);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate('/admin-login');
      return;
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      toast({
        title: "Access denied",
        description: "You do not have administrator privileges.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    setIsAdmin(true);
    fetchSchools();
  };

  const fetchSchools = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching schools:', error);
      toast({
        title: "Error",
        description: "Failed to load schools.",
        variant: "destructive",
      });
    } else {
      setSchools(data || []);
    }
    setLoading(false);
  };

  const filterSchools = () => {
    let filtered = schools;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (school) =>
          school.name.toLowerCase().includes(term) ||
          school.school_code.toLowerCase().includes(term) ||
          school.contact_email.toLowerCase().includes(term) ||
          (school.county?.toLowerCase().includes(term))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((school) => (school.status || 'active') === statusFilter);
    }

    setFilteredSchools(filtered);
  };

  const updateSchoolStatus = async (schoolId: string, newStatus: string) => {
    const { error } = await supabase
      .from('schools')
      .update({ status: newStatus })
      .eq('id', schoolId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update school status.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Status updated",
        description: `School has been ${newStatus}.`,
      });
      fetchSchools();
    }
  };

  const deleteSchool = async () => {
    if (!deleteDialog.school) return;

    const { error } = await supabase
      .from('schools')
      .delete()
      .eq('id', deleteDialog.school.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete school.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "School deleted",
        description: "The school has been permanently removed.",
      });
      fetchSchools();
    }
    setDeleteDialog({ open: false, school: null });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const getStatusBadge = (status: string | null) => {
    const s = status || 'active';
    switch (s) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-700 border-green-500/30">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">Pending</Badge>;
      case 'suspended':
        return <Badge className="bg-red-500/20 text-red-700 border-red-500/30">Suspended</Badge>;
      default:
        return <Badge variant="outline">{s}</Badge>;
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <img src={zarodaLogo} alt="Zaroda Solutions" className="h-10" />
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="text-primary" size={20} />
              <span className="font-semibold text-lg">Super Admin</span>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut size={18} className="mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <School className="text-primary" size={24} />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total Schools</p>
                <p className="text-2xl font-bold">{schools.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Active</p>
                <p className="text-2xl font-bold">{schools.filter(s => (s.status || 'active') === 'active').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-500/10">
                <Pause className="text-yellow-600" size={24} />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Pending</p>
                <p className="text-2xl font-bold">{schools.filter(s => s.status === 'pending').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-500/10">
                <XCircle className="text-red-600" size={24} />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Suspended</p>
                <p className="text-2xl font-bold">{schools.filter(s => s.status === 'suspended').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* School Management */}
        <div className="bg-card rounded-xl border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold mb-4">School Management</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  placeholder="Search by name, code, email, or county..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'active' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('active')}
                  size="sm"
                >
                  Active
                </Button>
                <Button
                  variant={statusFilter === 'pending' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('pending')}
                  size="sm"
                >
                  Pending
                </Button>
                <Button
                  variant={statusFilter === 'suspended' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('suspended')}
                  size="sm"
                >
                  Suspended
                </Button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading schools...</p>
            </div>
          ) : filteredSchools.length === 0 ? (
            <div className="p-12 text-center">
              <School className="mx-auto text-muted-foreground mb-4" size={48} />
              <p className="text-muted-foreground">No schools found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>School</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchools.map((school) => (
                    <TableRow key={school.id}>
                      <TableCell>
                        <div className="font-medium">{school.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {school.categories?.join(', ') || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{school.school_code}</TableCell>
                      <TableCell className="capitalize">{school.school_type || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin size={14} className="text-muted-foreground" />
                          <span className="capitalize">{school.county || 'N/A'}</span>
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {school.sub_county || ''}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Mail size={14} className="text-muted-foreground" />
                          {school.contact_email}
                        </div>
                        {school.contact_phone && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone size={12} />
                            {school.contact_phone}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(school.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(school.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical size={18} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {(school.status || 'active') !== 'active' && (
                              <DropdownMenuItem onClick={() => updateSchoolStatus(school.id, 'active')}>
                                <CheckCircle size={16} className="mr-2 text-green-600" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            {school.status !== 'suspended' && (
                              <DropdownMenuItem onClick={() => updateSchoolStatus(school.id, 'suspended')}>
                                <Pause size={16} className="mr-2 text-yellow-600" />
                                Suspend
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => setDeleteDialog({ open: true, school })}
                              className="text-red-600"
                            >
                              <XCircle size={16} className="mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete School?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteDialog.school?.name}</strong> and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteSchool} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SuperAdmin;
