import React, { useEffect, useState } from 'react';
import { departmentsStorage } from '@/lib/storage';
import type { DepartmentProfile as DepartmentProfileType } from '@/lib/storage';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

const DepartmentProfile = () => {
  const { currentUser } = useAuthContext();
  const { toast } = useToast();
  const deptName = currentUser?.department || '';

  const [profile, setProfile] = useState<DepartmentProfileType | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [form, setForm] = useState({ name: deptName, motto: '', description: '', newSubject: '' });

  useEffect(() => {
    const loadProfile = async () => {
      const p = await departmentsStorage.findByName(deptName);
      setProfile(p || null);
      if (p) setForm({ name: p.name, motto: p.motto || '', description: p.description || '', newSubject: '' });
    };
    void loadProfile();
  }, [deptName]);

  const saveProfile = async () => {
    if (!form.name.trim()) { toast({ title: 'Validation', description: 'Department name required', variant: 'destructive' }); return; }
    if (profile) {
      await departmentsStorage.update(profile.id, { name: form.name, motto: form.motto, description: form.description });
      const refreshed = await departmentsStorage.findByName(form.name.trim());
      setProfile(refreshed || null);
      toast({ title: 'Updated', description: 'Department profile updated.' });
    } else {
      const created = await departmentsStorage.add({ name: form.name, motto: form.motto, description: form.description, subjects: [], goals: [], meetings: [] });
      setProfile(created);
      toast({ title: 'Created', description: 'Department profile created.' });
    }
    setOpenEdit(false);
  };

  const addSubject = async () => {
    if (!form.newSubject.trim() || !profile) return;
    const subjects = [...(profile.subjects || []), form.newSubject.trim()];
    await departmentsStorage.update(profile.id, { subjects });
    const refreshed = await departmentsStorage.findByName(profile.name);
    setProfile(refreshed || null);
    setForm({ ...form, newSubject: '' });
    toast({ title: 'Added', description: 'Subject added.' });
  };

  const addGoal = async () => {
    if (!profile) return;
    const text = prompt('Enter goal text');
    if (!text) return;
    const goals = [...(profile.goals || []), { id: Date.now().toString(), text }];
    await departmentsStorage.update(profile.id, { goals });
    const refreshed = await departmentsStorage.findByName(profile.name);
    setProfile(refreshed || null);
    toast({ title: 'Saved', description: 'Goal added.' });
  };

  const addMeeting = async () => {
    if (!profile) return;
    const date = prompt('Meeting date (YYYY-MM-DD)');
    const agenda = prompt('Agenda');
    if (!date || !agenda) return;
    const meetings = [...(profile.meetings || []), { id: Date.now().toString(), date, agenda, minutes: '', attendees: [] }];
    await departmentsStorage.update(profile.id, { meetings });
    const refreshed = await departmentsStorage.findByName(profile.name);
    setProfile(refreshed || null);
    toast({ title: 'Saved', description: 'Meeting scheduled.' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Department Profile</h2>
        <div className="flex gap-2">
          <Dialog open={openEdit} onOpenChange={setOpenEdit}>
            <DialogTrigger asChild><Button>Edit Profile</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Edit Department</DialogTitle></DialogHeader>
              <div className="space-y-3 mt-2">
                <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Motto</Label><Input value={form.motto} onChange={(e) => setForm({ ...form, motto: e.target.value })} /></div>
                <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setOpenEdit(false)}>Cancel</Button><Button onClick={saveProfile}>Save</Button></div>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={addGoal}>Add Goal</Button>
          <Button onClick={addMeeting}>Schedule Meeting</Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-md p-4 space-y-4">
        {profile ? (
          <>
            <div><strong>{profile.name}</strong> <div className="text-sm text-muted-foreground">{profile.motto}</div></div>
            <div>{profile.description}</div>

            <div>
              <h3 className="font-medium">Subjects</h3>
              <div className="flex gap-2 mt-2">
                <Input placeholder="Add subject" value={form.newSubject} onChange={(e) => setForm({ ...form, newSubject: e.target.value })} />
                <Button onClick={addSubject}>Add</Button>
              </div>
              <div className="mt-2">
                {(profile.subjects || []).map(s => <div key={s} className="py-1">{s}</div>)}
              </div>
            </div>

            <div>
              <h3 className="font-medium">Term Goals</h3>
              {(profile.goals || []).map(g => <div key={g.id} className="py-1">{g.text}</div>)}
            </div>

            <div>
              <h3 className="font-medium">Meetings</h3>
              {(profile.meetings || []).map(m => (
                <div key={m.id} className="py-2 border-b">
                  <div className="font-medium">{m.date} — {m.agenda}</div>
                  <div className="text-sm text-muted-foreground">Minutes: {m.minutes || 'Not recorded'}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div>No department profile yet. Use Edit to create one.</div>
        )}
      </div>
    </div>
  );
};

export default DepartmentProfile;
