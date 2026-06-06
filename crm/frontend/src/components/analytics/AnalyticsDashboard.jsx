import React, { useState, useEffect } from 'react';
import { getStats } from '../../utils/api';
import { useSheet } from '../../context/SheetContext';
import { STATUS_CONFIG, STATUSES } from '../../utils/status';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { TrendingUp, Users, CheckCircle, XCircle, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, sub, accent }) => (
  <div className="card p-4 flex flex-col justify-between">
    <div className="flex items-start justify-between">
      <div>
        <div className="text-xs font-medium text-zinc-500">{label}</div>
        <div className="text-2xl font-semibold text-zinc-100 tracking-tight mt-1.5">{value}</div>
      </div>
      <div className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>
        <Icon size={15} />
      </div>
    </div>
    {sub && <div className="text-[10px] text-zinc-550 mt-2 font-medium">{sub}</div>}
  </div>
);

const SkeletonCard = () => (
  <div className="card p-4 space-y-2">
    <div className="skeleton h-3 w-16 rounded" />
    <div className="skeleton h-6 w-12 rounded mt-1.5" />
  </div>
);

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const { name, value } = payload[0];
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs shadow-xl">
        <div className="font-semibold text-zinc-200">{name}</div>
        <div className="text-zinc-500 mt-0.5">{value} leads</div>
      </div>
    );
  }
  return null;
};

export default function AnalyticsDashboard() {
  const { activeSheet } = useSheet();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeSheet) return;
    setLoading(true);
    getStats(activeSheet._id)
      .then(({ data }) => setStats(data.stats))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, [activeSheet]);

  if (!activeSheet) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-zinc-650 text-sm">Select a workspace to view analytics</div>
      </div>
    );
  }

  const chartData = stats?.statusBreakdown?.map((item) => ({
    name: item.status,
    value: item.count,
    fill: STATUS_CONFIG[item.status]?.color || '#71717a',
  })) || [];

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
      <div>
        <h1 className="text-sm font-semibold text-zinc-100">{activeSheet.sheetName}</h1>
        <p className="text-xs text-zinc-600 mt-0.5">Analytics dashboard</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              icon={Users}
              label="Total leads"
              value={stats?.total ?? 0}
              accent="bg-zinc-800/40 text-zinc-400 border border-zinc-700/20"
            />
            <StatCard
              icon={Activity}
              label="Active leads"
              value={stats?.active ?? 0}
              sub="New + Contacted + Qualified"
              accent="bg-sky-950/40 text-sky-400 border border-sky-900/20"
            />
            <StatCard
              icon={CheckCircle}
              label="Converted"
              value={stats?.converted ?? 0}
              sub={`${stats?.conversionRate ?? 0}% conversion rate`}
              accent="bg-indigo-950/40 text-indigo-400 border border-indigo-900/20"
            />
            <StatCard
              icon={XCircle}
              label="Lost"
              value={stats?.lost ?? 0}
              accent="bg-zinc-900/40 text-zinc-650 border border-zinc-800"
            />
          </>
        )}
      </div>

      {!loading && stats && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-zinc-450">Conversion rate</span>
            <span className="text-sm font-bold text-indigo-400">{stats.conversionRate}%</span>
          </div>
          <div className="w-full bg-zinc-900 border border-zinc-850 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-indigo-550 to-violet-550 h-1.5 rounded-full transition-all duration-700 m-[1px]"
              style={{ width: `${Math.min(100, stats.conversionRate)}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-600 mt-2.5 font-medium">
            {stats.converted} of {stats.total} leads converted
          </p>
        </div>
      )}

      {!loading && chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="text-xs font-semibold text-zinc-550 mb-5 uppercase tracking-wider">Distribution</h3>
            <div className="flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={88}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} opacity={0.9} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 justify-center">
                {chartData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5 text-[11px] text-zinc-550 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 border border-zinc-900" style={{ background: item.fill }} />
                    {item.name} ({item.value})
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-xs font-semibold text-zinc-550 mb-5 uppercase tracking-wider">By status</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  width={20}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.015)' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} opacity={0.9} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {!loading && chartData.length === 0 && (
        <div className="card p-12 text-center">
          <TrendingUp size={24} className="text-zinc-750 mx-auto mb-3" />
          <p className="text-zinc-550 text-sm">No lead data yet</p>
          <p className="text-zinc-750 text-xs mt-1.5">Add leads to see analytics</p>
        </div>
      )}
    </div>
  );
}
