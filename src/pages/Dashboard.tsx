import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  User,
  Phone,
  Mail,
  LogOut,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import zarodaLogo from '@/assets/zaroda-logo.png';
import AssessmentBook from '@/components/teacher/AssessmentBook';

const Dashboard = () => {
  const { currentUser, logout } = useAuthContext();
  const [activeTab, setActiveTab] = useState<'assessment' | 'timetable' | 'profile'>('assessment');
  const [myTimetable, setMyTimetable] = useState<any[]>([]);
  const [teacherCode, setTeacherCode] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    try {
      const codes: Record<string, string> = JSON.parse(localStorage.getItem('zaroda_teacher_codes') || '{}');
      const myCode = codes[currentUser.id] || Object.entries(codes).find(([, c]) => c && currentUser.fullName)?.toString() || '';
      setTeacherCode(typeof myCode === 'string' ? myCode : '');
      const allSlots = JSON.parse(localStorage.getItem('zaroda_master_timetable') || '[]');
      const filtered = allSlots.filter((s: any) => s.teacherId === currentUser.id || s.teacherCode === codes[currentUser.id]);
      setMyTimetable(filtered);
    } catch { setMyTimetable([]); }
  }, [currentUser, activeTab]);

  const handleSignOut = () => {
    logout();
  };

  if (!currentUser) return null;

  const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

  const navItems = [
    { id: 'assessment' as const, label: 'Assessment Book', icon: ClipboardList },
    { id: 'timetable' as const, label: 'My Timetable', icon: Calendar },
    { id: 'profile' as const, label: 'My Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <img src={zarodaLogo} alt="Zaroda Solutions" className="h-10 w-auto" />
              <span className="text-sm font-bold tracking-wide hidden sm:inline" style={{ color: '#1a5276' }}>ZARODA SOLUTIONS</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium">{currentUser.fullName}</span>
                <span className="text-xs text-muted-foreground">
                  {currentUser.grade} - {currentUser.subject}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut size={16} className="mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
          <div className="md:hidden flex gap-1 pb-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <item.icon size={14} />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'assessment' && currentUser.grade && currentUser.subject && (
          <AssessmentBook
            teacherId={currentUser.id}
            teacherName={currentUser.fullName}
            grade={currentUser.grade}
            subject={currentUser.subject}
            schoolCode={currentUser.schoolCode}
          />
        )}

        {activeTab === 'assessment' && (!currentUser.grade || !currentUser.subject) && (
          <Card className="max-w-lg mx-auto mt-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="text-primary" size={24} />
                Assessment Book Not Available
              </CardTitle>
              <CardDescription>
                Your account is missing grade or subject information. Please contact your administrator to update your profile, or sign out and create a new account with grade and subject details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut size={16} className="mr-2" />
                Sign Out & Re-register
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === 'timetable' && (
          <div className="mt-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="text-primary" size={24} />
                  My Weekly Timetable
                </CardTitle>
                <CardDescription>
                  {teacherCode && <Badge variant="outline" className="mr-2">Code: {teacherCode}</Badge>}
                  Your assigned classes and schedule
                </CardDescription>
              </CardHeader>
              <CardContent>
                {myTimetable.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle size={48} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Your timetable has not been set yet</h3>
                    <p className="text-muted-foreground">Contact the DHOI to have your timetable generated.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="bg-[#1E3A5F] text-white font-bold">Day</TableHead>
                          <TableHead className="bg-[#0D9488] text-white">Time</TableHead>
                          <TableHead className="bg-[#0D9488] text-white">Subject</TableHead>
                          <TableHead className="bg-[#0D9488] text-white">Class</TableHead>
                          <TableHead className="bg-[#0D9488] text-white">Stream</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {DAYS.map(day => {
                          const daySlots = myTimetable
                            .filter((s: any) => s.day === day && !s.isLocked)
                            .sort((a: any, b: any) => a.periodIndex - b.periodIndex);
                          if (daySlots.length === 0) return null;
                          return daySlots.map((slot: any, idx: number) => (
                            <TableRow key={slot.id || `${day}-${idx}`}>
                              {idx === 0 && (
                                <TableCell rowSpan={daySlots.length} className="bg-[#1E3A5F] text-white font-bold align-middle text-center">{day}</TableCell>
                              )}
                              <TableCell className="text-sm whitespace-nowrap">{slot.timeStart} - {slot.timeEnd}</TableCell>
                              <TableCell className="font-semibold">{slot.subjectName}</TableCell>
                              <TableCell>{slot.className}</TableCell>
                              <TableCell>{slot.streamName}</TableCell>
                            </TableRow>
                          ));
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="grid lg:grid-cols-3 gap-6 mt-2">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="text-primary" size={24} />
                  Teacher Profile
                </CardTitle>
                <CardDescription>Your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Full Name</Label>
                    <p className="font-medium text-lg">{currentUser.fullName}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">School Code</Label>
                    <p className="font-mono text-lg bg-muted px-3 py-1 rounded inline-block">{currentUser.schoolCode}</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Email</Label>
                    <p className="flex items-center gap-2">
                      <Mail size={14} className="text-muted-foreground" />
                      {currentUser.email}
                    </p>
                  </div>
                  {currentUser.phone && (
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">Phone</Label>
                      <p className="flex items-center gap-2">
                        <Phone size={14} className="text-muted-foreground" />
                        {currentUser.phone}
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {currentUser.grade && (
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">Grade Assigned</Label>
                      <p className="flex items-center gap-2">
                        <GraduationCap size={14} className="text-muted-foreground" />
                        {currentUser.grade}
                      </p>
                    </div>
                  )}
                  {currentUser.subject && (
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">Subject</Label>
                      <p className="flex items-center gap-2">
                        <BookOpen size={14} className="text-muted-foreground" />
                        {currentUser.subject}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ClipboardList className="text-primary" size={20} />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('assessment')}>
                    <ClipboardList size={16} className="mr-2" />
                    Open Assessment Book
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/">
                      <School size={16} className="mr-2" />
                      View Homepage
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg text-primary">Need Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Contact our support team for assistance with your account.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/contact">Contact Support</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
