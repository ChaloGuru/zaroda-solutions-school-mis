import { useState, useEffect, useMemo, Fragment } from 'react';
import { motion } from 'framer-motion';
import { useAuthContext } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  hoiTeachersStorage,
  hoiStudentsStorage,
  hoiClassesStorage,
  hoiFeesStorage,
  hoiAttendanceStorage,
  hoiAnnouncementsStorage,
  HoiAnnouncement,
} from '../../lib/hoiStorage';
import { adminAnnouncementsStorage, adminAnnouncementReadStorage, type AdminAnnouncement } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  GraduationCap,
  Users,
  Layers,
  DollarSign,
  ClipboardCheck,
  UserPlus,
  CalendarDays,
  ArrowUpRight,
  Megaphone,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LabelList } from 'recharts';

interface HoiOverviewProps {
  onNavigate: (section: 'overview' | 'school' | 'classes' | 'teachers' | 'students' | 'officials' | 'subjects' | 'timetable' | 'attendance' | 'finances' | 'library' | 'sports' | 'elections' | 'reports' | 'settings') => void;
}

const priorityConfig: Record<string, { color: string; bg: string }> = {
  urgent: { color: 'text-red-700', bg: 'bg-red-500/20 border-red-500/30' },
  high: { color: 'text-orange-700', bg: 'bg-orange-500/20 border-orange-500/30' },
  medium: { color: 'text-blue-700', bg: 'bg-blue-500/20 border-blue-500/30' },
  low: { color: 'text-gray-600', bg: 'bg-gray-500/20 border-gray-500/30' },
};

