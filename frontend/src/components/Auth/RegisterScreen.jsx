import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterScreen({ onSuccess, onBackToLogin }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedUsername || !trimmedEmail || !password) {
      toast.error('Fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: trimmedName,
        username: trimmedUsername,
        email: trimmedEmail,
        password,
      });
      toast.success('Account created. Welcome!');
      onSuccess?.();
    } catch (err) {
      const msg = err.response?.data?.error
        || (err.code === 'ERR_NETWORK' ? 'Cannot reach server. Is the backend running on port 5001?' : 'Create account failed');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-brand-cream">
      <div className="mb-8 text-center space-y-4">
        <div className="text-5xl mb-2">✨</div>
        <h1 className="font-heading text-4xl md:text-5xl tracking-tighter uppercase leading-none text-brand-black">
          XPense
        </h1>
        <p className="font-mono text-[11px] text-gray-500 uppercase tracking-[0.3em]">
          Create account
        </p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="DISPLAY NAME"
            className="w-full bg-white border-2 border-brand-black p-3 rounded-full text-sm font-bold focus:outline-none placeholder:text-gray-300 font-mono uppercase tracking-wider"
            autoComplete="name"
          />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="USERNAME"
            className="w-full bg-white border-2 border-brand-black p-3 rounded-full text-sm font-bold focus:outline-none placeholder:text-gray-300 font-mono uppercase tracking-wider"
            autoComplete="username"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="EMAIL"
            className="w-full bg-white border-2 border-brand-black p-3 rounded-full text-sm font-bold focus:outline-none placeholder:text-gray-300 font-mono uppercase tracking-wider"
            autoComplete="email"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="PASSWORD (6+ characters)"
            className="w-full bg-white border-2 border-brand-black p-3 rounded-full text-sm font-bold focus:outline-none placeholder:text-gray-300 font-mono uppercase tracking-wider"
            autoComplete="new-password"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="CONFIRM PASSWORD"
            className="w-full bg-white border-2 border-brand-black p-3 rounded-full text-sm font-bold focus:outline-none placeholder:text-gray-300 font-mono uppercase tracking-wider"
            autoComplete="new-password"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full editorial-button py-4 uppercase tracking-[0.2em] text-sm disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center">
          <button
            type="button"
            onClick={onBackToLogin}
            className="font-mono text-[11px] uppercase tracking-widest text-brand-black/70 hover:text-brand-black underline"
          >
            Back to login
          </button>
        </p>
      </div>
    </div>
  );
}
