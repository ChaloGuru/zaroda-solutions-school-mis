import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  hoiStudentsStorage,
  hoiTeachersStorage,
  hoiClassesStorage,
  hoiFeesStorage,
  hoiAttendanceStorage,
  hoiAnnouncementsStorage,
  HoiAnnouncement,
} from '@/lib/hoiStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

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
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [announcements, setAnnouncements] = useState<HoiAnnouncement[]>([]);
  const [chartData, setChartData] = useState<{ name: string; revenue: number; attendance: number }[]>([]);

  useEffect(() => {
    const students = hoiStudentsStorage.getAll();
    const teachers = hoiTeachersStorage.getAll();
    const classes = hoiClassesStorage.getAll();
    const fees = hoiFeesStorage.getAll();
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

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const cData = months.map((m, i) => {
      const mFees = fees.filter((f) => new Date(f.date).getMonth() === i).reduce((s, f) => s + f.amount, 0);
      const mAtt = attendance.filter((a) => new Date(a.date).getMonth() === i);
      const mPresent = mAtt.filter((a) => a.status === 'present').length;
      const mRate = mAtt.length > 0 ? Math.round((mPresent / mAtt.length) * 100) : 0;
      return { name: m, revenue: mFees / 1000, attendance: mRate };
    });
    setChartData(cData);
  }, []);

  const statCards = [
    { label: 'Total Students', value: totalStudents, icon: GraduationCap, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Total Teachers', value: totalTeachers, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    { label: 'Total Classes', value: totalClasses, icon: Layers, color: 'text-violet-600', bg: 'bg-violet-500/10' },
    { label: 'Revenue (Month)', value: `KES ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-500/10' },
    { label: 'Attendance Today', value: `${attendanceRate}%`, icon: ClipboardCheck, color: 'text-sky-600', bg: 'bg-sky-500/10' },
  ];

  const quickActions = [
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
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="revenue" name="Revenue (K)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="attendance" name="Attendance %" fill="#10b981" radius={[4, 4, 0, 0]} />
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
