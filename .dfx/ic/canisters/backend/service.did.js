export const idlFactory = ({ IDL }) => {
  const UserRole = IDL.Variant({
    'admin' : IDL.Null,
    'user' : IDL.Null,
    'guest' : IDL.Null,
  });
  const Time = IDL.Int;
  const Room = IDL.Record({
    'id' : IDL.Text,
    'participants' : IDL.Vec(IDL.Principal),
    'code' : IDL.Text,
    'link' : IDL.Text,
    'name' : IDL.Text,
    'createdAt' : Time,
    'createdBy' : IDL.Principal,
    'isActive' : IDL.Bool,
    'maxParticipants' : IDL.Nat,
  });
  const TurnProvider = IDL.Record({
    'id' : IDL.Text,
    'url' : IDL.Text,
    'attestationHash' : IDL.Opt(IDL.Text),
    'owner' : IDL.Principal,
    'publicKey' : IDL.Text,
    'name' : IDL.Text,
    'stakeAmount' : IDL.Nat,
    'reputation' : IDL.Float64,
    'isActive' : IDL.Bool,
    'isVerified' : IDL.Bool,
    'uptime' : IDL.Float64,
    'securityScore' : IDL.Nat,
    'totalEarnings' : IDL.Float64,
    'rating' : IDL.Float64,
    'totalSessions' : IDL.Nat,
    'lastSeen' : Time,
    'location' : IDL.Text,
  });
  const TurnServerUsage = IDL.Record({
    'user' : IDL.Principal,
    'serverUrl' : IDL.Text,
    'timestamp' : Time,
    'sessionId' : IDL.Text,
  });
  const ApprovalStatus = IDL.Variant({
    'pending' : IDL.Null,
    'approved' : IDL.Null,
    'rejected' : IDL.Null,
  });
  const BillingRecord = IDL.Record({
    'startTime' : Time,
    'costPerMinute' : IDL.Float64,
    'endTime' : Time,
    'protocolFee' : IDL.Float64,
    'user' : IDL.Principal,
    'totalCost' : IDL.Float64,
    'providerEarnings' : IDL.Float64,
    'durationMinutes' : IDL.Float64,
    'sessionId' : IDL.Text,
    'providerId' : IDL.Text,
  });
  const ChatMessage = IDL.Record({
    'id' : IDL.Text,
    'user' : IDL.Principal,
    'message' : IDL.Text,
    'timestamp' : Time,
    'roomId' : IDL.Text,
  });
  const UserProfile = IDL.Record({ 'name' : IDL.Text });
  const UserInfo = IDL.Record({
    'principal' : IDL.Principal,
    'role' : UserRole,
    'approval' : ApprovalStatus,
  });
  return IDL.Service({
    'assignRole' : IDL.Func([IDL.Principal, UserRole], [], []),
    'createRoom' : IDL.Func([IDL.Text, IDL.Nat], [Room], []),
    'getAllTurnProviders' : IDL.Func([], [IDL.Vec(TurnProvider)], ['query']),
    'getAllTurnServerUsages' : IDL.Func(
        [],
        [IDL.Vec(TurnServerUsage)],
        ['query'],
      ),
    'getAnswer' : IDL.Func([IDL.Text], [IDL.Opt(IDL.Text)], ['query']),
    'getApprovalStatus' : IDL.Func([], [ApprovalStatus], ['query']),
    'getBillingRecords' : IDL.Func([], [IDL.Vec(BillingRecord)], ['query']),
    'getCandidates' : IDL.Func([IDL.Text], [IDL.Vec(IDL.Text)], ['query']),
    'getCurrentUserRole' : IDL.Func([], [UserRole], ['query']),
    'getOffer' : IDL.Func([IDL.Text], [IDL.Opt(IDL.Text)], ['query']),
    'getRoomMessages' : IDL.Func([IDL.Text], [IDL.Vec(ChatMessage)], ['query']),
    'getTurnServerUsage' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(TurnServerUsage)],
        ['query'],
      ),
    'getUserProfile' : IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
    'initializeAuth' : IDL.Func([], [], []),
    'isCurrentUserAdmin' : IDL.Func([], [IDL.Bool], ['query']),
    'listUsers' : IDL.Func([], [IDL.Vec(UserInfo)], ['query']),
    'logTurnServerUsage' : IDL.Func([IDL.Text, IDL.Text], [], []),
    'recordBilling' : IDL.Func(
        [IDL.Text, IDL.Text, Time, Time, IDL.Float64],
        [],
        [],
      ),
    'registerPrincipal' : IDL.Func([IDL.Principal], [IDL.Text], []),
    'registerTurnProvider' : IDL.Func(
        [
          IDL.Text,
          IDL.Text,
          IDL.Text,
          IDL.Text,
          IDL.Opt(IDL.Text),
          IDL.Nat,
          IDL.Text,
        ],
        [],
        [],
      ),
    'registerUser' : IDL.Func([], [], []),
    'saveUserProfile' : IDL.Func([UserProfile], [], []),
    'sendMessage' : IDL.Func([IDL.Text, IDL.Text], [], []),
    'setApproval' : IDL.Func([IDL.Principal, ApprovalStatus], [], []),
    'submitAnswer' : IDL.Func([IDL.Text, IDL.Text], [], []),
    'submitCandidate' : IDL.Func([IDL.Text, IDL.Text], [], []),
    'submitOffer' : IDL.Func([IDL.Text, IDL.Text], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
