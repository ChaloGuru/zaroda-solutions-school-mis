import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  adminAnnouncementsStorage,
  platformUsersStorage,
  type AdminAnnouncement,
  type AdminAnnouncementTargetRole,
} from '@/lib/storage';

const TARGET_OPTIONS: Array<{ value: AdminAnnouncementTargetRole; label: string }> = [
  { value: 'hoi', label: 'HOIs only' },
  { value: 'teacher', label: 'Teachers only' },
  { value: 'parent', label: 'Parents only' },
  { value: 'all', label: 'All users' },
];

const TARGET_BADGE: Record<AdminAnnouncementTargetRole, string> = {
  hoi: 'bg-blue-500/10 text-blue-700 border-blue-500/30',
  teacher: 'bg-purple-500/10 text-purple-700 border-purple-500/30',
  parent: 'bg-pink-500/10 text-pink-700 border-pink-500/30',
  all: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
};

export default function CommunicationSection() {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [activeUsers, setActiveUsers] = useState<Array<{ role: string; status: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [form, setForm] = useState({
    title: '',
    message: '',
    targetRole: 'all' as AdminAnnouncementTargetRole,
  });

  const loadData = async () => {
    try {
      const [announcementRows, users] = await Promise.all([
        adminAnnouncementsStorage.getAll(),
        platformUsersStorage.getAll(),
      ]);
      setAnnouncements(announcementRows);
      setActiveUsers(users.filter((user) => user.status === 'active').map((user) => ({ role: user.role, status: user.status })));
    } catch (error) {
      toast({
        title: 'Failed to load communication data',
        description: error instanceof Error ? error.message : 'Could not load announcements and recipients.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const recipientCount = useMemo(() => {
    if (form.targetRole === 'all') return activeUsers.length;
    return activeUsers.filter((user) => user.role === form.targetRole).length;
  }, [activeUsers, form.targetRole]);

  const submitAnnouncement = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast({ title: 'Missing fields', description: 'Title and message are required.', variant: 'destructive' });
      return;
    }

    try {
      setIsSending(true);
      await adminAnnouncementsStorage.add({
        title: form.title.trim(),
        message: form.message.trim(),
        targetRole: form.targetRole,
        author: 'SuperAdmin',
      });

      await loadData();
      setForm({ title: '', message: '', targetRole: 'all' });
      toast({ title: 'Announcement sent', description: `Message sent to ${recipientCount} recipient(s).` });
    } catch (error) {
      toast({
        title: 'Failed to send announcement',
        description: error instanceof Error ? error.message : 'Could not send announcement.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Announcements & Communication</h1>
        <p className="text-gray-500 text-sm mt-1">Send targeted messages to HOIs, teachers, parents, or all users.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">New Announcement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Recipients</Label>
            <Select value={form.targetRole} onValueChange={(value) => setForm({ ...form, targetRole: value as AdminAnnouncementTargetRole })}>
              <SelectTrigger>
                <SelectValue placeholder="Select recipients" />
              </SelectTrigger>
              <SelectContent>
                {TARGET_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">This will be sent to {recipientCount} active user(s).</p>
          </div>

          <div>
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Announcement title" />
          </div>

          <div>
            <Label>Message</Label>
            <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Type your message..." rows={5} />
          </div>

          <div className="flex justify-end">
            <Button onClick={() => { void submitAnnouncement(); }} disabled={isSending || isLoading}>
              {isSending ? 'Sending...' : 'Send Announcement'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-6">Loading announcements...</p>
          ) : announcements.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No announcements sent yet.</p>
          ) : (
            <div className="space-y-3">
              {announcements.slice(0, 12).map((announcement) => (
                <div key={announcement.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-medium">{announcement.title}</p>
                    <Badge variant="outline" className={TARGET_BADGE[announcement.targetRole]}>
                      {TARGET_OPTIONS.find((option) => option.value === announcement.targetRole)?.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{announcement.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(announcement.createdAt).toLocaleString()} • {announcement.author || 'System'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
