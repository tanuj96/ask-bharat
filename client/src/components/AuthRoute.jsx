import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { validateToken } from '../../utils/auth.js';

const AuthRoute = () => {
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const valid = await validateToken();
      setIsValid(valid);
    };
    checkAuth();
  }, []);

  if (isValid === null) return <div>Loading...</div>;
  return isValid ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default AuthRoute;