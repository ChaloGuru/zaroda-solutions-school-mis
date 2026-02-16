import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  LogOut, 
  MoreHorizontal, 
  CheckCircle, 
  XCircle, 
  Pause,
  ExternalLink,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Sidebar, TopNav, StatsCards, RevenueChart } from '@/components/superadmin';
import { cn } from '@/lib/utils';


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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<SchoolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
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

    setAdminUser(user);
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
        {/* Top Navigation */}
        <TopNav />

        {/* Main Dashboard Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">SuperAdmin Dashboard</h1>
                <p className="text-muted-foreground">Manage all schools and system analytics</p>
              </div>
              <Button variant="outline" onClick={handleSignOut} className="gap-2">
                <LogOut size={18} />
                Sign Out
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0 }}
                className="glass-card rounded-2xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-600">
                    <ArrowUpRight className="w-3 h-3" />
                    +{schools.filter(s => (s.status || 'active') === 'active').length}
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground mb-1">{schools.length}</p>
                  <p className="text-sm text-muted-foreground">Total Schools</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card rounded-2xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-500/10">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-600">
                    <ArrowUpRight className="w-3 h-3" />
                    Active
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground mb-1">{schools.filter(s => (s.status || 'active') === 'active').length}</p>
                  <p className="text-sm text-muted-foreground">Active Schools</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-2xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-yellow-500/10">
                    <Pause className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-yellow-500/10 text-yellow-600">
                    {schools.filter(s => s.status === 'pending').length > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    Pending
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground mb-1">{schools.filter(s => s.status === 'pending').length}</p>
                  <p className="text-sm text-muted-foreground">Pending Approval</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card rounded-2xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-500/10">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-red-500/10 text-red-600">
                    {schools.filter(s => s.status === 'suspended').length > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    Suspended
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground mb-1">{schools.filter(s => s.status === 'suspended').length}</p>
                  <p className="text-sm text-muted-foreground">Suspended Schools</p>
                </div>
              </motion.div>
            </div>

            {/* Revenue Chart */}
            <div className="mb-8">
              <RevenueChart />
            </div>

            {/* School Overview Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card rounded-2xl overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">School Overview</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Manage all registered schools</p>
                </div>
              </div>

              <div className="px-6 py-5 border-b border-border/50">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Input
                      placeholder="Search schools, students, faculty..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-4"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
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
                  <p className="text-muted-foreground">No schools found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          School Name
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Code
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Type
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Location
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="text-center py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Status
                        </th>
                        <th className="text-right py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSchools.map((school, index) => (
                        <motion.tr
                          key={school.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.05 }}
                          className="border-b border-border/30 hover:bg-secondary/30 transition-colors group"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <span className="text-primary font-semibold text-sm">
                                  {school.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-foreground">{school.name}</span>
                                <div className="text-xs text-muted-foreground">
                                  {school.categories?.join(', ') || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 font-mono text-sm text-muted-foreground">{school.school_code}</td>
                          <td className="py-4 px-6 capitalize text-sm">{school.school_type || 'N/A'}</td>
                          <td className="py-4 px-6 text-sm">
                            <div className="capitalize font-medium">{school.county || 'N/A'}</div>
                            <div className="text-xs text-muted-foreground capitalize">
                              {school.sub_county || ''}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm">
                            <div className="text-foreground">{school.contact_email}</div>
                            {school.contact_phone && (
                              <div className="text-xs text-muted-foreground">{school.contact_phone}</div>
                            )}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={cn(
                              "inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize",
                              (school.status || 'active') === 'active' && 'bg-emerald-500/20 text-emerald-700',
                              school.status === 'pending' && 'bg-yellow-500/20 text-yellow-700',
                              school.status === 'suspended' && 'bg-red-500/20 text-red-700'
                            )}>
                              {school.status || 'active'}
                            </span>
                          </td>
                          <td className="py-4 px-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {(school.status || 'active') !== 'active' && (
                                  <DropdownMenuItem onClick={() => updateSchoolStatus(school.id, 'active')}>
                                    <CheckCircle size={16} className="mr-2 text-emerald-600" />
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
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </div>
        </main>
      </div>

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
