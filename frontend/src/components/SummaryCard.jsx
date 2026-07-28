import { formatCurrency } from '../utils/finance';

export default function SummaryCard({ title, value, icon: Icon, subtitle, accent }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-5 transition-all hover:border-primary/20">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <p className={`text-2xl font-bold tracking-tight ${accent ? 'text-primary' : 'text-foreground'}`}>
            {formatCurrency(value)}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
      </div>
    </div>
  );
}