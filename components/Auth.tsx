import React, { useState } from 'react';
import { Card } from './common/Card';
import { Input } from './common/Input';
import { Button } from './common/Button';

interface AuthProps {
  onSignIn: (credentials: any) => void;
  error: string | null;
}

export const Auth: React.FC<AuthProps> = ({ onSignIn, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignIn({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-float-in">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-brand drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        </div>
        <h2 className="text-center text-3xl font-bold text-gray-100 tracking-wider mb-2">
          Smart Retail Rate Quotes
        </h2>
        <p className="text-center text-gray-400 mb-8">
          Sign in to your account
        </p>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6 p-4">
            <Input
              id="email"
              name="email"
              type="email"
              label="Email address"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            {error && <p className="text-sm text-red-500 text-center pt-2">{error}</p>}

            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};