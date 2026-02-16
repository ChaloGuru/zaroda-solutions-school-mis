import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, GraduationCap, BookOpen, ClipboardCheck, BarChart3 } from 'lucide-react';
import { hoiStudentsStorage, hoiSubjectAssignmentsStorage, hoiAttendanceStorage, HoiStudent, HoiSubjectAssignment, HoiAttendance } from '@/lib/hoiStorage';
import { assessmentStorage, AssessmentRecord } from '@/lib/storage';

interface ClassOverviewProps {
  classId: string;
  className: string;
  streamId: string;
  streamName: string;
  teacherName: string;
}

export default function ClassOverview({ classId, className, streamId, streamName, teacherName }: ClassOverviewProps) {
  const [students, setStudents] = useState<HoiStudent[]>([]);
  const [assignments, setAssignments] = useState<HoiSubjectAssignment[]>([]);
  const [attendance, setAttendance] = useState<HoiAttendance[]>([]);
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);

  useEffect(() => {
    const allStudents = hoiStudentsStorage.getAll().filter(s => s.class_id === classId && s.stream_id === streamId && s.status === 'active');
    setStudents(allStudents);
    setAssignments(hoiSubjectAssignmentsStorage.getAll().filter(a => a.class_id === classId && a.stream_id === streamId));
    setAttendance(hoiAttendanceStorage.getAll().filter(a => a.class_id === classId && a.stream_id === streamId));
    setAssessments(assessmentStorage.getAll().filter(r => allStudents.some(s => s.id === r.studentId || s.admission_no === r.admissionNo)));
  }, [classId, streamId]);

  const maleCount = students.filter(s => s.gender === 'Male').length;
  const femaleCount = students.filter(s => s.gender === 'Female').length;
  const uniqueSubjects = [...new Set(assignments.map(a => a.subject_name))];
  const uniqueTeachers = [...new Set(assignments.map(a => a.teacher_name))];

  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(a => a.date === today);
  const presentToday = todayAttendance.filter(a => a.status === 'present').length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Class: {className} - {streamName}</h1>
        <p className="text-gray-500 text-sm mt-1">Class Teacher: {teacherName}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{students.length}</p>
                <p className="text-xs text-gray-500">Total Students</p>
              </div>
            </div>
            <div className="mt-3 flex gap-3 text-xs">
              <span className="text-blue-600">Boys: {maleCount}</span>
              <span className="text-pink-600">Girls: {femaleCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <ClipboardCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{presentToday}/{students.length}</p>
                <p className="text-xs text-gray-500">Present Today</p>
              </div>
            </div>
            {todayAttendance.length === 0 && (
              <p className="text-[10px] text-amber-600 mt-2">Attendance not marked today</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{uniqueSubjects.length}</p>
                <p className="text-xs text-gray-500">Subjects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{uniqueTeachers.length}</p>
                <p className="text-xs text-gray-500">Subject Teachers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Subject Teachers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <p className="text-gray-500 text-sm">No subject assignments found.</p>
            ) : (
              <div className="space-y-2">
                {[...new Map(assignments.map(a => [a.subject_name, a])).values()].map(a => (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm">{a.subject_name}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{a.teacher_name}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>{assessments.length} assessment records available</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>{attendance.length} attendance records total</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span>{students.length} active students enrolled</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
