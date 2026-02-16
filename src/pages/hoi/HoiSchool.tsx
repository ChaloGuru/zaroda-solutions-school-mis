import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  hoiSchoolProfileStorage,
  hoiCalendarEventsStorage,
  HoiSchoolProfile,
  HoiCalendarEvent,
} from '@/lib/hoiStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  School,
  Copy,
  Save,
  Plus,
  Pencil,
  Trash2,
  Search,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const eventTypeColors: Record<string, string> = {
  academic: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  sports: 'bg-green-500/20 text-green-700 border-green-500/30',
  holiday: 'bg-red-500/20 text-red-700 border-red-500/30',
  exam: 'bg-orange-500/20 text-orange-700 border-orange-500/30',
  meeting: 'bg-violet-500/20 text-violet-700 border-violet-500/30',
};

const emptyEventForm = {
  title: '',
  date: '',
  type: 'academic' as HoiCalendarEvent['type'],
  description: '',
};

const PAGE_SIZE = 10;

export default function HoiSchool() {
  const { toast } = useToast();

  const [profile, setProfile] = useState<HoiSchoolProfile>(hoiSchoolProfileStorage.get());
  const [events, setEvents] = useState<HoiCalendarEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);

  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<HoiCalendarEvent | null>(null);
  const [eventForm, setEventForm] = useState(emptyEventForm);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; event: HoiCalendarEvent | null }>({ open: false, event: null });

  const loadEvents = () => setEvents(hoiCalendarEventsStorage.getAll());

  useEffect(() => {
    loadEvents();
  }, []);

  const handleProfileSave = () => {
    if (!profile.name || !profile.school_code) {
      toast({ title: 'Validation Error', description: 'School name and code are required.', variant: 'destructive' });
      return;
    }
    hoiSchoolProfileStorage.save(profile);
    toast({ title: 'Profile Saved', description: 'School profile has been updated successfully.' });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(profile.school_code);
    toast({ title: 'Copied!', description: 'School code copied to clipboard.' });
  };

  const updateProfile = (field: keyof HoiSchoolProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const openAddEvent = () => {
    setEditingEvent(null);
    setEventForm(emptyEventForm);
    setEventDialogOpen(true);
  };

  const openEditEvent = (ev: HoiCalendarEvent) => {
    setEditingEvent(ev);
    setEventForm({ title: ev.title, date: ev.date, type: ev.type, description: ev.description || '' });
    setEventDialogOpen(true);
  };

  const handleSaveEvent = () => {
    if (!eventForm.title || !eventForm.date) {
      toast({ title: 'Validation Error', description: 'Title and date are required.', variant: 'destructive' });
      return;
    }
    if (editingEvent) {
      hoiCalendarEventsStorage.update(editingEvent.id, eventForm);
      toast({ title: 'Event Updated', description: `${eventForm.title} has been updated.` });
    } else {
      hoiCalendarEventsStorage.add(eventForm);
      toast({ title: 'Event Added', description: `${eventForm.title} has been added to the calendar.` });
    }
    setEventDialogOpen(false);
    loadEvents();
  };

  const handleDeleteEvent = () => {
    if (!deleteDialog.event) return;
    hoiCalendarEventsStorage.remove(deleteDialog.event.id);
    toast({ title: 'Event Deleted', description: `${deleteDialog.event.title} has been removed.` });
    setDeleteDialog({ open: false, event: null });
    loadEvents();
  };

  const filteredEvents = events.filter((ev) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term || ev.title.toLowerCase().includes(term);
    const matchesType = typeFilter === 'all' || ev.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE));
  const paginatedEvents = filteredEvents
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [searchTerm, typeFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">School Management</h1>
          <p className="text-muted-foreground">Manage your school profile, academic settings, and calendar</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="academic">Academic Settings</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <School className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>School Profile</CardTitle>
                    <p className="text-sm text-muted-foreground">Update your institution's details</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label>School Name</Label>
                    <Input value={profile.name} onChange={(e) => updateProfile('name', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>School Code</Label>
                    <div className="flex gap-2">
                      <Input value={profile.school_code} onChange={(e) => updateProfile('school_code', e.target.value)} className="font-mono" />
                      <Button variant="outline" size="icon" onClick={handleCopyCode} title="Copy school code">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input value={profile.address} onChange={(e) => updateProfile('address', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Motto</Label>
                    <Input value={profile.motto} onChange={(e) => updateProfile('motto', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Email</Label>
                    <Input type="email" value={profile.contact_email} onChange={(e) => updateProfile('contact_email', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Phone</Label>
                    <Input value={profile.contact_phone} onChange={(e) => updateProfile('contact_phone', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>County</Label>
                    <Input value={profile.county} onChange={(e) => updateProfile('county', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Sub-County</Label>
                    <Input value={profile.sub_county} onChange={(e) => updateProfile('sub_county', e.target.value)} />
                  </div>
                </div>
                <Button onClick={handleProfileSave} className="gap-2">
                  <Save className="w-4 h-4" />
                  Save Profile
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="academic">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                    <CalendarDays className="w-6 h-6 text-violet-600" />
                  </div>
                  <div>
                    <CardTitle>Academic Year & Term Settings</CardTitle>
                    <p className="text-sm text-muted-foreground">Configure your academic calendar</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label>Academic Year</Label>
                    <Input value={profile.academic_year} onChange={(e) => updateProfile('academic_year', e.target.value)} placeholder="e.g. 2025" />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Term</Label>
                    <Select value={profile.current_term} onValueChange={(v) => updateProfile('current_term', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Term 1">Term 1</SelectItem>
                        <SelectItem value="Term 2">Term 2</SelectItem>
                        <SelectItem value="Term 3">Term 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Term Start Date</Label>
                    <Input type="date" value={profile.term_start_date} onChange={(e) => updateProfile('term_start_date', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Term End Date</Label>
                    <Input type="date" value={profile.term_end_date} onChange={(e) => updateProfile('term_end_date', e.target.value)} />
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 mb-6">
                  <div>
                    <p className="text-sm font-medium">School Code</p>
                    <p className="text-2xl font-mono font-bold text-primary">{profile.school_code}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleCopyCode} className="gap-2">
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </Button>
                </div>
                <Button onClick={handleProfileSave} className="gap-2">
                  <Save className="w-4 h-4" />
                  Save Academic Settings
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="calendar">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <CalendarDays className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle>School Calendar</CardTitle>
                      <p className="text-sm text-muted-foreground">{filteredEvents.length} events</p>
                    </div>
                  </div>
                  <Button onClick={openAddEvent} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Event
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search events..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="holiday">Holiday</SelectItem>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paginatedEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No events found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedEvents.map((ev) => (
                          <TableRow key={ev.id}>
                            <TableCell className="font-medium">{ev.title}</TableCell>
                            <TableCell>{new Date(ev.date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cn('capitalize', eventTypeColors[ev.type])}>
                                {ev.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
                              {ev.description || '—'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="icon" onClick={() => openEditEvent(ev)}>
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ open: true, event: ev })}>
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                    <p className="text-sm text-muted-foreground">
                      Page {page} of {totalPages} ({filteredEvents.length} events)
                    </p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} placeholder="e.g. End of Term Exams" />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={eventForm.type} onValueChange={(v: HoiCalendarEvent['type']) => setEventForm({ ...eventForm, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="holiday">Holiday</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} placeholder="Brief description..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEventDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEvent}>{editingEvent ? 'Save Changes' : 'Add Event'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{deleteDialog.event?.title}</strong> from the calendar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEvent} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
