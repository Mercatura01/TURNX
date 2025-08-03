import React, { useState, useRef, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { useCreateRoom, useGetAllTurnProviders, useLogTurnServerUsage, useRecordBilling } from '../hooks/useQueries';
import { Shuffle, Video, VideoOff, Mic, MicOff, SkipForward, X, Users, Shield, Clock, Loader2, UserX, Heart, Zap, Globe, Star, Phone, PhoneOff } from 'lucide-react';
import type { TurnProvider } from '../../../src/declarations/backend/backend.did'; // Update path if needed

interface RandomChatSession {
  roomId: string;
  partnerId: string;
  partnerVideoRef: React.RefObject<HTMLVideoElement | null>;
  peerConnection: RTCPeerConnection | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  startTime: Date;
  isActive: boolean;
  isVideoCallActive: boolean;
  turnCredentials: {
    username: string;
    credential: string;
    urls: string;
  } | null;
}

export default function RandomChatMode() {


const [identity, setIdentity] = useState<null | import('@dfinity/agent').Identity>(null);

useEffect(() => {
  (async () => {
    const client = await AuthClient.create();
    const isAuthenticated = await client.isAuthenticated();
    if (isAuthenticated) {
      setIdentity(client.getIdentity());
    }
  })();
}, []);  
  const { data: turnProviders = [] } = useGetAllTurnProviders();
  const createRoomMutation = useCreateRoom();
  const logTurnUsageMutation = useLogTurnServerUsage();
  const recordBillingMutation = useRecordBilling();
  
  const [isSearching, setIsSearching] = useState(false);
  const [currentSession, setCurrentSession] = useState<RandomChatSession | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [currentTurnServer, setCurrentTurnServer] = useState<TurnProvider | null>(null);
  const [searchTime, setSearchTime] = useState(0);
  const [totalRandomChats, setTotalRandomChats] = useState(0);
  const [averageSessionTime, setAverageSessionTime] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('excellent');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'failed'>('disconnected');
  const [sessionCost, setSessionCost] = useState(0);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const costTimerRef = useRef<NodeJS.Timeout | null>(null);

  const userPrincipal = identity?.getPrincipal().toString() || '';

  // Mock partner data - in a real app, this would come from the backend
  const mockPartners = [
    'rdmx6-jaaaa-aaaah-qcaiq-cai',
    'rrkah-fqaaa-aaaah-qcaiq-cai',
    'ryjl3-tyaaa-aaaah-qcaiq-cai',
    'renrk-eyaaa-aaaah-qcaiq-cai',
    'rdbzx-hqaaa-aaaah-qcaiq-cai',
    'rjmkw-byaaa-aaaah-qcaiq-cai',
  ];

  // Session duration timer
  useEffect(() => {
    if (currentSession && currentSession.isActive) {
      sessionTimerRef.current = setInterval(() => {
        const now = new Date();
        const duration = Math.floor((now.getTime() - currentSession.startTime.getTime()) / 1000);
        setSessionDuration(duration);
      }, 1000);

      return () => {
        if (sessionTimerRef.current) {
          clearInterval(sessionTimerRef.current);
        }
      };
    }
  }, [currentSession]);

  // Cost calculation timer
  useEffect(() => {
    if (currentSession && currentSession.isVideoCallActive && currentTurnServer) {
      costTimerRef.current = setInterval(() => {
        const now = new Date();
        const durationMinutes = (now.getTime() - currentSession.startTime.getTime()) / (1000 * 60);
        const costPerMinute = 0.20;
        const cost = durationMinutes * costPerMinute;
        setSessionCost(cost);
      }, 1000);

      return () => {
        if (costTimerRef.current) {
          clearInterval(costTimerRef.current);
        }
      };
    }
  }, [currentSession, currentTurnServer]);

  // Search timer
  useEffect(() => {
    if (isSearching) {
      const startTime = Date.now();
      searchTimerRef.current = setInterval(() => {
        setSearchTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      return () => {
        if (searchTimerRef.current) {
          clearInterval(searchTimerRef.current);
        }
      };
    } else {
      setSearchTime(0);
    }
  }, [isSearching]);

  // Simulate connection quality changes
  useEffect(() => {
    if (currentSession && currentSession.isVideoCallActive) {
      const interval = setInterval(() => {
        const qualities: Array<'excellent' | 'good' | 'fair' | 'poor'> = ['excellent', 'good', 'fair'];
        const randomQuality = qualities[Math.floor(Math.random() * qualities.length)];
        setConnectionQuality(randomQuality);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [currentSession]);

  const selectRandomTurnServer = () => {
    const highRatedServers = turnProviders.filter(server => 
      server.rating > 4.5 && server.reputation > 90 && server.isVerified && server.attestationHash
    );
    
    if (highRatedServers.length === 0) {
      const trustedServers = turnProviders.filter(server => server.isVerified && server.attestationHash);
      if (trustedServers.length > 0) {
        const randomIndex = Math.floor(Math.random() * trustedServers.length);
        return trustedServers[randomIndex];
      }
      if (turnProviders.length > 0) {
        const randomIndex = Math.floor(Math.random() * turnProviders.length);
        return turnProviders[randomIndex];
      }
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * highRatedServers.length);
    return highRatedServers[randomIndex];
  };

  const generateMockTurnCredentials = (server: TurnProvider) => {
    return {
      username: `user_${Math.random().toString(36).substr(2, 9)}`,
      credential: `temp_pass_${Math.random().toString(36).substr(2, 9)}`,
      urls: server.url
    };
  };

  const createPeerConnection = async (turnCredentials: any): Promise<RTCPeerConnection> => {
    const configuration: RTCConfiguration = {
      iceServers: [
        {
          urls: turnCredentials.urls,
          username: turnCredentials.username,
          credential: turnCredentials.credential
        }
      ],
      iceTransportPolicy: 'relay' // Force TURN relay for privacy
    };

    const peerConnection = new RTCPeerConnection(configuration);

    // Handle ICE connection state changes
    peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', peerConnection.iceConnectionState);
      switch (peerConnection.iceConnectionState) {
        case 'checking':
          setConnectionStatus('connecting');
          break;
        case 'connected':
        case 'completed':
          setConnectionStatus('connected');
          break;
        case 'failed':
        case 'disconnected':
          setConnectionStatus('failed');
          break;
      }
    };

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('Received remote stream');
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setCurrentSession(prev => prev ? {
          ...prev,
          remoteStream: event.streams[0]
        } : null);
      }
    };

    return peerConnection;
  };

  const startLocalVideo = async (): Promise<MediaStream> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (error) {
      console.error('Error accessing camera:', error);
      throw error;
    }
  };

  const initiateVideoCall = async (session: RandomChatSession) => {
    try {
      setIsConnecting(true);
      setConnectionStatus('connecting');

      // Start local video
      const localStream = await startLocalVideo();
      
      // Create peer connection
      const peerConnection = await createPeerConnection(session.turnCredentials);
      
      // Add local stream to peer connection
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });

      // Create offer (in a real app, this would be coordinated through signaling server)
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      // Simulate receiving answer from remote peer
      setTimeout(async () => {
        try {
          // Mock answer from remote peer
          const mockAnswer: RTCSessionDescriptionInit = {
            type: 'answer',
            sdp: offer.sdp // In reality, this would be different
          };
          
          await peerConnection.setRemoteDescription(mockAnswer);
          
          // Update session with connection details
          setCurrentSession(prev => prev ? {
            ...prev,
            peerConnection,
            localStream,
            isVideoCallActive: true
          } : null);

          setIsConnecting(false);
          setConnectionStatus('connected');

          // Log TURN server usage
          if (currentTurnServer) {
            logTurnUsageMutation.mutate({
              serverUrl: currentTurnServer.url,
              sessionId: session.roomId
            });
          }

        } catch (error) {
          console.error('Error setting remote description:', error);
          setConnectionStatus('failed');
          setIsConnecting(false);
        }
      }, 2000); // Simulate network delay

    } catch (error) {
      console.error('Error initiating video call:', error);
      setConnectionStatus('failed');
      setIsConnecting(false);
    }
  };

  const startRandomChat = async () => {
    setIsSearching(true);
    setIsConnecting(false);
    setConnectionStatus('disconnected');
    
    // Simulate search time (2-8 seconds)
    const searchDuration = Math.random() * 6000 + 2000;
    
    setTimeout(async () => {
      setIsSearching(false);
      setIsConnecting(true);
      
      // Select random partner
      const availablePartners = mockPartners.filter(p => p !== userPrincipal);
      const randomPartner = availablePartners[Math.floor(Math.random() * availablePartners.length)];
      
      // Select TURN server
      const server = selectRandomTurnServer();
      if (server) {
        setCurrentTurnServer(server);
      }

      try {
        // Create room for random chat (1-on-1)
        const room = await createRoomMutation.mutateAsync({
          name: `Random Chat ${Date.now()}`,
          maxParticipants: BigInt(2)
        });

        // Generate TURN credentials
        const turnCredentials = server ? generateMockTurnCredentials(server) : null;

        const session: RandomChatSession = {
          roomId: room.id,
          partnerId: randomPartner,
          partnerVideoRef: remoteVideoRef,
          peerConnection: null,
          localStream: null,
          remoteStream: null,
          startTime: new Date(),
          isActive: true,
          isVideoCallActive: false,
          turnCredentials
        };

        setCurrentSession(session);
        setSessionDuration(0);
        setSessionCost(0);
        setConnectionQuality('excellent');
        
        // Initiate video call
        await initiateVideoCall(session);
        
      } catch (error) {
        console.error('Failed to create random chat room:', error);
        setIsSearching(false);
        setIsConnecting(false);
        setConnectionStatus('failed');
      }
    }, searchDuration);
  };

  const endRandomChat = async () => {
    if (currentSession) {
      // Stop local stream
      if (currentSession.localStream) {
        currentSession.localStream.getTracks().forEach(track => track.stop());
      }

      // Close peer connection
      if (currentSession.peerConnection) {
        currentSession.peerConnection.close();
      }

      // Clear video elements
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }

      // Record billing if there was a cost
      if (sessionCost > 0 && currentTurnServer) {
        const endTime = BigInt(Date.now() * 1_000_000); // Convert to nanoseconds
        const startTime = BigInt(currentSession.startTime.getTime() * 1_000_000);
        
        recordBillingMutation.mutate({
          sessionId: currentSession.roomId,
          providerId: currentTurnServer.id,
          startTime,
          endTime,
          costPerMinute: 0.20
        });
      }

      // Update stats
      setTotalRandomChats(prev => prev + 1);
      const sessionDurationMinutes = sessionDuration / 60;
      setAverageSessionTime(prev => 
        prev === 0 ? sessionDurationMinutes : (prev + sessionDurationMinutes) / 2
      );
    }

    // Reset state
    setCurrentSession(null);
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);
    setSessionDuration(0);
    setSessionCost(0);
    setCurrentTurnServer(null);
    setConnectionQuality('excellent');
    setIsConnecting(false);
    setConnectionStatus('disconnected');
  };

  const skipToNext = async () => {
    await endRandomChat();
    setTimeout(() => {
      startRandomChat();
    }, 500);
  };

  const toggleVideo = () => {
    if (currentSession && currentSession.localStream) {
      const videoTrack = currentSession.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (currentSession && currentSession.localStream) {
      const audioTrack = currentSession.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 1) return `${Math.floor(minutes * 60)}s`;
    return `${Math.floor(minutes)}m`;
  };

  const getConnectionQualityColor = () => {
    switch (connectionQuality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getConnectionQualityIcon = () => {
    switch (connectionQuality) {
      case 'excellent': return <Zap className="h-4 w-4" />;
      case 'good': return <Globe className="h-4 w-4" />;
      case 'fair': return <Clock className="h-4 w-4" />;
      case 'poor': return <X className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600';
      case 'connecting': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <Phone className="h-4 w-4" />;
      case 'connecting': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'failed': return <PhoneOff className="h-4 w-4" />;
      default: return <PhoneOff className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 rounded-full p-3">
              <Shuffle className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-purple-900">Random Video Chat</h2>
              <p className="text-purple-800">Connect with random users for anonymous one-on-one live video conversations with end-to-end encryption</p>
            </div>
          </div>
          
          {/* Enhanced Stats */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-white rounded-lg p-3 border border-purple-100">
              <p className="text-2xl font-bold text-purple-600">{totalRandomChats}</p>
              <p className="text-xs text-purple-700">Total Chats</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-purple-100">
              <p className="text-2xl font-bold text-pink-600">{formatDuration(averageSessionTime)}</p>
              <p className="text-xs text-pink-700">Avg. Duration</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interface */}
      <div className="bg-white rounded-xl shadow-sm border">
        {!isSearching && !isConnecting && !currentSession && (
          <div className="p-8 text-center">
            <div className="mb-8">
              <Shuffle className="h-16 w-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready for Random Video Chat?</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Connect instantly with another user for a private, anonymous live video conversation. 
                All video calls are end-to-end encrypted and completely private.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium text-green-900">Private & Secure</h4>
                <p className="text-sm text-green-700">End-to-end encrypted live video calls</p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium text-blue-900">Anonymous Matching</h4>
                <p className="text-sm text-blue-700">Random pairing with live video connection</p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <Video className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-medium text-purple-900">Instant Video Call</h4>
                <p className="text-sm text-purple-700">Live video streaming in seconds</p>
              </div>
            </div>

            <button
              onClick={startRandomChat}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="flex items-center space-x-3">
                <Video className="h-6 w-6" />
                <span>Start Random Video Chat</span>
              </div>
            </button>
          </div>
        )}

        {isSearching && (
          <div className="p-8 text-center">
            <div className="mb-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                <Shuffle className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Finding your video chat partner...</h3>
              <p className="text-gray-600">Searching for available users worldwide for live video chat</p>
              <p className="text-sm text-purple-600 mt-2">Search time: {formatTime(searchTime)}</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <div className="flex items-center space-x-2 mb-2">
                <Globe className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Global Video Matching</span>
              </div>
              <p className="text-xs text-blue-700">
                Connecting you with users from around the world for live video conversations
              </p>
            </div>

            <button
              onClick={() => setIsSearching(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel Search
            </button>
          </div>
        )}

        {isConnecting && (
          <div className="p-8 text-center">
            <div className="mb-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
                <Video className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Establishing live video connection...</h3>
              <p className="text-gray-600">Setting up secure video call with your partner</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Secure Video Connection</span>
              </div>
              <p className="text-xs text-green-700">
                Setting up end-to-end encryption and TURN relay for private video streaming
              </p>
            </div>
          </div>
        )}

        {currentSession && (
          <div className="p-6">
            {/* Enhanced Session Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 rounded-full p-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Live Video Chat Active</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Duration: {formatTime(sessionDuration)}</span>
                    <span>•</span>
                    <span>Partner: {currentSession.partnerId.slice(0, 10)}...</span>
                    <span>•</span>
                    <div className={`flex items-center space-x-1 ${getConnectionStatusColor()}`}>
                      {getConnectionStatusIcon()}
                      <span className="capitalize">{connectionStatus}</span>
                    </div>
                    <span>•</span>
                    <div className={`flex items-center space-x-1 ${getConnectionQualityColor()}`}>
                      {getConnectionQualityIcon()}
                      <span className="capitalize">{connectionQuality}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={skipToNext}
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                >
                  <SkipForward className="h-4 w-4" />
                  <span>Next Partner</span>
                </button>
                <button
                  onClick={endRandomChat}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>End Video Chat</span>
                </button>
              </div>
            </div>

            {/* Enhanced Live Video Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Your Video */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Your Video</h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span>Live</span>
                  </div>
                </div>
                <div className="simple-camera-preview">
                  {currentSession.isVideoCallActive && isVideoEnabled ? (
                    <>
                      <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="simple-camera-video"
                      />
                      <div className="absolute top-3 left-3 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                          <span>You</span>
                        </div>
                      </div>
                      <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                        <Shield className="h-3 w-3" />
                        <span>E2EE</span>
                      </div>
                      {currentTurnServer && (
                        <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
                          <span>{currentTurnServer.name}</span>
                          {currentTurnServer.attestationHash && (
                            <Shield className="h-3 w-3 text-green-400" />
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gray-900">
                      <Video className="h-16 w-16 mb-4 text-gray-500" />
                      <p className="text-center font-medium text-lg text-gray-300">Your Camera</p>
                      <p className="text-sm text-center mt-2 text-gray-500">
                        {!currentSession.isVideoCallActive ? 'Connecting...' : 'Camera disabled'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Partner Video */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Partner Video</h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className={`w-2 h-2 rounded-full ${
                      connectionStatus === 'connected' ? 'bg-blue-400 animate-pulse' : 'bg-gray-400'
                    }`}></div>
                    <span>{connectionStatus === 'connected' ? 'Connected' : 'Connecting...'}</span>
                  </div>
                </div>
                <div className="simple-camera-preview">
                  {currentSession.remoteStream && connectionStatus === 'connected' ? (
                    <>
                      <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="simple-camera-video"
                      />
                      <div className="absolute top-3 left-3 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                          <span>Partner</span>
                        </div>
                      </div>
                      <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                        <Shield className="h-3 w-3" />
                        <span>E2EE</span>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gray-800">
                      {connectionStatus === 'connecting' ? (
                        <>
                          <Loader2 className="h-16 w-16 mb-4 text-gray-500 animate-spin" />
                          <p className="text-center font-medium text-lg text-gray-300">Connecting to Partner</p>
                          <p className="text-sm text-center mt-2 text-gray-500">Establishing live video connection...</p>
                        </>
                      ) : connectionStatus === 'failed' ? (
                        <>
                          <X className="h-16 w-16 mb-4 text-red-500" />
                          <p className="text-center font-medium text-lg text-gray-300">Connection Failed</p>
                          <p className="text-sm text-center mt-2 text-gray-500">Unable to establish video connection</p>
                        </>
                      ) : (
                        <>
                          <Users className="h-16 w-16 mb-4 text-gray-500" />
                          <p className="text-center font-medium text-lg text-gray-300">Partner Camera</p>
                          <p className="text-sm text-center mt-2 text-gray-500">Waiting for partner video...</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Controls */}
            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={toggleVideo}
                disabled={!currentSession.isVideoCallActive}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                  isVideoEnabled
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {isVideoEnabled ? (
                  <Video className="h-5 w-5" />
                ) : (
                  <VideoOff className="h-5 w-5" />
                )}
                <span>{isVideoEnabled ? 'Camera On' : 'Camera Off'}</span>
              </button>
              
              <button
                onClick={toggleAudio}
                disabled={!currentSession.isVideoCallActive}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                  isAudioEnabled
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {isAudioEnabled ? (
                  <Mic className="h-5 w-5" />
                ) : (
                  <MicOff className="h-5 w-5" />
                )}
                <span>{isAudioEnabled ? 'Mic On' : 'Mic Off'}</span>
              </button>
            </div>

            {/* Enhanced Session Info */}
            {currentTurnServer && (
              <div className="mt-6 bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Live Video Session Details</h4>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                  <div>
                    <p className="text-blue-700">Duration</p>
                    <p className="font-medium text-blue-900">{formatTime(sessionDuration)}</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Provider</p>
                    <p className="font-medium text-blue-900">{currentTurnServer.name}</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Cost Rate</p>
                    <p className="font-medium text-blue-900">0.20 TURNX/min</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Session Cost</p>
                    <p className="font-medium text-red-600">{sessionCost.toFixed(4)} TURNX</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Connection</p>
                    <div className={`flex items-center space-x-1 ${getConnectionStatusColor()}`}>
                      {getConnectionStatusIcon()}
                      <span className="font-medium capitalize">{connectionStatus}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-blue-700">Attestation</p>
                    <div className="flex items-center space-x-1">
                      {currentTurnServer.attestationHash ? (
                        <>
                          <Shield className="h-3 w-3 text-green-600" />
                          <span className="font-medium text-green-700">Verified</span>
                        </>
                      ) : (
                        <span className="font-medium text-red-700">Not Available</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Privacy Notice */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-purple-900">Privacy & Safety in Random Video Chat</h3>
            <p className="text-purple-800 text-sm mt-1">
              Random video chats are completely anonymous and private. Your identity is not revealed to your chat partner. 
              All video and audio streams are end-to-end encrypted through verified TURN providers with live video transmission. 
              You can end or skip to the next video chat at any time. Each session creates a secure 1-on-1 room with automatic cleanup.
            </p>
          </div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Star className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-blue-900">Tips for Great Random Video Chats</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 text-sm text-blue-800">
              <div>
                <p className="font-medium">• Be respectful and friendly on video</p>
                <p className="font-medium">• Ensure good lighting for video quality</p>
                <p className="font-medium">• Use clear audio for better communication</p>
              </div>
              <div>
                <p className="font-medium">• Skip if you feel uncomfortable</p>
                <p className="font-medium">• Report inappropriate video behavior</p>
                <p className="font-medium">• Enjoy meeting people through live video</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
