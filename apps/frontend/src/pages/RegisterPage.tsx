import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../providers/AuthProvider';
import type { Role } from '../types/api';

const roles: { value: Role; label: string }[] = [
  { value: 'FRONTLINE', label: 'Frontline (nurse/therapist/MA)' },
  { value: 'MANAGER', label: 'Unit manager / charge nurse' },
  { value: 'FACILITATOR', label: 'QI facilitator / analyst' },
];

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', unit: '', role: roles[0].value });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setBusy(true);
      await register({ ...form });
      navigate('/');
    } catch (err) {
      setError('Unable to register. Try a different email.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl rounded-xl bg-white p-8 shadow-lg" aria-labelledby="register-title">
        <h1 id="register-title" className="mb-6 text-2xl font-semibold text-navy">
          Create your QI Tool Selector account
        </h1>
        {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600" role="alert">{error}</p>}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Name
            <input
              className="mt-1 w-full rounded border border-slate-300 p-2 focus:border-teal focus:outline-none"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              className="mt-1 w-full rounded border border-slate-300 p-2 focus:border-teal focus:outline-none"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              required
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              type="password"
              className="mt-1 w-full rounded border border-slate-300 p-2 focus:border-teal focus:outline-none"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              required
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Home unit (optional)
            <input
              className="mt-1 w-full rounded border border-slate-300 p-2 focus:border-teal focus:outline-none"
              value={form.unit}
              onChange={(event) => setForm((prev) => ({ ...prev, unit: event.target.value }))}
            />
          </label>
        </div>
        <fieldset className="mt-4">
          <legend className="text-sm font-medium text-slate-700">Role</legend>
          <div className="mt-2 grid gap-3 md:grid-cols-3">
            {roles.map((role) => (
              <label key={role.value} className="flex items-center gap-2 rounded border border-slate-300 p-3 hover:border-teal">
                <input
                  type="radio"
                  name="role"
                  value={role.value}
                  checked={form.role === role.value}
                  onChange={() => setForm((prev) => ({ ...prev, role: role.value }))}
                />
                <span className="text-sm text-slate-700">{role.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <button
          type="submit"
          className="mt-6 w-full rounded bg-navy py-2 text-white transition hover:bg-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
          disabled={busy}
        >
          {busy ? 'Creating account…' : 'Create account'}
        </button>
        <p className="mt-4 text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-teal hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};
