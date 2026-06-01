import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-800">
        <nav className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4">
          <Link to="/" className="font-semibold text-amber-400">
            Calibrate
          </Link>
          
          <Link to="/evaluate/new" className="text-sm text-gray-400 hover:text-white">
            Evaluate
          </Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
