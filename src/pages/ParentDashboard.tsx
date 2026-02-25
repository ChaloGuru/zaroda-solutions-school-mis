import { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  DollarSign,
  MessageSquare,
  User,
  Megaphone,
} from 'lucide-react';
import DashboardLayout, { type MenuGroup } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/context/AuthContext';
import { adminAnnouncementsStorage, adminAnnouncementReadStorage } from '@/lib/storage';

const menuGroups: MenuGroup[] = [
  {
    label: 'Main Menu',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'children', label: 'My Children', icon: Users },
      { id: 'grades', label: 'Academic Reports', icon: BookOpen },
      { id: 'fees', label: 'Fee Payments', icon: DollarSign },
      { id: 'messages', label: 'Messages', icon: MessageSquare },
      { id: 'profile', label: 'My Profile', icon: User },
    ],
  },
];

const ParentDashboard = () => {
  const { currentUser } = useAuthContext();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [announcements, setAnnouncements] = useState<Awaited<ReturnType<typeof adminAnnouncementsStorage.getByTargetRole>>>([]);
  const userKey = useMemo(() => {
    const identity = currentUser?.id || currentUser?.email || 'parent_guest';
    return `parent:${identity}`;
  }, [currentUser]);
  const [readAnnouncementIds, setReadAnnouncementIds] = useState<string[]>([]);

  useEffect(() => {
    const loadAnnouncementData = async () => {
      const scopedAnnouncements = await adminAnnouncementsStorage.getByTargetRole('parent');
      const readIds = await adminAnnouncementReadStorage.getReadIds(userKey);
      setAnnouncements(scopedAnnouncements);
      setReadAnnouncementIds(readIds);
    };

    void loadAnnouncementData();
  }, [userKey]);

  const unreadCount = announcements.filter((announcement) => !readAnnouncementIds.includes(announcement.id)).length;

  const markAllRead = async () => {
    await adminAnnouncementReadStorage.markManyRead(userKey, announcements.map((announcement) => announcement.id));
    setReadAnnouncementIds(await adminAnnouncementReadStorage.getReadIds(userKey));
  };

  const announcementsView = (
    <Card className="max-w-3xl mx-auto w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone size={18} className="text-primary" />
          Admin Announcements
          {unreadCount > 0 && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-[10px]">{unreadCount} NEW</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {unreadCount > 0 && (
          <div className="flex justify-end mb-2">
            <Button size="sm" variant="outline" onClick={markAllRead}>Mark all read</Button>
          </div>
        )}
        {announcements.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No announcements available.</p>
        ) : (
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <div key={announcement.id} className={`border rounded-lg p-3 ${!readAnnouncementIds.includes(announcement.id) ? 'border-primary/40 bg-primary/5' : ''}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-sm">{announcement.title}</p>
                  {!readAnnouncementIds.includes(announcement.id) && <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">NEW</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{announcement.message}</p>
                <p className="text-xs text-muted-foreground mt-2">{new Date(announcement.createdAt).toLocaleString()} • {announcement.author || 'SuperAdmin'}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout
      portalName="Parent"
      roleLabel="Parent/Guardian"
      menuGroups={menuGroups}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    >
      {activeSection === 'dashboard' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Parent Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Latest updates and communication from administration.</p>
          </div>
          {announcementsView}
        </div>
      )}

      {activeSection === 'messages' && (
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-500 text-sm mt-1">Read announcements sent to parents.</p>
          </div>
          {announcementsView}
        </div>
      )}

      {activeSection !== 'dashboard' && activeSection !== 'messages' && (
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Section under construction</h2>
          <p className="text-gray-500 text-center max-w-md">This section will be available soon.</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ParentDashboard;
