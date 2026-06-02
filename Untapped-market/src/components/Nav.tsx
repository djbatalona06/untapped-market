import { NavLink, Link } from 'react-router-dom';
import { useUser } from '@/store';

const links = [
  { to: '/explore', label: 'Explore' },
  { to: '/catalog', label: 'Strains' },
  { to: '/finder', label: 'Finder' },
  { to: '/library', label: 'Library' },
  { to: '/premium', label: 'Premium', premium: true },
];

export default function Nav() {
  const user = useUser();
  const displayName = user?.username ?? 'Guest';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <nav className="nav" aria-label="Primary">
      <Link to="/" className="nav-logo" aria-label="Untapped Market home">
        Untapped <span className="nav-logo-mark">Market.</span>
      </Link>
      <div className="nav-links">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `nav-link${l.premium ? ' premium' : ''}${isActive ? ' active' : ''}`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </div>
      <div className="nav-avatar" aria-label={`Signed in as ${displayName}`}>
        {initial}
      </div>
    </nav>
  );
}
