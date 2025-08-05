import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import StudentsPage from './components/StudentsPage';
import CoursesPage from './components/CoursesPage';
import MOUsPage from './components/MOUsPage';
import RequestsPage from './components/RequestsPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('pocToken');
    const userData = localStorage.getItem('pocUser');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogin = (userData: any) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem('pocToken', 'dummy-token');
    localStorage.setItem('pocUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('pocToken');
    localStorage.removeItem('pocUser');
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route 
            path="/dashboard" 
            element={<Dashboard user={user} onLogout={handleLogout} />} 
          />
          <Route 
            path="/students" 
            element={<StudentsPage user={user} onLogout={handleLogout} />} 
          />
          <Route 
            path="/courses" 
            element={<CoursesPage user={user} onLogout={handleLogout} />} 
          />
          <Route 
            path="/mous" 
            element={<MOUsPage user={user} onLogout={handleLogout} />} 
          />
          <Route 
            path="/requests" 
            element={<RequestsPage user={user} onLogout={handleLogout} />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
