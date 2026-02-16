import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, Trophy, Users, Timer, Plus, Medal, 
  Volleyball, Music, Activity, Printer, Star
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface SportsEvent {
  id: string;
  name: string;
  category: string;
  event_type: string;
  event_date: string | null;
  description: string | null;
}

interface Participant {
  id: string;
  student_name: string;
  admission_number: string | null;
  grade: string | null;
  stream: string | null;
  gender: string | null;
}

interface Performance {
  id: string;
  event_id: string;
  participant_id: string;
  performance_value: string;
  performance_numeric: number | null;
  position: number | null;
  is_best: boolean;
  participant?: Participant;
}

interface Team {
  id: string;
  name: string;
  sport: string;
  category: string | null;
}

interface Match {
  id: string;
  event_id: string;
  home_team_name: string | null;
  away_team_name: string | null;
  home_score: number;
  away_score: number;
  match_date: string | null;
  venue: string | null;
  status: string;
}

const athleticsEvents = [
  '100m', '200m', '400m', '800m', '1500m', '3000m', '5000m', '10000m',
  '100m Hurdles', '110m Hurdles', '400m Hurdles',
  '4x100m Relay', '4x400m Relay',
  'Long Jump', 'Triple Jump', 'High Jump', 'Pole Vault',
  'Shot Put', 'Discus', 'Javelin', 'Hammer Throw'
];

const ballGames = [
  'Football', 'Basketball', 'Volleyball', 'Netball', 'Handball',
  'Rugby', 'Hockey', 'Tennis', 'Table Tennis', 'Badminton'
];

const musicEvents = [
  'Choir', 'Solo Verse', 'Choral Verse', 'Set Piece', 'Own Composition',
  'Folk Song', 'African Hymn', 'Western Hymn', 'Cultural Dance',
  'Traditional Dance', 'Modern Dance', 'Drama', 'Elocution'
];

const otherActivities = [
  'Debate', 'Science Congress', 'Scouts', 'Girl Guides',
  'Chess', 'Swimming', 'Gymnastics', 'Martial Arts'
];

