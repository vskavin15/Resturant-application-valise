import React, { useState } from 'react';
// FIX: Corrected import path.
import { useAuth } from '../auth';
import { Role } from '../types';
import { LockClosedIcon, UsersIcon, RestaurantIcon } from '../components/Icons';

interface LoginScreenProps {
  onNavigateToSignup: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(Role.CUSTOMER);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, role);
      // Success will trigger a re-render in App.tsx, no need to navigate here
    } catch (err: any) {
        setError(err.message || 'Failed to log in.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-2xl shadow-lg">
        <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-amber-500/10 rounded-full">
                <RestaurantIcon className="w-8 h-8 text-amber-500"/>
            </div>
            <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
            <p className="text-gray-400">
              Select your role and sign in to continue.
            </p>
        </div>

        {error && (
            <div className="p-3 text-sm text-red-300 bg-red-500/20 rounded-lg" role="alert">
                <span className="font-medium">Error:</span> {error}
            </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
           <div>
            <label htmlFor="role" className="text-sm font-medium text-gray-300">
              Sign in as
            </label>
            <select
                id="role"
                name="role"
                required
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="mt-1 block w-full py-2.5 px-3 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-amber-500 focus:border-amber-500"
              >
                {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-300">
              Email Address
            </label>
            <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <UsersIcon className="w-5 h-5 text-gray-400" />
                </span>
                <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full py-2.5 pl-10 pr-3 text-white bg-gray-700 placeholder-gray-400 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 sm:text-sm"
                    placeholder="you@example.com"
                />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-300">
              Password
            </label>
            <div className="relative mt-1">
                 <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <LockClosedIcon className="w-5 h-5 text-gray-400" />
                </span>
                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full py-2.5 pl-10 pr-3 text-white bg-gray-700 placeholder-gray-400 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 sm:text-sm"
                    placeholder="••••••••"
                />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex justify-center w-full px-4 py-3 text-sm font-semibold text-white bg-amber-600 border border-transparent rounded-lg shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 ring-offset-gray-800 focus:ring-amber-500 disabled:bg-amber-400 disabled:cursor-not-allowed">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
         <p className="text-sm text-center text-gray-400">
            Don't have a customer account?{' '}
            <button onClick={onNavigateToSignup} className="font-medium text-amber-500 hover:text-amber-400">
                Sign up
            </button>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;