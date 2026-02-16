import { useState } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: School, label: "Schools", active: false },
  { icon: Users, label: "Student Registry", active: false },
  { icon: GraduationCap, label: "Faculty", active: false },
  { icon: DollarSign, label: "Finance", active: false },
  { icon: Settings, label: "Settings", active: false },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [activeItem, setActiveItem] = useState("Dashboard");

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 h-screen bg-sidebar z-50 flex flex-col shadow-elevated"
    >
      {/* Logo Section */}
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
              <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
                <span className="text-sidebar-primary-foreground font-bold text-lg">Z</span>
              </div>
              <div>
                <h1 className="text-sidebar-foreground font-semibold text-lg">Zaroda</h1>
                <p className="text-sidebar-foreground/60 text-xs">Solutions</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {collapsed && (
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center mx-auto">
            <span className="text-sidebar-primary-foreground font-bold text-lg">Z</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setActiveItem(item.label)}
            className={cn(
              "sidebar-item w-full group relative",
              activeItem === item.label && "sidebar-item-active"
            )}
          >
            <item.icon 
              className={cn(
                "w-5 h-5 transition-colors flex-shrink-0",
                activeItem === item.label ? "text-sidebar-primary" : "text-sidebar-foreground/70"
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
            
            {/* Active indicator */}
            {activeItem === item.label && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-sidebar-primary rounded-r-full"
                transition={{ duration: 0.2 }}
              />
            )}
          </button>
        ))}
      </nav>

      {/* Collapse Button */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-sidebar-accent/50 hover:bg-sidebar-accent transition-colors text-sidebar-foreground/80 hover:text-sidebar-foreground"
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