export default function HoiOverview({ onNavigate }: HoiOverviewProps) {
  const { currentUser } = useAuthContext();
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [announcements, setAnnouncements] = useState<HoiAnnouncement[]>([]);
  const [adminAnnouncements, setAdminAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [readAdminAnnouncementIds, setReadAdminAnnouncementIds] = useState<string[]>([]);
  const [chartData, setChartData] = useState<{ name: string; revenue: number; attendance: number }[]>([]);
  const [rollStudents, setRollStudents] = useState<Array<{ class_name: string; gender: 'Male' | 'Female' | null }>>([]);

  const adminAnnouncementUserKey = useMemo(() => {
    const identity = currentUser?.id || currentUser?.email || 'hoi_guest';
    return `hoi:${identity}`;
  }, [currentUser]);

  const normalizeRollClass = (value: string): string => {
    const normalized = (value || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const compact = normalized.replace(/\s+/g, '');
    const classMap: Record<string, string> = {
      pp1: 'PP1',
      'pp 1': 'PP1',
      pp2: 'PP2',
      'pp 2': 'PP2',
      grade1: 'Grade 1',
      'grade 1': 'Grade 1',
      grade2: 'Grade 2',
      'grade 2': 'Grade 2',
      grade3: 'Grade 3',
      'grade 3': 'Grade 3',
      grade4: 'Grade 4',
      'grade 4': 'Grade 4',
      grade5: 'Grade 5',
      'grade 5': 'Grade 5',
      grade6: 'Grade 6',
      'grade 6': 'Grade 6',
      grade7: 'Grade 7',
      'grade 7': 'Grade 7',
      jss1: 'Grade 7',
      'jss 1': 'Grade 7',
      grade8: 'Grade 8',
      'grade 8': 'Grade 8',
      jss2: 'Grade 8',
      'jss 2': 'Grade 8',
      grade9: 'Grade 9',
      'grade 9': 'Grade 9',
      jss3: 'Grade 9',
      'jss 3': 'Grade 9',
    };
    return classMap[normalized] || classMap[compact] || value;
  };

  const schoolRollGroups = useMemo(() => {
    const groups = [
      { section: 'ECDE', classes: ['PP1', 'PP2'] },
      { section: 'Primary', classes: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'] },
      { section: 'Junior Secondary', classes: ['Grade 7', 'Grade 8', 'Grade 9'] },
    ];

    return groups.map((group) => {
      const rows = group.classes.map((className) => {
        const classStudents = rollStudents.filter((student) => normalizeRollClass(student.class_name) === className);
        const boys = classStudents.filter((student) => student.gender === 'Male').length;
        const girls = classStudents.filter((student) => student.gender === 'Female').length;
        return {
          className,
          boys,
          girls,
          total: boys + girls,
        };
      });

      const subtotal = rows.reduce(
        (acc, row) => ({
          boys: acc.boys + row.boys,
          girls: acc.girls + row.girls,
          total: acc.total + row.total,
        }),
        { boys: 0, girls: 0, total: 0 }
      );

      return { ...group, rows, subtotal };
    });
  }, [rollStudents]);

  const schoolRollGrandTotal = useMemo(() => {
    return schoolRollGroups.reduce(
      (acc, group) => ({
        boys: acc.boys + group.subtotal.boys,
        girls: acc.girls + group.subtotal.girls,
        total: acc.total + group.subtotal.total,
      }),
      { boys: 0, girls: 0, total: 0 }
    );
  }, [schoolRollGroups]);

  useEffect(() => {
    const loadOverviewData = async () => {
      const students = hoiStudentsStorage.getAll();
      const teachers = hoiTeachersStorage.getAll();
      const classes = hoiClassesStorage.getAll();
      let fees = [] as ReturnType<typeof hoiFeesStorage.getAll>;
      try {
        fees = hoiFeesStorage.getAll();
      } catch {
        fees = [];
      }
      const attendance = hoiAttendanceStorage.getAll();
      const anns = hoiAnnouncementsStorage.getAll();

      setTotalStudents(students.length);
      setTotalTeachers(teachers.length);
      setTotalClasses(classes.length);

      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      const monthRevenue = fees
        .filter((f) => {
          const d = new Date(f.date);
          return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        })
        .reduce((sum, f) => sum + f.amount, 0);
      setTotalRevenue(monthRevenue);

      const todayStr = now.toISOString().split('T')[0];
      const todayAtt = attendance.filter((a) => a.date === todayStr);
      const presentCount = todayAtt.filter((a) => a.status === 'present').length;
      const rate = todayAtt.length > 0 ? Math.round((presentCount / todayAtt.length) * 100) : 0;
      setAttendanceRate(rate);

      setAnnouncements(anns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      try {
        setAdminAnnouncements(await adminAnnouncementsStorage.getByTargetRole('hoi'));
      } catch {
        setAdminAnnouncements([]);
      }

      if (!currentUser?.schoolId) {
        setRollStudents([]);
      } else {
        const { data: rollRows } = await supabase
          .from('hoi_students')
          .select('class_name, gender')
          .eq('school_id', currentUser.schoolId);

        if (rollRows && Array.isArray(rollRows)) {
          setRollStudents(
            rollRows.map((row) => ({
              class_name: String(row.class_name || ''),
              gender: row.gender === 'Male' || row.gender === 'Female' ? row.gender : null,
            }))
          );
        } else {
          setRollStudents([]);
        }
      }

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const cData = months.map((m, i) => {
        const mFees = fees.filter((f) => new Date(f.date).getMonth() === i).reduce((s, f) => s + f.amount, 0);
        const mAtt = attendance.filter((a) => new Date(a.date).getMonth() === i);
        const mPresent = mAtt.filter((a) => a.status === 'present').length;
        const mRate = mAtt.length > 0 ? Math.round((mPresent / mAtt.length) * 100) : 0;
        return { name: m, revenue: mFees / 1000, attendance: mRate };
      });
      setChartData(cData);

      try {
        setReadAdminAnnouncementIds(await adminAnnouncementReadStorage.getReadIds(adminAnnouncementUserKey));
      } catch {
        setReadAdminAnnouncementIds([]);
      }
    };

    void loadOverviewData();
  }, [adminAnnouncementUserKey, currentUser?.schoolId]);

  const unreadAdminCount = adminAnnouncements.filter((announcement) => !readAdminAnnouncementIds.includes(announcement.id)).length;

  const markAllAdminAnnouncementsRead = async () => {
    const ids = adminAnnouncements.map((announcement) => announcement.id);
    await adminAnnouncementReadStorage.markManyRead(adminAnnouncementUserKey, ids);
    setReadAdminAnnouncementIds(await adminAnnouncementReadStorage.getReadIds(adminAnnouncementUserKey));
  };

  const statCards = [
    { label: 'Total Students', value: totalStudents, icon: GraduationCap, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Total Teachers', value: totalTeachers, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    { label: 'Total Classes', value: totalClasses, icon: Layers, color: 'text-violet-600', bg: 'bg-violet-500/10' },
    { label: 'Revenue (Month)', value: `KES ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-500/10' },
    { label: 'Attendance Today', value: `${attendanceRate}%`, icon: ClipboardCheck, color: 'text-sky-600', bg: 'bg-sky-500/10' },
  ];

  const quickActions: Array<{ label: string; section: Parameters<HoiOverviewProps['onNavigate']>[0]; icon: typeof UserPlus }> = [
    { label: 'Add Teacher', section: 'teachers', icon: UserPlus },
    { label: 'Add Student', section: 'students', icon: GraduationCap },
    { label: 'View Timetable', section: 'timetable', icon: CalendarDays },
    { label: 'View Finances', section: 'finances', icon: DollarSign },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening at your school today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="glass-card">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.bg}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${stat.bg} ${stat.color}`}>
                    <ArrowUpRight className="w-3 h-3" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground mb-0.5">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Revenue & Attendance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                    label={{ value: 'Month', position: 'insideBottom', offset: -4, style: { fill: 'hsl(var(--muted-foreground))', fontSize: 11 } }}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(v) => `${v}K`}
                    label={{ value: 'Revenue (KES Thousands)', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))', fontSize: 11 } }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                    stroke="#10b981"
                    tickFormatter={(v) => `${v}%`}
                    label={{ value: 'Attendance (%)', angle: 90, position: 'insideRight', style: { fill: '#10b981', fontSize: 11 } }}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      if (name === 'Revenue') return [`KES ${(value * 1000).toLocaleString()}`, 'Revenue'];
                      return [`${value}%`, 'Attendance'];
                    }}
                    labelFormatter={(label) => `Month: ${label}`}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="revenue" position="top" formatter={(v: number) => `${v}K`} style={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  </Bar>
                  <Bar yAxisId="right" dataKey="attendance" name="Attendance" fill="#10b981" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="attendance" position="top" formatter={(v: number) => `${v}%`} style={{ fontSize: 10, fill: '#0f766e' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-card h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => onNavigate(action.section)}
                >
                  <action.icon className="w-4 h-4" />
                  {action.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.56 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Admin Announcements</CardTitle>
                {unreadAdminCount > 0 && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-[10px]">{unreadAdminCount} NEW</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {unreadAdminCount > 0 && (
                <div className="flex justify-end mb-2">
                  <Button size="sm" variant="outline" onClick={markAllAdminAnnouncementsRead}>Mark all read</Button>
                </div>
              )}
              {adminAnnouncements.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No admin announcements available.</p>
              ) : (
                <div className="space-y-2">
                  {adminAnnouncements.slice(0, 4).map((announcement) => {
                    const isNew = !readAdminAnnouncementIds.includes(announcement.id);
                    return (
                    <div key={announcement.id} className={`border rounded-lg p-3 ${isNew ? 'border-primary/40 bg-primary/5' : 'border-border/60'}`}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-semibold">{announcement.title}</p>
                        <div className="flex items-center gap-1">
                          {isNew && <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">NEW</Badge>}
                          <Badge variant="outline" className="text-[10px] capitalize">{announcement.targetRole}</Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap">{announcement.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{new Date(announcement.createdAt).toLocaleString()} • {announcement.author || 'SuperAdmin'}</p>
                    </div>
                  )})}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.58 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">School Roll Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[220px] font-bold">Class</TableHead>
                    <TableHead className="text-right font-bold">Boys</TableHead>
                    <TableHead className="text-right font-bold">Girls</TableHead>
                    <TableHead className="text-right font-bold">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schoolRollGroups.map((group, groupIndex) => (
                    <Fragment key={`${group.section}-group`}>
                      <TableRow key={`${group.section}-header`} className="bg-muted/30">
                        <TableCell className="font-semibold" colSpan={4}>{group.section}</TableCell>
                      </TableRow>
                      {group.rows.map((row, rowIndex) => (
                        <TableRow
                          key={`${group.section}-${row.className}`}
                          className={rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted/10'}
                        >
                          <TableCell className="pl-6">{row.className}</TableCell>
                          <TableCell className="text-right">{row.boys}</TableCell>
                          <TableCell className="text-right">{row.girls}</TableCell>
                          <TableCell className="text-right">{row.total}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow key={`${group.section}-subtotal`} className="bg-muted/40 font-semibold">
                        <TableCell>{group.section} Total</TableCell>
                        <TableCell className="text-right">{group.subtotal.boys}</TableCell>
                        <TableCell className="text-right">{group.subtotal.girls}</TableCell>
                        <TableCell className="text-right">{group.subtotal.total}</TableCell>
                      </TableRow>
                      {groupIndex < schoolRollGroups.length - 1 && (
                        <TableRow key={`${group.section}-divider`}>
                          <TableCell colSpan={4} className="h-0 p-0 border-b border-border/60" />
                        </TableRow>
                      )}
                    </Fragment>
                  ))}
                  <TableRow className="bg-primary/10 font-bold border-t-2 border-primary/30">
                    <TableCell>Grand Total</TableCell>
                    <TableCell className="text-right">{schoolRollGrandTotal.boys}</TableCell>
                    <TableCell className="text-right">{schoolRollGrandTotal.girls}</TableCell>
                    <TableCell className="text-right">{schoolRollGrandTotal.total}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Announcements</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {announcements.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No announcements yet.</p>
                ) : (
                  announcements.map((ann) => {
                    const pc = priorityConfig[ann.priority] || priorityConfig.low;
                    return (
                      <div key={ann.id} className="p-3 rounded-lg border border-border/50 hover:bg-secondary/30 transition-colors">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-foreground">{ann.title}</h4>
                          <Badge variant="outline" className={`capitalize text-[10px] ${pc.bg} ${pc.color}`}>
                            {ann.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-1.5">{ann.content}</p>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>{ann.author}</span>
                          <span>{new Date(ann.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {announcements.slice(0, 6).map((ann) => (
                  <div key={ann.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Megaphone className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{ann.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {ann.author} &middot; {new Date(ann.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
