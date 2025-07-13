import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Toast from '../components/ui/Toast'; // import the Toast

const LoginPage = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(email, password);
    if (result.success) {
      setSuccessMsg(result.message || 'Login successful');
      setTimeout(() => {
        // Get user from localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.role) {
          if (user.role.toLowerCase() === 'admin') {
            navigate('/admin');
          } else if (user.role.toLowerCase() === 'student') {
            navigate('/dashboard');
          } else {
            // fallback for unknown roles
            navigate('/');
          }
        } else {
          navigate('/');
        }
      }, 1500);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <h1 className="text-3xl font-bold gradient-text">ExamPortal</h1>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Sign in to your account</h2>
          <p className="mt-2 text-gray-600">
            Or{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-500 font-medium">
              create a new account
            </Link>
          </p>
        </div>

        <Card variant="floating">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl">
                {error}
              </div>
            )}

            <Input
              label="Email address"
              name="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
            />

            <Input
              label="Password"
              name="password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                Forgot your password?
              </Link>
            </div>

            <Button type="submit" className="w-full" loading={loading}>
              Sign in
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-100">
            <p className="text-sm text-gray-600 mb-2 font-medium">Demo accounts:</p>
            <p className="text-xs text-gray-500">Admin: admin@test.com / password</p>
            <p className="text-xs text-gray-500">Student: student@test.com / password</p>
          </div>
        </Card>
      </div>
      {successMsg && <Toast message={successMsg} onClose={() => setSuccessMsg('')} />}
    </div>
  );
};

export default LoginPage;