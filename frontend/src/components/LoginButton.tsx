import React, { useEffect, useState } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { useQueryClient } from '@tanstack/react-query';
import { LogIn, LogOut, Loader2 } from 'lucide-react';

export default function LoginButton() {
  const [identity, setIdentity] = useState<any>(null);
  const [loginStatus, setLoginStatus] = useState<'idle' | 'logging-in'>('idle');
  const queryClient = useQueryClient();

  useEffect(() => {
    (async () => {
      const client = await AuthClient.create();
      if (await client.isAuthenticated()) {
        setIdentity(client.getIdentity());
      }
    })();
  }, []);

  const login = async () => {
    setLoginStatus('logging-in');
    const client = await AuthClient.create();
    await client.login({
      identityProvider: 'https://identity.ic0.app/#authorize',
      onSuccess: () => {
        setIdentity(client.getIdentity());
        setLoginStatus('idle');
      },
      onError: (err) => {
        console.error('Login failed:', err);
        setLoginStatus('idle');
      },
    });
  };

  const clear = async () => {
    const client = await AuthClient.create();
    await client.logout();
    setIdentity(null);
    queryClient.clear();
  };

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <button
      onClick={handleAuth}
      disabled={disabled}
      className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors font-medium ${
        isAuthenticated
          ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          : 'bg-green-600 hover:bg-green-700 text-white'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {disabled ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isAuthenticated ? (
        <LogOut className="h-4 w-4" />
      ) : (
        <LogIn className="h-4 w-4" />
      )}
      <span>
        {disabled ? 'Processing...' : isAuthenticated ? 'Logout' : 'Login'}
      </span>
    </button>
  );
}
