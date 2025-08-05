"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartialIdentity = void 0;
const principal_1 = require("@dfinity/principal");
/**
 * A partial delegated identity, representing a delegation chain and the public key that it targets
 */
class PartialIdentity {
    #inner;
    /**
     * The raw public key of this identity.
     */
    get rawKey() {
        return this.#inner.rawKey;
    }
    /**
     * The DER-encoded public key of this identity.
     */
    get derKey() {
        return this.#inner.derKey;
    }
    /**
     * The DER-encoded public key of this identity.
     */
    toDer() {
        return this.#inner.toDer();
    }
    /**
     * The inner {@link PublicKey} used by this identity.
     */
    getPublicKey() {
        return this.#inner;
    }
    /**
     * The {@link Principal} of this identity.
     */
    getPrincipal() {
        if (!this.#inner.rawKey) {
            throw new Error('Cannot get principal from a public key without a raw key.');
        }
        return principal_1.Principal.fromUint8Array(new Uint8Array(this.#inner.rawKey));
    }
    /**
     * Required for the Identity interface, but cannot implemented for just a public key.
     */
    transformRequest() {
        return Promise.reject('Not implemented. You are attempting to use a partial identity to sign calls, but this identity only has access to the public key.To sign calls, use a DelegationIdentity instead.');
    }
    constructor(inner) {
        this.#inner = inner;
    }
}
exports.PartialIdentity = PartialIdentity;
//# sourceMappingURL=partial.js.map