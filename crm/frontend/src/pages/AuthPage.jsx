import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { ArrowRight, Layers } from 'lucide-react';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); 
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const [passwordError, setPasswordError] = useState('');

  const validatePassword = (pwd) => {
    const errors = [];
    if (pwd.length < 8) errors.push('at least 8 characters');
    if (!/[A-Z]/.test(pwd)) errors.push('an uppercase letter');
    if (!/[a-z]/.test(pwd)) errors.push('a lowercase letter');
    if (!/[0-9]/.test(pwd)) errors.push('a number');
    if (!/[!@#$%^&*]/.test(pwd)) errors.push('a special character (!@#$%^&*)');
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (mode === 'signup') {
      const pwdErrors = validatePassword(form.password);
      if (pwdErrors.length) {
        setPasswordError(`Password must contain ${pwdErrors.join(', ')}.`);
        return;
      }
    }
    setPasswordError('');
    setLoading(true);
    try {
      const fn = mode === 'login' ? login : signup;
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

      const { data } = await fn(payload);
      loginUser(data.token, data.user);
      toast.success(mode === 'login' ? 'Welcome back' : 'Account created');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950" />

      <div className="relative w-full max-w-sm animate-fade-in">
        
        <div className="flex items-center gap-2 mb-10 justify-center">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Layers size={16} className="text-white" />
          </div>
          <span className="text-zinc-100 font-semibold text-base tracking-tight">LeadFlow</span>
        </div>

        <div className="card p-8">
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-zinc-100">
              {mode === 'login' ? 'Sign in to your workspace' : 'Create your account'}
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              {mode === 'login'
                ? 'Enter your credentials to continue'
                : 'Start managing leads in minutes'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Full name</label>
                <input
                  type="text"
                  required
                  className="input-base"
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={set('name')}
                />
              </div>
            )}
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Email address</label>
              <input
                type="email"
                required
                className="input-base"
                placeholder="jane@company.com"
                value={form.email}
                onChange={set('email')}
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Password</label>
              <input
                type="password"
                required
                className="input-base"
                placeholder={mode === 'signup' ? 'Min. 8 characters' : '••••••••'}
                value={form.password}
                onChange={set('password')}
              />
              {passwordError && (
                <p className="mt-1 text-xs text-amber-400">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign in' : 'Create account'}
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-zinc-800 text-center">
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setForm({ name: '', email: '', password: '' });
              }}
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {mode === 'login'
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-700 mt-6">
          Secure · Multi-tenant · Enterprise-grade
        </p>
      </div>
    </div>
  );
}
