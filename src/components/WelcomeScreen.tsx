import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { Sparkles, Mail, Lock, KeyRound, X } from 'lucide-react';

export default function WelcomeScreen() {
  const [modalType, setModalType] = useState<'login' | 'signup' | 'otp' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      setModalType('otp');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'signup' });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-aura-bg text-aura-text relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="z-10 text-center space-y-8 max-w-md w-full p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-aura-card border border-aura-border rounded-3xl shadow-2xl">
              <Sparkles className="w-12 h-12 text-blue-400" />
            </div>
          </div>
          <h1 className="text-5xl font-semibold tracking-tight mb-4">Havenly</h1>
          <p className="text-aura-muted text-lg font-medium">Your intelligent home sanctuary.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="space-y-4"
        >
          <button
            onClick={() => setModalType('login')}
            className="w-full py-4 bg-aura-text text-aura-bg rounded-2xl font-medium hover:scale-[1.02] transition-transform"
          >
            Log In
          </button>
          <button
            onClick={() => setModalType('signup')}
            className="w-full py-4 bg-aura-card border border-aura-border rounded-2xl font-medium hover:bg-aura-card-hover transition-colors"
          >
            Create Account
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {modalType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-aura-card border border-aura-border rounded-3xl p-8 w-full max-w-sm relative shadow-2xl"
            >
              <button
                onClick={() => { setModalType(null); setError(''); }}
                className="absolute top-4 right-4 p-2 text-aura-muted hover:text-aura-text transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-display font-medium mb-6">
                {modalType === 'login' ? 'Welcome Back' : modalType === 'signup' ? 'Join Havenly' : 'Verify Email'}
              </h2>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={modalType === 'login' ? handleLogin : modalType === 'signup' ? handleSignup : handleVerifyOtp} className="space-y-4">
                {(modalType === 'login' || modalType === 'signup') && (
                  <>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-aura-muted" />
                      <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-aura-bg border border-aura-border rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-aura-text transition-colors text-aura-text"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-aura-muted" />
                      <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-aura-bg border border-aura-border rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-aura-text transition-colors text-aura-text"
                        required
                      />
                    </div>
                  </>
                )}

                {modalType === 'otp' && (
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-aura-muted" />
                    <input
                      type="text"
                      placeholder="6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full bg-aura-bg border border-aura-border rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-aura-text transition-colors text-aura-text tracking-widest"
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-aura-text text-aura-bg rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 mt-4"
                >
                  {loading ? 'Please wait...' : modalType === 'login' ? 'Log In' : modalType === 'signup' ? 'Sign Up' : 'Verify'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
