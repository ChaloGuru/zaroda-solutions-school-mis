import { useState, useMemo } from 'react';
import {
  hoiFeesStorage,
  hoiExpensesStorage,
  HoiFeePayment,
  HoiExpense,
} from '@/lib/hoiStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Receipt,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

const ROWS_PER_PAGE = 10;

const PAYMENT_METHODS = ['cash', 'mpesa', 'bank'] as const;
const TERMS = ['Term 1', 'Term 2', 'Term 3'] as const;
const EXPENSE_CATEGORIES = ['utilities', 'supplies', 'maintenance', 'salaries', 'transport', 'other'] as const;

const methodColors: Record<string, string> = {
  cash: 'bg-green-100 text-green-700 border-green-200',
  mpesa: 'bg-blue-100 text-blue-700 border-blue-200',
  bank: 'bg-purple-100 text-purple-700 border-purple-200',
};

const categoryColors: Record<string, string> = {
  utilities: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  supplies: 'bg-blue-100 text-blue-700 border-blue-200',
  maintenance: 'bg-orange-100 text-orange-700 border-orange-200',
  salaries: 'bg-red-100 text-red-700 border-red-200',
  transport: 'bg-green-100 text-green-700 border-green-200',
  other: 'bg-gray-100 text-gray-700 border-gray-200',
};

const PIE_COLORS = ['#f59e0b', '#3b82f6', '#f97316', '#ef4444', '#22c55e', '#6b7280'];

