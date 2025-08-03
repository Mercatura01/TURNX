import React, { useState } from 'react';
import { BookOpen, Shield, Server, Code, CheckCircle, AlertTriangle, ExternalLink, Copy, Terminal, FileText, Zap, Users, Lock, Eye, Globe, Star, ArrowRight, Download, Play } from 'lucide-react';

export default function OnboardingGuide() {
  const [activeSection, setActiveSection] = useState<'overview' | 'users' | 'providers' | 'developers'>('overview');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const sections = [
    { id: 'overview' as const, label: 'Platform Overview', icon: BookOpen },
    { id: 'users' as const, label: 'User Guide', icon: Users },
    { id: 'providers' as const, label: 'TURN Providers', icon: Server },
    { id: 'developers' as const, label: 'Developer Guide', icon: Code },
  ];

  const rustAttestationCode = `// Rust Attestation Agent Example
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use serde::{Deserialize, Serialize};
use tokio::time::interval;

#[derive(Serialize, Deserialize)]
struct AttestationReport {
    provider_id: String,
    timestamp: u64,
    turn_server_status: String,
    security_metrics: SecurityMetrics,
    signature: String,
}

#[derive(Serialize, Deserialize)]
struct SecurityMetrics {
    uptime_percentage: f64,
    data_integrity_score: u8,
    encryption_compliance: bool,
    traffic_volume: u64,
}

async fn run_attestation_agent(provider_id: String) -> Result<(), Box<dyn std::error::Error>> {
    let mut interval = interval(Duration::from_secs(60)); // Report every minute
    
    loop {
        interval.tick().await;
        
        // Monitor TURN server operations
        let metrics = collect_security_metrics().await?;
        
        // Generate attestation report
        let report = AttestationReport {
            provider_id: provider_id.clone(),
            timestamp: SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs(),
            turn_server_status: check_turn_server_status().await?,
            security_metrics: metrics,
            signature: generate_cryptographic_signature(&metrics).await?,
        };
        
        // Submit to coordination canister
        submit_attestation_report(report).await?;
    }
}

async fn collect_security_metrics() -> Result<SecurityMetrics, Box<dyn std::error::Error>> {
    // Implementation for collecting security metrics
    Ok(SecurityMetrics {
        uptime_percentage: 99.9,
        data_integrity_score: 100,
        encryption_compliance: true,
        traffic_volume: get_traffic_volume().await?,
    })
}`;

  const setupScript = `#!/bin/bash
# TURN Provider Setup Script

# 1. Install Rust and dependencies
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# 2. Clone attestation agent
git clone https://github.com/turnx-network/attestation-agent.git
cd attestation-agent

# 3. Configure environment
cp .env.example .env
# Edit .env with your provider details:
# PROVIDER_ID=your_provider_id
# TURN_SERVER_URL=your_turn_server_url
# PRIVATE_KEY_PATH=path_to_your_private_key
# CANISTER_ID=coordination_canister_id

# 4. Build and run
cargo build --release
./target/release/attestation-agent --config .env

# 5. Register with coordination canister
dfx canister call coordination_canister registerTurnProvider \\
  '("provider_001", "My TURN Provider", "turn:myserver.com:3478", \\
    "public_key_here", opt "attestation_hash", 1000, "US-East")'`;

  const webrtcExample = `// WebRTC Integration Example
const configuration = {
  iceServers: [
    {
      urls: 'turn:turnx-provider.com:3478',
      username: 'generated_username',
      credential: 'hmac_credential'
    }
  ],
  iceTransportPolicy: 'relay' // Force TURN relay for privacy
};

const peerConnection = new RTCPeerConnection(configuration);

// Enable DTLS-SRTP encryption
peerConnection.addEventListener('connectionstatechange', () => {
  if (peerConnection.connectionState === 'connected') {
    console.log('E2EE connection established via TURN relay');
  }
});`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 rounded-full p-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-blue-900">$TURNX Network Documentation</h2>
            <p className="text-blue-800">Comprehensive guide to privacy-preserving WebRTC coordination with attestation-based TURN providers</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="border-b">
          <nav className="flex space-x-1 p-4">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Platform Overview */}
          {activeSection === 'overview' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Platform Architecture</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <Shield className="h-8 w-8 text-green-600" />
                      <h4 className="font-semibold text-green-900">Privacy-First Design</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-green-800">
                      <li>• End-to-end DTLS-SRTP encryption</li>
                      <li>• ICE relay-only configuration</li>
                      <li>• No personal data storage</li>
                      <li>• Anonymous session tracking</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <Server className="h-8 w-8 text-blue-600" />
                      <h4 className="font-semibold text-blue-900">Attestation System</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li>• Rust-based attestation agents</li>
                      <li>• Continuous security monitoring</li>
                      <li>• Cryptographic proof of compliance</li>
                      <li>• Real-time status reporting</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <Zap className="h-8 w-8 text-purple-600" />
                      <h4 className="font-semibold text-purple-900">$TURNX Economy</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-purple-800">
                      <li>• Per-minute billing system</li>
                      <li>• 90% provider earnings</li>
                      <li>• 10% protocol treasury</li>
                      <li>• Transparent fee distribution</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Users className="h-5 w-5 text-blue-600 mt-1" />
                      <div>
                        <h4 className="font-medium text-gray-900">Multi-Participant Rooms</h4>
                        <p className="text-sm text-gray-600">Support for up to 50 participants with scalable WebRTC mesh networking</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Globe className="h-5 w-5 text-green-600 mt-1" />
                      <div>
                        <h4 className="font-medium text-gray-900">Random Video Chat</h4>
                        <p className="text-sm text-gray-600">Anonymous one-on-one matching with privacy-preserving pairing</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Lock className="h-5 w-5 text-purple-600 mt-1" />
                      <div>
                        <h4 className="font-medium text-gray-900">User Connections</h4>
                        <p className="text-sm text-gray-600">Private connection management with request/approval system</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Eye className="h-5 w-5 text-orange-600 mt-1" />
                      <div>
                        <h4 className="font-medium text-gray-900">DAO Governance</h4>
                        <p className="text-sm text-gray-600">Decentralized protocol parameter management and treasury control</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Star className="h-5 w-5 text-yellow-600 mt-1" />
                      <div>
                        <h4 className="font-medium text-gray-900">Provider Reputation</h4>
                        <p className="text-sm text-gray-600">Performance-based scoring with staking and slashing mechanisms</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-teal-600 mt-1" />
                      <div>
                        <h4 className="font-medium text-gray-900">Transparent Billing</h4>
                        <p className="text-sm text-gray-600">Real-time cost tracking with detailed session records</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Guide */}
          {activeSection === 'users' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h3>
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-3">1. Authentication & Profile Setup</h4>
                    <div className="space-y-3 text-sm text-blue-800">
                      <p>• Connect using Internet Identity for secure, privacy-preserving authentication</p>
                      <p>• Set up your profile with a display name (no personal information required)</p>
                      <p>• Wait for admin approval to access full platform features</p>
                      <p>• Your Principal ID serves as your unique, anonymous identifier</p>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-3">2. WebRTC Communication</h4>
                    <div className="space-y-3 text-sm text-green-800">
                      <p>• Create rooms supporting up to 50 participants with integrated chat</p>
                      <p>• Join rooms using room codes or shareable links</p>
                      <p>• All communications are end-to-end encrypted using DTLS-SRTP</p>
                      <p>• TURN providers relay encrypted data without access to content</p>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                    <h4 className="font-semibold text-purple-900 mb-3">3. $TURNX Token Management</h4>
                    <div className="space-y-3 text-sm text-purple-800">
                      <p>• Monitor your $TURNX balance in real-time during sessions</p>
                      <p>• Pay per-minute rates (typically 0.20 TURNX/min) for TURN relay usage</p>
                      <p>• View detailed billing records and session history</p>
                      <p>• Top up your balance to continue using the service</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Advanced Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Users className="h-6 w-6 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">Connection Management</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Send connection requests to other users</li>
                      <li>• Accept or reject incoming requests</li>
                      <li>• Manage your network of connected users</li>
                      <li>• Start private video calls with connections</li>
                    </ul>
                  </div>

                  <div className="bg-white border rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Globe className="h-6 w-6 text-green-600" />
                      <h4 className="font-semibold text-gray-900">Random Video Chat</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Anonymous matching with random users</li>
                      <li>• One-on-one encrypted video conversations</li>
                      <li>• Skip to next partner anytime</li>
                      <li>• Complete privacy protection</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Privacy & Security Best Practices</h4>
                    <ul className="mt-2 space-y-1 text-sm text-yellow-800">
                      <li>• Never share personal information during video calls</li>
                      <li>• Use the platform's built-in features for communication</li>
                      <li>• Report inappropriate behavior to administrators</li>
                      <li>• Verify TURN provider attestation status for maximum security</li>
                      <li>• Monitor your session costs and balance regularly</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TURN Providers */}
          {activeSection === 'providers' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Rust Attestation Agent Requirements</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-900">Mandatory Requirement</h4>
                      <p className="text-sm text-red-800 mt-1">
                        All TURN providers MUST deploy and maintain a Rust-based attestation agent. 
                        Failure to do so will result in provider suspension and potential stake slashing.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <Lock className="h-6 w-6 text-blue-600" />
                      <h4 className="font-semibold text-blue-900">Security Monitoring</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li>• Continuous TURN server operation monitoring</li>
                      <li>• Data integrity and encryption compliance checks</li>
                      <li>• Traffic volume and pattern analysis</li>
                      <li>• Uptime and performance metrics collection</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <Eye className="h-6 w-6 text-green-600" />
                      <h4 className="font-semibold text-green-900">Transparency Features</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-green-800">
                      <li>• Real-time attestation status reporting</li>
                      <li>• Cryptographic proof of secure operations</li>
                      <li>• Public verification of compliance status</li>
                      <li>• Automated canister integration</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Setup Instructions</h3>
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6 border">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">1. Automated Setup Script</h4>
                      <button
                        onClick={() => copyToClipboard(setupScript, 'setup-script')}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                      >
                        {copiedCode === 'setup-script' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        <span className="text-sm">{copiedCode === 'setup-script' ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
                      <code>{setupScript}</code>
                    </pre>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 border">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">2. Attestation Agent Implementation</h4>
                      <button
                        onClick={() => copyToClipboard(rustAttestationCode, 'rust-code')}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                      >
                        {copiedCode === 'rust-code' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        <span className="text-sm">{copiedCode === 'rust-code' ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
                      <code>{rustAttestationCode}</code>
                    </pre>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Provider Requirements</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Server className="h-6 w-6 text-purple-600" />
                      <h4 className="font-semibold text-gray-900">Technical</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Rust 1.70+ installed</li>
                      <li>• TURN server (coturn recommended)</li>
                      <li>• SSL/TLS certificates</li>
                      <li>• 24/7 uptime requirement</li>
                      <li>• Minimum 1Gbps bandwidth</li>
                    </ul>
                  </div>

                  <div className="bg-white border rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Zap className="h-6 w-6 text-yellow-600" />
                      <h4 className="font-semibold text-gray-900">Economic</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Minimum 500 TURNX stake</li>
                      <li>• Earn 90% of session fees</li>
                      <li>• Performance-based reputation</li>
                      <li>• Slashing for non-compliance</li>
                      <li>• Monthly earnings reports</li>
                    </ul>
                  </div>

                  <div className="bg-white border rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Shield className="h-6 w-6 text-green-600" />
                      <h4 className="font-semibold text-gray-900">Security</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Attestation agent deployment</li>
                      <li>• Cryptographic key management</li>
                      <li>• Regular security audits</li>
                      <li>• Compliance monitoring</li>
                      <li>• Incident response procedures</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <Download className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Resources & Support</h4>
                    <div className="mt-3 space-y-2">
                      <a href="#" className="flex items-center space-x-2 text-sm text-blue-700 hover:text-blue-800">
                        <ExternalLink className="h-3 w-3" />
                        <span>Download Attestation Agent Template</span>
                      </a>
                      <a href="#" className="flex items-center space-x-2 text-sm text-blue-700 hover:text-blue-800">
                        <FileText className="h-3 w-3" />
                        <span>Technical Specification Document</span>
                      </a>
                      <a href="#" className="flex items-center space-x-2 text-sm text-blue-700 hover:text-blue-800">
                        <Terminal className="h-3 w-3" />
                        <span>Provider Setup Troubleshooting Guide</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Developer Guide */}
          {activeSection === 'developers' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">WebRTC Integration</h3>
                <div className="bg-gray-50 rounded-lg p-6 border">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Privacy-First WebRTC Configuration</h4>
                    <button
                      onClick={() => copyToClipboard(webrtcExample, 'webrtc-code')}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                    >
                      {copiedCode === 'webrtc-code' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      <span className="text-sm">{copiedCode === 'webrtc-code' ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
                    <code>{webrtcExample}</code>
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">API Integration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Canister Methods</h4>
                    <div className="space-y-3 text-sm">
                      <div className="bg-gray-50 p-3 rounded">
                        <code className="text-blue-600">createRoom(name, maxParticipants)</code>
                        <p className="text-gray-600 mt-1">Create a new room with up to 50 participants</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <code className="text-blue-600">logTurnServerUsage(serverUrl, sessionId)</code>
                        <p className="text-gray-600 mt-1">Log TURN server usage for billing</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <code className="text-blue-600">recordBilling(sessionId, providerId, ...)</code>
                        <p className="text-gray-600 mt-1">Record session billing information</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Authentication Flow</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">1</div>
                        <span>Internet Identity authentication</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">2</div>
                        <span>Principal ID extraction</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">3</div>
                        <span>User profile setup</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">4</div>
                        <span>Admin approval process</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Security Considerations</h3>
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-900">Critical Security Requirements</h4>
                        <ul className="mt-2 space-y-1 text-sm text-red-800">
                          <li>• Always use iceTransportPolicy: 'relay' to force TURN usage</li>
                          <li>• Verify TURN provider attestation status before connection</li>
                          <li>• Implement proper credential refresh mechanisms</li>
                          <li>• Never store or log personal user information</li>
                          <li>• Use HTTPS/WSS for all signaling communications</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-900">Best Practices</h4>
                        <ul className="mt-2 space-y-1 text-sm text-green-800">
                          <li>• Implement automatic credential refresh before expiry</li>
                          <li>• Monitor connection quality and switch providers if needed</li>
                          <li>• Use React Query for efficient state management</li>
                          <li>• Implement proper error handling for network failures</li>
                          <li>• Provide clear user feedback for connection status</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <Code className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Development Resources</h4>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <a href="#" className="flex items-center space-x-2 text-sm text-blue-700 hover:text-blue-800">
                          <ExternalLink className="h-3 w-3" />
                          <span>GitHub Repository</span>
                        </a>
                        <a href="#" className="flex items-center space-x-2 text-sm text-blue-700 hover:text-blue-800">
                          <FileText className="h-3 w-3" />
                          <span>API Documentation</span>
                        </a>
                        <a href="#" className="flex items-center space-x-2 text-sm text-blue-700 hover:text-blue-800">
                          <Play className="h-3 w-3" />
                          <span>Video Tutorials</span>
                        </a>
                      </div>
                      <div className="space-y-2">
                        <a href="#" className="flex items-center space-x-2 text-sm text-blue-700 hover:text-blue-800">
                          <Terminal className="h-3 w-3" />
                          <span>CLI Tools</span>
                        </a>
                        <a href="#" className="flex items-center space-x-2 text-sm text-blue-700 hover:text-blue-800">
                          <Code className="h-3 w-3" />
                          <span>SDK Downloads</span>
                        </a>
                        <a href="#" className="flex items-center space-x-2 text-sm text-blue-700 hover:text-blue-800">
                          <Users className="h-3 w-3" />
                          <span>Developer Community</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
