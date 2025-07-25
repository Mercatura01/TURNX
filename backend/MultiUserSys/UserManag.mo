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
