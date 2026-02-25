import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  School,
  Users,
  GraduationCap,
  DollarSign,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import zarodaLogo from '@/assets/zaroda-logo.png';

export const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: UserCog, label: "User Management", id: "users" },
  { icon: School, label: "Schools", id: "schools" },
  { icon: Users, label: "Student Registry", id: "students" },
  { icon: GraduationCap, label: "Staff Establishment", id: "staffEstablishment" },
  { icon: DollarSign, label: "Finance", id: "finance" },
  { icon: Settings, label: "Settings", id: "settings" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeItem?: string;
  onItemClick?: (id: string) => void;
  onSignOut?: () => void;
}

export function Sidebar({ collapsed, onToggle, activeItem = "dashboard", onItemClick, onSignOut }: SidebarProps) {
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 h-screen bg-sidebar z-50 flex flex-col shadow-elevated border-r border-sidebar-border/60"
    >
      <div className="h-20 flex items-center justify-between px-4 border-b border-sidebar-border">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-sidebar-accent/90 border border-sidebar-border/60 flex items-center justify-center overflow-hidden">
                <img src={zarodaLogo} alt="Zaroda" className="h-8 w-8 object-contain" />
              </div>
              <div>
                <h1 className="font-bold text-xs tracking-wide text-sidebar-foreground">ZARODA SOLUTIONS</h1>
                <p className="text-sidebar-foreground/60 text-xs">SuperAdmin</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {collapsed && (
          <div className="w-10 h-10 rounded-xl bg-sidebar-accent/90 border border-sidebar-border/60 flex items-center justify-center mx-auto overflow-hidden">
            <img src={zarodaLogo} alt="Z" className="h-8 w-8 object-contain" />
          </div>
        )}
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick?.(item.id)}
            className={cn(
              "sidebar-item w-full group relative",
              activeItem === item.id && "sidebar-item-active"
            )}
          >
            <item.icon 
              className={cn(
                "w-5 h-5 transition-colors flex-shrink-0",
                activeItem === item.id ? "text-sidebar-primary" : "text-sidebar-foreground/65"
              )} 
            />
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="font-medium text-sm whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
            
            {activeItem === item.id && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-sidebar-primary rounded-r-full"
                transition={{ duration: 0.2 }}
              />
            )}
          </button>
        ))}
      </nav>

      <div className="px-3 pb-2">
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="sidebar-item w-full group text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/80"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="font-medium text-sm whitespace-nowrap"
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        )}
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-sidebar-accent/80 border border-sidebar-border/70 hover:bg-sidebar-accent transition-colors text-sidebar-foreground/80 hover:text-sidebar-foreground"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
