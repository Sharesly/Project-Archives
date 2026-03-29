import { Database, AlertTriangle, PieChart, TrendingUp, BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Metrics, Project } from '../types';
import { APP_CONFIG } from '../config';
import { useToast } from '../components/Toast';

interface PortfolioViewProps {
  onProjectClick: (id: string) => void;
  refreshTrigger?: number;
  searchQuery?: string;
}

export default function PortfolioView({ onProjectClick, refreshTrigger, searchQuery = '' }: PortfolioViewProps) {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsData, projectsData] = await Promise.all([
          api.getMetrics(),
          api.getProjects()
        ]);
        setMetrics(metricsData);
        setProjects(projectsData);
      } catch (error) {
        showToast('Failed to load portfolio data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshTrigger]);

  if (loading || !metrics) return <div className="p-10">Loading portfolio data...</div>;

  const filteredProjects = searchQuery
    ? projects.filter(p => {
        const q = searchQuery.toLowerCase();
        return p.title.toLowerCase().includes(q) || p.owner.name.toLowerCase().includes(q) || p.department.toLowerCase().includes(q);
      })
    : projects;

  const handleExport = () => {
    const csvHeader = 'Title,Status,Priority,Owner,Department,Progress,Risk Factor,Health Score\n';
    const csvRows = projects.map(p =>
      `"${p.title}","${p.status}","${p.priority}","${p.owner.name}","${p.department}",${p.progress},"${p.riskFactor}",${p.healthScore}`
    ).join('\n');
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${APP_CONFIG.appName.toLowerCase().replace(/\s+/g, '-')}-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Report exported as CSV', 'success');
  };

  return (
    <div className="p-10 space-y-10 max-w-7xl mx-auto">
      <section>
        <div className="flex items-end justify-between mb-6">
          <div className="space-y-1">
            <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Portfolio Overview</h2>
            <p className="text-on-surface-variant text-sm">Analytics across all active {APP_CONFIG.departmentLabel.toLowerCase()}s.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-surface-container-lowest text-primary text-xs font-bold rounded border border-outline-variant/20 hover:bg-surface-container-low transition-colors"
            >
              Export Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-3 bg-surface-container-lowest p-6 rounded shadow-sm border border-outline-variant/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold tracking-widest uppercase text-on-secondary-container">Total {APP_CONFIG.projectLabelPlural}</span>
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div className="text-4xl font-headline font-black text-primary">{metrics.totalRecords}</div>
            <div className="mt-2 text-xs font-medium text-on-tertiary-container flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Portfolio summary
            </div>
          </div>

          <div className="col-span-12 md:col-span-3 bg-surface-container-lowest p-6 rounded shadow-sm border border-outline-variant/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold tracking-widest uppercase text-on-secondary-container">Risk Level</span>
              <AlertTriangle className="w-5 h-5 text-error" />
            </div>
            <div className="text-4xl font-headline font-black text-on-surface">{metrics.riskLevel}</div>
            <div className="mt-2 text-xs font-medium text-on-surface-variant">Overall portfolio risk</div>
          </div>

          <div className="col-span-12 md:col-span-6 bg-surface-container-lowest p-6 rounded shadow-sm border border-outline-variant/10 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold tracking-widest uppercase text-on-secondary-container">{APP_CONFIG.projectLabelPlural} by Status</span>
              <PieChart className="w-5 h-5 text-on-surface-variant" />
            </div>
            <div className="flex items-center gap-8">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-surface-container-low" cx="64" cy="64" fill="transparent" r="50" stroke="currentColor" strokeWidth="20"></circle>
                  <circle className="text-primary" cx="64" cy="64" fill="transparent" r="50" stroke="currentColor" strokeDasharray="314" strokeDashoffset="100" strokeWidth="20"></circle>
                  <circle className="text-tertiary-fixed-dim" cx="64" cy="64" fill="transparent" r="50" stroke="currentColor" strokeDasharray="314" strokeDashoffset="250" strokeWidth="20"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black font-headline">{metrics.activeProjects}</span>
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant">Active</span>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                {Object.entries(metrics.projectsByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span className="text-xs font-medium">{status}</span>
                    </div>
                    <span className="text-xs font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Metric Summary</h2>
          <p className="text-on-surface-variant text-sm">Detailed performance and risk evaluation per {APP_CONFIG.projectLabel.toLowerCase()}.</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="p-4 text-xs font-bold text-on-secondary-container uppercase tracking-widest">{APP_CONFIG.projectLabel} Name</th>
                <th className="p-4 text-xs font-bold text-on-secondary-container uppercase tracking-widest">Risk Factor</th>
                <th className="p-4 text-xs font-bold text-on-secondary-container uppercase tracking-widest">Completion</th>
                <th className="p-4 text-xs font-bold text-on-secondary-container uppercase tracking-widest text-right">{APP_CONFIG.healthScoreLabel}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {filteredProjects.map(project => (
                <tr key={project.id} onClick={() => onProjectClick(project.id)} className="hover:bg-surface-container-low transition-colors cursor-pointer">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-on-surface leading-none">{project.title}</div>
                        <div className="text-[10px] text-on-surface-variant">{APP_CONFIG.ownerLabel}: {project.owner.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                      project.riskFactor === 'High' ? 'bg-error-container text-error' :
                      project.riskFactor === 'Medium' ? 'bg-tertiary-container text-tertiary-fixed' :
                      'bg-surface-container-high text-on-secondary-container'
                    }`}>
                      {project.riskFactor}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="w-32 h-1 bg-surface-container-high rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: `${project.progress}%` }}></div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-sm font-black text-on-surface">{project.healthScore?.toFixed(1) ?? '—'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
