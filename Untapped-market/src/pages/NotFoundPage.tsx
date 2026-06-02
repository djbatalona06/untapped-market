import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page">
      <div className="empty-library" style={{ padding: '4rem 0' }}>
        <div className="empty-icon">🌫️</div>
        <h2>Page not found</h2>
        <p>This trail doesn't lead anywhere. Let's get you back on track.</p>
        <Link to="/" className="btn btn-primary mt-2">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
