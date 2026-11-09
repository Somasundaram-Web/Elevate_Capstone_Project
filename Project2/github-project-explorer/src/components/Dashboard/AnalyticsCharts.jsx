import { useMemo } from 'react';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { formatNumber } from '../../utils/formatters';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const PALETTE = [
  '#6366f1',
  '#f59e0b',
  '#10b981',
  '#ef4444',
  '#06b6d4',
  '#8b5cf6',
  '#ec4899',
  '#84cc16',
  '#94a3b8',
];

function ChartCard({ title, children }) {
  return (
    <div className="card p-4">
      <h3 className="mb-3 font-semibold text-slate-800">{title}</h3>
      <div className="h-72">{children}</div>
    </div>
  );
}

/** Language distribution, top repositories by stars, top repositories by forks. */
export default function AnalyticsCharts({ repos }) {
  const languages = useMemo(() => {
    const counts = {};
    repos.forEach((r) => {
      const key = r.language || 'Unknown';
      counts[key] = (counts[key] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 8);
    const rest = sorted.slice(8).reduce((sum, [, n]) => sum + n, 0);
    if (rest > 0) top.push(['Other', rest]);
    return top;
  }, [repos]);

  const byStars = useMemo(() => [...repos].sort((a, b) => b.stars - a.stars).slice(0, 10), [repos]);
  const byForks = useMemo(() => [...repos].sort((a, b) => b.forks - a.forks).slice(0, 10), [repos]);

  const doughnutData = {
    labels: languages.map(([name]) => name),
    datasets: [
      {
        data: languages.map(([, n]) => n),
        backgroundColor: languages.map((_, i) => PALETTE[i % PALETTE.length]),
        borderWidth: 1,
      },
    ],
  };

  const horizontalBar = (items, key, label, color) => ({
    data: {
      labels: items.map((r) => r.name),
      datasets: [{ label, data: items.map((r) => r[key]), backgroundColor: color, borderRadius: 4 }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true, ticks: { callback: (v) => formatNumber(v) } } },
    },
  });

  const stars = horizontalBar(byStars, 'stars', 'Stars', '#6366f1');
  const forks = horizontalBar(byForks, 'forks', 'Forks', '#f59e0b');

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <ChartCard title="Languages">
        <Doughnut
          data={doughnutData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
          }}
        />
      </ChartCard>
      <ChartCard title="Top 10 by stars">
        <Bar data={stars.data} options={stars.options} />
      </ChartCard>
      <ChartCard title="Top 10 by forks">
        <Bar data={forks.data} options={forks.options} />
      </ChartCard>
    </div>
  );
}
