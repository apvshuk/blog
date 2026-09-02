import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import PostPage from './pages/PostPage';
import './App.css';

export default function App() {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/post/*"
            element={<PostPage />}
          />
        </Routes>
      </main>
      <footer className="app-footer">
        <span className="app-footer__mono">
          FILE ARCHIVE // ALL RECORDS UNVERIFIED UNTIL CROSS-CHECKED
        </span>
      </footer>
    </div>
  );
}
