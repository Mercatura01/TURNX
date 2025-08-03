import React from 'react';
import { useListUsers, useSetApproval, useAssignRole, useGetAllTurnServerUsages, useGetAllTurnProviders, useGetBillingRecords } from '../hooks/useQueries';
import { Users, Shield, Server, Clock, DollarSign, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const { data: users = [] } = useListUsers();
  const { data: turnUsages = [] } = useGetAllTurnServerUsages();
  const { data: turnProviders = [] } = useGetAllTurnProviders();
  const { data: billingRecords = [] } = useGetBillingRecords();
  const approvalMutation = useSetApproval();
  const roleMutation = useAssignRole();

  const handleApproval = (userPrincipal: string, approval: 'approved' | 'rejected') => {
    approvalMutation.mutate({ user: userPrincipal, approval });
  };

  const handleRoleChange = (userPrincipal: string, role: 'admin' | 'user' | 'guest') => {
    roleMutation.mutate({ user: userPrincipal, role });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'user': return 'bg-blue-100 text-blue-800';
      case 'guest': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalRevenue = billingRecords.reduce((sum, record) => sum + record.totalCost, 0);
  const totalProviderEarnings = billingRecords.reduce((sum, record) => sum + record.providerEarnings, 0);
  const totalProtocolFees = billingRecords.reduce((sum, record) => sum + record.protocolFee, 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Approved Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.approval === 'approved').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <Server className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">TURN Providers</p>
              <p className="text-2xl font-bold text-gray-900">{turnProviders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <DollarSign className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{totalRevenue.toFixed(2)} TURNX</p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Revenue Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">Provider Earnings (90%)</span>
            </div>
            <p className="text-2xl font-bold text-green-900">{totalProviderEarnings.toFixed(2)} TURNX</p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Protocol Treasury (10%)</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{totalProtocolFees.toFixed(2)} TURNX</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-900">Total Sessions</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">{billingRecords.length}</p>
          </div>
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.principal.toString()} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      {user.principal.toString().slice(0, 20)}...
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.approval)}`}>
                        {user.approval}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApproval(user.principal.toString(), 'approved')}
                      disabled={approvalMutation.isPending}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleApproval(user.principal.toString(), 'rejected')}
                      disabled={approvalMutation.isPending}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 text-sm"
                    >
                      Reject
                    </button>
                  </div>
                  
                  <select
                    onChange={(e) => handleRoleChange(user.principal.toString(), e.target.value as any)}
                    value={user.role}
                    disabled={roleMutation.isPending}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="guest">Guest</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TURN Provider Status */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">TURN Provider Status</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {turnProviders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No TURN providers registered yet</p>
            ) : (
              turnProviders.map((provider) => (
                <div key={provider.id} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Provider</p>
                      <p className="font-medium">{provider.name}</p>
                      <p className="text-xs text-gray-500">{provider.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Stake Amount</p>
                      <p className="font-medium">{Number(provider.stakeAmount).toLocaleString()} TURNX</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          provider.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {provider.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {provider.isVerified && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Performance</p>
                      <p className="text-sm">Reputation: {provider.reputation}%</p>
                      <p className="text-sm">Uptime: {provider.uptime}%</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* TURN Server Usage Audit */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">TURN Server Usage Audit</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {turnUsages.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No TURN server usage recorded yet</p>
            ) : (
              turnUsages.map((usage, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Session ID</p>
                      <p className="font-mono text-sm">{usage.sessionId.slice(0, 20)}...</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">TURN Server</p>
                      <p className="text-sm">{usage.serverUrl}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">User</p>
                      <p className="font-mono text-sm">{usage.user.toString().slice(0, 15)}...</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Timestamp</p>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <p className="text-sm">
                          {new Date(Number(usage.timestamp) / 1000000).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Billing Records */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Recent Billing Records</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {billingRecords.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No billing records yet</p>
            ) : (
              billingRecords.slice(0, 10).map((record, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Session</p>
                      <p className="font-mono text-sm">{record.sessionId.slice(0, 15)}...</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="text-sm">{record.durationMinutes.toFixed(1)} min</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Cost</p>
                      <p className="font-medium text-green-600">{record.totalCost.toFixed(4)} TURNX</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Provider Earnings</p>
                      <p className="text-sm">{record.providerEarnings.toFixed(4)} TURNX</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Protocol Fee</p>
                      <p className="text-sm">{record.protocolFee.toFixed(4)} TURNX</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
