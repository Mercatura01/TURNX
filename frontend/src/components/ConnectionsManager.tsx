import React, { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { useListUsers } from '../hooks/useQueries';
import {
  UserPlus, Users, Check, X, Search, MessageCircle, Video, Clock, UserCheck
} from 'lucide-react';
import type { UserInfo } from '../../../src/declarations/backend/backend.did';

export default function ConnectionsManager() {
  const [identity, setIdentity] = useState<ReturnType<AuthClient['getIdentity']> | null>(null);
  const { data: allUsers = [] } = useListUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'connections' | 'requests' | 'discover'>('connections');

  const [connections, setConnections] = useState<string[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const client = await AuthClient.create();
      if (await client.isAuthenticated()) {
        setIdentity(client.getIdentity());
      } else {
        await client.login({
          identityProvider: 'https://identity.ic0.app/#authorize',
          onSuccess: () => setIdentity(client.getIdentity()),
        });
      }
    })();
  }, []);

  const currentUserPrincipal = identity?.getPrincipal().toString() || '';

  const approvedUsers = allUsers.filter(user =>
    user.principal.toString() !== currentUserPrincipal &&
    Object.keys(user.approval)[0] === 'approved'
  );

  const filteredUsers = approvedUsers.filter(user =>
    user.principal.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  const connectedUsers = approvedUsers.filter(user =>
    connections.includes(user.principal.toString())
  );

  const usersWithSentRequests = approvedUsers.filter(user =>
    sentRequests.includes(user.principal.toString())
  );

  const usersWithReceivedRequests = approvedUsers.filter(user =>
    receivedRequests.includes(user.principal.toString())
  );

  const discoverableUsers = filteredUsers.filter(user =>
    !connections.includes(user.principal.toString()) &&
    !sentRequests.includes(user.principal.toString()) &&
    !receivedRequests.includes(user.principal.toString())
  );

  const sendConnectionRequest = (userPrincipal: string) => {
    setSentRequests(prev => [...prev, userPrincipal]);
  };

  const acceptConnectionRequest = (userPrincipal: string) => {
    setConnections(prev => [...prev, userPrincipal]);
    setReceivedRequests(prev => prev.filter(p => p !== userPrincipal));
  };

  const rejectConnectionRequest = (userPrincipal: string) => {
    setReceivedRequests(prev => prev.filter(p => p !== userPrincipal));
  };

  const removeConnection = (userPrincipal: string) => {
    setConnections(prev => prev.filter(p => p !== userPrincipal));
  };

  const cancelRequest = (userPrincipal: string) => {
    setSentRequests(prev => prev.filter(p => p !== userPrincipal));
  };

  const renderUserCard = (user: UserInfo, actions: React.ReactNode) => (
    <div key={user.principal.toString()} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 rounded-full p-3">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {user.principal.toString().slice(0, 15)}...
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                Object.keys(user.role)[0] === 'admin'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {Object.keys(user.role)[0]}
              </span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {Object.keys(user.approval)[0]}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">{actions}</div>
      </div>
    </div>
  );
  const tabs = [
    { id: 'connections' as const, label: 'My Connections', count: connections.length },
    { id: 'requests' as const, label: 'Requests', count: receivedRequests.length + sentRequests.length },
    { id: 'discover' as const, label: 'Discover Users', count: discoverableUsers.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <UserPlus className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Connection Manager</h2>
              <p className="text-gray-600">Connect with other users for private communications</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by principal ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="border-b">
          <nav className="flex space-x-1 p-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activeTab === tab.id ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* My Connections Tab */}
          {activeTab === 'connections' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Your Connections</h3>
                <div className="text-sm text-gray-500">
                  {connections.length} connection{connections.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              {connectedUsers.length === 0 ? (
                <div className="text-center py-12">
                  <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No connections yet</p>
                  <p className="text-gray-400 text-sm">Start by discovering and connecting with other users</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {connectedUsers.map((user) => 
                    renderUserCard(user, (
                      <div className="flex space-x-2">
                        <button
                          className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                          title="Start video call"
                        >
                          <Video className="h-3 w-3" />
                          <span>Call</span>
                        </button>
                        <button
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                          title="Send message"
                        >
                          <MessageCircle className="h-3 w-3" />
                          <span>Message</span>
                        </button>
                        <button
                          onClick={() => removeConnection(user.principal.toString())}
                          className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                          title="Remove connection"
                        >
                          <X className="h-3 w-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div className="space-y-6">
              {/* Received Requests */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Received Requests</h3>
                  <div className="text-sm text-gray-500">
                    {receivedRequests.length} pending request{receivedRequests.length !== 1 ? 's' : ''}
                  </div>
                </div>
                
                {usersWithReceivedRequests.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No pending requests</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {usersWithReceivedRequests.map((user) => 
                      renderUserCard(user, (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => acceptConnectionRequest(user.principal.toString())}
                            className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                          >
                            <Check className="h-3 w-3" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => rejectConnectionRequest(user.principal.toString())}
                            className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                          >
                            <X className="h-3 w-3" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Sent Requests */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Sent Requests</h3>
                  <div className="text-sm text-gray-500">
                    {sentRequests.length} pending request{sentRequests.length !== 1 ? 's' : ''}
                  </div>
                </div>
                
                {usersWithSentRequests.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No sent requests</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {usersWithSentRequests.map((user) => 
                      renderUserCard(user, (
                        <div className="flex space-x-2">
                          <span className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm">
                            <Clock className="h-3 w-3" />
                            <span>Pending</span>
                          </span>
                          <button
                            onClick={() => cancelRequest(user.principal.toString())}
                            className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                          >
                            <X className="h-3 w-3" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Discover Users Tab */}
          {activeTab === 'discover' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Discover Users</h3>
                <div className="text-sm text-gray-500">
                  {discoverableUsers.length} user{discoverableUsers.length !== 1 ? 's' : ''} available
                </div>
              </div>
              
              {discoverableUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    {searchTerm ? 'No users found' : 'No new users to discover'}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {searchTerm ? 'Try a different search term' : 'You\'ve already connected with all available users'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {discoverableUsers.map((user) => 
                    renderUserCard(user, (
                      <button
                        onClick={() => sendConnectionRequest(user.principal.toString())}
                        className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <UserPlus className="h-3 w-3" />
                        <span>Connect</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <UserPlus className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-blue-900">Privacy & Connections</h3>
            <p className="text-blue-800 text-sm mt-1">
              Connections are managed privately using your Principal ID. Only approved users can send and receive connection requests. 
              All communications remain end-to-end encrypted through the $TURNX network.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
