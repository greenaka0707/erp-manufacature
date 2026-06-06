interface EmptyStateProps {
  title?: string;
  description?: string;
}

export default function EmptyState({ title = "No Data", description = "No records found." }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <h3 className="font-medium">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
