import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, CreditCard, Shield, GraduationCap, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { settingsStorage, PlatformSettings } from '@/lib/storage';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' as const },
  }),
};

export default function SettingsSection() {
  const [settings, setSettings] = useState<PlatformSettings>(settingsStorage.get());
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setSettings(settingsStorage.get());
  }, []);

  const updateField = <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    settingsStorage.save(settings);
    toast({
      title: 'Settings saved',
      description: 'Platform settings have been updated successfully.',
    });
  };

  const handleReset = () => {
    const defaults: PlatformSettings = {
      platform_name: 'Zaroda Solutions',
      support_email: 'support@zaroda.io',
      support_phone: '+254 700 000 000',
      default_currency: 'KES',
      academic_year: '2024',
      term: 'Term 3',
      enable_notifications: true,
      enable_sms: true,
      enable_email: true,
      maintenance_mode: false,
      max_schools: 100,
      billing_cycle: 'termly',
    };
    settingsStorage.save(defaults);
    setSettings(defaults);
    setResetDialogOpen(false);
    toast({
      title: 'Settings reset',
      description: 'All settings have been restored to their default values.',
    });
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-foreground mb-2">System Settings</h1>
        <p className="text-muted-foreground">Configure platform-wide settings and preferences</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">General Settings</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform_name">Platform Name</Label>
              <Input
                id="platform_name"
                value={settings.platform_name}
                onChange={(e) => updateField('platform_name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support_email">Support Email</Label>
              <Input
                id="support_email"
                type="email"
                value={settings.support_email}
                onChange={(e) => updateField('support_email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support_phone">Support Phone</Label>
              <Input
                id="support_phone"
                value={settings.support_phone}
                onChange={(e) => updateField('support_phone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default_currency">Default Currency</Label>
              <Input
                id="default_currency"
                value={settings.default_currency}
                onChange={(e) => updateField('default_currency', e.target.value)}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Academic Configuration</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="academic_year">Academic Year</Label>
              <Input
                id="academic_year"
                value={settings.academic_year}
                onChange={(e) => updateField('academic_year', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Term</Label>
              <Select value={settings.term} onValueChange={(val) => updateField('term', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Term 1">Term 1</SelectItem>
                  <SelectItem value="Term 2">Term 2</SelectItem>
                  <SelectItem value="Term 3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_schools">Max Schools</Label>
              <Input
                id="max_schools"
                type="number"
                min={1}
                value={settings.max_schools}
                onChange={(e) => updateField('max_schools', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          custom={2}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
          </div>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Push Notifications</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Enable in-app push notifications</p>
              </div>
              <Switch
                checked={settings.enable_notifications}
                onCheckedChange={(val) => updateField('enable_notifications', val)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">SMS Notifications</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Send SMS alerts to users</p>
              </div>
              <Switch
                checked={settings.enable_sms}
                onCheckedChange={(val) => updateField('enable_sms', val)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Email Notifications</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Send email alerts and digests</p>
              </div>
              <Switch
                checked={settings.enable_email}
                onCheckedChange={(val) => updateField('enable_email', val)}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          custom={3}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-violet-600" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Billing</h2>
          </div>
          <div className="space-y-2">
            <Label>Billing Cycle</Label>
            <Select
              value={settings.billing_cycle}
              onValueChange={(val) => updateField('billing_cycle', val as PlatformSettings['billing_cycle'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select billing cycle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="termly">Termly</SelectItem>
                <SelectItem value="annually">Annually</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        <motion.div
          custom={4}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className={cn(
            'glass-card rounded-2xl p-6 lg:col-span-2',
            settings.maintenance_mode && 'border-2 border-yellow-500/50'
          )}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              settings.maintenance_mode ? 'bg-yellow-500/20' : 'bg-red-500/10'
            )}>
              <Shield className={cn(
                'w-5 h-5',
                settings.maintenance_mode ? 'text-yellow-600' : 'text-red-600'
              )} />
            </div>
            <h2 className="text-lg font-semibold text-foreground">System</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Maintenance Mode</Label>
              <p className={cn(
                'text-xs mt-0.5',
                settings.maintenance_mode ? 'text-yellow-600 font-medium' : 'text-muted-foreground'
              )}>
                {settings.maintenance_mode
                  ? 'Platform is currently in maintenance mode. Users cannot access the system.'
                  : 'Enable to put the platform into maintenance mode'}
              </p>
            </div>
            <Switch
              checked={settings.maintenance_mode}
              onCheckedChange={(val) => updateField('maintenance_mode', val)}
            />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-end gap-3 pt-4"
      >
        <Button variant="outline" onClick={() => setResetDialogOpen(true)}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset to Defaults
        </Button>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </motion.div>

      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset to Defaults?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all platform settings to their default values. Any custom configuration will be lost. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="bg-red-600 hover:bg-red-700">
              Reset Settings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
