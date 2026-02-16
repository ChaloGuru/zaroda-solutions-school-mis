import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ChevronDown, Search, User, School } from "lucide-react";
import { cn } from "@/lib/utils";

const schools = [
  { id: 1, name: "Greenwood Academy", location: "Nairobi" },
  { id: 2, name: "Sunrise Primary School", location: "Mombasa" },
  { id: 3, name: "Heritage High School", location: "Kisumu" },
  { id: 4, name: "Victory Christian School", location: "Nakuru" },
];

export function TopNav() {
  const [selectedSchool, setSelectedSchool] = useState(schools[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications] = useState(3);

  return (
    <header className="h-20 glass-card border-b border-border/50 flex items-center justify-between px-8 sticky top-0 z-40">
      {/* Left Section - Search */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search schools, students, faculty..."
            className="w-80 h-11 pl-11 pr-4 rounded-xl bg-secondary/50 border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Center Section - Tenant Switcher */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/50 transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <School className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">{selectedSchool.name}</p>
            <p className="text-xs text-muted-foreground">{selectedSchool.location}</p>
          </div>
          <ChevronDown className={cn(
            "w-4 h-4 text-muted-foreground transition-transform",
            showDropdown && "rotate-180"
          )} />
        </button>

        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full mt-2 left-0 w-72 glass-card-elevated rounded-xl border border-border/50 overflow-hidden z-50"
            >
              <div className="p-2">
                <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Switch School
                </p>
                {schools.map((school) => (
                  <button
                    key={school.id}
                    onClick={() => {
                      setSelectedSchool(school);
                      setShowDropdown(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                      selectedSchool.id === school.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-secondary text-foreground"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      selectedSchool.id === school.id ? "bg-primary/20" : "bg-muted"
                    )}>
                      <School className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{school.name}</p>
                      <p className="text-xs text-muted-foreground">{school.location}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative w-11 h-11 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/50 flex items-center justify-center transition-colors group">
          <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
              {notifications}
            </span>
          )}
        </button>

        {/* User Profile */}
        <button className="flex items-center gap-3 pl-4 pr-5 py-2 rounded-xl hover:bg-secondary/50 transition-colors group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Super Admin</p>
            <p className="text-xs text-muted-foreground">admin@zaroda.io</p>
          </div>
        </button>
      </div>
    </header>
  );
}
