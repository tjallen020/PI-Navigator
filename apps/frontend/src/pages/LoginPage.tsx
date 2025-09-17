import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../providers/AuthProvider';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setBusy(true);
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Unable to sign in. Check your email and password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg"
        aria-labelledby="login-title"
      >
        <h1 id="login-title" className="mb-6 text-2xl font-semibold text-navy">
          QI Tool Selector Login
        </h1>
        {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600" role="alert">{error}</p>}
        <label className="mb-4 block text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            className="mt-1 w-full rounded border border-slate-300 p-2 focus:border-teal focus:outline-none"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="mb-4 block text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            className="mt-1 w-full rounded border border-slate-300 p-2 focus:border-teal focus:outline-none"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button
          type="submit"
          className="mt-2 w-full rounded bg-navy py-2 text-white transition hover:bg-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
          disabled={busy}
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="mt-4 text-sm text-slate-600">
          Need an account?{' '}
          <Link to="/register" className="font-semibold text-teal hover:underline">
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
};
