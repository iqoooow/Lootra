'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, Zap } from 'lucide-react';
import { useSupabase } from '@/hooks/useSupabase';
import { cn } from '@/utils/cn';
import type { Locale } from '@/i18n/request';

export default function RegisterPage({ params: { locale } }: { params: { locale: Locale } }) {
  const router = useRouter();
  const { supabase } = useSupabase();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 8) {
      setError(locale === 'uz' ? 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak' : 'Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, display_name: username },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-10 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-brand-500/20 flex items-center justify-center mx-auto mb-4">
            <Zap size={32} className="text-brand-400" />
          </div>
          <h2 className="text-xl font-display font-bold text-white mb-2">
            {locale === 'uz' ? 'Emailingizni tasdiqlang!' : 'Check your email!'}
          </h2>
          <p className="text-dark-300 text-sm mb-6">
            {locale === 'uz'
              ? `${email} manziliga tasdiqlash havolasi yuborildi.`
              : `A confirmation link was sent to ${email}.`}
          </p>
          <Link href={`/${locale}/auth/login`} className="btn-primary">
            {locale === 'uz' ? 'Kirish sahifasiga o\'tish' : 'Go to Sign In'}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gold-gradient flex items-center justify-center mx-auto mb-4">
            <span className="font-display font-bold text-dark-950 text-2xl">S</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-white">
            {locale === 'uz' ? 'Ro\'yxatdan o\'tish' : 'Create Account'}
          </h1>
          <p className="text-dark-400 text-sm mt-1">
            {locale === 'uz' ? 'Bepul hisob yarating' : 'Join the community for free'}
          </p>
        </div>

        <div className="card p-8">
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-surface-border hover:bg-surface-overlay transition-colors text-sm font-medium mb-6"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {locale === 'uz' ? 'Google orqali ro\'yxatdan o\'tish' : 'Continue with Google'}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface-card px-3 text-dark-400">
                {locale === 'uz' ? 'yoki email bilan' : 'or with email'}
              </span>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-1.5">
                {locale === 'uz' ? 'Foydalanuvchi nomi' : 'Username'}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                className="input w-full"
                placeholder="shax_gamer"
                required
                minLength={3}
                maxLength={30}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-200 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-200 mb-1.5">
                {locale === 'uz' ? 'Parol' : 'Password'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input w-full pr-10"
                  placeholder="••••••••"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-xs text-dark-400 mt-1">
                {locale === 'uz' ? 'Kamida 8 ta belgi' : 'At least 8 characters'}
              </p>
            </div>

            {error && (
              <p className="text-accent-red text-sm bg-accent-red/10 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={cn('btn-primary w-full', loading && 'opacity-60 cursor-not-allowed')}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Zap size={16} className="animate-spin" />
                  {locale === 'uz' ? 'Ro\'yxatdan o\'tilmoqda...' : 'Creating account...'}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <UserPlus size={16} />
                  {locale === 'uz' ? 'Ro\'yxatdan o\'tish' : 'Create Account'}
                </span>
              )}
            </button>

            <p className="text-xs text-dark-400 text-center">
              {locale === 'uz'
                ? 'Ro\'yxatdan o\'tish orqali siz '
                : 'By signing up, you agree to our '}
              <Link href={`/${locale}/terms`} className="text-brand-400 hover:underline">
                {locale === 'uz' ? 'foydalanish shartlariga' : 'Terms of Service'}
              </Link>
              {locale === 'uz' ? ' rozilik bildirasiz.' : '.'}
            </p>
          </form>

          <p className="text-center text-sm text-dark-400 mt-6">
            {locale === 'uz' ? 'Hisobingiz bormi?' : 'Already have an account?'}{' '}
            <Link href={`/${locale}/auth/login`} className="text-brand-400 hover:text-brand-300 font-medium">
              {locale === 'uz' ? 'Kirish' : 'Sign In'}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
