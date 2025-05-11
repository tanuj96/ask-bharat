import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import Dashboard from './components/Dashboard';
import CreateChatbot from './components/CreateChatbot';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import EmbedPage from './components/EmbedPage';
import EmbedSettings from './components/EmbedSettings';
import PrivateRoute from './components/PrivateRoute';
import AuthRoute from './components/AuthRoute';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-16">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create-chatbot" element={<CreateChatbot />} />
              <Route path="/embed-settings/:chatbotId" element={<EmbedSettings />} />
            </Route>
            
            <Route element={<AuthRoute />}>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
            </Route>
            
            <Route path="/embed/:chatbotId" element={<EmbedPage />} />
            

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;