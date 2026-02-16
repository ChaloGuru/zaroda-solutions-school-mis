import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Construction } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import zarodaLogo from '@/assets/zaroda-logo.png';

const HoiDashboard = () => {
  const { currentUser, logout } = useAuthContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container-max section-padding !py-0">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <img src={zarodaLogo} alt="Zaroda Solutions" className="h-12 w-auto" />
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {currentUser?.fullName || 'HOI'}
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut size={16} className="mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="container-max section-padding flex flex-col items-center justify-center min-h-[60vh]">
        <Construction size={64} className="text-primary mb-6" />
        <h1 className="text-3xl font-bold mb-2">HOI Dashboard</h1>
        <p className="text-muted-foreground text-center max-w-md">
          This dashboard is under construction. Features for Head of Institution will be available soon.
        </p>
      </main>
    </div>
  );
};

export default HoiDashboard;
