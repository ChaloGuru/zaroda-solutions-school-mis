import { motion } from "framer-motion";
import { School, Users, GraduationCap, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  {
    label: "Total Schools",
    value: "24",
    change: "+3",
    trend: "up",
    icon: School,
    color: "primary",
  },
  {
    label: "Total Students",
    value: "12,847",
    change: "+847",
    trend: "up",
    icon: Users,
    color: "accent",
  },
  {
    label: "Faculty Members",
    value: "892",
    change: "+23",
    trend: "up",
    icon: GraduationCap,
    color: "primary",
  },
  {
    label: "Monthly Revenue",
    value: "KES 4.2M",
    change: "-2.1%",
    trend: "down",
    icon: TrendingUp,
    color: "accent",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function StatsCards() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          variants={item}
          className="stat-card group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
              stat.color === "primary" 
                ? "bg-primary/10" 
                : "bg-accent/10"
            )}>
              <stat.icon className={cn(
                "w-6 h-6",
                stat.color === "primary" ? "text-primary" : "text-accent"
              )} />
            </div>
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium",
              stat.trend === "up" 
                ? "bg-emerald-500/10 text-emerald-600" 
                : "bg-red-500/10 text-red-600"
            )}>
              {stat.trend === "up" ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {stat.change}
            </div>
          </div>
          
          <div>
            <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
