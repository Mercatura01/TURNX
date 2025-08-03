import React, { useState } from 'react';
import { useSaveUserProfile } from '../hooks/useQueries';
import { User, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ProfileSetup() {
  const [name, setName] = useState('');
  const profileMutation = useSaveUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    
    if (!trimmedName) return;
    
    try {
      await profileMutation.mutateAsync({ name: trimmedName });
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const isLoading = profileMutation.isPending;
  const isDisabled = isLoading || !name.trim();
  const hasError = profileMutation.isError;
  const isSuccess = profileMutation.isSuccess;

  return (
    <div className="text-center">
      <div className="flex justify-center mb-6">
        <User className="h-16 w-16 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h2>
      <p className="text-gray-600 mb-8">Please enter your name to get started</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            required
            disabled={isLoading}
            maxLength={50}
            autoComplete="name"
            autoFocus
          />
          
          {hasError && (
            <div className="mt-2 flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-sm">Failed to save profile. Please try again.</p>
            </div>
          )}
          
          {isSuccess && (
            <div className="mt-2 flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <p className="text-sm">Profile saved successfully!</p>
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isDisabled}
          className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <User className="h-4 w-4" />
          )}
          <span>{isLoading ? 'Saving...' : 'Continue'}</span>
        </button>
      </form>
      
      <div className="mt-6 text-xs text-gray-500">
        <p>Your profile information is stored securely and privately.</p>
        <p>Only your display name is required to proceed.</p>
      </div>
    </div>
  );
}
