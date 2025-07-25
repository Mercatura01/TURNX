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

persistent actor {
    // Initialize the multi-user system state
    let multiUserState = MultiUserSystem.initState();

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

    transient let principalMap = OrderedMap.Make<Principal>(Principal.compare);
    var userProfiles = principalMap.empty<UserProfile>();

    public query ({ caller }) func getUserProfile() : async ?UserProfile {
        principalMap.get(userProfiles, caller);
    };

    public shared ({ caller }) func saveUserProfile(profile : UserProfile) : async () {
        userProfiles := principalMap.put(userProfiles, caller, profile);
    };

 // In any public-facing system, we must restrict access based on the user's role.
// Below are examples of how you can enforce permission logic based on different cases:
//
// * For admin-exclusive actions:
//   if (not (MultiUserSystem.hasPermission(multiUserState, caller, #admin, true))) {
//       Debug.trap("Unauthorized: Only approved users and admins delete data");
//   };
//
// * For users who’ve been explicitly approved:
//   if (not (MultiUserSystem.hasPermission(multiUserState, caller, #user, true))) {
//       Debug.trap("Unauthorized: Only approved users and admins delete data");
//   };
//
// * For any authenticated user (approval not required):
//   if (not (MultiUserSystem.hasPermission(multiUserState, caller, #user, false))) {
//       Debug.trap("Unauthorized: Only approved users and admins delete data");
//   };
//
// * For completely open access including guests: simply skip permission checks.


// TURN Provider Management
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
};


// This structure logs each time a user interacts with a TURN server.
// It helps maintain transparency and accountability over relayer usage.
public type TurnServerUsage = {
    serverUrl : Text;
    timestamp : Time.Time;
    sessionId : Text;
    user : Principal;
};


// A transient in-memory map is used to store the TURN session usage records.
// It's suitable for quick access and testing; not meant for durable storage.
transient let textMap = OrderedMap.Make<Text>(Text.compare);
var turnServerUsages = textMap.empty<TurnServerUsage>();


// Whenever a user connects through a TURN server, we record the usage.
// This function is only allowed for users that were granted explicit access.
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


// Approved users can fetch the usage entry for a specific session.
// This supports verifying their own TURN server activity.
public query ({ caller }) func getTurnServerUsage(sessionId : Text) : async ?TurnServerUsage {
    if (not (MultiUserSystem.hasPermission(multiUserState, caller, #user, true))) {
        Debug.trap("Unauthorized: Only approved users can view TURN server usage");
    };

    textMap.get(turnServerUsages, sessionId);
};


// For administrators, this function provides access to all recorded usage logs.
// Useful for monitoring system-wide TURN activity or billing.
public query ({ caller }) func getAllTurnServerUsages() : async [TurnServerUsage] {
    if (not (MultiUserSystem.hasPermission(multiUserState, caller, #admin, true))) {
        Debug.trap("Unauthorized: Only admins can view all TURN server usages");
    };

    Array.map<(Text, TurnServerUsage), TurnServerUsage>(
        Iter.toArray(textMap.entries(turnServerUsages)),
        func((k, v)) = v,
    );
};

