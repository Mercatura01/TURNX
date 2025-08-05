import MultiUserSystem "MultiUserSys/UserManag";
import OrderedMap "mo:base/OrderedMap";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Debug "mo:base/Debug";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Float "mo:base/Float";
import Int "mo:base/Int";
import List "mo:base/List";
import Nat "mo:base/Nat";
import Video "video";
import hash "mo:base/Hash";


persistent actor {
    // Initialize the multi-user system state
    let multiUserState = MultiUserSystem.initState();


public type CandidateList = [Text];


// ✅ Bootstrap admin during deployment
ignore {
    let bootstrapAdmin = Principal.fromText("cplb5-2ppqs-w62gn-7j2ly-3j3pd-afuw6-s47ty-3vvwg-onu6b-qzrhi-sqe");
    MultiUserSystem.initializeAuth(multiUserState, bootstrapAdmin);
    MultiUserSystem.setApproval(multiUserState, bootstrapAdmin, bootstrapAdmin, #approved);
    MultiUserSystem.assignRole(multiUserState, bootstrapAdmin, bootstrapAdmin, #admin);
};


public shared ({ caller }) func registerPrincipal(user : Principal) : async Text {
    // Ensure the caller (admin) is at least initialized
    if (not MultiUserSystem.hasPermission(multiUserState, caller, #admin, false)) {
        MultiUserSystem.initializeAuth(multiUserState, caller);
        MultiUserSystem.setApproval(multiUserState, caller, caller, #approved);
        MultiUserSystem.assignRole(multiUserState, caller, caller, #admin);
    };

    // Now safely register target principal
    MultiUserSystem.initializeAuth(multiUserState, user);
    MultiUserSystem.setApproval(multiUserState, caller, user, #approved);
    MultiUserSystem.assignRole(multiUserState, caller, user, #user);

    return "✅ Principal registered and approved successfully";
};



    public shared ({ caller }) func initializeAuth() : async () {
        MultiUserSystem.initializeAuth(multiUserState, caller);
    };

    public query ({ caller }) func getCurrentUserRole() : async MultiUserSystem.UserRole {
        MultiUserSystem.getUserRole(multiUserState, caller);
    };

    public query ({ caller }) func isCurrentUserAdmin() : async Bool {
        MultiUserSystem.isAdmin(multiUserState, caller);
    };

    // Requires admin privilege to execute
    public shared ({ caller }) func assignRole(user : Principal, newRole : MultiUserSystem.UserRole) : async () {
        MultiUserSystem.assignRole(multiUserState, caller, user, newRole);
    };

    // Requires admin privilege to execute
    public shared ({ caller }) func setApproval(user : Principal, approval : MultiUserSystem.ApprovalStatus) : async () {
        MultiUserSystem.setApproval(multiUserState, caller, user, approval);
    };

    public query ({ caller }) func getApprovalStatus() : async MultiUserSystem.ApprovalStatus {
        MultiUserSystem.getApprovalStatus(multiUserState, caller);
    };

    public query ({ caller }) func listUsers() : async [MultiUserSystem.UserInfo] {
        MultiUserSystem.listUsers(multiUserState, caller);
    };

    public type UserProfile = {
        name : Text;
        // Other user's metadata if needed
    };

  transient var videoState = Video.initState();




  // ========== VIDEO MODULE WRAPPERS ==========
public shared (msg) func createRoom() : async Nat {
    let roomId = Video.createRoom(videoState, msg.caller); // in-place update
    return roomId;
};

public shared (msg) func joinRoom(roomId : Nat, offer : Text) : async Bool {
    Debug.print(
        "joinRoom (actor) called by " # Principal.toText(msg.caller) #
        " for roomId " # Nat.toText(roomId)
    );
    return Video.joinRoom(videoState, msg.caller, roomId, offer); // no tuple
};

public shared (msg) func getOffer(roomId : Nat) : async ?Text {
    Debug.print(
        "getOffer (actor) called by " # Principal.toText(msg.caller) #
        " for roomId " # Nat.toText(roomId)
    );
    return Video.getOffer(videoState, msg.caller, roomId);
};

public shared (msg) func answerOffer(roomId: Nat, answer: Text) : async Bool {
    Debug.print(
        "answerOffer (actor) called by " # Principal.toText(msg.caller) #
        " for roomId " # Nat.toText(roomId)
    );
    return Video.answerOffer(videoState, msg.caller, roomId, answer); // no tuple
};

public shared query (msg) func getAnswer(roomId: Nat) : async ?Text {
    return Video.getAnswer(videoState, msg.caller, roomId);
};



// --- ICE Candidate Management ---
transient let candidateMap = OrderedMap.Make<Text>(Text.compare);

// Storage for ICE candidates per room
var candidates : OrderedMap.Map<Text, [Text]> = candidateMap.empty();

// ✅ Store ICE candidate
public shared ({ caller }) func submitCandidate(roomId: Text, candidate: Text) : async () {
    let existing = switch (candidateMap.get(candidates, roomId)) {
        case (?list) list;
        case (null) [];
    };
    candidates := candidateMap.put(candidates, roomId, Array.append(existing, [candidate]));
};

// ✅ Retrieve ICE candidates
public query func getCandidates(roomId: Text) : async [Text] {
    switch (candidateMap.get(candidates, roomId)) {
        case (?list) list;
        case (null) [];
    };
};


    transient let principalMap = OrderedMap.Make<Principal>(Principal.compare);
    var userProfiles = principalMap.empty<UserProfile>();

    public query ({ caller }) func getUserProfile() : async ?UserProfile {
        principalMap.get(userProfiles, caller);
    };

    public shared ({ caller }) func saveUserProfile(profile : UserProfile) : async () {
        userProfiles := principalMap.put(userProfiles, caller, profile);
    };

// Authorization Strategy
//
// Public functions in this system must be protected by permission checks.
// Use the following patterns based on the desired access control level:
//
// - To restrict to administrators:
//   if (not (MultiUserSystem.hasPermission(multiUserState, caller, #admin, true))) {
//       Debug.trap("Unauthorized: Only approved users and admins delete data");
//   };
//
// - For approved (whitelisted) users only:
//   if (not (MultiUserSystem.hasPermission(multiUserState, caller, #user, true))) {
//       Debug.trap("Unauthorized: Only approved users and admins delete data");
//   };
//
// - For any signed-in principal (does not require whitelist):
//   if (not (MultiUserSystem.hasPermission(multiUserState, caller, #user, false))) {
//       Debug.trap("Unauthorized: Only approved users and admins delete data");
//   };
//
// - For open/public access: skip the check entirely.


// TURN Provider Information
//
// This type defines all the key properties of TURN relayers registered in the system.
// It includes technical details, performance stats, and operator info.
public type TurnProvider = {
    id : Text;
    name : Text;
    url : Text;
    publicKey : Text;
    attestationHash : ?Text;
    stakeAmount : Nat;
    reputation : Float;
    uptime : Float;
    rating : Float;
    totalSessions : Nat;
    totalEarnings : Float;
    location : Text;
    isVerified : Bool;
    isActive : Bool;
    securityScore : Nat;
    lastSeen : Time.Time;
    owner : Principal;
};


// TURN Session Tracking Type
//
// We log each TURN usage by recording who connected, to which server, and when.
public type TurnServerUsage = {
    serverUrl : Text;
    timestamp : Time.Time;
    sessionId : Text;
    user : Principal;
};


// In-memory Session Store
//
// A transient map that holds session records keyed by sessionId.
// This is ideal for fast access but not meant for long-term durability.
transient let textMap = OrderedMap.Make<Text>(Text.compare);
var turnServerUsages = textMap.empty<TurnServerUsage>();

  // --- New WebRTC Signal Map (RoomId → (Offer, Answer)) ---
  transient let signalMap = OrderedMap.Make<Text>(Text.compare);
  var offers : OrderedMap.Map<Text, Text> = signalMap.empty();
  var answers : OrderedMap.Map<Text, Text> = signalMap.empty();











// Record Usage of a TURN Server
//
// Called by an approved user when they initiate a TURN session.
// The function logs metadata for future tracking, billing, or analysis.
public shared ({ caller }) func logTurnServerUsage(serverUrl : Text, sessionId : Text) : async () {
    if (not (MultiUserSystem.hasPermission(multiUserState, caller, #user, true))) {
        Debug.trap("Unauthorized: Only approved users can log TURN server usage");
    };

    let usage : TurnServerUsage = {
        serverUrl = serverUrl;
        timestamp = Time.now();
        sessionId = sessionId;
        user = caller;
    };

    turnServerUsages := textMap.put(turnServerUsages, sessionId, usage);
};


// Retrieve a Specific Session Log
//
// Enables an approved user to fetch the usage details of a given session.
// Important for verifying personal usage or debugging behavior.
public query ({ caller }) func getTurnServerUsage(sessionId : Text) : async ?TurnServerUsage {
    if (not (MultiUserSystem.hasPermission(multiUserState, caller, #user, true))) {
        Debug.trap("Unauthorized: Only approved users can view TURN server usage");
    };

    textMap.get(turnServerUsages, sessionId);
};


// Admin-Only View of All Sessions
//
// Returns all recorded TURN server usages.
// Access to this data is limited to admins for auditing or network-wide insights.
public query ({ caller }) func getAllTurnServerUsages() : async [TurnServerUsage] {
    if (not (MultiUserSystem.hasPermission(multiUserState, caller, #admin, true))) {
        Debug.trap("Unauthorized: Only admins can view all TURN server usages");
    };

    Array.map<(Text, TurnServerUsage), TurnServerUsage>(
        Iter.toArray(textMap.entries(turnServerUsages)),
        func((k, v)) = v,
    );
};

// TURN Provider Registry (In-Memory Map)
//
// This map holds all TURN providers currently registered by users.
// Each entry is keyed by the provider's ID.
var turnProviders = textMap.empty<TurnProvider>();


// Billing and Token Management
//
// We define the structure of a billing event, including session times, pricing,
// calculated costs, and how revenue is split between the provider and protocol.
public type BillingRecord = {
    sessionId : Text;
    user : Principal;
    providerId : Text;
    startTime : Time.Time;
    endTime : Time.Time;
    durationMinutes : Float;
    costPerMinute : Float;
    totalCost : Float;
    providerEarnings : Float;
    protocolFee : Float;
};


// This map holds all billing records keyed by sessionId.
// Since it's transient, it's suitable for testing or short-lived tracking.
var billingRecords = textMap.empty<BillingRecord>();


// Create a New Billing Entry
//
// When a session completes, the client can call this to log payment breakdowns.
// The function calculates total usage time, cost, fee split, and stores the result.
public shared ({ caller }) func recordBilling(
    sessionId : Text,
    providerId : Text,
    startTime : Time.Time,
    endTime : Time.Time,
    costPerMinute : Float,
) : async () {
    if (not (MultiUserSystem.hasPermission(multiUserState, caller, #user, true))) {
        Debug.trap("Unauthorized: Only approved users can record billing");
    };

    let durationNanos = Float.fromInt(Int.abs(endTime - startTime));
    let durationMinutes = durationNanos / (60.0 * 1_000_000_000.0);
    let totalCost = durationMinutes * costPerMinute;
    let providerEarnings = totalCost * 0.9;
    let protocolFee = totalCost * 0.1;

    let record : BillingRecord = {
        sessionId = sessionId;
        user = caller;
        providerId = providerId;
        startTime = startTime;
        endTime = endTime;
        durationMinutes = durationMinutes;
        costPerMinute = costPerMinute;
        totalCost = totalCost;
        providerEarnings = providerEarnings;
        protocolFee = protocolFee;
    };

    billingRecords := textMap.put(billingRecords, sessionId, record);
};


// TURN Provider Registration
//
// This function lets approved users register themselves as TURN providers.
// Initial values are set to zero/defaults until updated through usage or verification.
public shared ({ caller }) func registerTurnProvider(
    id : Text,
    name : Text,
    url : Text,
    publicKey : Text,
    attestationHash : ?Text,
    stakeAmount : Nat,
    location : Text,
) : async () {
    if (not (MultiUserSystem.hasPermission(multiUserState, caller, #user, true))) {
        Debug.trap("Unauthorized: Only approved users can register TURN providers");
    };

    let provider : TurnProvider = {
        id = id;
        name = name;
        url = url;
        publicKey = publicKey;
        attestationHash = attestationHash;
        stakeAmount = stakeAmount;
        reputation = 0.0;
        uptime = 0.0;
        rating = 0.0;
        totalSessions = 0;
        totalEarnings = 0.0;
        location = location;
        isVerified = false;
        isActive = false;
        securityScore = 0;
        lastSeen = Time.now();
        owner = caller;
    };

    turnProviders := textMap.put(turnProviders, id, provider);
};




//Room handling 



// Get All Registered TURN Providers
//
// This query function lists every TURN provider on record.
// Can be used for listing in UI, provider selection, or verification tools.
public query func getAllTurnProviders() : async [TurnProvider] {
    Array.map<(Text, TurnProvider), TurnProvider>(
        Iter.toArray(textMap.entries(turnProviders)),
        func((k, v)) = v,
    );
};
  public query ({ caller }) func getBillingRecords() : async [BillingRecord] {
       if (not (MultiUserSystem.hasPermission(multiUserState, caller, #user, true))) {
           Debug.trap("Unauthorized: Only approved users can view billing records");
       };


       Array.map<(Text, BillingRecord), BillingRecord>(
           Iter.toArray(textMap.entries(billingRecords)),
           func((k, v)) = v,
       );
   };






public shared ({ caller }) func registerUser() : async () {
  MultiUserSystem.initializeAuth(multiUserState, caller);
};

   // Room Management
   public type Room = {
       id : Text;
       name : Text;
       code : Text;
       link : Text;
       createdBy : Principal;
       createdAt : Time.Time;
       participants : [Principal];
       isActive : Bool;
       maxParticipants : Nat;
   };


   var rooms = textMap.empty<Room>();








   // Chat Management
   public type ChatMessage = {
       id : Text;
       roomId : Text;
       user : Principal;
       message : Text;
       timestamp : Time.Time;
   };


   var chatMessages = textMap.empty<ChatMessage>();


   public shared ({ caller }) func sendMessage(
       roomId : Text,
       message : Text,
   ) : async () {
       if (not (MultiUserSystem.hasPermission(multiUserState, caller, #user, true))) {
           Debug.trap("Unauthorized: Only approved users can send messages");
       };


       let messageId = Text.concat("msg_", Int.toText(Time.now()));


       let newMessage : ChatMessage = {
           id = messageId;
           roomId = roomId;
           user = caller;
           message = message;
           timestamp = Time.now();
       };


       chatMessages := textMap.put(chatMessages, messageId, newMessage);
   };


   public query func getRoomMessages(roomId : Text) : async [ChatMessage] {
       var messages = List.nil<ChatMessage>();
       for ((id, msg) in textMap.entries(chatMessages)) {
           if (msg.roomId == roomId) {
               messages := List.push(msg, messages);
           };
       };
       List.toArray(messages);
   };
};







