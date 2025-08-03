import React, { useEffect, useState } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent } from '@dfinity/agent';
import type { Identity } from '@dfinity/agent';
import WebRTCDashboard from './components/WebRTCDashBoard';
import AdminDashboard from './components/AdminDashboard';
import ConnectionsManager from './components/ConnectionsManager';
import RandomChatMode from './components/RandomChatMode';
import OnboardingGuide from './components/OnboardingGuide';
import DAOGovernance from './components/DAOGovernance';
import ProviderDashboard from './components/ProviderDashboard';
import { Users, Video, UserPlus, Shuffle, BookOpen, Vote, Server, LogOut } from 'lucide-react';

function App() {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [agent, setAgent] = useState<HttpAgent | null>(null);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [activeTab, setActiveTab] = useState<'landing' | string>('landing');

  const HARDCODED_ADMIN = "jl3ck-2cds7-rddbn-ww2i7-uo3ti-huzcp-5p673-miyae-vc22n-nzkna-2qe";

  // Initialize Internet Identity
  useEffect(() => {
    const initAuth = async () => {
      const client = await AuthClient.create();
      setAuthClient(client);
      const isAuthenticated = await client.isAuthenticated();
      if (isAuthenticated) {
        const id = client.getIdentity();
        const ag = new HttpAgent({ identity: id });
        setIdentity(id);
        setAgent(ag);
        setActiveTab('landing'); // ✅ Show landing after login
      }
    };
    initAuth();
  }, []);

  const login = async () => {
    if (!authClient) return;
    await authClient.login({
      identityProvider: `https://identity.ic0.app/#authorize`,
      onSuccess: async () => {
        const id = authClient.getIdentity();
        const ag = new HttpAgent({ identity: id });
        setIdentity(id);
        setAgent(ag);
        setActiveTab('landing');
      },
    });
  };

  const logout = async () => {
    if (authClient) {
      await authClient.logout();
      setIdentity(null);
      setAgent(null);
      setActiveTab('landing');
    }
  };

  const copyPrincipal = () => {
    const principal = identity?.getPrincipal().toText();
    if (principal) navigator.clipboard.writeText(principal);
  };

  const principalText = identity?.getPrincipal().toText();
  const isAdmin = principalText === HARDCODED_ADMIN;

  // Tabs (shown only after login)
  const tabs = [
    { id: 'webrtc', label: 'WebRTC', icon: Video },
    { id: 'connections', label: 'Connections', icon: UserPlus },
    { id: 'random-chat', label: 'Random Chat', icon: Shuffle },
    { id: 'providers', label: 'TURN Providers', icon: Server },
    { id: 'dao', label: 'DAO', icon: Vote },
    { id: 'onboarding', label: 'Docs', icon: BookOpen },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: Users }] : []),
  ];

  // ✅ Show Login screen if not authenticated
  if (!identity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 text-gray-800 flex items-center justify-center">
        <button
          onClick={login}
          className="px-6 py-3 bg-green-600 text-white rounded-full font-semibold shadow hover:bg-green-700"
        >
          Login with Internet Identity
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 text-gray-800">
      <div className="flex justify-between items-center p-4 bg-white shadow-sm border-b">
        <nav className="flex space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('landing')}
            className={`flex items-center space-x-1 px-4 py-2 rounded-full font-medium ${
              activeTab === 'landing'
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            🏠 <span>Home</span>
          </button>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1 px-4 py-2 rounded-full font-medium ${
                  activeTab === tab.id
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 max-w-[250px] truncate">{principalText}</span>
          <button
            onClick={copyPrincipal}
            className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
          >
            Copy
          </button>
          <button
            onClick={logout}
            className="px-2 py-1 text-xs bg-red-200 hover:bg-red-300 rounded flex items-center space-x-1"
          >
            <LogOut size={14} /> <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'landing' && (
          <div className="text-center mt-20">
            <h1 className="text-3xl font-bold text-green-700 mb-4">Welcome to TURNX</h1>
            <p className="text-gray-600 mb-6">
              Select a feature from the top navigation to start a call, manage connections, or explore other tools.
            </p>
            <p className="text-gray-500 text-sm">
              Logged in as: {principalText}
            </p>
          </div>
        )}
        {activeTab === 'webrtc' && (
          <WebRTCDashboard
            turnConfig={{
              url: 'stun:stun.l.google.com:19302',
              username: '',
              password: ''
            }}
            callMode="start"
            callId="12345"
            onEndCall={() => console.log('Call ended')}
          />
        )}
        {activeTab === 'connections' && <ConnectionsManager />}
        {activeTab === 'random-chat' && <RandomChatMode />}
        {activeTab === 'providers' && <ProviderDashboard />}
        {activeTab === 'dao' && <DAOGovernance />}
        {activeTab === 'onboarding' && <OnboardingGuide />}
        {activeTab === 'admin' && isAdmin && <AdminDashboard />}
      </div>
    </div>
  );
}

export default App;
