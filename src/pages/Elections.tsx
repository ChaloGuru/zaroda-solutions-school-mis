import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Vote, Users, Trophy, Plus, Printer, ChevronRight, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Position {
  id: string;
  name: string;
  description: string;
  scope: string;
  category: string | null;
}

interface Candidate {
  id: string;
  position_id: string;
  student_name: string;
  grade: string;
  stream: string;
  manifesto: string;
}

interface Election {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
}

const defaultPositions = [
  { name: 'Class Representative', description: 'Elected by stream members', scope: 'stream' },
  { name: 'School President', description: 'Elected by whole school', scope: 'whole_school' },
  { name: 'Deputy President', description: 'Elected by whole school', scope: 'whole_school' },
  { name: 'Speaker', description: 'Elected by whole school', scope: 'whole_school' },
  { name: 'Deputy Speaker', description: 'Elected by whole school', scope: 'whole_school' },
  { name: 'Time Manager', description: 'Elected per school category', scope: 'category' },
  { name: 'Cabinet Secretary', description: 'Appointed for whole school - create positions as needed', scope: 'whole_school' },
  { name: 'Senator', description: 'Optional - per school category', scope: 'category' },
];

const Elections = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [activeElection, setActiveElection] = useState<Election | null>(null);
  const [showAddPosition, setShowAddPosition] = useState(false);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<string>('');
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  
  const [newPosition, setNewPosition] = useState({
    name: '',
    description: '',
    scope: 'whole_school',
    category: '',
  });

  const [newCandidate, setNewCandidate] = useState({
    student_name: '',
    grade: '',
    stream: '',
    manifesto: '',
  });

  useEffect(() => {
    if (profile?.school_id) {
      loadElectionData();
    }
  }, [profile?.school_id]);

  const loadElectionData = async () => {
    if (!profile?.school_id) return;

    // Load positions
    const { data: positionsData } = await supabase
      .from('election_positions')
      .select('*')
      .eq('school_id', profile.school_id);
    
    if (positionsData) setPositions(positionsData);

    // Load elections
    const { data: electionsData } = await supabase
      .from('elections')
      .select('*')
      .eq('school_id', profile.school_id)
      .order('created_at', { ascending: false });
    
    if (electionsData) {
      setElections(electionsData);
      const active = electionsData.find(e => e.is_active);
      if (active) setActiveElection(active);
    }

    // Load candidates
    const { data: candidatesData } = await supabase
      .from('election_candidates')
      .select('*');
    
    if (candidatesData) setCandidates(candidatesData);

    // Load vote counts if there's an active election
    if (activeElection) {
      const { data: votesData } = await supabase
        .from('election_votes')
        .select('candidate_id')
        .eq('election_id', activeElection.id);
      
      if (votesData) {
        const counts: Record<string, number> = {};
        votesData.forEach(v => {
          counts[v.candidate_id] = (counts[v.candidate_id] || 0) + 1;
        });
        setVoteCounts(counts);
      }
    }
  };

  const handleAddPosition = async () => {
    if (!profile?.school_id || !newPosition.name) return;

    const { error } = await supabase
      .from('election_positions')
      .insert({
        school_id: profile.school_id,
        name: newPosition.name,
        description: newPosition.description,
        scope: newPosition.scope as any,
        category: newPosition.category || null,
      });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Position added successfully' });
      setNewPosition({ name: '', description: '', scope: 'whole_school', category: '' });
      setShowAddPosition(false);
      loadElectionData();
    }
  };

  const handleAddCandidate = async () => {
    if (!selectedPosition || !newCandidate.student_name) return;

    const { error } = await supabase
      .from('election_candidates')
      .insert({
        position_id: selectedPosition,
        student_name: newCandidate.student_name,
        grade: newCandidate.grade,
        stream: newCandidate.stream,
        manifesto: newCandidate.manifesto,
      });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Candidate added successfully' });
      setNewCandidate({ student_name: '', grade: '', stream: '', manifesto: '' });
      setShowAddCandidate(false);
      loadElectionData();
    }
  };

  const handleVote = async (candidateId: string, positionId: string) => {
    if (!activeElection || !user) return;

    const voterIdentifier = user.id; // Using user ID as voter identifier

    const { error } = await supabase
      .from('election_votes')
      .insert({
        election_id: activeElection.id,
        position_id: positionId,
        candidate_id: candidateId,
        voter_identifier: voterIdentifier,
      });

    if (error) {
      if (error.code === '23505') {
        toast({ title: 'Already Voted', description: 'You have already voted for this position', variant: 'destructive' });
      } else {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    } else {
      toast({ title: 'Vote Cast!', description: 'Your vote has been recorded' });
      loadElectionData();
    }
  };

  const handlePrintResults = () => {
    window.print();
  };

  const initializeDefaultPositions = async () => {
    if (!profile?.school_id) return;

    for (const pos of defaultPositions) {
      await supabase.from('election_positions').insert({
        school_id: profile.school_id,
        name: pos.name,
        description: pos.description,
        scope: pos.scope as any,
        is_default: true,
      });
    }
    
    toast({ title: 'Success', description: 'Default positions created' });
    loadElectionData();
  };

  if (!user) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container-max section-padding text-center">
            <Vote className="w-16 h-16 text-primary mx-auto mb-6" />
            <h1 className="text-4xl font-bold mb-4">School Elections</h1>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Manage student council elections with our digital voting system. Create positions, 
              register candidates, conduct votes, and generate printable results reports.
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
              <Card>
                <CardHeader>
                  <Users className="w-10 h-10 text-primary mb-2" />
                  <CardTitle>Multiple Positions</CardTitle>
                  <CardDescription>
                    Class Rep, President, Deputy, Speaker, Time Manager, Cabinet, Senators & more
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <BarChart3 className="w-10 h-10 text-secondary mb-2" />
                  <CardTitle>Live Tallying</CardTitle>
                  <CardDescription>
                    Real-time vote counting and results display for transparency
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Trophy className="w-10 h-10 text-accent mb-2" />
                  <CardTitle>Print Reports</CardTitle>
                  <CardDescription>
                    Generate printable results with winners for each position
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
            <Button asChild variant="hero" size="lg">
              <Link to="/login">Login to Manage Elections</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container-max section-padding">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">School Elections</h1>
              <p className="text-muted-foreground">Manage student council elections</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handlePrintResults}>
                <Printer className="mr-2" size={18} />
                Print Results
              </Button>
              {positions.length === 0 && (
                <Button onClick={initializeDefaultPositions}>
                  <Plus className="mr-2" size={18} />
                  Initialize Default Positions
                </Button>
              )}
            </div>
          </div>

          {/* Positions Section */}
          <section className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Election Positions</h2>
              <Button variant="outline" size="sm" onClick={() => setShowAddPosition(!showAddPosition)}>
                <Plus className="mr-2" size={16} />
                Add Position
              </Button>
            </div>

            {showAddPosition && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Add New Position</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Position Name</Label>
                      <Input 
                        value={newPosition.name}
                        onChange={(e) => setNewPosition({ ...newPosition, name: e.target.value })}
                        placeholder="e.g., Sports Captain"
                      />
                    </div>
                    <div>
                      <Label>Scope</Label>
                      <Select 
                        value={newPosition.scope}
                        onValueChange={(v) => setNewPosition({ ...newPosition, scope: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="stream">Stream Level</SelectItem>
                          <SelectItem value="category">Category Level (ECDE/Primary/JS)</SelectItem>
                          <SelectItem value="whole_school">Whole School</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea 
                      value={newPosition.description}
                      onChange={(e) => setNewPosition({ ...newPosition, description: e.target.value })}
                      placeholder="Describe the position responsibilities"
                    />
                  </div>
                  {newPosition.scope === 'category' && (
                    <div>
                      <Label>Category</Label>
                      <Select 
                        value={newPosition.category}
                        onValueChange={(v) => setNewPosition({ ...newPosition, category: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ECDE">ECDE</SelectItem>
                          <SelectItem value="Primary">Primary</SelectItem>
                          <SelectItem value="Junior">Junior Secondary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <Button onClick={handleAddPosition}>Save Position</Button>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {positions.map((pos) => (
                <Card key={pos.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      {pos.name}
                      <ChevronRight className="text-muted-foreground" size={18} />
                    </CardTitle>
                    <CardDescription>
                      {pos.description}
                      <span className="block mt-1 text-xs capitalize">
                        Scope: {pos.scope.replace('_', ' ')} {pos.category && `(${pos.category})`}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {candidates.filter(c => c.position_id === pos.id).length} candidate(s)
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Candidates Section */}
          <section className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Candidates</h2>
              <Button variant="outline" size="sm" onClick={() => setShowAddCandidate(!showAddCandidate)}>
                <Plus className="mr-2" size={16} />
                Add Candidate
              </Button>
            </div>

            {showAddCandidate && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Register Candidate</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Position</Label>
                    <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        {positions.map((pos) => (
                          <SelectItem key={pos.id} value={pos.id}>{pos.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label>Student Name</Label>
                      <Input 
                        value={newCandidate.student_name}
                        onChange={(e) => setNewCandidate({ ...newCandidate, student_name: e.target.value })}
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <Label>Grade</Label>
                      <Input 
                        value={newCandidate.grade}
                        onChange={(e) => setNewCandidate({ ...newCandidate, grade: e.target.value })}
                        placeholder="e.g., Grade 8"
                      />
                    </div>
                    <div>
                      <Label>Stream</Label>
                      <Input 
                        value={newCandidate.stream}
                        onChange={(e) => setNewCandidate({ ...newCandidate, stream: e.target.value })}
                        placeholder="e.g., East"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Manifesto</Label>
                    <Textarea 
                      value={newCandidate.manifesto}
                      onChange={(e) => setNewCandidate({ ...newCandidate, manifesto: e.target.value })}
                      placeholder="Candidate's campaign promises"
                    />
                  </div>
                  <Button onClick={handleAddCandidate}>Register Candidate</Button>
                </CardContent>
              </Card>
            )}

            {/* Candidates by Position */}
            {positions.map((pos) => {
              const posCandidates = candidates.filter(c => c.position_id === pos.id);
              if (posCandidates.length === 0) return null;

              return (
                <div key={pos.id} className="mb-8">
                  <h3 className="text-lg font-medium mb-4">{pos.name}</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {posCandidates.map((candidate) => (
                      <Card key={candidate.id} className="relative">
                        <CardHeader>
                          <CardTitle className="text-lg">{candidate.student_name}</CardTitle>
                          <CardDescription>
                            {candidate.grade} - {candidate.stream}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">{candidate.manifesto}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Votes: {voteCounts[candidate.id] || 0}
                            </span>
                            {activeElection && (
                              <Button 
                                size="sm" 
                                onClick={() => handleVote(candidate.id, pos.id)}
                              >
                                <Vote className="mr-2" size={14} />
                                Vote
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>

          {/* Results Section (for printing) */}
          <section className="print:block" id="election-results">
            <h2 className="text-2xl font-bold mb-6 text-center">Election Results</h2>
            <div className="space-y-6">
              {positions.map((pos) => {
                const posCandidates = candidates
                  .filter(c => c.position_id === pos.id)
                  .sort((a, b) => (voteCounts[b.id] || 0) - (voteCounts[a.id] || 0));
                
                if (posCandidates.length === 0) return null;
                const winner = posCandidates[0];

                return (
                  <Card key={pos.id}>
                    <CardHeader>
                      <CardTitle>{pos.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Candidate</th>
                            <th className="text-left py-2">Grade</th>
                            <th className="text-right py-2">Votes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {posCandidates.map((c, i) => (
                            <tr key={c.id} className={i === 0 ? 'bg-primary/10' : ''}>
                              <td className="py-2">
                                {c.student_name}
                                {i === 0 && <Trophy className="inline ml-2 text-primary" size={16} />}
                              </td>
                              <td className="py-2">{c.grade}</td>
                              <td className="text-right py-2 font-bold">{voteCounts[c.id] || 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {winner && (
                        <p className="mt-4 text-sm font-medium">
                          Winner: <span className="text-primary">{winner.student_name}</span> with {voteCounts[winner.id] || 0} votes
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Elections;
