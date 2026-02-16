import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export type UserRole = 'superadmin' | 'teacher' | 'hoi' | 'dhoi' | 'student' | 'parent';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  schoolCode: string;
  phone?: string;
  subject?: string;
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
        return { success: true };
      }
      return { success: false, error: 'Invalid school code, email, or password.' };
    }

    if (role === 'teacher') {
      const users = getStoredUsers();
      const found = users.find(u => u.email.toLowerCase() === normalizedEmail && u.role === 'teacher');
      if (!found) {
        return { success: false, error: 'No teacher account found with this email. Please sign up first.' };
      }
      const passwords = getStoredPasswords();
      if (passwords[normalizedEmail] !== password) {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }
      setCurrentUser(found);
      localStorage.setItem('zaroda_current_user', JSON.stringify(found));
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
    };

    saveUser(newUser, data.password);
    setCurrentUser(newUser);
    localStorage.setItem('zaroda_current_user', JSON.stringify(newUser));
    return { success: true };
  };

  const logout = () => {
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
