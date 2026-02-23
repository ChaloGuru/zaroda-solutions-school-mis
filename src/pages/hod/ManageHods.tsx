import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { hodStorage } from '@/lib/storage';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

const DEPARTMENTS = ['STEM', 'Arts and Sports', 'Social Sciences'];

const ManageHods = () => {
  const [hods, setHods] = useState(() => hodStorage.getAll());
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '', employeeId: '', department: DEPARTMENTS[0], hodCode: '' });
  const { toast } = useToast();

  useEffect(() => {
    setHods(hodStorage.getAll());
  }, []);

  const reset = () => setForm({ fullName: '', email: '', password: '', phone: '', employeeId: '', department: DEPARTMENTS[0], hodCode: '' });

  const savePassword = (email: string, pwd: string) => {
    try {
      const key = 'zaroda_passwords';
      const existing = localStorage.getItem(key);
      const pwds = existing ? JSON.parse(existing) : {};
      pwds[email.toLowerCase()] = pwd;
      localStorage.setItem(key, JSON.stringify(pwds));
    } catch (e) { /* ignore */ }
  };

  const handleCreate = () => {
    // validation
    if (!form.fullName.trim() || !form.email.trim() || !form.password.trim() || !form.department.trim()) {
      toast({ title: 'Missing fields', description: 'Please fill all required fields.', variant: 'destructive' });
      return;
    }
    const emailVal = form.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailVal)) { toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'destructive' }); return; }
    if (form.password.length < 6) { toast({ title: 'Weak password', description: 'Password must be at least 6 characters.', variant: 'destructive' }); return; }
    if (!form.employeeId.trim()) { toast({ title: 'Missing employee ID', description: 'Please provide an employee ID.', variant: 'destructive' }); return; }

    const existing = hodStorage.findByEmail(emailVal);
    if (existing) { toast({ title: 'Exists', description: 'An HOD with this email already exists.', variant: 'destructive' }); return; }

    const created = hodStorage.add({ fullName: form.fullName.trim(), email: emailVal, phone: form.phone.trim(), employeeId: form.employeeId.trim(), department: form.department, hodCode: form.hodCode.trim(), schoolCode: '' });
    savePassword(created.email, form.password.trim());
    setHods(hodStorage.getAll());
    toast({ title: 'HOD created', description: `${created.fullName} created successfully.` });
    reset();
    setOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Manage HODs</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add HOD</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create HOD Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <div>
                <Label>Full name</Label>
                <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <Label>Password</Label>
                <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <Label>Employee ID</Label>
                <Input value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} />
              </div>
              <div>
                <Label>Department</Label>
                <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full p-2 border rounded-md bg-card">
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <Label>HOD Code</Label>
                <Input value={form.hodCode} onChange={(e) => setForm({ ...form, hodCode: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => { reset(); setOpen(false); }}>Cancel</Button>
                <Button onClick={handleCreate}>Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-md p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>HOD Code</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Phone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hods.map(h => (
              <TableRow key={h.id}>
                <TableCell>{h.hodCode}</TableCell>
                <TableCell>{h.fullName}</TableCell>
                <TableCell>{h.email}</TableCell>
                <TableCell>{h.department}</TableCell>
                <TableCell>{h.phone}</TableCell>
              </TableRow>
            ))}
            {hods.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">No HOD accounts yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ManageHods;
