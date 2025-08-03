import React, { useState } from 'react';
import { useGetAllTurnProviders, useRegisterTurnProvider } from '../hooks/useQueries';
import { Server, Shield, Star, MapPin, Clock, DollarSign, TrendingUp, AlertTriangle, CheckCircle, Plus, X, Eye, Zap, Users, Lock, Globe, BarChart3, Activity } from 'lucide-react';

export default function ProviderDashboard() {
  const { data: turnProviders = [] } = useGetAllTurnProviders();
  const registerProviderMutation = useRegisterTurnProvider();
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [newProvider, setNewProvider] = useState({
    id: '',
    name: '',
    url: '',
    publicKey: '',
    attestationHash: '',
    stakeAmount: '',
    location: ''
  });

  const handleRegisterProvider = (e: React.FormEvent) => {
    e.preventDefault();
    registerProviderMutation.mutate({
      id: newProvider.id,
      name: newProvider.name,
      url: newProvider.url,
      publicKey: newProvider.publicKey,
      attestationHash: newProvider.attestationHash || null,
      stakeAmount: BigInt(newProvider.stakeAmount),
      location: newProvider.location
    }, {
      onSuccess: () => {
        setShowRegisterForm(false);
        setNewProvider({
          id: '',
          name: '',
          url: '',
          publicKey: '',
          attestationHash: '',
          stakeAmount: '',
          location: ''
        });
      }
    });
  };

  const getAttestationStatus = (provider: any) => {
    if (!provider.attestationHash) {
      return { status: 'missing', color: 'text-red-600', bg: 'bg-red-100', text: 'No Attestation', icon: AlertTriangle };
    }
    if (provider.isVerified) {
      return { status: 'verified', color: 'text-green-600', bg: 'bg-green-100', text: 'Verified', icon: CheckCircle };
    }
    return { status: 'pending', color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'Pending', icon: Clock };
  };

  const getPerformanceColor = (value: number, thresholds: { good: number, fair: number }) => {
    if (value >= thresholds.good) return 'text-green-600';
    if (value >= thresholds.fair) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const verifiedProviders = turnProviders.filter(p => p.isVerified && p.attestationHash);
  const unverifiedProviders = turnProviders.filter(p => !p.isVerified || !p.attestationHash);
  const activeProviders = turnProviders.filter(p => p.isActive);
  const totalStaked = turnProviders.reduce((sum, p) => sum + Number(p.stakeAmount), 0);
  const averageRating = turnProviders.length > 0 
    ? turnProviders.reduce((sum, p) => sum + p.rating, 0) / turnProviders.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 rounded-full p-3">
              <Server className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-blue-900">TURN Provider Network</h2>
              <p className="text-blue-800">Attestation-verified providers with staking and reputation system</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowRegisterForm(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Register Provider</span>
          </button>
        </div>
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <Server className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Providers</p>
              <p className="text-2xl font-bold text-gray-900">{turnProviders.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Verified</p>
              <p className="text-2xl font-bold text-gray-900">{verifiedProviders.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <Activity className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{activeProviders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <DollarSign className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Total Staked</p>
              <p className="text-2xl font-bold text-gray-900">{totalStaked.toLocaleString()}</p>
              <p className="text-xs text-gray-500">TURNX</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <Star className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attestation Requirements Banner */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 mb-2">Mandatory Rust Attestation Agent</h3>
            <p className="text-red-800 mb-4">
              All TURN providers MUST deploy and maintain a Rust-based attestation agent for continuous security monitoring. 
              Failure to maintain attestation will result in provider suspension and potential stake slashing.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-red-100">
                <div className="flex items-center space-x-2 mb-2">
                  <Lock className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-900">Security Monitoring</span>
                </div>
                <p className="text-sm text-red-700">Continuous TURN server operation and data integrity checks</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-red-100">
                <div className="flex items-center space-x-2 mb-2">
                  <Eye className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-900">Transparency</span>
                </div>
                <p className="text-sm text-red-700">Real-time attestation status reporting to coordination canister</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-red-100">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-900">Accountability</span>
                </div>
                <p className="text-sm text-red-700">Attestation compliance directly linked to provider rewards</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Provider Grid */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900">Provider Network</h3>
        </div>
        
        <div className="p-6">
          {turnProviders.length === 0 ? (
            <div className="text-center py-12">
              <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No TURN providers registered</p>
              <p className="text-gray-400 text-sm">Be the first to register a provider with attestation agent</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {turnProviders.map((provider) => {
                const attestation = getAttestationStatus(provider);
                const AttestationIcon = attestation.icon;
                
                return (
                  <div
                    key={provider.id}
                    className={`border rounded-lg p-6 transition-all hover:shadow-md ${
                      provider.isVerified && provider.attestationHash
                        ? 'border-green-200 bg-green-50'
                        : provider.attestationHash
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{provider.name}</h4>
                          {provider.isActive && (
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{provider.url}</p>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{provider.location}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setSelectedProvider(provider)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Attestation Status */}
                    <div className={`flex items-center space-x-2 p-3 rounded-lg mb-4 ${attestation.bg}`}>
                      <AttestationIcon className={`h-4 w-4 ${attestation.color}`} />
                      <span className={`text-sm font-medium ${attestation.color}`}>
                        {attestation.text}
                      </span>
                    </div>

                    {/* Performance Metrics */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Rating:</span>
                        <div className="flex items-center space-x-1">
                          {renderStars(provider.rating)}
                          <span className="text-sm font-medium ml-1">{provider.rating}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Reputation:</span>
                        <span className={`text-sm font-medium ${getPerformanceColor(provider.reputation, { good: 90, fair: 70 })}`}>
                          {provider.reputation}%
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Uptime:</span>
                        <span className={`text-sm font-medium ${getPerformanceColor(provider.uptime, { good: 99, fair: 95 })}`}>
                          {provider.uptime}%
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Stake:</span>
                        <span className="text-sm font-medium">
                          {Number(provider.stakeAmount).toLocaleString()} TURNX
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Sessions:</span>
                        <span className="text-sm font-medium">
                          {Number(provider.totalSessions).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Earnings:</span>
                        <span className="text-sm font-medium text-green-600">
                          {provider.totalEarnings.toFixed(2)} TURNX
                        </span>
                      </div>
                    </div>

                    {/* Status Indicators */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex items-center space-x-2">
                        {provider.isVerified ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                            Verified
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium">
                            Unverified
                          </span>
                        )}
                        
                        {provider.isActive ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium">
                            Inactive
                          </span>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Security: {Number(provider.securityScore)}/100
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Register Provider Modal */}
      {showRegisterForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Register TURN Provider</h3>
              <button
                onClick={() => setShowRegisterForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900">Attestation Agent Required</h4>
                  <p className="text-sm text-yellow-800 mt-1">
                    You must deploy and maintain a Rust-based attestation agent before registering. 
                    See the Documentation tab for setup instructions.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleRegisterProvider} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provider ID
                  </label>
                  <input
                    type="text"
                    value={newProvider.id}
                    onChange={(e) => setNewProvider(prev => ({ ...prev, id: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="provider_001"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provider Name
                  </label>
                  <input
                    type="text"
                    value={newProvider.name}
                    onChange={(e) => setNewProvider(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="My TURN Provider"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TURN Server URL
                </label>
                <input
                  type="url"
                  value={newProvider.url}
                  onChange={(e) => setNewProvider(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="turn:myserver.com:3478"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Public Key
                </label>
                <textarea
                  value={newProvider.publicKey}
                  onChange={(e) => setNewProvider(prev => ({ ...prev, publicKey: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your public key for authentication..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attestation Hash (Optional)
                </label>
                <input
                  type="text"
                  value={newProvider.attestationHash}
                  onChange={(e) => setNewProvider(prev => ({ ...prev, attestationHash: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Hash from your attestation agent..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty if attestation agent is not yet deployed. You can update this later.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stake Amount (TURNX)
                  </label>
                  <input
                    type="number"
                    min="500"
                    value={newProvider.stakeAmount}
                    onChange={(e) => setNewProvider(prev => ({ ...prev, stakeAmount: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1000"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 500 TURNX required</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <select
                    value={newProvider.location}
                    onChange={(e) => setNewProvider(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select location...</option>
                    <option value="US-East">US East</option>
                    <option value="US-West">US West</option>
                    <option value="EU-West">EU West</option>
                    <option value="EU-Central">EU Central</option>
                    <option value="Asia-Pacific">Asia Pacific</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowRegisterForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registerProviderMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {registerProviderMutation.isPending ? 'Registering...' : 'Register Provider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Provider Details Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{selectedProvider.name}</h3>
              <button
                onClick={() => setSelectedProvider(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Provider Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">ID:</span>
                      <span className="text-sm font-mono">{selectedProvider.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">URL:</span>
                      <span className="text-sm font-mono">{selectedProvider.url}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Location:</span>
                      <span className="text-sm">{selectedProvider.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Owner:</span>
                      <span className="text-sm font-mono">{selectedProvider.owner.toString().slice(0, 15)}...</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Attestation Status</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {selectedProvider.attestationHash ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-900">Attestation Agent Deployed</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Hash: {selectedProvider.attestationHash.slice(0, 20)}...
                        </div>
                        <div className="text-xs text-gray-600">
                          Last seen: {new Date(Number(selectedProvider.lastSeen) / 1000000).toLocaleString()}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-900">No Attestation Agent</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Performance Metrics</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Rating:</span>
                      <div className="flex items-center space-x-1">
                        {renderStars(selectedProvider.rating)}
                        <span className="text-sm font-medium ml-1">{selectedProvider.rating}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Reputation:</span>
                      <span className={`text-sm font-medium ${getPerformanceColor(selectedProvider.reputation, { good: 90, fair: 70 })}`}>
                        {selectedProvider.reputation}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Uptime:</span>
                      <span className={`text-sm font-medium ${getPerformanceColor(selectedProvider.uptime, { good: 99, fair: 95 })}`}>
                        {selectedProvider.uptime}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Security Score:</span>
                      <span className="text-sm font-medium">{Number(selectedProvider.securityScore)}/100</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Economics</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Stake Amount:</span>
                      <span className="text-sm font-medium">{Number(selectedProvider.stakeAmount).toLocaleString()} TURNX</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Sessions:</span>
                      <span className="text-sm font-medium">{Number(selectedProvider.totalSessions).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Earnings:</span>
                      <span className="text-sm font-medium text-green-600">{selectedProvider.totalEarnings.toFixed(2)} TURNX</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