export default function HoiFinances() {
  const { toast } = useToast();

  const [fees, setFees] = useState<HoiFeePayment[]>(() => hoiFeesStorage.getAll());
  const [expenses, setExpenses] = useState<HoiExpense[]>(() => hoiExpensesStorage.getAll());

  const [feeSearch, setFeeSearch] = useState('');
  const [feeTermFilter, setFeeTermFilter] = useState('all');
  const [feeYearFilter, setFeeYearFilter] = useState('all');
  const [feeMethodFilter, setFeeMethodFilter] = useState('all');
  const [feePage, setFeePage] = useState(1);
  const [feeDialogOpen, setFeeDialogOpen] = useState(false);

  const [expSearch, setExpSearch] = useState('');
  const [expCategoryFilter, setExpCategoryFilter] = useState('all');
  const [expPage, setExpPage] = useState(1);
  const [expDialogOpen, setExpDialogOpen] = useState(false);

  const [feeForm, setFeeForm] = useState({
    student_name: '',
    admission_no: '',
    amount: '',
    term: 'Term 1' as HoiFeePayment['term'],
    year: new Date().getFullYear().toString(),
    date: new Date().toISOString().split('T')[0],
    payment_method: 'cash' as HoiFeePayment['payment_method'],
    receipt_no: '',
  });

  const [expForm, setExpForm] = useState({
    item: '',
    amount: '',
    category: 'utilities' as HoiExpense['category'],
    date: new Date().toISOString().split('T')[0],
    approved_by: '',
    notes: '',
  });

  const filteredFees = useMemo(() => {
    return fees.filter((f) => {
      const matchSearch = f.student_name.toLowerCase().includes(feeSearch.toLowerCase());
      const matchTerm = feeTermFilter === 'all' || f.term === feeTermFilter;
      const matchYear = feeYearFilter === 'all' || f.year.toString() === feeYearFilter;
      const matchMethod = feeMethodFilter === 'all' || f.payment_method === feeMethodFilter;
      return matchSearch && matchTerm && matchYear && matchMethod;
    });
  }, [fees, feeSearch, feeTermFilter, feeYearFilter, feeMethodFilter]);

  const feeTotalPages = Math.max(1, Math.ceil(filteredFees.length / ROWS_PER_PAGE));
  const paginatedFees = filteredFees.slice((feePage - 1) * ROWS_PER_PAGE, feePage * ROWS_PER_PAGE);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch = e.item.toLowerCase().includes(expSearch.toLowerCase());
      const matchCategory = expCategoryFilter === 'all' || e.category === expCategoryFilter;
      return matchSearch && matchCategory;
    });
  }, [expenses, expSearch, expCategoryFilter]);

  const expTotalPages = Math.max(1, Math.ceil(filteredExpenses.length / ROWS_PER_PAGE));
  const paginatedExpenses = filteredExpenses.slice((expPage - 1) * ROWS_PER_PAGE, expPage * ROWS_PER_PAGE);

  const feeYears = useMemo(() => [...new Set(fees.map((f) => f.year.toString()))].sort(), [fees]);

  const resetFeeForm = () => {
    setFeeForm({
      student_name: '',
      admission_no: '',
      amount: '',
      term: 'Term 1',
      year: new Date().getFullYear().toString(),
      date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      receipt_no: '',
    });
  };

  const resetExpForm = () => {
    setExpForm({
      item: '',
      amount: '',
      category: 'utilities',
      date: new Date().toISOString().split('T')[0],
      approved_by: '',
      notes: '',
    });
  };

  const handleAddFee = () => {
    if (!feeForm.student_name.trim() || !feeForm.admission_no.trim() || !feeForm.amount || !feeForm.receipt_no.trim()) {
      toast({ title: 'Validation Error', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    const amount = parseFloat(feeForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Validation Error', description: 'Amount must be a positive number.', variant: 'destructive' });
      return;
    }
    hoiFeesStorage.add({
      student_id: '',
      student_name: feeForm.student_name.trim(),
      admission_no: feeForm.admission_no.trim(),
      amount,
      term: feeForm.term,
      year: parseInt(feeForm.year),
      date: feeForm.date,
      payment_method: feeForm.payment_method,
      receipt_no: feeForm.receipt_no.trim(),
      recorded_by: 'Bursar',
    });
    setFees(hoiFeesStorage.getAll());
    setFeeDialogOpen(false);
    resetFeeForm();
    toast({ title: 'Success', description: 'Fee payment recorded successfully.' });
  };

  const handleAddExpense = () => {
    if (!expForm.item.trim() || !expForm.amount || !expForm.approved_by.trim()) {
      toast({ title: 'Validation Error', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    const amount = parseFloat(expForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Validation Error', description: 'Amount must be a positive number.', variant: 'destructive' });
      return;
    }
    hoiExpensesStorage.add({
      item: expForm.item.trim(),
      amount,
      category: expForm.category,
      date: expForm.date,
      approved_by: expForm.approved_by.trim(),
      notes: expForm.notes.trim() || undefined,
    });
    setExpenses(hoiExpensesStorage.getAll());
    setExpDialogOpen(false);
    resetExpForm();
    toast({ title: 'Success', description: 'Expense recorded successfully.' });
  };

  const totalRevenue = fees.reduce((s, f) => s + f.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netBalance = totalRevenue - totalExpenses;

  const expenseByCategoryData = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((m, i) => {
      const rev = fees.filter((f) => new Date(f.date).getMonth() === i).reduce((s, f) => s + f.amount, 0);
      const exp = expenses.filter((e) => new Date(e.date).getMonth() === i).reduce((s, e) => s + e.amount, 0);
      return { name: m, revenue: rev, expenses: exp };
    });
  }, [fees, expenses]);

  const Pagination = ({ page, totalPages, setPage }: { page: number; totalPages: number; setPage: (p: number) => void }) => (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-1">Financial Management</h1>
        <p className="text-muted-foreground">Manage fee payments, expenses, and view financial summaries.</p>
      </div>

      <Tabs defaultValue="fees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="fees">Fee Payments</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="fees">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="text-lg">Fee Payments</CardTitle>
                <Button size="sm" onClick={() => { resetFeeForm(); setFeeDialogOpen(true); }}>
                  <Plus className="w-4 h-4 mr-1" /> Record Payment
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search by student name..." value={feeSearch} onChange={(e) => { setFeeSearch(e.target.value); setFeePage(1); }} className="pl-9" />
                </div>
                <Select value={feeTermFilter} onValueChange={(v) => { setFeeTermFilter(v); setFeePage(1); }}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Term" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Terms</SelectItem>
                    {TERMS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={feeYearFilter} onValueChange={(v) => { setFeeYearFilter(v); setFeePage(1); }}>
                  <SelectTrigger className="w-[120px]"><SelectValue placeholder="Year" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {feeYears.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={feeMethodFilter} onValueChange={(v) => { setFeeMethodFilter(v); setFeePage(1); }}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Method" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    {PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Adm No</TableHead>
                    <TableHead>Amount (KES)</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedFees.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No fee payments found.</TableCell></TableRow>
                  ) : paginatedFees.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.student_name}</TableCell>
                      <TableCell>{f.admission_no}</TableCell>
                      <TableCell>{f.amount.toLocaleString()}</TableCell>
                      <TableCell>{f.term}</TableCell>
                      <TableCell>{f.year}</TableCell>
                      <TableCell>{new Date(f.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`capitalize ${methodColors[f.payment_method] || ''}`}>{f.payment_method}</Badge>
                      </TableCell>
                      <TableCell>{f.receipt_no}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination page={feePage} totalPages={feeTotalPages} setPage={setFeePage} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="text-lg">Expenses</CardTitle>
                <Button size="sm" onClick={() => { resetExpForm(); setExpDialogOpen(true); }}>
                  <Plus className="w-4 h-4 mr-1" /> Add Expense
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search expenses..." value={expSearch} onChange={(e) => { setExpSearch(e.target.value); setExpPage(1); }} className="pl-9" />
                </div>
                <Select value={expCategoryFilter} onValueChange={(v) => { setExpCategoryFilter(v); setExpPage(1); }}>
                  <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {EXPENSE_CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Amount (KES)</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Approved By</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedExpenses.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No expenses found.</TableCell></TableRow>
                  ) : paginatedExpenses.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.item}</TableCell>
                      <TableCell>{e.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`capitalize ${categoryColors[e.category] || ''}`}>{e.category}</Badge>
                      </TableCell>
                      <TableCell>{new Date(e.date).toLocaleDateString()}</TableCell>
                      <TableCell>{e.approved_by}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{e.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination page={expPage} totalPages={expTotalPages} setPage={setExpPage} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold text-foreground">KES {totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Expenses</p>
                    <p className="text-2xl font-bold text-foreground">KES {totalExpenses.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Net Balance</p>
                    <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      KES {netBalance.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Monthly Revenue vs Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(value: number) => `KES ${value.toLocaleString()}`}
                    />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Expense Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenseByCategoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {expenseByCategoryData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `KES ${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Monthly Financial Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Revenue (KES)</TableHead>
                    <TableHead>Expenses (KES)</TableHead>
                    <TableHead>Net (KES)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyData.filter((m) => m.revenue > 0 || m.expenses > 0).map((m) => (
                    <TableRow key={m.name}>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell className="text-green-600">{m.revenue.toLocaleString()}</TableCell>
                      <TableCell className="text-red-600">{m.expenses.toLocaleString()}</TableCell>
                      <TableCell className={m.revenue - m.expenses >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {(m.revenue - m.expenses).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={feeDialogOpen} onOpenChange={setFeeDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" /> Record Fee Payment
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Student Name *</label>
                <Input value={feeForm.student_name} onChange={(e) => setFeeForm({ ...feeForm, student_name: e.target.value })} placeholder="Full name" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Admission No *</label>
                <Input value={feeForm.admission_no} onChange={(e) => setFeeForm({ ...feeForm, admission_no: e.target.value })} placeholder="ADM-XXXX" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Amount (KES) *</label>
                <Input type="number" value={feeForm.amount} onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })} placeholder="0" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Receipt No *</label>
                <Input value={feeForm.receipt_no} onChange={(e) => setFeeForm({ ...feeForm, receipt_no: e.target.value })} placeholder="RCP-XXX" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Term</label>
                <Select value={feeForm.term} onValueChange={(v) => setFeeForm({ ...feeForm, term: v as HoiFeePayment['term'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TERMS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Year</label>
                <Input type="number" value={feeForm.year} onChange={(e) => setFeeForm({ ...feeForm, year: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Payment Method</label>
                <Select value={feeForm.payment_method} onValueChange={(v) => setFeeForm({ ...feeForm, payment_method: v as HoiFeePayment['payment_method'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Date</label>
              <Input type="date" value={feeForm.date} onChange={(e) => setFeeForm({ ...feeForm, date: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeeDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddFee}>Record Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={expDialogOpen} onOpenChange={setExpDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5" /> Add Expense
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Item / Description *</label>
              <Input value={expForm.item} onChange={(e) => setExpForm({ ...expForm, item: e.target.value })} placeholder="Expense description" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Amount (KES) *</label>
                <Input type="number" value={expForm.amount} onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })} placeholder="0" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Category</label>
                <Select value={expForm.category} onValueChange={(v) => setExpForm({ ...expForm, category: v as HoiExpense['category'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Date</label>
                <Input type="date" value={expForm.date} onChange={(e) => setExpForm({ ...expForm, date: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Approved By *</label>
                <Input value={expForm.approved_by} onChange={(e) => setExpForm({ ...expForm, approved_by: e.target.value })} placeholder="Approver name" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Notes</label>
              <Input value={expForm.notes} onChange={(e) => setExpForm({ ...expForm, notes: e.target.value })} placeholder="Optional notes" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExpDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddExpense}>Add Expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}