import { useState, useEffect } from 'react';
import {
  hoiElectionsStorage,
  hoiCandidatesStorage,
  hoiStudentsStorage,
  HoiElection,
  HoiCandidate,
  HoiStudent,
} from '@/lib/hoiStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Vote,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Users,
  Award,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const PAGE_SIZE = 10;
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export default function DhoiElections() {
  const { toast } = useToast();

  const [elections, setElections] = useState<HoiElection[]>([]);
  const [candidates, setCandidates] = useState<HoiCandidate[]>([]);
  const [students, setStudents] = useState<HoiStudent[]>([]);

  const [electionDialogOpen, setElectionDialogOpen] = useState(false);
  const [editingElection, setEditingElection] = useState<HoiElection | null>(null);
  const [electionForm, setElectionForm] = useState({ name: '', positions: '' as string, date: '', status: 'upcoming' as HoiElection['status'] });
  const [electionsPage, setElectionsPage] = useState(1);

  const [selectedCandElection, setSelectedCandElection] = useState('');
  const [candidateDialogOpen, setCandidateDialogOpen] = useState(false);
  const [candidateForm, setCandidateForm] = useState({ student_id: '', position: '' });
  const [candidatesPage, setCandidatesPage] = useState(1);

  const [selectedResultElection, setSelectedResultElection] = useState('');
  const [voteEdits, setVoteEdits] = useState<Record<string, number>>({});
  const [selectedPosition, setSelectedPosition] = useState('');

  const reload = () => {
    setElections(hoiElectionsStorage.getAll());
    setCandidates(hoiCandidatesStorage.getAll());
    setStudents(hoiStudentsStorage.getAll());
  };

  useEffect(() => { reload(); }, []);

  const electionsTotal = Math.max(1, Math.ceil(elections.length / PAGE_SIZE));
  const pagedElections = elections.slice((electionsPage - 1) * PAGE_SIZE, electionsPage * PAGE_SIZE);

  const electionCandidates = candidates.filter(c => c.election_id === selectedCandElection);
  const candidatesTotal = Math.max(1, Math.ceil(electionCandidates.length / PAGE_SIZE));
  const pagedCandidates = electionCandidates.slice((candidatesPage - 1) * PAGE_SIZE, candidatesPage * PAGE_SIZE);

  const resultElection = elections.find(e => e.id === selectedResultElection);
  const resultCandidates = candidates.filter(c => c.election_id === selectedResultElection);
  const resultPositions = resultElection?.positions || [];
  const positionCandidates = resultCandidates.filter(c => !selectedPosition || c.position === selectedPosition);

  const chartData = positionCandidates.map(c => ({
    name: c.student_name,
    votes: voteEdits[c.id] !== undefined ? voteEdits[c.id] : c.votes,
  }));

  const openAddElection = () => {
    setEditingElection(null);
    setElectionForm({ name: '', positions: '', date: '', status: 'upcoming' });
    setElectionDialogOpen(true);
  };

  const openEditElection = (e: HoiElection) => {
    setEditingElection(e);
    setElectionForm({ name: e.name, positions: e.positions.join(', '), date: e.date, status: e.status });
    setElectionDialogOpen(true);
  };

  const saveElection = () => {
    if (!electionForm.name.trim() || !electionForm.date || !electionForm.positions.trim()) {
      toast({ title: 'Validation Error', description: 'Name, positions and date are required', variant: 'destructive' });
      return;
    }
    const posArr = electionForm.positions.split(',').map(p => p.trim()).filter(Boolean);
    if (editingElection) {
      hoiElectionsStorage.update(editingElection.id, { name: electionForm.name, positions: posArr, date: electionForm.date, status: electionForm.status });
      toast({ title: 'Election Updated' });
    } else {
      hoiElectionsStorage.add({ name: electionForm.name, positions: posArr, date: electionForm.date, status: electionForm.status });
      toast({ title: 'Election Created' });
    }
    setElectionDialogOpen(false);
    reload();
  };

  const deleteElection = (id: string) => {
    hoiElectionsStorage.remove(id);
    toast({ title: 'Election Deleted' });
    reload();
  };

  const selectedElectionObj = elections.find(e => e.id === selectedCandElection);

  const addCandidate = () => {
    if (!candidateForm.student_id || !candidateForm.position) {
      toast({ title: 'Validation Error', description: 'Student and position are required', variant: 'destructive' });
      return;
    }
    const student = students.find(s => s.id === candidateForm.student_id);
    if (!student) return;
    const exists = candidates.find(c => c.election_id === selectedCandElection && c.student_id === candidateForm.student_id && c.position === candidateForm.position);
    if (exists) {
      toast({ title: 'Already Registered', description: 'This candidate is already registered for this position', variant: 'destructive' });
      return;
    }
    hoiCandidatesStorage.add({
      election_id: selectedCandElection,
      student_id: student.id,
      student_name: student.full_name,
      class_name: student.class_name,
      position: candidateForm.position,
      votes: 0,
    });
    toast({ title: 'Candidate Registered' });
    setCandidateDialogOpen(false);
    setCandidateForm({ student_id: '', position: '' });
    reload();
  };

  const removeCandidate = (id: string) => {
    hoiCandidatesStorage.remove(id);
    toast({ title: 'Candidate Removed' });
    reload();
  };

  const saveVotes = () => {
    Object.entries(voteEdits).forEach(([id, votes]) => {
      hoiCandidatesStorage.update(id, { votes });
    });
    toast({ title: 'Votes Saved' });
    setVoteEdits({});
    reload();
  };

  const declareWinner = () => {
    if (!selectedPosition || positionCandidates.length === 0) return;
    const sorted = [...positionCandidates].sort((a, b) => {
      const va = voteEdits[a.id] !== undefined ? voteEdits[a.id] : a.votes;
      const vb = voteEdits[b.id] !== undefined ? voteEdits[b.id] : b.votes;
      return vb - va;
    });
    toast({ title: `Winner: ${sorted[0].student_name}`, description: `${sorted[0].student_name} wins ${selectedPosition} with ${voteEdits[sorted[0].id] !== undefined ? voteEdits[sorted[0].id] : sorted[0].votes} votes` });
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      upcoming: 'bg-blue-100 text-blue-700 border-blue-200',
      active: 'bg-amber-100 text-amber-700 border-amber-200',
      completed: 'bg-green-100 text-green-700 border-green-200',
    };
    return <Badge variant="outline" className={`capitalize ${colors[status] || ''}`}>{status}</Badge>;
  };

  const Pagination = ({ page, total, setPage }: { page: number; total: number; setPage: (p: number) => void }) => (
    <div className="flex items-center justify-between mt-4">
      <span className="text-sm text-muted-foreground">Page {page} of {total}</span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="w-4 h-4" /></Button>
        <Button variant="outline" size="sm" disabled={page >= total} onClick={() => setPage(page + 1)}><ChevronRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-1">Student Elections</h1>
        <p className="text-muted-foreground">Manage student council elections, candidates and results</p>
      </div>

      <Tabs defaultValue="elections">
        <TabsList className="mb-4">
          <TabsTrigger value="elections" className="gap-2"><Vote className="w-4 h-4" />Elections</TabsTrigger>
          <TabsTrigger value="candidates" className="gap-2"><Users className="w-4 h-4" />Candidates</TabsTrigger>
        </TabsList>

        <TabsContent value="elections">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>All Elections</CardTitle>
                <Button onClick={openAddElection}><Plus className="w-4 h-4 mr-1" />Create Election</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Election Name</TableHead>
                    <TableHead>Positions</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedElections.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No elections</TableCell></TableRow>
                  ) : pagedElections.map(e => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {e.positions.map(p => <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>)}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(e.date).toLocaleDateString()}</TableCell>
                      <TableCell>{statusBadge(e.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEditElection(e)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteElection(e.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination page={electionsPage} total={electionsTotal} setPage={setElectionsPage} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="candidates">
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <CardTitle>Candidates</CardTitle>
                  <div className="flex gap-2">
                    <Select value={selectedCandElection} onValueChange={v => { setSelectedCandElection(v); setCandidatesPage(1); }}>
                      <SelectTrigger className="w-[250px]"><SelectValue placeholder="Select election" /></SelectTrigger>
                      <SelectContent>
                        {elections.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {selectedCandElection && (
                      <Button onClick={() => { setCandidateForm({ student_id: '', position: '' }); setCandidateDialogOpen(true); }}>
                        <Plus className="w-4 h-4 mr-1" />Register Candidate
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!selectedCandElection ? (
                  <p className="text-center text-muted-foreground py-8">Select an election to view candidates</p>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Votes</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pagedCandidates.length === 0 ? (
                          <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No candidates registered</TableCell></TableRow>
                        ) : pagedCandidates.map(c => (
                          <TableRow key={c.id}>
                            <TableCell className="font-medium">{c.student_name}</TableCell>
                            <TableCell>{c.class_name}</TableCell>
                            <TableCell><Badge variant="secondary">{c.position}</Badge></TableCell>
                            <TableCell>{c.votes}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => removeCandidate(c.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <Pagination page={candidatesPage} total={candidatesTotal} setPage={setCandidatesPage} />
                  </>
                )}
              </CardContent>
            </Card>

            {selectedCandElection && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <CardTitle>Election Results</CardTitle>
                    <div className="flex gap-2">
                      {selectedElectionObj && selectedElectionObj.positions.length > 0 && (
                        <Select value={selectedPosition} onValueChange={v => { setSelectedPosition(v); setSelectedResultElection(selectedCandElection); setVoteEdits({}); }}>
                          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select position" /></SelectTrigger>
                          <SelectContent>
                            {selectedElectionObj.positions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {!selectedPosition ? (
                    <p className="text-center text-muted-foreground py-8">Select a position to view candidates and votes</p>
                  ) : (
                    <div className="space-y-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Candidate</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Votes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {positionCandidates.length === 0 ? (
                            <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No candidates for this position</TableCell></TableRow>
                          ) : positionCandidates
                            .sort((a, b) => {
                              const va = voteEdits[a.id] !== undefined ? voteEdits[a.id] : a.votes;
                              const vb = voteEdits[b.id] !== undefined ? voteEdits[b.id] : b.votes;
                              return vb - va;
                            })
                            .map((c, i) => {
                              const isTop = i === 0 && ((voteEdits[c.id] !== undefined ? voteEdits[c.id] : c.votes) > 0);
                              return (
                                <TableRow key={c.id} className={isTop ? 'bg-green-50 dark:bg-green-950/20' : ''}>
                                  <TableCell className="font-medium">
                                    {c.student_name}
                                    {isTop && <Award className="inline w-4 h-4 text-amber-500 ml-2" />}
                                  </TableCell>
                                  <TableCell>{c.class_name}</TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      min={0}
                                      className="w-24"
                                      value={voteEdits[c.id] !== undefined ? voteEdits[c.id] : c.votes}
                                      onChange={e => setVoteEdits({ ...voteEdits, [c.id]: parseInt(e.target.value) || 0 })}
                                    />
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                        </TableBody>
                      </Table>

                      <div className="flex gap-2">
                        <Button onClick={saveVotes}>Save Votes</Button>
                        <Button variant="outline" onClick={declareWinner}><Award className="w-4 h-4 mr-1" />Declare Winner</Button>
                      </div>

                      {chartData.length > 0 && (
                        <div className="mt-4">
                          <h3 className="text-lg font-semibold mb-3">Votes Chart &mdash; {selectedPosition}</h3>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'hsl(var(--card))',
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '8px',
                                }}
                              />
                              <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                                {chartData.map((_, i) => (
                                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={electionDialogOpen} onOpenChange={setElectionDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingElection ? 'Edit Election' : 'Create Election'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Election Name *</Label>
              <Input value={electionForm.name} onChange={e => setElectionForm({ ...electionForm, name: e.target.value })} />
            </div>
            <div>
              <Label>Positions * (comma-separated)</Label>
              <Input value={electionForm.positions} onChange={e => setElectionForm({ ...electionForm, positions: e.target.value })} placeholder="Head Boy, Head Girl, Games Captain" />
            </div>
            <div>
              <Label>Date *</Label>
              <Input type="date" value={electionForm.date} onChange={e => setElectionForm({ ...electionForm, date: e.target.value })} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={electionForm.status} onValueChange={v => setElectionForm({ ...electionForm, status: v as HoiElection['status'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setElectionDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveElection}>{editingElection ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={candidateDialogOpen} onOpenChange={setCandidateDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Register Candidate</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Student *</Label>
              <Select value={candidateForm.student_id} onValueChange={v => setCandidateForm({ ...candidateForm, student_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>
                  {students.filter(s => s.status === 'active').map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.full_name} ({s.class_name})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Position *</Label>
              <Select value={candidateForm.position} onValueChange={v => setCandidateForm({ ...candidateForm, position: v })}>
                <SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger>
                <SelectContent>
                  {selectedElectionObj?.positions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCandidateDialogOpen(false)}>Cancel</Button>
            <Button onClick={addCandidate}>Register</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
