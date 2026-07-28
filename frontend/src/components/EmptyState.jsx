export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-foreground font-semibold text-lg mb-1">{title}</h3>
      <p className="text-muted-foreground text-sm text-center max-w-sm">{description}</p>
    </div>
  );
}