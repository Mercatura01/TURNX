import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';
import type { Principal as PrincipalType } from '@dfinity/principal';



import type {
  UserProfile, UserInfo, UserRole, ApprovalStatus,
  TurnServerUsage, TurnProvider, Room, ChatMessage,
  BillingRecord, Time
} from '../../../src/declarations/backend/backend.did.d.ts';

export function useUserProfile() {
    const { actor, isFetching } = useActor();
    return useQuery<UserProfile | null>({
      queryKey: ['userProfile'],
      queryFn: async () => {
        if (!actor) return null;
        const result = await actor.getUserProfile();
        return Array.isArray(result) ? result[0] ?? null : null;
      },
      enabled: !!actor && !isFetching,
      staleTime: 5 * 60 * 1000,
      retry: 3,
    });
  }
  
  export function useSaveUserProfile() {
    const { actor } = useActor();
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: async (profile: UserProfile) => {
        if (!actor) throw new Error('No actor available');
        await actor.saveUserProfile(profile);
        return profile;
      },
      onSuccess: (profile) => {
        // Update the cache immediately with the saved profile
        queryClient.setQueryData(['userProfile'], profile);
        // Also invalidate to ensure fresh data
        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        // Also invalidate approval status as profile creation might affect it
        queryClient.invalidateQueries({ queryKey: ['userApprovalStatus'] });
      },
      onError: (error) => {
        console.error('Failed to save user profile:', error);
      },
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
  }
  
  // User Management Queries
  export function useUserApprovalStatus() {
    const { actor, isFetching } = useActor();
    return useQuery<ApprovalStatus>({
      queryKey: ['userApprovalStatus'],
      queryFn: async () => {
        if (!actor) throw new Error('No actor available');
        return actor.getApprovalStatus();
      },
      enabled: !!actor && !isFetching,
      staleTime: 30 * 1000, // 30 seconds
      retry: 3,
    });
  }
  
  export function useIsCurrentUserAdmin() {
    const { actor, isFetching } = useActor();
    return useQuery<boolean>({
      queryKey: ['isCurrentUserAdmin'],
      queryFn: async () => {
        if (!actor) return false;
        return actor.isCurrentUserAdmin();
      },
      enabled: !!actor && !isFetching,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  }
  
  export function useCurrentUserRole() {
    const { actor, isFetching } = useActor();
    return useQuery<UserRole>({
      queryKey: ['currentUserRole'],
      queryFn: async () => {
        if (!actor) throw new Error('No actor available');
        return actor.getCurrentUserRole();
      },
      enabled: !!actor && !isFetching,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  }
  
  export function useListUsers() {
    const { actor, isFetching } = useActor();
    return useQuery<UserInfo[]>({
      queryKey: ['listUsers'],
      queryFn: async () => {
        if (!actor) return [];
        return actor.listUsers();
      },
      enabled: !!actor && !isFetching,
      staleTime: 30 * 1000, // 30 seconds
    });
  }
  
  function parsePrincipal(text: string): Principal {
    try {
      return Principal.fromText(text);
    } catch (e) {
      console.error('Invalid Principal string:', text, e);
      throw new Error('Invalid Principal format');
    }
  }
  
  export function useSetApproval() {
    const { actor } = useActor();
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async ({ user, approval }: { user: string; approval: ApprovalStatus }) => {
        if (!actor) throw new Error('No actor available');
        const principal = Principal.fromText(user); // ✅ Do NOT cast
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['listUsers'] });
      },
      retry: 2,
    });
  }
  
  export function useAssignRole() {
    const { actor } = useActor();
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async ({ user, role }: { user: string; role: UserRole }) => {
        if (!actor) throw new Error('No actor available');
        const principal = Principal.fromText(user); // ✅ Do NOT cast
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['listUsers'] });
      },
      retry: 2,
    });
  }
  // TURN Server Usage Queries
  export function useLogTurnServerUsage() {
    const { actor } = useActor();
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: async ({ serverUrl, sessionId }: { serverUrl: string, sessionId: string }) => {
        if (!actor) throw new Error('No actor');
        return actor.logTurnServerUsage(serverUrl, sessionId);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['turnServerUsage'] });
        queryClient.invalidateQueries({ queryKey: ['allTurnServerUsages'] });
      },
      retry: 2,
    });
  }
  
  export function useGetTurnServerUsage(sessionId: string) {
    const { actor, isFetching } = useActor();
  
    return useQuery<TurnServerUsage | null>({
      queryKey: ['turnServerUsage', sessionId],
      queryFn: async () => {
        if (!actor || !sessionId) return null;
        const res = await actor.getTurnServerUsage(sessionId);
        return Array.isArray(res) ? res[0] ?? null : res;
      },
      enabled: !!actor && !isFetching && !!sessionId,
      staleTime: 60 * 1000, // 1 minute
    });
  }
  
  
  export function useGetAllTurnServerUsages() {
    const { actor, isFetching } = useActor();
    return useQuery<TurnServerUsage[]>({
      queryKey: ['allTurnServerUsages'],
      queryFn: async () => {
        if (!actor) return [];
        return actor.getAllTurnServerUsages();
      },
      enabled: !!actor && !isFetching,
      staleTime: 30 * 1000, // 30 seconds
    });
  }
  
  // TURN Provider Queries
  export function useGetAllTurnProviders() {
    const { actor, isFetching } = useActor();
    return useQuery<TurnProvider[]>({
      queryKey: ['allTurnProviders'],
      queryFn: async () => {
        if (!actor) return [];
        return actor.getAllTurnProviders();
      },
      enabled: !!actor && !isFetching,
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  }
  
  export function useRegisterTurnProvider() {
    const { actor } = useActor();
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: async (params: {
        id: string;
        name: string;
        url: string;
        publicKey: string;
        attestationHash: string | null;
        stakeAmount: bigint;
        location: string;
      }) => {
        if (!actor) throw new Error('No actor');
        return actor.registerTurnProvider(
            params.id,
            params.name,
            params.url,
            params.publicKey,
            params.attestationHash !== null ? [params.attestationHash] : [],
            params.stakeAmount,
            params.location
          );
          
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['allTurnProviders'] });
      },
      retry: 2,
    });
  }
  
  // Room Management Queries
  export function useGetAllRooms() {
    const { actor, isFetching } = useActor();
    return useQuery<Room[]>({
      queryKey: ['allRooms'],
      queryFn: async () => {
        if (!actor) return [];
        return actor.getAllRooms();
      },
      enabled: !!actor && !isFetching,
      staleTime: 30 * 1000, // 30 seconds
    });
  }
  
  export function useCreateRoom() {
    const { actor } = useActor();
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: async ({ name, maxParticipants }: { name: string, maxParticipants: bigint }) => {
        if (!actor) throw new Error('No actor');
        return actor.createRoom(name, maxParticipants);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['allRooms'] });
      },
      retry: 2,
    });
  }
  
  // Chat Queries
  export function useGetRoomMessages(roomId: string) {
    const { actor, isFetching } = useActor();
    return useQuery<ChatMessage[]>({
      queryKey: ['roomMessages', roomId],
      queryFn: async () => {
        if (!actor || !roomId) return [];
        return actor.getRoomMessages(roomId);
      },
      enabled: !!actor && !isFetching && !!roomId,
      refetchInterval: 2000, // Refetch every 2 seconds for real-time chat
      staleTime: 1000, // 1 second
    });
  }
  
  export function useSendMessage() {
    const { actor } = useActor();
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: async ({ roomId, message }: { roomId: string, message: string }) => {
        if (!actor) throw new Error('No actor');
        return actor.sendMessage(roomId, message);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['roomMessages', variables.roomId] });
      },
      retry: 2,
    });
  }
  
  // Billing Queries
  export function useGetBillingRecords() {
    const { actor, isFetching } = useActor();
    return useQuery<BillingRecord[]>({
      queryKey: ['billingRecords'],
      queryFn: async () => {
        if (!actor) return [];
        return actor.getBillingRecords();
      },
      enabled: !!actor && !isFetching,
      staleTime: 60 * 1000, // 1 minute
    });
  }
  
  export function useRecordBilling() {
    const { actor } = useActor();
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: async (params: {
        sessionId: string;
        providerId: string;
        startTime: Time;
        endTime: Time;
        costPerMinute: number;
      }) => {
        if (!actor) throw new Error('No actor');
        return actor.recordBilling(
          params.sessionId,
          params.providerId,
          params.startTime,
          params.endTime,
          params.costPerMinute
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['billingRecords'] });
      },
      retry: 2,
    });
  }
  



