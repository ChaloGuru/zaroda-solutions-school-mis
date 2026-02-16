import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  hoiTeachersStorage,
  hoiStudentsStorage,
  hoiClassesStorage,
  hoiSubjectsStorage,
  HoiTeacher,
} from '@/lib/hoiStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  GraduationCap,
  Layers,
  BookOpen,
  Calendar,
  Plus,
  ClipboardList,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

import { useToast } from '@/hooks/use-toast';

interface DhoiOverviewProps {
  onNavigate: (section: string) => void;
}

interface ActivityItem {
  id: string;
  message: string;
  timestamp: string;
  type: 'teacher' | 'subject' | 'timetable';
}

const STATUS_COLORS: Record<string, string> = {
  active: '#10b981',
  on_leave: '#f59e0b',
  deactivated: '#ef4444',
};

export default function DhoiOverview({ onNavigate }: DhoiOverviewProps) {
  const { toast } = useToast();
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
  const [totalSubjects, setTotalSubjects] = useState(0);
  const [timetableGenerated, setTimetableGenerated] = useState(false);
  const [teacherStatusData, setTeacherStatusData] = useState<{ name: string; value: number }[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const teachers = hoiTeachersStorage.getAll();
    const students = hoiStudentsStorage.getAll();
    const classes = hoiClassesStorage.getAll();
    const subjects = hoiSubjectsStorage.getAll();

    setTotalTeachers(teachers.length);
    setTotalStudents(students.length);
    setTotalClasses(classes.length);
    setTotalSubjects(subjects.length);

    const masterTimetable = localStorage.getItem('zaroda_master_timetable');
    setTimetableGenerated(!!masterTimetable && masterTimetable !== '[]');

    const statusCounts: Record<string, number> = { active: 0, on_leave: 0, deactivated: 0 };
    teachers.forEach((t: HoiTeacher) => {
      statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
    });
    setTeacherStatusData(
      Object.entries(statusCounts)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({
          name: name === 'on_leave' ? 'On Leave' : name.charAt(0).toUpperCase() + name.slice(1),
          value,
        }))
    );

    const recentActivities: ActivityItem[] = [];
    const sortedTeachers = [...teachers].sort(
      (a, b) => new Date(b.hired_at).getTime() - new Date(a.hired_at).getTime()
    );
    sortedTeachers.slice(0, 3).forEach((t) => {
      recentActivities.push({
        id: `teacher-${t.id}`,
        message: `${t.full_name} added as teacher (${t.subject_specialization})`,
        timestamp: t.hired_at,
        type: 'teacher',
      });
    });

    subjects.slice(0, 2).forEach((s) => {
      recentActivities.push({
        id: `subject-${s.id}`,
        message: `Subject "${s.name}" (${s.code}) assigned as ${s.category}`,
        timestamp: new Date().toISOString().split('T')[0],
        type: 'subject',
      });
    });

    if (masterTimetable && masterTimetable !== '[]') {
      recentActivities.push({
        id: 'timetable-gen',
        message: 'Master timetable generated successfully',
        timestamp: new Date().toISOString().split('T')[0],
        type: 'timetable',
      });
    }

    setActivities(recentActivities);
  }, []);

  const statCards = [
    { label: 'Total Teachers', value: totalTeachers, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    { label: 'Total Students', value: totalStudents, icon: GraduationCap, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Total Classes', value: totalClasses, icon: Layers, color: 'text-violet-600', bg: 'bg-violet-500/10' },
    { label: 'Total Subjects', value: totalSubjects, icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-500/10' },
    {
      label: 'Timetable Status',
      value: timetableGenerated ? 'Generated' : 'Not Generated',
      icon: timetableGenerated ? CheckCircle : XCircle,
      color: timetableGenerated ? 'text-emerald-600' : 'text-red-500',
      bg: timetableGenerated ? 'bg-emerald-500/10' : 'bg-red-500/10',
    },
  ];

  const quickActions = [
    { label: 'Add Teacher', icon: Plus, section: 'Teachers' },
    { label: 'Assign Subject', icon: BookOpen, section: 'Subjects' },
    { label: 'Generate Timetable', icon: Calendar, section: 'Timetable' },
    { label: 'View Roster', icon: ClipboardList, section: 'Roster' },
  ];

  const handleQuickAction = (section: string) => {
    toast({
      title: 'Navigation',
      description: `Navigate to ${section} section`,
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'teacher':
        return Users;
      case 'subject':
        return BookOpen;
      case 'timetable':
        return Calendar;
      default:
        return Users;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">DHOI Dashboard Overview</h1>
        <p className="text-muted-foreground">Deputy Head of Institution — overview of school data and quick actions.</p>
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
                  {stat.label === 'Timetable Status' && (
                    <Badge variant="outline" className={`text-[10px] ${stat.bg} ${stat.color}`}>
                      {timetableGenerated ? 'Active' : 'Pending'}
                    </Badge>
                  )}
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
              <CardTitle className="text-lg">Teacher Distribution by Status</CardTitle>
            </CardHeader>
            <CardContent>
              {teacherStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={teacherStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {teacherStatusData.map((entry, index) => {
                        const key = entry.name.toLowerCase().replace(' ', '_');
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={STATUS_COLORS[key] || '#6366f1'}
                          />
                        );
                      })}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">No teacher data available.</p>
              )}
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
                  onClick={() => handleQuickAction(action.section)}
                >
                  <action.icon className="w-4 h-4" />
                  {action.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No recent activity.</p>
              ) : (
                activities.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {activity.type}
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
