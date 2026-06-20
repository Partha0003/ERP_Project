import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const COLORS = ['#198754', '#dc3545', '#ffc107', '#6c757d', '#0dcaf0'];

interface AttendanceBarChartProps {
  data: { name: string; value: number }[];
  title?: string;
}

export function AttendanceBarChart({ data, title }: AttendanceBarChartProps) {
  if (data.every((d) => d.value === 0)) {
    return <div className="text-muted text-center py-4">No attendance data available</div>;
  }

  return (
    <div>
      {title && <h6 className="fw-semibold mb-3">{title}</h6>}
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface AttendancePieChartProps {
  data: { name: string; value: number }[];
  title?: string;
}

export function AttendancePieChart({ data, title }: AttendancePieChartProps) {
  const filtered = data.filter((d) => d.value > 0);
  if (filtered.length === 0) {
    return <div className="text-muted text-center py-4">No attendance data available</div>;
  }

  return (
    <div>
      {title && <h6 className="fw-semibold mb-3">{title}</h6>}
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={filtered}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label={({ name, value }) => `${name}: ${value}`}
          >
            {filtered.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

interface PayrollBarChartProps {
  data: { name: string; value: number }[];
  title?: string;
}

export function PayrollBarChart({ data, title }: PayrollBarChartProps) {
  if (data.length === 0) {
    return <div className="text-muted text-center py-4">No payroll data available</div>;
  }

  return (
    <div>
      {title && <h6 className="fw-semibold mb-3">{title}</h6>}
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#0d6efd" name="Count" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function weeklyToChartData(
  dailyStatus: Record<string, Record<string, number>> | undefined
): { name: string; Present: number; Absent: number; Leave: number }[] {
  if (!dailyStatus) return [];
  return Object.entries(dailyStatus).map(([date, statuses]) => ({
    name: date.slice(5),
    Present: statuses.PRESENT ?? statuses.present ?? 0,
    Absent: statuses.ABSENT ?? statuses.absent ?? 0,
    Leave: statuses.LEAVE ?? statuses.leave ?? 0,
  }));
}

interface WeeklyTrendChartProps {
  data: { name: string; Present: number; Absent: number; Leave: number }[];
}

export function WeeklyTrendChart({ data }: WeeklyTrendChartProps) {
  if (data.length === 0) {
    return <div className="text-muted text-center py-4">No weekly trend data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="Present" stackId="a" fill="#198754" />
        <Bar dataKey="Absent" stackId="a" fill="#dc3545" />
        <Bar dataKey="Leave" stackId="a" fill="#ffc107" />
      </BarChart>
    </ResponsiveContainer>
  );
}
