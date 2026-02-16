import { createContext, useContext, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
}

interface Profile {
  user_id: string;
  school_id: string;
  role: string;
}

interface School {
  id: string;
  name: string;
  county?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  school: School | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const value: AuthContextType = {
    user: null,
    profile: null,
    school: null,
    loading: false,
    signOut: async () => {
      // TODO: Connect to Replit backend
      console.log('signOut called - connect to Replit');
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
