import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Lock,
  Palette,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DhoiSettingsProps {
  onSignOut: () => void;
}

export default function DhoiSettings({ onSignOut }: DhoiSettingsProps) {
  const { toast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const handlePasswordChange = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: 'Validation Error', description: 'All password fields are required', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: 'Validation Error', description: 'New password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Validation Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }

    try {
      const currentUserStr = localStorage.getItem('zaroda_current_user');
      if (!currentUserStr) {
        toast({ title: 'Error', description: 'No user session found', variant: 'destructive' });
        return;
      }
      const currentUser = JSON.parse(currentUserStr);
      const email = currentUser.email?.toLowerCase();

      const passwords: Record<string, string> = JSON.parse(localStorage.getItem('zaroda_passwords') || '{}');
      if (passwords[email] !== currentPassword) {
        toast({ title: 'Error', description: 'Current password is incorrect', variant: 'destructive' });
        return;
      }

      passwords[email] = newPassword;
      localStorage.setItem('zaroda_passwords', JSON.stringify(passwords));

      const dhoiAccountsStr = localStorage.getItem('zaroda_dhoi_account');
      if (dhoiAccountsStr) {
        const dhoiAccounts = JSON.parse(dhoiAccountsStr);
        if (Array.isArray(dhoiAccounts)) {
          const idx = dhoiAccounts.findIndex((a: any) => a.email?.toLowerCase() === email);
          if (idx !== -1) {
            dhoiAccounts[idx] = { ...dhoiAccounts[idx], password: newPassword };
            localStorage.setItem('zaroda_dhoi_account', JSON.stringify(dhoiAccounts));
          }
        } else if (dhoiAccounts?.email?.toLowerCase() === email) {
          localStorage.setItem('zaroda_dhoi_account', JSON.stringify({ ...dhoiAccounts, password: newPassword }));
        }
      }

      toast({ title: 'Password Changed', description: 'Your password has been updated successfully' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast({ title: 'Error', description: 'Failed to update password', variant: 'destructive' });
    }
  };

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    toast({ title: 'Theme Changed', description: `Switched to ${newDark ? 'dark' : 'light'} mode` });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-1">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your DHOI account password</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Current Password</Label>
              <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
            </div>
            <div>
              <Label>New Password</Label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            <div>
              <Label>Confirm New Password</Label>
              <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
            <Button onClick={handlePasswordChange}>Update Password</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                <div>
                  <p className="font-medium">{isDark ? 'Dark Mode' : 'Light Mode'}</p>
                  <p className="text-sm text-muted-foreground">Toggle between light and dark themes</p>
                </div>
              </div>
              <Switch checked={isDark} onCheckedChange={toggleTheme} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <LogOut className="w-5 h-5 text-red-500" />
              <div>
                <CardTitle>Sign Out</CardTitle>
                <CardDescription>Log out of your account</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You will be signed out of your current session and redirected to the login page.
            </p>
            <Button variant="destructive" onClick={onSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
