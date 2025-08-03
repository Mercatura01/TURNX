import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent, Actor } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

import { idlFactory as backend_idlFactoryRaw } from '../../../src/declarations/backend/backend.did.js';
import { canisterId as backendCanisterId } from '../../../src/declarations/backend';
import type { _SERVICE } from '../../../src/declarations/backend/backend.did';

const ACTOR_QUERY_KEY = 'actor';

// Type assertion to ensure idlFactory is treated correctly
const backend_idlFactory = backend_idlFactoryRaw as unknown as IDL.InterfaceFactory;
export function useActor() {
  const queryClient = useQueryClient();

  const actorQuery = useQuery<_SERVICE>({
    queryKey: [ACTOR_QUERY_KEY],
    queryFn: async () => {
      const authClient = await AuthClient.create();
      const identity = authClient.getIdentity();

      const agent = new HttpAgent({ identity });

      // For local development
      if (import.meta.env.DEV) {
        await agent.fetchRootKey();
      }

      const actor = Actor.createActor<_SERVICE>(backend_idlFactory, {
        agent,
        canisterId: backendCanisterId,
      });

      return actor;
    },
    staleTime: Infinity, // Prevent unnecessary re-fetch
  });

  // Invalidate all other queries when a new actor is loaded
  useEffect(() => {
    if (actorQuery.data) {
      queryClient.invalidateQueries({
        predicate: (query) => !query.queryKey.includes(ACTOR_QUERY_KEY),
      });
    }
  }, [actorQuery.data, queryClient]);

  return {
    actor: actorQuery.data ?? null,
    isFetching: actorQuery.isFetching,
  };
}
