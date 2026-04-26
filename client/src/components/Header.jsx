import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-brand">
          <h1 className="header-title">ReleaseCheck</h1>
        </Link>
        <div className="header-actions">
           {/* Add user info or other links here if needed */}
        </div>
      </div>
    </header>
  );
}

export default Header;
