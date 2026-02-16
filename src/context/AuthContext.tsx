import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { platformUsersStorage, activityStorage, initSeedPasswords } from '@/lib/storage';

export type UserRole = 'superadmin' | 'teacher' | 'hoi' | 'dhoi' | 'student' | 'parent';

export type GradeLevel = 'Playgroup' | 'PP1' | 'PP2' | 'Grade 1' | 'Grade 2' | 'Grade 3' | 'Grade 4' | 'Grade 5' | 'Grade 6' | 'Grade 7' | 'Grade 8' | 'Grade 9';

export const GRADE_LEVELS: GradeLevel[] = ['Playgroup', 'PP1', 'PP2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'];

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  schoolCode: string;
  phone?: string;
  subject?: string;
  grade?: GradeLevel;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  userRole: UserRole | null;
  loading: boolean;
  login: (role: UserRole, email: string, password: string, schoolCode?: string) => { success: boolean; error?: string };
  signup: (data: TeacherSignupData) => { success: boolean; error?: string };
  logout: () => void;
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

const SUPERADMIN_CREDENTIALS = {
  schoolCode: 'Zaroda001',
  email: 'oduorongo@gmail.com',
  password: 'ongo123',
};

const ROLE_DASHBOARD_MAP: Record<UserRole, string> = {
  superadmin: '/superadmin-dashboard',
  teacher: '/teacher-dashboard',
  hoi: '/hoi-dashboard',
  dhoi: '/dhoi-dashboard',
  student: '/student-dashboard',
  parent: '/parent-dashboard',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getStoredUsers = (): AuthUser[] => {
  try {
    const data = localStorage.getItem('zaroda_users');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const getStoredPasswords = (): Record<string, string> => {
  try {
    const data = localStorage.getItem('zaroda_passwords');
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

const saveUser = (user: AuthUser, password: string) => {
  const users = getStoredUsers();
  users.push(user);
  localStorage.setItem('zaroda_users', JSON.stringify(users));

  const passwords = getStoredPasswords();
  passwords[user.email.toLowerCase()] = password;
  localStorage.setItem('zaroda_passwords', JSON.stringify(passwords));
};

export const getDashboardForRole = (role: UserRole): string => {
  return ROLE_DASHBOARD_MAP[role] || '/login';
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initSeedPasswords();
    try {
      const stored = localStorage.getItem('zaroda_current_user');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem('zaroda_current_user');
    }
    setLoading(false);
  }, []);

  const login = (role: UserRole, email: string, password: string, schoolCode?: string): { success: boolean; error?: string } => {
    const normalizedEmail = email.trim().toLowerCase();

    if (role === 'superadmin') {
      if (
        (schoolCode || '').trim() === SUPERADMIN_CREDENTIALS.schoolCode &&
        normalizedEmail === SUPERADMIN_CREDENTIALS.email &&
        password === SUPERADMIN_CREDENTIALS.password
      ) {
        const user: AuthUser = {
          id: 'superadmin-001',
          email: SUPERADMIN_CREDENTIALS.email,
          fullName: 'Super Admin',
          role: 'superadmin',
          schoolCode: SUPERADMIN_CREDENTIALS.schoolCode,
        };
        setCurrentUser(user);
        localStorage.setItem('zaroda_current_user', JSON.stringify(user));
        activityStorage.add({
          userId: user.id,
          email: user.email,
          fullName: user.fullName,
          role: 'superadmin',
          action: 'login',
        });
        return { success: true };
      }
      return { success: false, error: 'Invalid school code, email, or password.' };
    }

    if (role === 'teacher') {
      const users = getStoredUsers();
      const found = users.find(u => u.email.toLowerCase() === normalizedEmail && u.role === 'teacher');
      const platformUser = platformUsersStorage.findByEmail(normalizedEmail);

      if (!found && (!platformUser || platformUser.role !== 'teacher')) {
        return { success: false, error: 'No teacher account found with this email. Please sign up first.' };
      }

      if (platformUser && platformUser.status === 'suspended') {
        return { success: false, error: 'Your account has been suspended. Please contact the SuperAdmin.' };
      }

      const passwords = getStoredPasswords();
      if (passwords[normalizedEmail] !== password) {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }

      const user: AuthUser = found || {
        id: platformUser!.id,
        email: platformUser!.email,
        fullName: platformUser!.fullName,
        role: 'teacher' as UserRole,
        schoolCode: platformUser!.schoolCode,
        phone: platformUser!.phone,
        subject: platformUser!.subject,
        grade: platformUser!.grade as GradeLevel | undefined,
      };
      setCurrentUser(user);
      localStorage.setItem('zaroda_current_user', JSON.stringify(user));
      if (platformUser) {
        platformUsersStorage.recordLogin(platformUser.id);
        activityStorage.add({
          userId: platformUser.id,
          email: user.email,
          fullName: user.fullName,
          role: 'teacher',
          action: 'login',
        });
      }
      return { success: true };
    }

    if (role === 'hoi') {
      const platformUser = platformUsersStorage.findByEmail(normalizedEmail);
      if (!platformUser || platformUser.role !== 'hoi') {
        return { success: false, error: 'No HOI account found with this email. Your account must be created by the SuperAdmin.' };
      }
      if (platformUser.status === 'suspended') {
        return { success: false, error: 'Your account has been suspended. Please contact the SuperAdmin.' };
      }
      if (platformUser.status === 'inactive') {
        return { success: false, error: 'Your account is inactive. Please contact the SuperAdmin.' };
      }
      const passwords = getStoredPasswords();
      if (passwords[normalizedEmail] !== password) {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }
      const user: AuthUser = {
        id: platformUser.id,
        email: platformUser.email,
        fullName: platformUser.fullName,
        role: 'hoi',
        schoolCode: platformUser.schoolCode,
        phone: platformUser.phone,
      };
      setCurrentUser(user);
      localStorage.setItem('zaroda_current_user', JSON.stringify(user));
      platformUsersStorage.recordLogin(platformUser.id);
      activityStorage.add({
        userId: platformUser.id,
        email: platformUser.email,
        fullName: platformUser.fullName,
        role: 'hoi',
        action: 'login',
      });
      return { success: true };
    }

    if (role === 'dhoi') {
      const dhoiAccounts = (() => {
        try {
          const data = localStorage.getItem('zaroda_dhoi_account');
          return data ? JSON.parse(data) : [];
        } catch { return []; }
      })();
      const dhoiAccount = Array.isArray(dhoiAccounts)
        ? dhoiAccounts.find((a: any) => a.email?.toLowerCase() === normalizedEmail)
        : (dhoiAccounts?.email?.toLowerCase() === normalizedEmail ? dhoiAccounts : null);

      if (!dhoiAccount) {
        return { success: false, error: 'No DHOI account found with this email. Your account must be created by the HOI.' };
      }
      if (dhoiAccount.status === 'suspended') {
        return { success: false, error: 'Your account has been suspended. Please contact the HOI.' };
      }
      const passwords = getStoredPasswords();
      if (passwords[normalizedEmail] !== password) {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }
      const user: AuthUser = {
        id: dhoiAccount.id || `dhoi-${Date.now()}`,
        email: dhoiAccount.email,
        fullName: dhoiAccount.fullName,
        role: 'dhoi',
        schoolCode: dhoiAccount.schoolCode || '',
        phone: dhoiAccount.phone,
      };
      setCurrentUser(user);
      localStorage.setItem('zaroda_current_user', JSON.stringify(user));
      activityStorage.add({
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        role: 'dhoi',
        action: 'login',
      });
      return { success: true };
    }

    return { success: false, error: 'This role is not yet available. Contact your administrator to get your account.' };
  };

  const signup = (data: TeacherSignupData): { success: boolean; error?: string } => {
    const normalizedEmail = data.email.trim().toLowerCase();
    const users = getStoredUsers();
    const existing = users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return { success: false, error: 'An account with this email already exists. Please log in instead.' };
    }

    const newUser: AuthUser = {
      id: `teacher-${Date.now()}`,
      email: normalizedEmail,
      fullName: data.fullName.trim(),
      role: 'teacher',
      schoolCode: data.schoolCode.trim(),
      subject: data.subject.trim(),
      phone: data.phone.trim(),
      grade: data.grade,
    };

    saveUser(newUser, data.password);
    setCurrentUser(newUser);
    localStorage.setItem('zaroda_current_user', JSON.stringify(newUser));

    const schoolName = data.schoolCode.trim();
    platformUsersStorage.add({
      email: normalizedEmail,
      fullName: data.fullName.trim(),
      role: 'teacher',
      schoolCode: data.schoolCode.trim(),
      schoolName,
      phone: data.phone.trim(),
      status: 'active',
      subject: data.subject.trim(),
      grade: data.grade,
      createdBy: 'Self-registered',
    });
    activityStorage.add({
      userId: newUser.id,
      email: normalizedEmail,
      fullName: data.fullName.trim(),
      role: 'teacher',
      action: 'account_created',
      details: 'Teacher self-registered',
    });
    return { success: true };
  };

  const logout = () => {
    if (currentUser) {
      activityStorage.add({
        userId: currentUser.id,
        email: currentUser.email,
        fullName: currentUser.fullName,
        role: currentUser.role,
        action: 'logout',
      });
    }
    setCurrentUser(null);
    localStorage.removeItem('zaroda_current_user');
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
