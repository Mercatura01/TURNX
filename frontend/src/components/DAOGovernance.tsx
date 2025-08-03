import React, { useState } from 'react';
import { Vote, TrendingUp, DollarSign, Users, Clock, CheckCircle, XCircle, AlertTriangle, Plus, Eye, ThumbsUp, ThumbsDown, Coins, Shield, Settings, FileText, BarChart3 } from 'lucide-react';

interface Proposal {
  id: string;
  title: string;
  description: string;
  type: 'fee_adjustment' | 'provider_approval' | 'treasury_allocation' | 'protocol_upgrade';
  status: 'active' | 'passed' | 'rejected' | 'executed';
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  quorumRequired: number;
  endTime: Date;
  proposer: string;
  executionDelay: number;
  details: any;
}

export default function DAOGovernance() {
  const [activeTab, setActiveTab] = useState<'proposals' | 'treasury' | 'create' | 'history'>('proposals');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    type: 'fee_adjustment' as const,
    details: {}
  });

  // Mock data - in a real app, this would come from the backend
  const [proposals] = useState<Proposal[]>([
    {
      id: 'prop_001',
      title: 'Reduce TURN Provider Fee Rate to 0.15 TURNX/min',
      description: 'Proposal to reduce the per-minute fee rate from 0.20 to 0.15 TURNX to increase platform adoption and competitiveness.',
      type: 'fee_adjustment',
      status: 'active',
      votesFor: 1250,
      votesAgainst: 340,
      totalVotes: 1590,
      quorumRequired: 2000,
      endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      proposer: 'rdmx6-jaaaa-aaaah-qcaiq-cai',
      executionDelay: 48,
      details: {
        currentRate: 0.20,
        proposedRate: 0.15,
        estimatedImpact: 'Increase in user adoption by ~25%'
      }
    },
    {
      id: 'prop_002',
      title: 'Approve New TURN Provider: CloudRelay Networks',
      description: 'Proposal to approve CloudRelay Networks as a verified TURN provider with proper attestation agent deployment.',
      type: 'provider_approval',
      status: 'active',
      votesFor: 890,
      votesAgainst: 120,
      totalVotes: 1010,
      quorumRequired: 1500,
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      proposer: 'rrkah-fqaaa-aaaah-qcaiq-cai',
      executionDelay: 24,
      details: {
        providerName: 'CloudRelay Networks',
        stakeAmount: 2500,
        location: 'EU-West',
        attestationStatus: 'verified'
      }
    },
    {
      id: 'prop_003',
      title: 'Allocate 50,000 TURNX for Marketing Campaign',
      description: 'Proposal to allocate treasury funds for a comprehensive marketing campaign to increase platform awareness.',
      type: 'treasury_allocation',
      status: 'passed',
      votesFor: 2100,
      votesAgainst: 450,
      totalVotes: 2550,
      quorumRequired: 2000,
      endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      proposer: 'ryjl3-tyaaa-aaaah-qcaiq-cai',
      executionDelay: 72,
      details: {
        amount: 50000,
        purpose: 'Marketing Campaign',
        duration: '6 months'
      }
    }
  ]);

  const [treasuryStats] = useState({
    totalBalance: 125750.50,
    monthlyInflow: 8420.25,
    monthlyOutflow: 3200.00,
    totalProposals: 15,
    activeProposals: 3,
    passedProposals: 8,
    rejectedProposals: 4
  });

  const [votingPower] = useState(450); // User's voting power based on TURNX holdings

  const handleVote = (proposalId: string, vote: 'for' | 'against') => {
    console.log(`Voting ${vote} on proposal ${proposalId} with ${votingPower} voting power`);
    // In a real app, this would call the backend
  };

  const handleCreateProposal = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating proposal:', newProposal);
    // In a real app, this would call the backend
    setShowCreateForm(false);
    setNewProposal({ title: '', description: '', type: 'fee_adjustment', details: {} });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'passed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'executed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'fee_adjustment': return <DollarSign className="h-4 w-4" />;
      case 'provider_approval': return <Shield className="h-4 w-4" />;
      case 'treasury_allocation': return <Coins className="h-4 w-4" />;
      case 'protocol_upgrade': return <Settings className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const calculateQuorumProgress = (proposal: Proposal) => {
    return Math.min((proposal.totalVotes / proposal.quorumRequired) * 100, 100);
  };

  const calculateApprovalRate = (proposal: Proposal) => {
    if (proposal.totalVotes === 0) return 0;
    return (proposal.votesFor / proposal.totalVotes) * 100;
  };

  const tabs = [
    { id: 'proposals' as const, label: 'Active Proposals', count: proposals.filter(p => p.status === 'active').length },
    { id: 'treasury' as const, label: 'Treasury', count: null },
    { id: 'create' as const, label: 'Create Proposal', count: null },
    { id: 'history' as const, label: 'History', count: proposals.filter(p => p.status !== 'active').length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 rounded-full p-3">
              <Vote className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-purple-900">DAO Governance</h2>
              <p className="text-purple-800">Decentralized protocol parameter management and treasury control</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="bg-white rounded-lg p-4 border border-purple-100">
              <p className="text-sm text-gray-600">Your Voting Power</p>
              <p className="text-2xl font-bold text-purple-600">{votingPower.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Based on TURNX holdings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Proposals</p>
              <p className="text-2xl font-bold text-gray-900">{treasuryStats.totalProposals}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Active Proposals</p>
              <p className="text-2xl font-bold text-gray-900">{treasuryStats.activeProposals}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Passed</p>
              <p className="text-2xl font-bold text-gray-900">{treasuryStats.passedProposals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <Coins className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Treasury Balance</p>
              <p className="text-2xl font-bold text-gray-900">{treasuryStats.totalBalance.toLocaleString()}</p>
              <p className="text-xs text-gray-500">TURNX</p>
            </div>
          </div>
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
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activeTab === tab.id ? 'bg-purple-200 text-purple-800' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Active Proposals */}
          {activeTab === 'proposals' && (
            <div className="space-y-6">
              {proposals.filter(p => p.status === 'active').map((proposal) => (
                <div key={proposal.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="bg-gray-100 rounded-full p-2">
                          {getTypeIcon(proposal.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{proposal.title}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                              {proposal.status}
                            </span>
                            <span className="text-xs text-gray-500">
                              by {proposal.proposer.slice(0, 10)}...
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm mb-4">{proposal.description}</p>
                    </div>
                  </div>

                  {/* Voting Progress */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Approval Rate</span>
                        <span className="font-medium">{calculateApprovalRate(proposal).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${calculateApprovalRate(proposal)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{proposal.votesFor.toLocaleString()} for</span>
                        <span>{proposal.votesAgainst.toLocaleString()} against</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Quorum Progress</span>
                        <span className="font-medium">{proposal.totalVotes.toLocaleString()} / {proposal.quorumRequired.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${calculateQuorumProgress(proposal)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Voting Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Ends {proposal.endTime.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{proposal.executionDelay}h execution delay</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedProposal(proposal)}
                        className="flex items-center space-x-1 px-3 py-1 text-blue-600 hover:text-blue-700 text-sm"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Details</span>
                      </button>
                      <button
                        onClick={() => handleVote(proposal.id, 'against')}
                        className="flex items-center space-x-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                      >
                        <ThumbsDown className="h-4 w-4" />
                        <span>Against</span>
                      </button>
                      <button
                        onClick={() => handleVote(proposal.id, 'for')}
                        className="flex items-center space-x-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>For</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {proposals.filter(p => p.status === 'active').length === 0 && (
                <div className="text-center py-12">
                  <Vote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No active proposals</p>
                  <p className="text-gray-400 text-sm">Create a new proposal to get started</p>
                </div>
              )}
            </div>
          )}

          {/* Treasury */}
          {activeTab === 'treasury' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm text-green-700">Monthly Inflow</p>
                      <p className="text-2xl font-bold text-green-900">{treasuryStats.monthlyInflow.toLocaleString()}</p>
                      <p className="text-xs text-green-600">TURNX</p>
                    </div>
                  </div>
                  <p className="text-sm text-green-700">From protocol fees (10% of session costs)</p>
                </div>

                <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <BarChart3 className="h-8 w-8 text-red-600" />
                    <div>
                      <p className="text-sm text-red-700">Monthly Outflow</p>
                      <p className="text-2xl font-bold text-red-900">{treasuryStats.monthlyOutflow.toLocaleString()}</p>
                      <p className="text-xs text-red-600">TURNX</p>
                    </div>
                  </div>
                  <p className="text-sm text-red-700">From approved treasury allocations</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <Coins className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-700">Net Growth</p>
                      <p className="text-2xl font-bold text-blue-900">+{(treasuryStats.monthlyInflow - treasuryStats.monthlyOutflow).toLocaleString()}</p>
                      <p className="text-xs text-blue-600">TURNX/month</p>
                    </div>
                  </div>
                  <p className="text-sm text-blue-700">Sustainable treasury growth</p>
                </div>
              </div>

              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Treasury Allocation History</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Marketing Campaign</p>
                      <p className="text-sm text-gray-600">Approved via Proposal #003</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">-50,000 TURNX</p>
                      <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Developer Grants Program</p>
                      <p className="text-sm text-gray-600">Approved via Proposal #001</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">-25,000 TURNX</p>
                      <p className="text-xs text-gray-500">1 week ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Security Audit</p>
                      <p className="text-sm text-gray-600">Emergency allocation</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">-15,000 TURNX</p>
                      <p className="text-xs text-gray-500">2 weeks ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Create Proposal */}
          {activeTab === 'create' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900">Proposal Requirements</h3>
                    <ul className="mt-2 space-y-1 text-sm text-blue-800">
                      <li>• Minimum 100 TURNX voting power required to create proposals</li>
                      <li>• Proposals require a quorum of 2,000 votes to pass</li>
                      <li>• Execution delay varies by proposal type (24-72 hours)</li>
                      <li>• Treasury allocations require detailed justification</li>
                    </ul>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCreateProposal} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proposal Type
                  </label>
                  <select
                    value={newProposal.type}
                    onChange={(e) => setNewProposal(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="fee_adjustment">Fee Rate Adjustment</option>
                    <option value="provider_approval">TURN Provider Approval</option>
                    <option value="treasury_allocation">Treasury Allocation</option>
                    <option value="protocol_upgrade">Protocol Upgrade</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proposal Title
                  </label>
                  <input
                    type="text"
                    value={newProposal.title}
                    onChange={(e) => setNewProposal(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter a clear, descriptive title..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newProposal.description}
                    onChange={(e) => setNewProposal(prev => ({ ...prev, description: e.target.value }))}
                    rows={6}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Provide a detailed description of the proposal, including rationale and expected impact..."
                    required
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setNewProposal({ title: '', description: '', type: 'fee_adjustment', details: {} })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    disabled={votingPower < 100}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Create Proposal
                  </button>
                </div>

                {votingPower < 100 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-yellow-800">
                          You need at least 100 TURNX voting power to create proposals. 
                          Your current voting power is {votingPower} TURNX.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* History */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {proposals.filter(p => p.status !== 'active').map((proposal) => (
                <div key={proposal.id} className="border rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="bg-gray-100 rounded-full p-2">
                          {getTypeIcon(proposal.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{proposal.title}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                              {proposal.status}
                            </span>
                            <span className="text-xs text-gray-500">
                              by {proposal.proposer.slice(0, 10)}...
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm mb-4">{proposal.description}</p>
                    </div>
                    
                    <div className="text-right text-sm text-gray-600">
                      <p>Final: {proposal.votesFor.toLocaleString()} for, {proposal.votesAgainst.toLocaleString()} against</p>
                      <p>Approval: {calculateApprovalRate(proposal).toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Proposal Details Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Proposal Details</h3>
              <button
                onClick={() => setSelectedProposal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">{selectedProposal.title}</h4>
                <p className="text-gray-700">{selectedProposal.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Proposer</p>
                  <p className="font-mono text-sm">{selectedProposal.proposer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium">{selectedProposal.type.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">End Time</p>
                  <p className="font-medium">{selectedProposal.endTime.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Execution Delay</p>
                  <p className="font-medium">{selectedProposal.executionDelay} hours</p>
                </div>
              </div>
              
              {selectedProposal.details && Object.keys(selectedProposal.details).length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Additional Details</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {Object.entries(selectedProposal.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-1">
                        <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-sm font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