const Sports = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('athletics');
  
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [showAddPerformance, setShowAddPerformance] = useState(false);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [showAddMatch, setShowAddMatch] = useState(false);
  
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  
  const [newEvent, setNewEvent] = useState({
    name: '',
    category: 'athletics',
    event_type: '',
    event_date: '',
    description: ''
  });
  
  const [newParticipant, setNewParticipant] = useState({
    student_name: '',
    admission_number: '',
    grade: '',
    stream: '',
    gender: ''
  });
  
  const [newPerformance, setNewPerformance] = useState({
    event_id: '',
    participant_id: '',
    performance_value: '',
    performance_numeric: ''
  });
  
  const [newTeam, setNewTeam] = useState({
    name: '',
    sport: '',
    category: ''
  });
  
  const [newMatch, setNewMatch] = useState({
    event_id: '',
    home_team_name: '',
    away_team_name: '',
    home_score: 0,
    away_score: 0,
    venue: '',
    status: 'scheduled'
  });

  useEffect(() => {
    if (profile?.school_id) {
      loadSportsData();
    }
  }, [profile?.school_id]);

  const loadSportsData = async () => {
    if (!profile?.school_id) return;

    const [eventsRes, participantsRes, teamsRes] = await Promise.all([
      supabase.from('sports_events').select('*').eq('school_id', profile.school_id),
      supabase.from('sports_participants').select('*').eq('school_id', profile.school_id),
      supabase.from('sports_teams').select('*').eq('school_id', profile.school_id)
    ]);

    if (eventsRes.data) setEvents(eventsRes.data);
    if (participantsRes.data) setParticipants(participantsRes.data);
    if (teamsRes.data) setTeams(teamsRes.data);

    // Load performances with participant details
    if (eventsRes.data && eventsRes.data.length > 0) {
      const eventIds = eventsRes.data.map(e => e.id);
      const { data: performancesData } = await supabase
        .from('sports_performances')
        .select('*')
        .in('event_id', eventIds);
      
      if (performancesData) {
        const performancesWithParticipants = performancesData.map(perf => ({
          ...perf,
          participant: participantsRes.data?.find(p => p.id === perf.participant_id)
        }));
        setPerformances(performancesWithParticipants);
      }

      // Load matches
      const { data: matchesData } = await supabase
        .from('sports_matches')
        .select('*')
        .in('event_id', eventIds);
      
      if (matchesData) setMatches(matchesData);
    }
  };

  const handleAddEvent = async () => {
    if (!profile?.school_id || !newEvent.name || !newEvent.event_type) return;

    const { error } = await supabase.from('sports_events').insert({
      school_id: profile.school_id,
      name: newEvent.name,
      category: newEvent.category,
      event_type: newEvent.event_type,
      event_date: newEvent.event_date || null,
      description: newEvent.description || null
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Event created successfully' });
      setNewEvent({ name: '', category: 'athletics', event_type: '', event_date: '', description: '' });
      setShowAddEvent(false);
      loadSportsData();
    }
  };

  const handleAddParticipant = async () => {
    if (!profile?.school_id || !newParticipant.student_name) return;

    const { error } = await supabase.from('sports_participants').insert({
      school_id: profile.school_id,
      student_name: newParticipant.student_name,
      admission_number: newParticipant.admission_number || null,
      grade: newParticipant.grade || null,
      stream: newParticipant.stream || null,
      gender: newParticipant.gender || null
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Participant added successfully' });
      setNewParticipant({ student_name: '', admission_number: '', grade: '', stream: '', gender: '' });
      setShowAddParticipant(false);
      loadSportsData();
    }
  };

  const handleAddPerformance = async () => {
    if (!newPerformance.event_id || !newPerformance.participant_id || !newPerformance.performance_value) return;

    const numericValue = parseFloat(newPerformance.performance_numeric) || null;

    const { error } = await supabase.from('sports_performances').insert({
      event_id: newPerformance.event_id,
      participant_id: newPerformance.participant_id,
      performance_value: newPerformance.performance_value,
      performance_numeric: numericValue
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Performance recorded' });
      setNewPerformance({ event_id: '', participant_id: '', performance_value: '', performance_numeric: '' });
      setShowAddPerformance(false);
      loadSportsData();
      updateBestPerformances(newPerformance.event_id);
    }
  };

  const updateBestPerformances = async (eventId: string) => {
    const eventPerformances = performances.filter(p => p.event_id === eventId);
    if (eventPerformances.length === 0) return;

    // Find the best (lowest for time events)
    const sorted = [...eventPerformances].sort((a, b) => {
      if (a.performance_numeric === null) return 1;
      if (b.performance_numeric === null) return -1;
      return a.performance_numeric - b.performance_numeric;
    });

    // Update positions and best flag
    for (let i = 0; i < sorted.length; i++) {
      await supabase.from('sports_performances').update({
        position: i + 1,
        is_best: i === 0
      }).eq('id', sorted[i].id);
    }

    loadSportsData();
  };

  const handleAddTeam = async () => {
    if (!profile?.school_id || !newTeam.name || !newTeam.sport) return;

    const { error } = await supabase.from('sports_teams').insert({
      school_id: profile.school_id,
      name: newTeam.name,
      sport: newTeam.sport,
      category: newTeam.category || null
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Team created successfully' });
      setNewTeam({ name: '', sport: '', category: '' });
      setShowAddTeam(false);
      loadSportsData();
    }
  };

  const handleAddMatch = async () => {
    if (!newMatch.event_id || !newMatch.home_team_name || !newMatch.away_team_name) return;

    const { error } = await supabase.from('sports_matches').insert({
      event_id: newMatch.event_id,
      home_team_name: newMatch.home_team_name,
      away_team_name: newMatch.away_team_name,
      home_score: newMatch.home_score,
      away_score: newMatch.away_score,
      venue: newMatch.venue || null,
      status: newMatch.status
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Match added successfully' });
      setNewMatch({ event_id: '', home_team_name: '', away_team_name: '', home_score: 0, away_score: 0, venue: '', status: 'scheduled' });
      setShowAddMatch(false);
      loadSportsData();
    }
  };

  const handlePrintResults = () => {
    window.print();
  };

  const getEventsByCategory = (category: string) => events.filter(e => e.category === category);
  const getPerformancesByEvent = (eventId: string) => performances.filter(p => p.event_id === eventId).sort((a, b) => (a.position || 999) - (b.position || 999));

  if (!user) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container-max section-padding text-center">
            <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
              <ArrowLeft className="mr-2" size={18} />
              Back to Home
            </Button>
            <Trophy className="w-16 h-16 text-primary mx-auto mb-6" />
            <h1 className="text-4xl font-bold mb-4">Sports & Activities</h1>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Comprehensive sports management including athletics tracking, ball games, music festivals, and other co-curricular activities.
            </p>
            <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-8">
              <Card>
                <CardHeader>
                  <Timer className="w-10 h-10 text-primary mb-2" />
                  <CardTitle>Athletics</CardTitle>
                  <CardDescription>Track races, jumps, throws with automatic best time/distance calculation</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Volleyball className="w-10 h-10 text-secondary mb-2" />
                  <CardTitle>Ball Games</CardTitle>
                  <CardDescription>Football, basketball, volleyball matches and team management</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Music className="w-10 h-10 text-accent mb-2" />
                  <CardTitle>Music</CardTitle>
                  <CardDescription>Music festival events - choir, dance, drama performances</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Activity className="w-10 h-10 text-primary mb-2" />
                  <CardTitle>Other Activities</CardTitle>
                  <CardDescription>Debate, science congress, scouts, chess and more</CardDescription>
                </CardHeader>
              </Card>
            </div>
            <Button asChild variant="hero" size="lg">
              <Link to="/login">Login to Manage Sports</Link>
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
      <main className="pt-24 pb-16 print:pt-4">
        <div className="container-max section-padding">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-6 print:hidden">
            <ArrowLeft className="mr-2" size={18} />
            Back to Home
          </Button>

          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Sports & Activities</h1>
              <p className="text-muted-foreground">Manage athletics, ball games, music, and activities</p>
            </div>
            <div className="flex gap-3 print:hidden">
              <Button variant="outline" onClick={handlePrintResults}>
                <Printer className="mr-2" size={18} />
                Print Results
              </Button>
              <Button onClick={() => setShowAddParticipant(true)}>
                <Plus className="mr-2" size={18} />
                Add Participant
              </Button>
            </div>
          </div>

          {/* Add Participant Form */}
          {showAddParticipant && (
            <Card className="mb-6 print:hidden">
              <CardHeader>
                <CardTitle>Add Participant/Athlete</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-5 gap-4">
                  <div>
                    <Label>Student Name *</Label>
                    <Input
                      value={newParticipant.student_name}
                      onChange={(e) => setNewParticipant({ ...newParticipant, student_name: e.target.value })}
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <Label>Admission No.</Label>
                    <Input
                      value={newParticipant.admission_number}
                      onChange={(e) => setNewParticipant({ ...newParticipant, admission_number: e.target.value })}
                      placeholder="ADM001"
                    />
                  </div>
                  <div>
                    <Label>Grade</Label>
                    <Input
                      value={newParticipant.grade}
                      onChange={(e) => setNewParticipant({ ...newParticipant, grade: e.target.value })}
                      placeholder="Grade 8"
                    />
                  </div>
                  <div>
                    <Label>Stream</Label>
                    <Input
                      value={newParticipant.stream}
                      onChange={(e) => setNewParticipant({ ...newParticipant, stream: e.target.value })}
                      placeholder="East"
                    />
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <Select
                      value={newParticipant.gender}
                      onValueChange={(v) => setNewParticipant({ ...newParticipant, gender: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddParticipant}>Save Participant</Button>
                  <Button variant="outline" onClick={() => setShowAddParticipant(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 print:hidden">
              <TabsTrigger value="athletics" className="flex items-center gap-2">
                <Timer size={16} /> Athletics
              </TabsTrigger>
              <TabsTrigger value="ball_games" className="flex items-center gap-2">
                <Volleyball size={16} /> Ball Games
              </TabsTrigger>
              <TabsTrigger value="music" className="flex items-center gap-2">
                <Music size={16} /> Music
              </TabsTrigger>
              <TabsTrigger value="other" className="flex items-center gap-2">
                <Activity size={16} /> Other
              </TabsTrigger>
            </TabsList>

            {/* Athletics Tab */}
            <TabsContent value="athletics" className="space-y-6">
              <div className="flex justify-between items-center print:hidden">
                <h2 className="text-xl font-semibold">Athletics Events</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setNewEvent({ ...newEvent, category: 'athletics' }); setShowAddEvent(true); }}>
                    <Plus className="mr-2" size={16} /> Add Event
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowAddPerformance(true)}>
                    <Timer className="mr-2" size={16} /> Record Performance
                  </Button>
                </div>
              </div>

              {/* Add Event Form */}
              {showAddEvent && newEvent.category === 'athletics' && (
                <Card className="print:hidden">
                  <CardHeader><CardTitle>Create Athletics Event</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label>Event Name *</Label>
                        <Input
                          value={newEvent.name}
                          onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                          placeholder="Boys U16 100m Finals"
                        />
                      </div>
                      <div>
                        <Label>Event Type *</Label>
                        <Select
                          value={newEvent.event_type}
                          onValueChange={(v) => setNewEvent({ ...newEvent, event_type: v })}
                        >
                          <SelectTrigger><SelectValue placeholder="Select event type" /></SelectTrigger>
                          <SelectContent>
                            {athleticsEvents.map(e => (
                              <SelectItem key={e} value={e}>{e}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Event Date</Label>
                        <Input
                          type="date"
                          value={newEvent.event_date}
                          onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddEvent}>Create Event</Button>
                      <Button variant="outline" onClick={() => setShowAddEvent(false)}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Record Performance Form */}
              {showAddPerformance && (
                <Card className="print:hidden">
                  <CardHeader><CardTitle>Record Performance</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <Label>Event *</Label>
                        <Select
                          value={newPerformance.event_id}
                          onValueChange={(v) => setNewPerformance({ ...newPerformance, event_id: v })}
                        >
                          <SelectTrigger><SelectValue placeholder="Select event" /></SelectTrigger>
                          <SelectContent>
                            {getEventsByCategory('athletics').map(e => (
                              <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Participant *</Label>
                        <Select
                          value={newPerformance.participant_id}
                          onValueChange={(v) => setNewPerformance({ ...newPerformance, participant_id: v })}
                        >
                          <SelectTrigger><SelectValue placeholder="Select participant" /></SelectTrigger>
                          <SelectContent>
                            {participants.map(p => (
                              <SelectItem key={p.id} value={p.id}>{p.student_name} ({p.grade})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Time/Distance *</Label>
                        <Input
                          value={newPerformance.performance_value}
                          onChange={(e) => setNewPerformance({ ...newPerformance, performance_value: e.target.value })}
                          placeholder="e.g., 12.5s or 5.2m"
                        />
                      </div>
                      <div>
                        <Label>Numeric Value (for ranking)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={newPerformance.performance_numeric}
                          onChange={(e) => setNewPerformance({ ...newPerformance, performance_numeric: e.target.value })}
                          placeholder="e.g., 12.5"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddPerformance}>Record</Button>
                      <Button variant="outline" onClick={() => setShowAddPerformance(false)}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Events and Results */}
              <div className="space-y-4">
                {getEventsByCategory('athletics').map(event => (
                  <Card key={event.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {event.name}
                            <span className="text-sm font-normal bg-primary/10 text-primary px-2 py-1 rounded">
                              {event.event_type}
                            </span>
                          </CardTitle>
                          <CardDescription>{event.event_date && new Date(event.event_date).toLocaleDateString()}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {getPerformancesByEvent(event.id).length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2 px-2">Pos</th>
                                <th className="text-left py-2 px-2">Name</th>
                                <th className="text-left py-2 px-2">Grade</th>
                                <th className="text-left py-2 px-2">Performance</th>
                                <th className="text-left py-2 px-2">Best</th>
                              </tr>
                            </thead>
                            <tbody>
                              {getPerformancesByEvent(event.id).map(perf => (
                                <tr key={perf.id} className={`border-b ${perf.is_best ? 'bg-yellow-50' : ''}`}>
                                  <td className="py-2 px-2">
                                    {perf.position === 1 && <Medal className="inline text-yellow-500" size={16} />}
                                    {perf.position === 2 && <Medal className="inline text-gray-400" size={16} />}
                                    {perf.position === 3 && <Medal className="inline text-amber-600" size={16} />}
                                    {perf.position && perf.position > 3 && perf.position}
                                  </td>
                                  <td className="py-2 px-2 font-medium">{perf.participant?.student_name}</td>
                                  <td className="py-2 px-2">{perf.participant?.grade}</td>
                                  <td className="py-2 px-2">{perf.performance_value}</td>
                                  <td className="py-2 px-2">
                                    {perf.is_best && <Star className="inline text-yellow-500" size={16} />}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No performances recorded yet</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {getEventsByCategory('athletics').length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No athletics events created yet. Add an event to get started.</p>
                )}
              </div>
            </TabsContent>

            {/* Ball Games Tab */}
            <TabsContent value="ball_games" className="space-y-6">
              <div className="flex justify-between items-center print:hidden">
                <h2 className="text-xl font-semibold">Ball Games</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setNewEvent({ ...newEvent, category: 'ball_games' }); setShowAddEvent(true); }}>
                    <Plus className="mr-2" size={16} /> Add Event
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowAddTeam(true)}>
                    <Users className="mr-2" size={16} /> Add Team
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowAddMatch(true)}>
                    <Volleyball className="mr-2" size={16} /> Add Match
                  </Button>
                </div>
              </div>

              {/* Add Event Form for Ball Games */}
              {showAddEvent && newEvent.category === 'ball_games' && (
                <Card className="print:hidden">
                  <CardHeader><CardTitle>Create Ball Game Event</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label>Event Name *</Label>
                        <Input
                          value={newEvent.name}
                          onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                          placeholder="Inter-house Football Tournament"
                        />
                      </div>
                      <div>
                        <Label>Sport *</Label>
                        <Select
                          value={newEvent.event_type}
                          onValueChange={(v) => setNewEvent({ ...newEvent, event_type: v })}
                        >
                          <SelectTrigger><SelectValue placeholder="Select sport" /></SelectTrigger>
                          <SelectContent>
                            {ballGames.map(s => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Event Date</Label>
                        <Input
                          type="date"
                          value={newEvent.event_date}
                          onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddEvent}>Create Event</Button>
                      <Button variant="outline" onClick={() => setShowAddEvent(false)}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Add Team Form */}
              {showAddTeam && (
                <Card className="print:hidden">
                  <CardHeader><CardTitle>Create Team</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label>Team Name *</Label>
                        <Input
                          value={newTeam.name}
                          onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                          placeholder="Red House FC"
                        />
                      </div>
                      <div>
                        <Label>Sport *</Label>
                        <Select
                          value={newTeam.sport}
                          onValueChange={(v) => setNewTeam({ ...newTeam, sport: v })}
                        >
                          <SelectTrigger><SelectValue placeholder="Select sport" /></SelectTrigger>
                          <SelectContent>
                            {ballGames.map(s => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Input
                          value={newTeam.category}
                          onChange={(e) => setNewTeam({ ...newTeam, category: e.target.value })}
                          placeholder="U14, U16, Senior"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddTeam}>Create Team</Button>
                      <Button variant="outline" onClick={() => setShowAddTeam(false)}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Add Match Form */}
              {showAddMatch && (
                <Card className="print:hidden">
                  <CardHeader><CardTitle>Add Match</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label>Event *</Label>
                        <Select
                          value={newMatch.event_id}
                          onValueChange={(v) => setNewMatch({ ...newMatch, event_id: v })}
                        >
                          <SelectTrigger><SelectValue placeholder="Select event" /></SelectTrigger>
                          <SelectContent>
                            {getEventsByCategory('ball_games').map(e => (
                              <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Home Team *</Label>
                        <Input
                          value={newMatch.home_team_name}
                          onChange={(e) => setNewMatch({ ...newMatch, home_team_name: e.target.value })}
                          placeholder="Red House"
                        />
                      </div>
                      <div>
                        <Label>Away Team *</Label>
                        <Input
                          value={newMatch.away_team_name}
                          onChange={(e) => setNewMatch({ ...newMatch, away_team_name: e.target.value })}
                          placeholder="Blue House"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <Label>Home Score</Label>
                        <Input
                          type="number"
                          value={newMatch.home_score}
                          onChange={(e) => setNewMatch({ ...newMatch, home_score: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label>Away Score</Label>
                        <Input
                          type="number"
                          value={newMatch.away_score}
                          onChange={(e) => setNewMatch({ ...newMatch, away_score: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label>Venue</Label>
                        <Input
                          value={newMatch.venue}
                          onChange={(e) => setNewMatch({ ...newMatch, venue: e.target.value })}
                          placeholder="Main Field"
                        />
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Select
                          value={newMatch.status}
                          onValueChange={(v) => setNewMatch({ ...newMatch, status: v })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddMatch}>Add Match</Button>
                      <Button variant="outline" onClick={() => setShowAddMatch(false)}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Teams List */}
              {teams.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Teams</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {teams.map(team => (
                      <Card key={team.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{team.name}</CardTitle>
                          <CardDescription>{team.sport} {team.category && `• ${team.category}`}</CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Matches */}
              <div className="space-y-4">
                {getEventsByCategory('ball_games').map(event => (
                  <Card key={event.id}>
                    <CardHeader>
                      <CardTitle>{event.name}</CardTitle>
                      <CardDescription>{event.event_type} • {event.event_date && new Date(event.event_date).toLocaleDateString()}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {matches.filter(m => m.event_id === event.id).length > 0 ? (
                        <div className="space-y-3">
                          {matches.filter(m => m.event_id === event.id).map(match => (
                            <div key={match.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <span className="font-medium">{match.home_team_name}</span>
                              <div className="text-center">
                                <span className="text-2xl font-bold">{match.home_score} - {match.away_score}</span>
                                <p className="text-xs text-muted-foreground">{match.status}</p>
                              </div>
                              <span className="font-medium">{match.away_team_name}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No matches recorded yet</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Music Tab */}
            <TabsContent value="music" className="space-y-6">
              <div className="flex justify-between items-center print:hidden">
                <h2 className="text-xl font-semibold">Music & Drama</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setNewEvent({ ...newEvent, category: 'music' }); setShowAddEvent(true); }}>
                    <Plus className="mr-2" size={16} /> Add Event
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowAddPerformance(true)}>
                    <Music className="mr-2" size={16} /> Record Performance
                  </Button>
                </div>
              </div>

              {/* Add Event Form for Music */}
              {showAddEvent && newEvent.category === 'music' && (
                <Card className="print:hidden">
                  <CardHeader><CardTitle>Create Music Event</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label>Event Name *</Label>
                        <Input
                          value={newEvent.name}
                          onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                          placeholder="County Music Festival - Choir"
                        />
                      </div>
                      <div>
                        <Label>Event Type *</Label>
                        <Select
                          value={newEvent.event_type}
                          onValueChange={(v) => setNewEvent({ ...newEvent, event_type: v })}
                        >
                          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                          <SelectContent>
                            {musicEvents.map(e => (
                              <SelectItem key={e} value={e}>{e}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Event Date</Label>
                        <Input
                          type="date"
                          value={newEvent.event_date}
                          onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddEvent}>Create Event</Button>
                      <Button variant="outline" onClick={() => setShowAddEvent(false)}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Music Events */}
              <div className="space-y-4">
                {getEventsByCategory('music').map(event => (
                  <Card key={event.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Music size={20} className="text-primary" />
                        {event.name}
                      </CardTitle>
                      <CardDescription>{event.event_type} • {event.event_date && new Date(event.event_date).toLocaleDateString()}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {getPerformancesByEvent(event.id).length > 0 ? (
                        <div className="space-y-2">
                          {getPerformancesByEvent(event.id).map(perf => (
                            <div key={perf.id} className={`flex justify-between items-center p-2 rounded ${perf.is_best ? 'bg-yellow-50' : 'bg-muted/50'}`}>
                              <span className="font-medium">{perf.participant?.student_name}</span>
                              <span>{perf.performance_value}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No performances recorded yet</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {getEventsByCategory('music').length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No music events created yet.</p>
                )}
              </div>
            </TabsContent>

            {/* Other Activities Tab */}
            <TabsContent value="other" className="space-y-6">
              <div className="flex justify-between items-center print:hidden">
                <h2 className="text-xl font-semibold">Other Activities</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setNewEvent({ ...newEvent, category: 'other' }); setShowAddEvent(true); }}>
                    <Plus className="mr-2" size={16} /> Add Activity
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowAddPerformance(true)}>
                    <Activity className="mr-2" size={16} /> Record Performance
                  </Button>
                </div>
              </div>

              {/* Add Event Form for Other */}
              {showAddEvent && newEvent.category === 'other' && (
                <Card className="print:hidden">
                  <CardHeader><CardTitle>Create Activity</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label>Activity Name *</Label>
                        <Input
                          value={newEvent.name}
                          onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                          placeholder="Inter-school Debate Competition"
                        />
                      </div>
                      <div>
                        <Label>Activity Type *</Label>
                        <Select
                          value={newEvent.event_type}
                          onValueChange={(v) => setNewEvent({ ...newEvent, event_type: v })}
                        >
                          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                          <SelectContent>
                            {otherActivities.map(a => (
                              <SelectItem key={a} value={a}>{a}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Event Date</Label>
                        <Input
                          type="date"
                          value={newEvent.event_date}
                          onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddEvent}>Create Activity</Button>
                      <Button variant="outline" onClick={() => setShowAddEvent(false)}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Other Activities Events */}
              <div className="space-y-4">
                {getEventsByCategory('other').map(event => (
                  <Card key={event.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity size={20} className="text-primary" />
                        {event.name}
                      </CardTitle>
                      <CardDescription>{event.event_type} • {event.event_date && new Date(event.event_date).toLocaleDateString()}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {getPerformancesByEvent(event.id).length > 0 ? (
                        <div className="space-y-2">
                          {getPerformancesByEvent(event.id).map(perf => (
                            <div key={perf.id} className={`flex justify-between items-center p-2 rounded ${perf.is_best ? 'bg-yellow-50' : 'bg-muted/50'}`}>
                              <span className="font-medium">{perf.participant?.student_name}</span>
                              <span>{perf.performance_value}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No performances recorded yet</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {getEventsByCategory('other').length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No activities created yet.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Participants List */}
          {participants.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-semibold mb-4">Registered Participants ({participants.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-3">Name</th>
                      <th className="text-left py-3 px-3">Adm No.</th>
                      <th className="text-left py-3 px-3">Grade</th>
                      <th className="text-left py-3 px-3">Stream</th>
                      <th className="text-left py-3 px-3">Gender</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map(p => (
                      <tr key={p.id} className="border-b">
                        <td className="py-2 px-3 font-medium">{p.student_name}</td>
                        <td className="py-2 px-3">{p.admission_number || '-'}</td>
                        <td className="py-2 px-3">{p.grade || '-'}</td>
                        <td className="py-2 px-3">{p.stream || '-'}</td>
                        <td className="py-2 px-3 capitalize">{p.gender || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Sports;
