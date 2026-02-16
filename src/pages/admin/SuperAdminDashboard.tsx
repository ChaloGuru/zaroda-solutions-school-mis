import { useState } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/superadmin/Sidebar";
import { TopNav } from "@/components/superadmin/TopNav";
import { StatsCards } from "@/components/superadmin/StatsCards";
import { RevenueChart } from "@/components/superadmin/RevenueChart";
import { SchoolsTable } from "@/components/dashboard/SchoolsTable";

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />

      {/* Main Content */}
      <motion.div
        animate={{ marginLeft: sidebarCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="min-h-screen"
      >
        {/* Top Navigation */}
        <TopNav />

        {/* Dashboard Content */}
        <main className="p-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here's an overview of all your managed schools.
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="mb-8">
            <StatsCards />
          </div>

          {/* Charts and Table Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Revenue Chart - Takes 2 columns */}
            <div className="xl:col-span-2">
              <RevenueChart />
            </div>

            {/* Quick Actions Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="glass-card rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors text-sm">
                  Add New School
                </button>
                <button className="w-full py-3 px-4 rounded-xl bg-accent text-accent-foreground font-medium hover:bg-accent/90 transition-colors text-sm">
                  Register Students
                </button>
                <button className="w-full py-3 px-4 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors text-sm border border-border/50">
                  Generate Reports
                </button>
                <button className="w-full py-3 px-4 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors text-sm border border-border/50">
                  Manage Faculty
                </button>
              </div>

              {/* Recent Activity */}
              <div className="mt-8">
                <h4 className="text-sm font-semibold text-foreground mb-4">Recent Activity</h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2" />
                    <div>
                      <p className="text-sm text-foreground">New student enrolled</p>
                      <p className="text-xs text-muted-foreground">Greenwood Academy • 2h ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent mt-2" />
                    <div>
                      <p className="text-sm text-foreground">Payment received</p>
                      <p className="text-xs text-muted-foreground">Heritage High • 4h ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div>
                      <p className="text-sm text-foreground">New faculty added</p>
                      <p className="text-xs text-muted-foreground">Sunrise Primary • 6h ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Schools Table */}
          <div className="mt-8">
            <SchoolsTable />
          </div>
        </main>
      </motion.div>
    </div>
  );
};

export default Index;