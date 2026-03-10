import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const loc = useLocation();
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 2rem', height: '60px',
    }}>
      <Link to="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
        <span style={{ color: 'var(--accent)' }}>Drop</span>Share
      </Link>
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {[['/', 'Upload'], ['/my-files', 'My Files']].map(([path, label]) => (
          <Link key={path} to={path} style={{
            padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.875rem',
            fontWeight: 500, transition: 'all 0.15s',
            background: loc.pathname === path ? 'var(--surface2)' : 'transparent',
            color: loc.pathname === path ? 'var(--text)' : 'var(--text-muted)',
          }}>{label}</Link>
        ))}
      </div>
    </nav>
  );
}
