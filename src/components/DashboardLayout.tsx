import { useState, useEffect, useRef, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Menu,
  Search,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import zarodaLogo from '@/assets/zaroda-logo.png';

export interface MenuGroup {
  label: string;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface DashboardLayoutProps {
  portalName: string;
  roleLabel: string;
  menuGroups: MenuGroup[];
  activeSection: string;
  onSectionChange: (id: string) => void;
  children: ReactNode;
}

export default function DashboardLayout({
  portalName,
  roleLabel,
  menuGroups,
  activeSection,
  onSectionChange,
  children,
}: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { currentUser, logout } = useAuthContext();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const handleItemClick = (id: string) => {
    onSectionChange(id);
    setMobileOpen(false);
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  };

  const activeLabel = menuGroups
    .flatMap((g) => g.items)
    .find((m) => m.id === activeSection)?.label || 'Dashboard';

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [activeSection]);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-accent/90 border border-sidebar-border/60 flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img src={zarodaLogo} alt="Zaroda" className="h-8 w-8 object-contain" />
          </div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <h1 className="font-bold text-sm text-sidebar-foreground whitespace-nowrap">{portalName}</h1>
                <p className="text-[11px] text-sidebar-foreground/60 whitespace-nowrap">Portal</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <nav className="flex-1 px-3 overflow-y-auto pb-4">
        {menuGroups.map((group) => (
          <div key={group.label} className="mb-2">
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] uppercase tracking-widest font-semibold px-3 pt-4 pb-2 text-sidebar-primary"
                >
                  {group.label}
                </motion.p>
              )}
            </AnimatePresence>
            {group.items.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'sidebar-item w-full relative',
                    collapsed && 'justify-center px-2',
                    isActive && 'sidebar-item-active'
                  )}
                >
                  <item.icon className={cn('w-[18px] h-[18px] flex-shrink-0', isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/65')} />
                  <AnimatePresence mode="wait">
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        className="whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId={`${portalName}-active`}
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-r-full bg-sidebar-primary"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="px-3 pb-3 mt-auto border-t border-sidebar-border/60 pt-3">
        <button
          onClick={handleSignOut}
          className={cn(
            'sidebar-item w-full text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/80',
            collapsed && 'justify-center px-2'
          )}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      <div className="px-3 pb-3 hidden lg:block">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-sidebar-accent/80 border border-sidebar-border/70 hover:bg-sidebar-accent transition-colors text-sidebar-foreground/70 hover:text-sidebar-foreground"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-muted/40 overflow-hidden">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 250 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="hidden lg:flex fixed left-0 top-0 h-screen bg-sidebar z-50 flex-col shadow-elevated border-r border-sidebar-border/60"
      >
        {sidebarContent}
      </motion.aside>

      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-[250px] bg-sidebar z-50 flex flex-col shadow-elevated border-r border-sidebar-border/60 transform transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 text-sidebar-foreground/60 hover:text-sidebar-foreground z-10"
        >
          <X className="w-5 h-5" />
        </button>
        {sidebarContent}
      </aside>

      <div className={cn('flex-1 flex flex-col overflow-hidden transition-all duration-300', collapsed ? 'lg:ml-[72px]' : 'lg:ml-[250px]')}>
        <header className="h-16 bg-background/95 backdrop-blur border-b border-border/70 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <div className="hidden md:flex flex-col">
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Current Section</span>
              <span className="text-sm font-semibold text-foreground">{activeLabel}</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              {searchOpen ? (
                <div className="flex items-center gap-2 bg-muted rounded-lg border border-border/60 px-3 py-1.5">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    className="border-0 bg-transparent h-7 text-sm focus-visible:ring-0 w-48"
                    autoFocus
                    onBlur={() => setSearchOpen(false)}
                  />
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground bg-muted rounded-lg border border-border/60 px-3 py-1.5 text-sm transition-colors"
                >
                  <Search className="w-4 h-4" />
                  <span>Search...</span>
                  <kbd className="hidden md:inline text-[10px] bg-background rounded px-1.5 py-0.5 font-mono text-muted-foreground border border-border/70">Ctrl+K</kbd>
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-border/60">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />
            </button>
            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-border/70">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                {currentUser?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">{currentUser?.fullName}</span>
                <span className="text-[11px] text-muted-foreground">{roleLabel}</span>
              </div>
            </div>
          </div>
        </header>

        <main ref={mainContentRef} className="flex-1 overflow-auto bg-muted/30">
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
