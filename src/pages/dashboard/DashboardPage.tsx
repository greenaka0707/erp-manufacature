export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border p-4">Purchasing</div>

        <div className="rounded-lg border p-4">Inventory</div>

        <div className="rounded-lg border p-4">Production</div>

        <div className="rounded-lg border p-4">Sales</div>
      </div>
    </div>
  );
}
