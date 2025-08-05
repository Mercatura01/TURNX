import React, { useEffect, useState } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent, Identity, ActorSubclass } from '@dfinity/agent';
import { createActor, canisterId as backend_id } from '../../src/declarations/backend';

import WebRTCDashboard from './components/WebRTCDashBoard';
import AdminDashboard from './components/AdminDashboard';
import ConnectionsManager from './components/ConnectionsManager';
import RandomChatMode from './components/RandomChatMode';
import OnboardingGuide from './components/OnboardingGuide';
import DAOGovernance from './components/DAOGovernance';
import ProviderDashboard from './components/ProviderDashboard';

import { Users, Video, UserPlus, Shuffle, BookOpen, Vote, Server, LogOut } from 'lucide-react';
import type { _SERVICE } from '../../src/declarations/backend/backend.did';

function App() {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [agent, setAgent] = useState<HttpAgent | null>(null);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [backendActor, setBackendActor] = useState<ActorSubclass<_SERVICE> | null>(null);
  const [activeTab, setActiveTab] = useState<'landing' | string>('landing');
  const [roomIdFromURL, setRoomIdFromURL] = useState<string | null>(null);

  const HARDCODED_ADMIN = "jl3ck-2cds7-rddbn-ww2i7-uo3ti-huzcp-5p673-miyae-vc22n-nzkna-2qe";

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setRoomIdFromURL(urlParams.get('roomId'));
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const client = await AuthClient.create();
      setAuthClient(client);

      if (await client.isAuthenticated()) {
        const id = client.getIdentity();
        const ag = new HttpAgent({ identity: id });
        if (process.env.DFX_NETWORK !== 'ic') {
          await ag.fetchRootKey();
        }
        setIdentity(id);
        setAgent(ag);
        setBackendActor(createActor(backend_id, { agent: ag }));
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
        if (process.env.DFX_NETWORK !== 'ic') {
          await ag.fetchRootKey();
        }
        setIdentity(id);
        setAgent(ag);
        setBackendActor(createActor(backend_id, { agent: ag }));
      },
    });
  };

  const logout = async () => {
    if (authClient) {
      await authClient.logout();
      setIdentity(null);
      setAgent(null);
      setBackendActor(null);
    }
  };

  const copyPrincipal = () => {
    const principal = identity?.getPrincipal().toText();
    if (principal) navigator.clipboard.writeText(principal);
  };

  const principalText = identity?.getPrincipal().toText();
  const isAdmin = principalText === HARDCODED_ADMIN;

  const tabs = [
    { id: 'webrtc', label: 'WebRTC', icon: Video },
    { id: 'connections', label: 'Connections', icon: UserPlus },
    { id: 'random-chat', label: 'Random Chat', icon: Shuffle },
    { id: 'providers', label: 'TURN Providers', icon: Server },
    { id: 'dao', label: 'DAO', icon: Vote },
    { id: 'onboarding', label: 'Docs', icon: BookOpen },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: Users }] : []),
  ];

  if (!identity || !backendActor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <button disabled={!authClient} onClick={login} className="px-6 py-3 bg-green-600 text-white rounded-full">
          Login with Internet Identity
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 text-gray-800">
      <div className="flex justify-between items-center p-4 bg-white shadow-sm border-b">
        <nav className="flex space-x-2 overflow-x-auto whitespace-nowrap w-full px-2 sm:px-0">
          <button onClick={() => setActiveTab('landing')} className={`px-4 py-2 rounded-full ${activeTab === 'landing' ? 'bg-green-100 text-green-700 border' : ''}`}>
            🏠 Home
          </button>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-full ${activeTab === tab.id ? 'bg-green-100 text-green-700 border' : ''}`}>
                <Icon className="h-4 w-4" /> {tab.label}
              </button>
            );
          })}
        </nav>
        <div className="flex items-center space-x-2">
          <span className="text-sm">{principalText}</span>
          <button onClick={copyPrincipal} className="px-2 py-1 text-xs bg-gray-200 rounded">Copy</button>
          <button onClick={logout} className="px-2 py-1 text-xs bg-red-200 rounded flex items-center space-x-1">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'landing' && <p className="text-center mt-20">Welcome to TURNX</p>}
        {activeTab === 'webrtc' && (
          <WebRTCDashboard
            backend={backendActor}
            turnConfig={{
              iceServers: [
                { urls: 'turn:194.31.150.154:3478?transport=udp', username: 'turnx', credential: '1234' }
              ],
            }}
            callMode={roomIdFromURL ? 'join' : 'start'}
            callId={roomIdFromURL ?? ''}
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
