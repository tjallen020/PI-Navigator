import { Link, NavLink } from 'react-router-dom';
import { LanguageToggle } from './LanguageToggle';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-semibold text-primary">
            QI Tool Selector
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `rounded px-3 py-2 ${isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:text-primary'}`
              }
            >
              Fast Track
            </NavLink>
            <NavLink
              to="/decision-tree"
              className={({ isActive }) =>
                `rounded px-3 py-2 ${isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:text-primary'}`
              }
            >
              QI Pathfinding
            </NavLink>
            <NavLink
              to="/guided"
              className={({ isActive }) =>
                `rounded px-3 py-2 ${isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:text-primary'}`
              }
            >
              Guided Path
            </NavLink>
            <NavLink
              to="/facilitator"
              className={({ isActive }) =>
                `rounded px-3 py-2 ${isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:text-primary'}`
              }
            >
              Facilitator Mode
            </NavLink>
            <LanguageToggle />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
};
