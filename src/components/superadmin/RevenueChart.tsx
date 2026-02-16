import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  { month: "Jan", revenue: 2400000, expenses: 1800000 },
  { month: "Feb", revenue: 2800000, expenses: 2000000 },
  { month: "Mar", revenue: 3200000, expenses: 2200000 },
  { month: "Apr", revenue: 2900000, expenses: 2100000 },
  { month: "May", revenue: 3500000, expenses: 2400000 },
  { month: "Jun", revenue: 3800000, expenses: 2600000 },
  { month: "Jul", revenue: 4100000, expenses: 2800000 },
  { month: "Aug", revenue: 4200000, expenses: 2900000 },
];

const formatValue = (value: number) => {
  if (value >= 1000000) {
    return `KES ${(value / 1000000).toFixed(1)}M`;
  }
  return `KES ${(value / 1000).toFixed(0)}K`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card-elevated rounded-xl px-4 py-3 border border-border/50">
        <p className="text-sm font-semibold text-foreground mb-2">{label} 2024</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground capitalize">{entry.name}:</span>
            <span className="font-medium text-foreground">{formatValue(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function RevenueChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card rounded-2xl p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Revenue vs Expenses</h3>
        <p className="text-sm text-muted-foreground mt-0.5">Monthly financial overview across all schools</p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 100%, 27%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(0, 100%, 27%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(43, 66%, 52%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(43, 66%, 52%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(30, 15%, 88%)" 
              vertical={false}
            />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(220, 10%, 45%)', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(220, 10%, 45%)', fontSize: 12 }}
              tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              align="right"
              height={36}
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-sm text-muted-foreground capitalize">{value}</span>
              )}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(0, 100%, 27%)"
              strokeWidth={2.5}
              fill="url(#revenueGradient)"
              name="revenue"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="hsl(43, 66%, 52%)"
              strokeWidth={2.5}
              fill="url(#expenseGradient)"
              name="expenses"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
