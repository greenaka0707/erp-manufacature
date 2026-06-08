export default function AppNavbar() {
  return (
    <header className="relative z-[60] flex h-16 items-center justify-between border-b bg-white px-6">
      <h1 className="hidden md:block font-semibold">ERP Manufacture Kopi SaaS</h1>

      <h1 className="ml-12 block text-sm font-semibold md:hidden">ERP Kopi</h1>

      <div>Admin</div>
    </header>
  );
}
