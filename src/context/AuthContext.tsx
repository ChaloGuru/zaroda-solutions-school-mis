import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { activityStorage } from '@/lib/storage';
import { sendWelcomeEmail } from '@/lib/email';
import { getSupabaseConfigError, supabase } from '@/lib/supabase';

export type UserRole = 'superadmin' | 'teacher' | 'hoi' | 'dhoi' | 'student' | 'parent' | 'hod';

export type GradeLevel = 'Playgroup' | 'PP1' | 'PP2' | 'Grade 1' | 'Grade 2' | 'Grade 3' | 'Grade 4' | 'Grade 5' | 'Grade 6' | 'Grade 7' | 'Grade 8' | 'Grade 9';

export const GRADE_LEVELS: GradeLevel[] = ['Playgroup', 'PP1', 'PP2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'];

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  schoolId?: string | null;
  schoolName?: string;
  schoolCode: string;
  phone?: string;
  subject?: string;
  grade?: GradeLevel;
  isClassTeacher?: boolean;
  classTeacherClassId?: string;
  classTeacherClassName?: string;
  classTeacherStreamId?: string;
  classTeacherStreamName?: string;
  department?: string;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  userRole: UserRole | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: TeacherSignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

export interface TeacherSignupData {
  fullName: string;
  email: string;
  password: string;
  schoolCode: string;
  subject: string;
  phone: string;
  grade: GradeLevel;
}

const ROLE_DASHBOARD_MAP: Record<UserRole, string> = {
  superadmin: '/superadmin-dashboard',
  teacher: '/teacher-dashboard',
  hoi: '/hoi-dashboard',
  dhoi: '/dhoi-dashboard',
  hod: '/hod-dashboard',
  student: '/student-dashboard',
  parent: '/parent-dashboard',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapProfileToAuthUser = (profile: any): AuthUser => ({
  id: profile.id,
  email: profile.email,
  fullName: profile.full_name,
  role: profile.role,
  schoolId: profile.role === 'superadmin' ? null : (profile.school_id || null),
  schoolName: profile.school_name || undefined,
  schoolCode: profile.school_code || '',
  phone: profile.phone || undefined,
  subject: profile.subject || undefined,
  grade: profile.grade || undefined,
  isClassTeacher: profile.is_class_teacher || false,
  classTeacherClassId: profile.class_teacher_class_id || undefined,
  classTeacherClassName: profile.class_teacher_class_name || undefined,
  classTeacherStreamId: profile.class_teacher_stream_id || undefined,
  classTeacherStreamName: profile.class_teacher_stream_name || undefined,
});

const fetchAuthUserProfile = async (authUserId: string): Promise<AuthUser | null> => {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', authUserId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapProfileToAuthUser(data);
};

export const getDashboardForRole = (role: UserRole): string => {
  return ROLE_DASHBOARD_MAP[role] || '/login';
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (data.session?.user && mounted) {
          const profileUser = await fetchAuthUserProfile(data.session.user.id);
          setCurrentUser(profileUser);
        }
      } catch {
        if (mounted) setCurrentUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void initialize();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setLoading(true);
      if (!session?.user) {
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      void (async () => {
        try {
          const profileUser = await fetchAuthUserProfile(session.user.id);
          setCurrentUser(profileUser);
        } catch {
          setCurrentUser(null);
        } finally {
          setLoading(false);
        }
      })();
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const getFriendlyLoginError = (error: unknown): string => {
    const message = error instanceof Error ? error.message : String(error || 'Login failed');
    const normalized = message.toLowerCase();

    if (normalized.includes('failed to fetch') || normalized.includes('network') || normalized.includes('fetch')) {
      return 'Cannot reach Supabase. Check your internet connection and verify VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY are set correctly.';
    }

    return message;
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const configError = getSupabaseConfigError();
    if (configError) {
      return { success: false, error: configError };
    }

    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error || !data.user) {
      return { success: false, error: getFriendlyLoginError(error?.message || 'Invalid credentials.') };
    }

    try {
      const profileUser = await fetchAuthUserProfile(data.user.id);
      if (!profileUser) {
        await supabase.auth.signOut();
        return { success: false, error: 'No profile found for this account. Please contact administrator.' };
      }

      setCurrentUser(profileUser);

      await supabase
        .from('profiles')
        .update({
          last_login: new Date().toISOString(),
          login_count: (await supabase.from('profiles').select('login_count').eq('id', profileUser.id).single()).data?.login_count + 1 || 1,
        })
        .eq('id', profileUser.id);

      await activityStorage.add({
        userId: profileUser.id,
        email: profileUser.email,
        fullName: profileUser.fullName,
        role: profileUser.role,
        action: 'login',
      });

      return { success: true };
    } catch (profileError) {
      await supabase.auth.signOut();
      return { success: false, error: getFriendlyLoginError(profileError instanceof Error ? profileError.message : 'Failed to load profile.') };
    }
  };

  const signup = async (data: TeacherSignupData): Promise<{ success: boolean; error?: string }> => {
    const normalizedEmail = data.email.trim().toLowerCase();
    const trimmedCode = data.schoolCode.trim();

    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .select('id, name, school_code')
      .eq('school_code', trimmedCode)
      .maybeSingle();

    if (schoolError) {
      return { success: false, error: schoolError.message };
    }

    if (!school) {
      return { success: false, error: 'School code not found. Please contact administrator.' };
    }

    const { data: signUpData, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName.trim(),
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!signUpData.user) {
      return { success: false, error: 'Signup failed. Please try again.' };
    }

    const profilePayload = {
      id: signUpData.user.id,
      email: normalizedEmail,
      full_name: data.fullName.trim(),
      role: 'teacher' as UserRole,
      school_id: school.id,
      school_code: school.school_code,
      school_name: school.name,
      phone: data.phone.trim(),
      subject: data.subject.trim(),
      grade: data.grade,
      status: 'active',
      created_by: 'Self-registered',
      login_count: 0,
    };

    const { error: profileError } = await supabase.from('profiles').upsert(profilePayload, { onConflict: 'id' });
    if (profileError) {
      return { success: false, error: profileError.message };
    }

    const createdUser: AuthUser = {
      id: signUpData.user.id,
      email: normalizedEmail,
      fullName: data.fullName.trim(),
      role: 'teacher',
      schoolId: school.id,
      schoolName: school.name,
      schoolCode: school.school_code,
      phone: data.phone.trim(),
      subject: data.subject.trim(),
      grade: data.grade,
    };

    setCurrentUser(createdUser);

    await activityStorage.add({
      userId: createdUser.id,
      email: createdUser.email,
      fullName: createdUser.fullName,
      role: createdUser.role,
      action: 'account_created',
      details: 'Teacher self-registered',
    });

    void sendWelcomeEmail({
      email: normalizedEmail,
      fullName: data.fullName.trim(),
      role: 'teacher',
      schoolName: school.name,
      schoolCode: school.school_code,
      createdBy: 'Self-registered',
    });

    return { success: true };
  };

  const logout = async () => {
    if (currentUser) {
      await activityStorage.add({
        userId: currentUser.id,
        email: currentUser.email,
        fullName: currentUser.fullName,
        role: currentUser.role,
        action: 'logout',
      });
    }

    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userRole: currentUser?.role || null,
        loading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
