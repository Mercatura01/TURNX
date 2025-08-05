TurnX is a decentralized WebRTC coordination and TURN server management layer built on the Internet Computer Protocol (ICP).
It is developed by Mercatura Labs, backed by Mercatura Forum, with the goal of enabling privacy-preserving, real-time peer-to-peer communication at scale.

Overview
TurnX enables authenticated users to create and join secure WebRTC rooms with TURN/STUN server integration, persistent room state on-chain, and built-in participant management.
All room state, signaling data, and TURN usage metrics are stored on the ICP blockchain, ensuring transparency, tamper-resistance, and decentralized control.

TurnX allows anyone to build on a trustless, decentralized environment. Any DAO or dApp that requires trusted video communication can seamlessly tap into TurnX’s infrastructure, which operates as an L2 on ICP for secure, verifiable communications.

Features
Decentralized Signaling Backend
All room creation, joining, and SDP/ICE exchange is handled by an ICP canister.

Persistent Room State
Uses OrderedMap to store and retrieve room data with consistent ordering and in-place updates.

Role & Access Control
Host and guest roles are enforced; only authorized participants can answer offers or retrieve signaling data.

Offer/Answer Flow

Host creates a room and sets an offer.

Guest joins and sets an answer.

Prevents guests from overwriting host offers.

Requires an offer to exist before allowing an answer.

TURN/STUN Integration
Supports private TURN servers for NAT traversal while keeping end-to-end encryption.

Multi-User System Integration
Works alongside Mercatura Labs’ user management module for approvals, roles, and principal-based access.

Debug-Friendly Development
Detailed Debug.print logs for every key backend operation.

Technical Stack
Frontend: React + TypeScript with full WebRTC integration.

Backend: Motoko canisters deployed on ICP.

Storage: OrderedMap for in-memory state with stable variable export/import.

Auth: Internet Identity for user authentication.

TURN/STUN: External server integration for connectivity.

Current Development Status
Migrated backend storage from HashMap to OrderedMap for more predictable state handling.

Updated backend to store room state in-place without breaking frontend calls.

Added checks to prevent role violations in the offer/answer process.

Integrated participant conversion from List<Principal> to arrays for frontend compatibility.

Current Challenge: When a guest joins, getOffer() sometimes returns length: 0.
Root cause: Host’s offer is not being stored immediately after room creation.
Next Step: Allow host to set the initial offer as part of the joinRoom() or a dedicated setOffer() function.

Roadmap
 Fix host offer persistence so joiners always retrieve a valid offer.

 Add ICE candidate storage and retrieval per room.

 Implement TURN provider registry and usage billing.

 Expand to multi-participant rooms.

 Enable end-to-end encrypted chat alongside video/audio.

 Introduce decentralized TURN node incentive system.

About Mercatura Labs
TurnX is built by Mercatura Labs, the R&D and venture creation arm of Mercatura Forum.
Mercatura Forum is a Web3-focused venture ecosystem that builds, funds, and scales decentralized applications and infrastructure in MENA and globally
