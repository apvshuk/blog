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
        <span>DE...CLASSIFIED</span>
      </div>

      <div className="masthead__top">
        <span className="masthead__mono">{TODAY}</span>
      </div>

      <Link to="/" className="masthead__title-link">
        <h1 className="masthead__title">THE DAILY DOSSIER</h1>
      </Link>
      <p className="masthead__tagline">
        My readings, experiments, learnings and thoughts
      </p>

      <div className="masthead__rule">
        <span >OPEN TO PUBLIC RECORD</span>
      </div>
    </header>
  );
}
