import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import ReleaseListPage from './pages/ReleaseListPage.jsx';
import ReleaseDetailPage from './pages/ReleaseDetailPage.jsx';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<ReleaseListPage />} />
            <Route path="/releases/:id" element={<ReleaseDetailPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
