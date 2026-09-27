import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
        fontFamily: 'var(--font-body)',
      }}
    >
      <p style={{ fontSize: '64px', margin: '0 0 16px' }}>🔍</p>
      <h1
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 800,
          fontSize: '24px',
          color: 'var(--color-ink)',
          margin: '0 0 8px',
        }}
      >
        Page not found
      </h1>
      <p style={{ color: 'var(--color-muted)', marginBottom: '32px' }}>
        This URL doesn&apos;t exist yet.
      </p>
      <Link
        to="/"
        style={{
          display: 'inline-block',
          background: 'var(--color-primary)',
          color: '#fff',
          borderRadius: '12px',
          padding: '12px 28px',
          fontFamily: 'var(--font-body)',
          fontWeight: 600,
          textDecoration: 'none',
          fontSize: '15px',
        }}
      >
        Go home
      </Link>
    </div>
  );
}
