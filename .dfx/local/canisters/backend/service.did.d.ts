import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type ApprovalStatus = { 'pending' : null } |
  { 'approved' : null } |
  { 'rejected' : null };
export interface BillingRecord {
  'startTime' : Time,
  'costPerMinute' : number,
  'endTime' : Time,
  'protocolFee' : number,
  'user' : Principal,
  'totalCost' : number,
  'providerEarnings' : number,
  'durationMinutes' : number,
  'sessionId' : string,
  'providerId' : string,
}
export interface ChatMessage {
  'id' : string,
  'user' : Principal,
  'message' : string,
  'timestamp' : Time,
  'roomId' : string,
}
export interface Room {
  'id' : string,
  'participants' : Array<Principal>,
  'code' : string,
  'link' : string,
  'name' : string,
  'createdAt' : Time,
  'createdBy' : Principal,
  'isActive' : boolean,
  'maxParticipants' : bigint,
}
export type Time = bigint;
export interface TurnProvider {
  'id' : string,
  'url' : string,
  'attestationHash' : [] | [string],
  'owner' : Principal,
  'publicKey' : string,
  'name' : string,
  'stakeAmount' : bigint,
  'reputation' : number,
  'isActive' : boolean,
  'isVerified' : boolean,
  'uptime' : number,
  'securityScore' : bigint,
  'totalEarnings' : number,
  'rating' : number,
  'totalSessions' : bigint,
  'lastSeen' : Time,
  'location' : string,
}
export interface TurnServerUsage {
  'user' : Principal,
  'serverUrl' : string,
  'timestamp' : Time,
  'sessionId' : string,
}
export interface UserInfo {
  'principal' : Principal,
  'role' : UserRole,
  'approval' : ApprovalStatus,
}
export interface UserProfile { 'name' : string }
export type UserRole = { 'admin' : null } |
  { 'user' : null } |
  { 'guest' : null };
export interface _SERVICE {
  'assignRole' : ActorMethod<[Principal, UserRole], undefined>,
  'createRoom' : ActorMethod<[string, bigint], Room>,
  'getAllRooms' : ActorMethod<[], Array<Room>>,
  'getAllTurnProviders' : ActorMethod<[], Array<TurnProvider>>,
  'getAllTurnServerUsages' : ActorMethod<[], Array<TurnServerUsage>>,
  'getApprovalStatus' : ActorMethod<[], ApprovalStatus>,
  'getBillingRecords' : ActorMethod<[], Array<BillingRecord>>,
  'getCurrentUserRole' : ActorMethod<[], UserRole>,
  'getRoomMessages' : ActorMethod<[string], Array<ChatMessage>>,
  'getTurnServerUsage' : ActorMethod<[string], [] | [TurnServerUsage]>,
  'getUserProfile' : ActorMethod<[], [] | [UserProfile]>,
  'initializeAuth' : ActorMethod<[], undefined>,
  'isCurrentUserAdmin' : ActorMethod<[], boolean>,
  'listUsers' : ActorMethod<[], Array<UserInfo>>,
  'logTurnServerUsage' : ActorMethod<[string, string], undefined>,
  'recordBilling' : ActorMethod<
    [string, string, Time, Time, number],
    undefined
  >,
  'registerTurnProvider' : ActorMethod<
    [string, string, string, string, [] | [string], bigint, string],
    undefined
  >,
  'saveUserProfile' : ActorMethod<[UserProfile], undefined>,
  'sendMessage' : ActorMethod<[string, string], undefined>,
  'setApproval' : ActorMethod<[Principal, ApprovalStatus], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
