import { Link } from 'react-router-dom';
import './Header.css';

const TODAY = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export default function Header() {
  return (
    <header className="masthead">
      <div className="masthead__stamp" aria-hidden="true">
        <span>CLASSIFIED</span>
      </div>

      <div className="masthead__top">
        <span className="masthead__mono">EST. FILE NO. 001</span>
        <span className="masthead__mono">{TODAY}</span>
      </div>

      <Link to="/" className="masthead__title-link">
        <h1 className="masthead__title">THE DAILY DOSSIER</h1>
      </Link>
      <p className="masthead__tagline">
        Investigative reporting, filed and cross-referenced
      </p>

      <div className="masthead__rule">
        <span className="masthead__rule-mono">CASE ARCHIVE — OPEN TO PUBLIC RECORD</span>
      </div>
    </header>
  );
}
