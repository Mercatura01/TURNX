import OrderedMap "mo:base/OrderedMap";
import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";

module {
    public type UserRole = {
        #admin;
        #user;
        #guest;
    };

    public type ApprovalStatus = {
        #approved;
        #rejected;
        #pending;
    };

    public type MultiUserSystemState = {
        var adminAssigned : Bool;
        var userRoles : OrderedMap.Map<Principal, UserRole>;
        var approvalStatus : OrderedMap.Map<Principal, ApprovalStatus>;
    };

    public func initState() : MultiUserSystemState {
        let principalMap = OrderedMap.Make<Principal>(Principal.compare);
        {
            var adminAssigned = false;
            var userRoles = principalMap.empty<UserRole>();
            var approvalStatus = principalMap.empty<ApprovalStatus>();
        };
    };
// Returns whether a caller has the required role (and optionally, approval).
// Useful as a reusable gate for public functions.
public func hasPermission(state : MultiUserSystemState, caller : Principal, requiredRole : UserRole, requireApproval : Bool) : Bool {
    let role = getUserRole(state, caller);
    if (requireApproval) {
        let approval = getApprovalStatus(state, caller);
        if (approval != #approved) {
            return false;
        };
    };
    switch (role) {
        case (#admin) true;
        case (role) {
            switch (requiredRole) {
                case (#admin) false;
                case (#user) role == #user;
                case (#guest) true;
            };
        };
    };
};

// Simple utility to determine if the caller is an admin.
public func isAdmin(state : MultiUserSystemState, caller : Principal) : Bool {
    getUserRole(state, caller) == #admin;
};

// Core initialization logic. First non-anonymous caller becomes admin;
// all others get added as pending users until approved.
public func initializeAuth(state : MultiUserSystemState, caller : Principal) {
    if (not Principal.isAnonymous(caller)) {
        let principalMap = OrderedMap.Make<Principal>(Principal.compare);
        switch (principalMap.get(state.userRoles, caller)) {
            case (?_) {};
            case (null) {
                if (not state.adminAssigned) {
                    state.userRoles := principalMap.put(state.userRoles, caller, #admin);
                    state.approvalStatus := principalMap.put(state.approvalStatus, caller, #approved);
                    state.adminAssigned := true;
                } else {
                    state.userRoles := principalMap.put(state.userRoles, caller, #user);
                    state.approvalStatus := principalMap.put(state.approvalStatus, caller, #pending);
                };
            };
        };
    };
};

// Retrieve a user's approval status (#approved, #pending, or #rejected).
// Used in permission checks.
public func getApprovalStatus(state : MultiUserSystemState, caller : Principal) : ApprovalStatus {
    let principalMap = OrderedMap.Make<Principal>(Principal.compare);
    switch (principalMap.get(state.approvalStatus, caller)) {
        case (?status) status;
        case null Debug.trap("User is not registered");
    };
};

// Get a user's role: admin, user, or guest.
// Anonymous users are always treated as guests.
public func getUserRole(state : MultiUserSystemState, caller : Principal) : UserRole {
    if (Principal.isAnonymous(caller)) {
        #guest;
    } else {
        let principalMap = OrderedMap.Make<Principal>(Principal.compare);
        switch (principalMap.get(state.userRoles, caller)) {
            case (?role) { role };
            case (null) {
                Debug.trap("User is not registered");
            };
        };
    };
};

// Admin-only function to change any user's role.
// For example, promoting a user to admin or demoting to guest.
public func assignRole(state : MultiUserSystemState, caller : Principal, user : Principal, newRole : UserRole) {
    if (not (hasPermission(state, caller, #admin, true))) {
        Debug.trap("Unauthorized: Only admins can assign user roles");
    };
    let principalMap = OrderedMap.Make<Principal>(Principal.compare);
    state.userRoles := principalMap.put(state.userRoles, user, newRole);
};

// Admins can use this to change a user's approval status.
// Only approved users are treated as fully active.
public func setApproval(state : MultiUserSystemState, caller : Principal, user : Principal, approval : ApprovalStatus) {
    if (not (hasPermission(state, caller, #admin, true))) {
        Debug.trap("Unauthorized: Only admins can approve users");
    };
    let principalMap = OrderedMap.Make<Principal>(Principal.compare);
    state.approvalStatus := principalMap.put(state.approvalStatus, user, approval);
};

// Combines all user data into a list, for admin view.
// Useful for dashboards or audits.
public func listUsers(state : MultiUserSystemState, caller : Principal) : [UserInfo] {
    if (not (hasPermission(state, caller, #admin, true))) {
        Debug.trap("Unauthorized: Only admins can approve users");
    };
    let principalMap = OrderedMap.Make<Principal>(Principal.compare);
    let infos = principalMap.map<UserRole, UserInfo>(
        state.userRoles,
        func(principal, role) {
            let approval = getApprovalStatus(state, principal);
            let info : UserInfo = {
                principal;
                role;
                approval;
            };
            info;
        }
    );
    Iter.toArray(principalMap.vals(infos));
};

// Struct representing one user's complete metadata: identity, role, and approval status.
public type UserInfo = {
    principal : Principal;
    role : UserRole;
    approval : ApprovalStatus;
};
}