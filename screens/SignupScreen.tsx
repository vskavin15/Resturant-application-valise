import React, { useState } from 'react';
import { useAuth } from '../auth';
import { LockClosedIcon, UsersIcon, RestaurantIcon } from '../components/Icons';
import { notificationService } from '../services/notificationService';

interface SignupScreenProps {
  onNavigateToLogin: () => void;
}

const SignupScreen: React.FC<SignupScreenProps> = ({ onNavigateToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signup(name, email, password);
      notificationService.notify({
          title: 'Signup Successful!',
          message: 'Your customer account has been created. Please log in.',
          type: 'success',
      });
      onNavigateToLogin();
    } catch (err: any) {
      setError(err.message || 'Failed to sign up.');
    } finally {
        setLoading(false);
    }
  };
  
  const inputStyles = "mt-1 block w-full py-2.5 px-3 text-white bg-gray-700 placeholder-gray-400 border border-gray-600 rounded-lg focus:ring-amber-500 focus:border-amber-500";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-2xl shadow-lg">
        <div className="text-center">
            <button onClick={onNavigateToLogin} className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-amber-500/10 rounded-full">
                <RestaurantIcon className="w-8 h-8 text-amber-500"/>
            </button>
            <h1 className="text-3xl font-bold text-white">Create a Customer Account</h1>
            <p className="text-gray-400">
            Join us to track orders and earn loyalty points. Staff members must be invited by an admin.
            </p>
        </div>

        {error && (
            <div className="p-3 text-sm text-red-300 bg-red-500/20 rounded-lg" role="alert">
                <span className="font-medium">Error:</span> {error}
            </div>
        )}

        <form className="space-y-4" onSubmit={handleSignup}>
          <div>
            <label htmlFor="name" className="text-sm font-medium text-gray-300">Full Name</label>
            <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputStyles} placeholder="John Doe" />
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-300">Email Address</label>
            <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputStyles} placeholder="you@example.com" />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-300">Password</label>
            <input id="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputStyles} placeholder="••••••••" />
          </div>
           <div>
            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300">Confirm Password</label>
            <input id="confirmPassword" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputStyles} placeholder="••••••••" />
          </div>

          <div>
            <button type="submit" disabled={loading} className="flex justify-center w-full px-4 py-3 mt-2 text-sm font-semibold text-white bg-amber-600 border border-transparent rounded-lg shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 ring-offset-gray-800 focus:ring-amber-500 disabled:bg-amber-400 disabled:cursor-not-allowed">
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-400">
            Already have an account?{' '}
            <button onClick={onNavigateToLogin} className="font-medium text-amber-500 hover:text-amber-400">
                Sign in
            </button>
        </p>
      </div>
    </div>
  );
};

export default SignupScreen;