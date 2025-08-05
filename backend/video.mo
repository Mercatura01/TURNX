import Principal "mo:base/Principal";
import List "mo:base/List";
import OrderedMap "mo:base/OrderedMap";
import Nat "mo:base/Nat";
import Debug "mo:base/Debug";

module {
    type RoomId = Nat;
    type RoomData = {
        host : Principal;
        guest : ?Principal;
        offer : ?Text;
        answer : ?Text;
        participants : List.List<Principal>;
    };

    type VideoState = {
        var rooms : OrderedMap.Map<RoomId, RoomData>;
        var nextRoomId : RoomId;
    };

    public func initState() : VideoState {
        let roomMap = OrderedMap.Make<RoomId>(Nat.compare);
        {
            var rooms = roomMap.empty<RoomData>();
            var nextRoomId = 0;
        };
    };

    public func createRoom(state : VideoState, caller : Principal) : RoomId {
        let roomMap = OrderedMap.Make<RoomId>(Nat.compare);
        let roomId = state.nextRoomId;
        let newRoom : RoomData = {
            host = caller;
            guest = null;
            offer = null;
            answer = null;
            participants = List.push(caller, List.nil<Principal>());
        };
        state.rooms := roomMap.put(state.rooms, roomId, newRoom);
        state.nextRoomId += 1;
        Debug.print("Room created with ID: " # Nat.toText(roomId) # " by host " # Principal.toText(caller));
        roomId;
    };

    public func joinRoom(state : VideoState, caller : Principal, roomId : RoomId, offer : Text) : Bool {
        let roomMap = OrderedMap.Make<RoomId>(Nat.compare);
        switch (roomMap.get(state.rooms, roomId)) {
            case null {
                Debug.print("Room not found: " # Nat.toText(roomId));
                false;
            };
            case (?room) {
                // Host sets offer if empty
                if (caller == room.host and room.offer == null) {
                    let updatedRoom : RoomData = {
                        host = room.host;
                        guest = room.guest;
                        offer = ?offer;
                        answer = room.answer;
                        participants = room.participants;
                    };
                    state.rooms := roomMap.put(state.rooms, roomId, updatedRoom);
                    Debug.print("Host set offer for room " # Nat.toText(roomId));
                    return true;
                };

                // Guest joins if offer exists
                if (room.guest == null and room.offer != null) {
                    let updatedRoom : RoomData = {
                        host = room.host;
                        guest = ?caller;
                        offer = room.offer;
                        answer = room.answer;
                        participants = List.push(caller, room.participants);
                    };
                    state.rooms := roomMap.put(state.rooms, roomId, updatedRoom);
                    Debug.print("Guest joined room " # Nat.toText(roomId));
                    return true;
                };

                Debug.print("❌ joinRoom rejected — invalid state");
                false;
            };
        };
    };

    public func getOffer(state : VideoState, caller : Principal, roomId : RoomId) : ?Text {
        let roomMap = OrderedMap.Make<RoomId>(Nat.compare);
        switch (roomMap.get(state.rooms, roomId)) {
            case null { null };
            case (?room) {
                if (caller == room.host or room.guest == ?caller) {
                    room.offer;
                } else null;
            };
        };
    };

    public func answerOffer(state : VideoState, caller : Principal, roomId : RoomId, answer : Text) : Bool {
        let roomMap = OrderedMap.Make<RoomId>(Nat.compare);
        switch (roomMap.get(state.rooms, roomId)) {
            case null { false };
            case (?room) {
                if (room.guest != ?caller or room.offer == null) return false;
                let updatedRoom : RoomData = {
                    host = room.host;
                    guest = room.guest;
                    offer = room.offer;
                    answer = ?answer;
                    participants = List.push(caller, room.participants);
                };
                state.rooms := roomMap.put(state.rooms, roomId, updatedRoom);
                true;
            };
        };
    };

    public func getAnswer(state : VideoState, caller : Principal, roomId : RoomId) : ?Text {
        let roomMap = OrderedMap.Make<RoomId>(Nat.compare);
        switch (roomMap.get(state.rooms, roomId)) {
            case null { null };
            case (?room) {
                if (caller == room.host or room.guest == ?caller) {
                    room.answer;
                } else null;
            };
        };
    };

    public func getParticipants(state : VideoState, roomId : RoomId) : ?[Principal] {
        let roomMap = OrderedMap.Make<RoomId>(Nat.compare);
        switch (roomMap.get(state.rooms, roomId)) {
            case null { null };
            case (?room) { ?List.toArray(room.participants) };
        };
    };
};
