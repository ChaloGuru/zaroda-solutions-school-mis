import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { invoicesStorage, schoolsStorage, Invoice } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DollarSign,
  FileText,
  AlertTriangle,
  CheckCircle,
  Plus,
  Search,
  Pencil,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const formatKES = (amount: number) =>
  `KES ${amount.toLocaleString('en-KE')}`;

const emptyForm = {
  school_id: '',
  school_name: '',
  description: '',
  amount: 0,
  period: '',
  due_date: '',
  status: 'pending' as 'paid' | 'pending' | 'overdue',
  paid_at: null as string | null,
};

export default function FinanceSection() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; invoice: Invoice | null }>({ open: false, invoice: null });
  const { toast } = useToast();

  const schools = schoolsStorage.getAll();

  const loadInvoices = () => setInvoices(invoicesStorage.getAll());

  useEffect(() => { loadInvoices(); }, []);

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const pendingAmount = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);
  const overdueAmount = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);
  const totalInvoices = invoices.length;

  const filtered = invoices.filter((inv) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term || inv.school_name.toLowerCase().includes(term) || inv.description.toLowerCase().includes(term) || inv.id.toLowerCase().includes(term) || inv.period.toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesSchool = schoolFilter === 'all' || inv.school_id === schoolFilter;
    return matchesSearch && matchesStatus && matchesSchool;
  });

  const openAddDialog = () => {
    setEditingInvoice(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setForm({
      school_id: invoice.school_id,
      school_name: invoice.school_name,
      description: invoice.description,
      amount: invoice.amount,
      period: invoice.period,
      due_date: invoice.due_date,
      status: invoice.status,
      paid_at: invoice.paid_at,
    });
    setDialogOpen(true);
  };

  const handleSchoolChange = (schoolId: string) => {
    const school = schools.find(s => s.id === schoolId);
    setForm(prev => ({
      ...prev,
      school_id: schoolId,
      school_name: school ? school.name : '',
    }));
  };

  const handleSave = () => {
    if (!form.school_id || !form.description || !form.amount || !form.period || !form.due_date) {
      toast({ title: 'Validation Error', description: 'All fields are required.', variant: 'destructive' });
      return;
    }
    if (editingInvoice) {
      invoicesStorage.update(editingInvoice.id, { ...form });
      toast({ title: 'Invoice Updated', description: `Invoice has been updated successfully.` });
    } else {
      invoicesStorage.add({ ...form });
      toast({ title: 'Invoice Created', description: `Invoice has been created successfully.` });
    }
    setDialogOpen(false);
    loadInvoices();
  };

  const handleMarkPaid = (invoice: Invoice) => {
    invoicesStorage.update(invoice.id, { status: 'paid', paid_at: new Date().toISOString().split('T')[0] });
    toast({ title: 'Invoice Paid', description: `Invoice for ${invoice.school_name} has been marked as paid.` });
    loadInvoices();
  };

  const handleDelete = () => {
    if (!deleteDialog.invoice) return;
    invoicesStorage.remove(deleteDialog.invoice.id);
    toast({ title: 'Invoice Deleted', description: `Invoice has been permanently removed.` });
    setDeleteDialog({ open: false, invoice: null });
    loadInvoices();
  };

  const updateField = (field: string, value: string | number | null) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const uniqueSchools = Array.from(new Map(invoices.map(i => [i.school_id, { id: i.school_id, name: i.school_name }])).values());

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Finance & Billing</h1>
          <p className="text-muted-foreground">Invoice management and revenue overview</p>
        </div>
        <Button onClick={openAddDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="glass-card rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-500/10">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-600">
              <ArrowUpRight className="w-3 h-3" />
              Revenue
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">{formatKES(totalRevenue)}</p>
          <p className="text-sm text-muted-foreground">Total Revenue</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-yellow-500/10">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-yellow-500/10 text-yellow-600">
              {pendingAmount > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              Pending
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">{formatKES(pendingAmount)}</p>
          <p className="text-sm text-muted-foreground">Pending Amount</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-500/10">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-red-500/10 text-red-600">
              {overdueAmount > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              Overdue
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">{formatKES(overdueAmount)}</p>
          <p className="text-sm text-muted-foreground">Overdue Amount</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary">
              <ArrowUpRight className="w-3 h-3" />
              Total
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">{totalInvoices}</p>
          <p className="text-sm text-muted-foreground">Total Invoices</p>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-border/50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices by school, description, period..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <Button variant={statusFilter === 'all' ? 'default' : 'outline'} onClick={() => setStatusFilter('all')} size="sm">All</Button>
              <Button variant={statusFilter === 'paid' ? 'default' : 'outline'} onClick={() => setStatusFilter('paid')} size="sm">Paid</Button>
              <Button variant={statusFilter === 'pending' ? 'default' : 'outline'} onClick={() => setStatusFilter('pending')} size="sm">Pending</Button>
              <Button variant={statusFilter === 'overdue' ? 'default' : 'outline'} onClick={() => setStatusFilter('overdue')} size="sm">Overdue</Button>
              <Select value={schoolFilter} onValueChange={setSchoolFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by school" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schools</SelectItem>
                  {uniqueSchools.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No invoices found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Invoice ID</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">School Name</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Period</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Due Date</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Paid Date</th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((invoice, index) => (
                  <motion.tr
                    key={invoice.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="border-b border-border/30 hover:bg-secondary/30 transition-colors group"
                  >
                    <td className="py-4 px-6 font-mono text-sm text-muted-foreground">{invoice.id.slice(0, 8).toUpperCase()}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-semibold text-xs">{invoice.school_name.charAt(0)}</span>
                        </div>
                        <span className="font-medium text-foreground text-sm">{invoice.school_name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm">{invoice.description}</td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">{invoice.period}</td>
                    <td className="py-4 px-6 text-sm font-semibold text-right">{formatKES(invoice.amount)}</td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">{invoice.due_date}</td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">{invoice.paid_at || '—'}</td>
                    <td className="py-4 px-6 text-center">
                      <Badge variant="outline" className={cn(
                        "capitalize",
                        invoice.status === 'paid' && 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30',
                        invoice.status === 'pending' && 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
                        invoice.status === 'overdue' && 'bg-red-500/20 text-red-700 border-red-500/30'
                      )}>
                        {invoice.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {(invoice.status === 'pending' || invoice.status === 'overdue') && (
                          <Button variant="ghost" size="icon" onClick={() => handleMarkPaid(invoice)} title="Mark as Paid">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(invoice)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ open: true, invoice })}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingInvoice ? 'Edit Invoice' : 'Create Invoice'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>School</Label>
              <Select value={form.school_id} onValueChange={handleSchoolChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select school" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => updateField('description', e.target.value)} placeholder="e.g. Platform Subscription - Term 1" />
            </div>
            <div className="space-y-2">
              <Label>Amount (KES)</Label>
              <Input type="number" value={form.amount || ''} onChange={(e) => updateField('amount', parseFloat(e.target.value) || 0)} placeholder="e.g. 45000" />
            </div>
            <div className="space-y-2">
              <Label>Period</Label>
              <Input value={form.period} onChange={(e) => updateField('period', e.target.value)} placeholder="e.g. 2024 Term 1" />
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" value={form.due_date} onChange={(e) => updateField('due_date', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => updateField('status', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingInvoice ? 'Save Changes' : 'Create Invoice'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the invoice for <strong>{deleteDialog.invoice?.school_name}</strong> ({deleteDialog.invoice?.description}). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}