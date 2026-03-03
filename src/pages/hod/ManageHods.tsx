import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { hodStorage } from '@/lib/storage';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const DEPARTMENTS = ['STEM', 'Arts and Sports', 'Social Sciences'];

const ManageHods = () => {
  const [hods, setHods] = useState<Awaited<ReturnType<typeof hodStorage.getAll>>>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '', employeeId: '', department: DEPARTMENTS[0], hodCode: '' });
  const { toast } = useToast();
  const { currentUser } = useAuthContext();

  useEffect(() => {
    const loadHods = async () => {
      const allHods = await hodStorage.getAll();
      const scopedHods = currentUser?.schoolCode
        ? allHods.filter((hod) => hod.schoolCode === currentUser.schoolCode)
        : allHods;
      setHods(scopedHods);
    };
    void loadHods();
  }, [currentUser?.schoolCode]);

  const reset = () => setForm({ fullName: '', email: '', password: '', phone: '', employeeId: '', department: DEPARTMENTS[0], hodCode: '' });

  const handleCreate = async () => {
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
    if (!currentUser?.schoolId || !currentUser.schoolCode || !currentUser.schoolName) {
      toast({ title: 'Missing school context', description: 'Your account is not linked to a school.', variant: 'destructive' });
      return;
    }

    const existing = await hodStorage.findByEmail(emailVal);
    if (existing) { toast({ title: 'Exists', description: 'An HOD with this email already exists.', variant: 'destructive' }); return; }

    const { data: authData, error: createAuthError } = await supabase.auth.signUp({
      email: emailVal,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName.trim(),
          role: 'hod',
        },
      },
    });
    if (createAuthError) {
      toast({ title: 'Create failed', description: createAuthError.message, variant: 'destructive' });
      return;
    }

    const authUser = authData.user;
    if (!authUser) {
      toast({ title: 'Create failed', description: 'Auth user was not created.', variant: 'destructive' });
      return;
    }

    const { error: profileUpsertError } = await supabase.from('profiles').upsert({
      id: authUser.id,
      email: emailVal,
      full_name: form.fullName.trim(),
      role: 'hod',
      school_id: currentUser.schoolId,
      school_code: currentUser.schoolCode,
      school_name: currentUser.schoolName,
      phone: form.phone.trim() || null,
      status: 'active',
      created_by: currentUser.role?.toUpperCase() || 'HOI',
    }, { onConflict: 'id' });

    if (profileUpsertError) {
      toast({ title: 'Create failed', description: profileUpsertError.message, variant: 'destructive' });
      return;
    }

    const created = await hodStorage.add({ fullName: form.fullName.trim(), email: emailVal, phone: form.phone.trim(), employeeId: form.employeeId.trim(), department: form.department, hodCode: form.hodCode.trim(), schoolCode: currentUser.schoolCode });
    const allHods = await hodStorage.getAll();
    setHods(allHods.filter((hod) => hod.schoolCode === currentUser.schoolCode));
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
