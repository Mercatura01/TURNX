import React, { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, Maximize, Minimize, Copy, Send } from 'lucide-react';
import type { ChatMessage, _SERVICE } from '../../../src/declarations/backend/backend.did';
import type { ActorSubclass } from '@dfinity/agent';

interface CallInterfaceProps {
  backend: ActorSubclass<_SERVICE>; 
  turnConfig: RTCConfiguration;
  callMode: 'join' | 'start';  // ✅ Add this line
  callId: string;              // ✅ Ensure this is also defined
  onEndCall: () => void;       // ✅ If used
  // ✅ Authenticated actor passed as prop
}

function CallInterface({ backend }: CallInterfaceProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [roomId, setRoomId] = useState<string>('');
  const [roomLink, setRoomLink] = useState<string>('');
  const [messages, setMessages] = useState<{ user: string; message: string }[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);

  const turnConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      {
        urls: 'turn:194.31.150.154:3478?transport=udp',
        username: 'turnx',
        credential: '1234'
      }
    ]
  };

  useEffect(() => {
    const setupMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Failed to access media devices:", err);
      }
    };
    setupMedia();
    return () => {
      localStream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    const roomIdFromQuery = url.searchParams.get("roomId");
    if (roomIdFromQuery && roomIdFromQuery.startsWith("CODE_")) {
      setRoomId(roomIdFromQuery);
      initConnection(roomIdFromQuery, false);
    }
  }, []);

  const createRoom = async () => {
    if (!localStream) {
      console.warn("❌ No localStream — cannot create room.");
      return;
    }
    try {
      console.log("📡 Calling backend.createRoom()...");
      setLoading(true);
  
      const roomId = await backend.createRoom();
      console.log("✅ Room created with ID:", roomId.toString());
  
      setRoomId(roomId.toString());
      setRoomLink(`${window.location.origin}?roomId=${roomId.toString()}`);
  
      console.log("🚀 Initializing connection as room creator...");
      initConnection(roomId.toString(), true);
  
    } catch (err) {
      console.error("❌ Error creating room:", err);
      alert("Could not create room. Make sure you are logged in with Internet Identity.");
    } finally {
      setLoading(false);
    }
  };
  
  const joinRoom = async () => {
    const id = prompt("Enter Room ID to join") || '';
    if (id.trim()) {
      console.log("🔗 Joining existing room:", id);
      setRoomId(id);
      initConnection(id, false);
    } else {
      console.warn("⚠️ No room ID entered.");
    }
  };
  const initConnection = async (id: string, isCreator: boolean) => {
    if (!localStream) {
      console.warn("❌ No localStream — cannot start connection.");
      return;
    }
  
    console.log(`📡 Setting up RTCPeerConnection for room ${id}, creator: ${isCreator}`);
    const pc = new RTCPeerConnection(turnConfig);
    setPeerConnection(pc);
  
    localStream.getTracks().forEach(track => {
      console.log(`🎥 Adding local track: ${track.kind}`);
      pc.addTrack(track, localStream);
    });
  
    pc.ontrack = e => {
      console.log("📺 Remote track received:", e.streams[0]);
      if (e.streams[0] && !remoteStreams.includes(e.streams[0])) {
        setRemoteStreams(prev => [...prev, e.streams[0]]);
      }
    };
  
    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        console.log("🧊 ICE candidate found:", event.candidate);
      } else {
        console.log("🧊 ICE gathering complete.");
      }
    };
  
    pc.oniceconnectionstatechange = () => {
      console.log("🔄 ICE connection state:", pc.iceConnectionState);
    };
  
    pc.onconnectionstatechange = () => {
      console.log("🌐 Peer connection state:", pc.connectionState);
    };
  
    try {
      if (isCreator) {
        console.log("📜 Creating offer...");
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        console.log("📤 Sending offer to backend.joinRoom:", id, offer);
  
        const success = await backend.joinRoom(BigInt(id), btoa(JSON.stringify(offer)));
        console.log("joinRoom() success:", success);
  
        if (!success) {
          console.error("❌ Failed to submit offer to backend.");
          return;
        }
      } else {
        console.log("📥 Fetching offer from backend.getOffer for room:", id);
        const offerOpt = await backend.getOffer(BigInt(id));
        console.log("getOffer() returned length:", offerOpt.length);
  
        if (!offerOpt.length) {
          console.warn("⚠️ No offer found for room:", id);
          return;
        }
  
        const offerStr = offerOpt[0];
        const offer = JSON.parse(atob(offerStr));
        console.log("✅ Offer received, setting as remote description...");
        await pc.setRemoteDescription(offer);
  
        console.log("📜 Creating answer...");
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log("📤 Sending answer to backend.answerOffer:", answer);
  
        const success = await backend.answerOffer(BigInt(id), btoa(JSON.stringify(answer)));
        console.log("answerOffer() success:", success);
  
        if (!success) {
          console.error("❌ Failed to submit answer to backend.");
          return;
        }
      }
  
      console.log("🔄 Starting poll interval for answer retrieval...");
      const pollInterval = setInterval(async () => {
        const answerOpt = await backend.getAnswer(BigInt(id));
        if (answerOpt.length && !pc.currentRemoteDescription) {
          console.log("📥 Answer found, applying remote description...");
          const answer = JSON.parse(atob(answerOpt[0]));
          await pc.setRemoteDescription(answer);
        }
      }, 2000);
  
      return () => clearInterval(pollInterval);
    } catch (err) {
      console.error("❌ Error during connection setup:", err);
    }
  };
  
  
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    await backend.sendMessage(roomId, newMessage);
    setMessages(prev => [...prev, { user: 'Me', message: newMessage }]);
    setNewMessage('');
  };

  const loadMessages = async () => {
    if (!roomId) return;
    const msgs: ChatMessage[] = await backend.getRoomMessages(roomId);
    const formatted = msgs.map(m => ({ user: m.user.toString(), message: m.message }));
    setMessages(formatted);
  };

  useEffect(() => {
    if (roomId) {
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [roomId]);

  const toggleMute = () => {
    if (localStream) {
      const track = localStream.getAudioTracks()[0];
      track.enabled = !track.enabled;
      setIsMuted(!track.enabled);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const track = localStream.getVideoTracks()[0];
      track.enabled = !track.enabled;
      setIsVideoOff(!track.enabled);
    }
  };

  const toggleFullscreen = () => setIsFullscreen(prev => !prev);

  const copyLink = () => {
    const link = `${window.location.origin}?roomId=${roomId}`;
    navigator.clipboard.writeText(link);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <div className="w-1/4 bg-gray-800 p-4 flex flex-col space-y-4 border-r border-gray-700">
        <button onClick={createRoom} className="bg-green-600 px-4 py-2 rounded hover:bg-green-700">
          {loading ? 'Creating...' : '+ Create Room'}
        </button>
        <button onClick={joinRoom} className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
          Join Room
        </button>
        {roomId && (
          <button onClick={copyLink} className="mt-4 text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600">
            <Copy size={14} className="inline" /> Copy Invite Link
          </button>
        )}
      </div>

      <div className="flex-1 p-4 flex flex-col">
        <div className={`relative bg-black rounded-xl overflow-hidden grid grid-cols-2 gap-2 ${isFullscreen ? 'w-full h-[85vh]' : 'w-full h-[60vh]'}`}>
          <video ref={localVideoRef} muted autoPlay playsInline className="object-cover w-full h-full border-2 border-green-500" />
          {remoteStreams.map((stream, idx) => (
            <video
              key={idx}
              autoPlay
              playsInline
              ref={(video) => { if (video) video.srcObject = stream; }}
              className="object-cover w-full h-full border border-gray-700"
            />
          ))}
          <button onClick={toggleFullscreen} className="absolute top-3 right-3 bg-gray-800/70 p-2 rounded hover:bg-gray-700">
            {isFullscreen ? <Minimize /> : <Maximize />}
          </button>
        </div>

        <div className="flex gap-4 mt-4 justify-center">
          <button onClick={toggleMute} className="bg-gray-700 p-4 rounded-full hover:bg-gray-600">
            {isMuted ? <MicOff /> : <Mic />}
          </button>
          <button onClick={toggleVideo} className="bg-gray-700 p-4 rounded-full hover:bg-gray-600">
            {isVideoOff ? <VideoOff /> : <Video />}
          </button>
        </div>

        {roomId && (
          <div className="bg-gray-800 mt-4 p-3 rounded-lg flex flex-col h-48">
            <div className="flex-1 overflow-y-auto space-y-2">
              {messages.map((msg, idx) => (
                <div key={idx} className="text-sm"><span className="font-bold">{msg.user}: </span>{msg.message}</div>
              ))}
            </div>
            <div className="flex mt-2">
              <input
                className="flex-1 p-2 text-black rounded-l"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button onClick={sendMessage} className="bg-green-600 px-4 py-2 rounded-r hover:bg-green-700">
                <Send size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CallInterface;
