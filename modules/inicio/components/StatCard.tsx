import { Card } from '@/components/ui/Card';

interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
}

export function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <Card className="stat-card">
      <span className="stat-icon">{icon}</span>
      <span className="stat-val">{value}</span>
      <span className="stat-label">{label}</span>
    </Card>
  );
}