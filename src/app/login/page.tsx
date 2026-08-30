'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Loader2, Eye, EyeOff, ChevronLeft, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await signIn('credentials', {
        redirect: false,
        username,
        password,
      });

      if (res?.error) {
        setErrorMsg('Incorrect username or password. Please try again.');
      } else if (res?.ok) {
        toast.success('Welcome back!');
        router.push('/admin');
        router.refresh();
      } else {
        setErrorMsg('Login failed. Please try again.');
      }
    } catch {
      setErrorMsg('A network error occurred. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#2A0813] via-[#160308] to-[#0D0206] p-4 text-rose-50">
      {/* Luxury Background Glows */}
      <div className="pointer-events-none absolute -top-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-[#951C30]/20 blur-[150px]" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-[26rem] w-[26rem] rounded-full bg-[#3F0D1C]/40 blur-[160px]" />

      <Link
        href="/"
        className="absolute top-6 left-6 inline-flex items-center gap-1 text-xs font-medium uppercase tracking-widest text-rose-100/60 transition hover:text-rose-50"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to website
      </Link>

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-rose-200/10 bg-white/[0.03] p-8 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative mb-4 h-20 w-20 overflow-hidden rounded-full border-2 border-rose-700/60 shadow-lg shadow-rose-900/40">
            <Image
              src="/portfolio-logo.jpeg"
              alt="Mariam Logo"
              fill
              className="object-cover"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Admin Portal</h1>
          <p className="mt-1 text-sm text-rose-200/60">Mariam — Portfolio Dashboard</p>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-rose-200/10 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-200/80">
            <ShieldCheck className="h-3.5 w-3.5" />
            Private access
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-rose-200">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="w-full rounded-xl border border-rose-900/50 bg-rose-950/20 px-4 py-3 text-white transition-colors focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              placeholder="e.g. Mariam"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-rose-200">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-rose-900/50 bg-rose-950/20 px-4 py-3 pr-12 text-white transition-colors focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-300/60 transition-colors hover:text-rose-300"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>


          {/* Inline error message */}
          {errorMsg && (
            <div className="flex items-start gap-3 rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#951C30] to-[#6b1220] px-8 py-3.5 font-medium text-white shadow-lg shadow-rose-900/30 transition-all hover:from-rose-500 hover:to-rose-800 hover:shadow-rose-900/40 focus:outline-none focus:ring-2 focus:ring-rose-500/40 disabled:pointer-events-none disabled:opacity-50"
          >
            {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
            {isLoading ? 'Authenticating...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}