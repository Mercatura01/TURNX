"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ed25519KeyIdentity = exports.Ed25519PublicKey = void 0;
const agent_1 = require("@dfinity/agent");
const candid_1 = require("@dfinity/candid");
const ed25519_1 = require("@noble/curves/ed25519");
const utils_1 = require("@noble/hashes/utils");
function isObject(value) {
    return value !== null && typeof value === 'object';
}
class Ed25519PublicKey {
    /**
     * Construct Ed25519PublicKey from an existing PublicKey
     * @param {unknown} maybeKey - existing PublicKey, ArrayBuffer, DerEncodedPublicKey, or hex string
     * @returns {Ed25519PublicKey} Instance of Ed25519PublicKey
     */
    static from(maybeKey) {
        if (typeof maybeKey === 'string') {
            const key = (0, utils_1.hexToBytes)(maybeKey);
            return this.fromRaw(key);
        }
        else if (isObject(maybeKey)) {
            const key = maybeKey;
            if (isObject(key) && Object.hasOwnProperty.call(key, '__derEncodedPublicKey__')) {
                return this.fromDer(key);
            }
            else if (ArrayBuffer.isView(key)) {
                const view = key;
                return this.fromRaw((0, candid_1.uint8FromBufLike)(view.buffer));
            }
            else if (key instanceof ArrayBuffer) {
                return this.fromRaw((0, candid_1.uint8FromBufLike)(key));
            }
            else if ('rawKey' in key && key.rawKey instanceof Uint8Array) {
                return this.fromRaw(key.rawKey);
            }
            else if ('derKey' in key) {
                return this.fromDer(key.derKey);
            }
            else if ('toDer' in key) {
                return this.fromDer(key.toDer());
            }
        }
        throw new Error('Cannot construct Ed25519PublicKey from the provided key.');
    }
    static fromRaw(rawKey) {
        return new Ed25519PublicKey(rawKey);
    }
    static fromDer(derKey) {
        return new Ed25519PublicKey(this.derDecode(derKey));
    }
    // The length of Ed25519 public keys is always 32 bytes.
    static { this.RAW_KEY_LENGTH = 32; }
    static derEncode(publicKey) {
        const key = (0, agent_1.wrapDER)(publicKey, agent_1.ED25519_OID);
        key.__derEncodedPublicKey__ = undefined;
        return key;
    }
    static derDecode(key) {
        const unwrapped = (0, agent_1.unwrapDER)(key, agent_1.ED25519_OID);
        if (unwrapped.length !== this.RAW_KEY_LENGTH) {
            throw new Error('An Ed25519 public key must be exactly 32bytes long');
        }
        return unwrapped;
    }
    #rawKey;
    get rawKey() {
        return this.#rawKey;
    }
    #derKey;
    get derKey() {
        return this.#derKey;
    }
    // `fromRaw` and `fromDer` should be used for instantiation, not this constructor.
    constructor(key) {
        if (key.byteLength !== Ed25519PublicKey.RAW_KEY_LENGTH) {
            throw new Error('An Ed25519 public key must be exactly 32bytes long');
        }
        this.#rawKey = key;
        this.#derKey = Ed25519PublicKey.derEncode(key);
    }
    toDer() {
        return this.derKey;
    }
    toRaw() {
        return this.rawKey;
    }
}
exports.Ed25519PublicKey = Ed25519PublicKey;
/**
 * Ed25519KeyIdentity is an implementation of SignIdentity that uses Ed25519 keys. This class is used to sign and verify messages for an agent.
 */
class Ed25519KeyIdentity extends agent_1.SignIdentity {
    /**
     * Generate a new Ed25519KeyIdentity.
     * @param seed a 32-byte seed for the private key. If not provided, a random seed will be generated.
     * @returns Ed25519KeyIdentity
     */
    static generate(seed) {
        if (seed && seed.length !== 32) {
            throw new Error('Ed25519 Seed needs to be 32 bytes long.');
        }
        if (!seed)
            seed = ed25519_1.ed25519.utils.randomPrivateKey();
        // Check if the seed is all zeros
        if ((0, candid_1.uint8Equals)(seed, new Uint8Array(new Array(32).fill(0)))) {
            console.warn('Seed is all zeros. This is not a secure seed. Please provide a seed with sufficient entropy if this is a production environment.');
        }
        const sk = new Uint8Array(32);
        for (let i = 0; i < 32; i++) {
            sk[i] = seed[i];
        }
        const pk = ed25519_1.ed25519.getPublicKey(sk);
        return Ed25519KeyIdentity.fromKeyPair(pk, sk);
    }
    static fromParsedJson(obj) {
        const [publicKeyDer, privateKeyRaw] = obj;
        return new Ed25519KeyIdentity(Ed25519PublicKey.fromDer((0, utils_1.hexToBytes)(publicKeyDer)), (0, utils_1.hexToBytes)(privateKeyRaw));
    }
    static fromJSON(json) {
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed)) {
            if (typeof parsed[0] === 'string' && typeof parsed[1] === 'string') {
                return this.fromParsedJson([parsed[0], parsed[1]]);
            }
            else {
                throw new Error('Deserialization error: JSON must have at least 2 items.');
            }
        }
        throw new Error(`Deserialization error: Invalid JSON type for string: ${JSON.stringify(json)}`);
    }
    static fromKeyPair(publicKey, privateKey) {
        return new Ed25519KeyIdentity(Ed25519PublicKey.fromRaw(publicKey), privateKey);
    }
    static fromSecretKey(secretKey) {
        const publicKey = ed25519_1.ed25519.getPublicKey(secretKey);
        return Ed25519KeyIdentity.fromKeyPair(publicKey, secretKey);
    }
    #publicKey;
    #privateKey;
    // `fromRaw` and `fromDer` should be used for instantiation, not this constructor.
    constructor(publicKey, privateKey) {
        super();
        this.#publicKey = Ed25519PublicKey.from(publicKey);
        this.#privateKey = privateKey;
    }
    /**
     * Serialize this key to JSON.
     */
    toJSON() {
        return [(0, utils_1.bytesToHex)(this.#publicKey.toDer()), (0, utils_1.bytesToHex)(this.#privateKey)];
    }
    /**
     * Return a copy of the key pair.
     */
    getKeyPair() {
        return {
            secretKey: this.#privateKey,
            publicKey: this.#publicKey,
        };
    }
    /**
     * Return the public key.
     */
    getPublicKey() {
        return this.#publicKey;
    }
    /**
     * Signs a blob of data, with this identity's private key.
     * @param challenge - challenge to sign with this identity's secretKey, producing a signature
     */
    async sign(challenge) {
        // Some implementations of Ed25519 private keys append a public key to the end of the private key. We only want the private key.
        const signature = ed25519_1.ed25519.sign(challenge, this.#privateKey.slice(0, 32));
        // add { __signature__: void; } to the signature to make it compatible with the agent
        Object.defineProperty(signature, '__signature__', {
            enumerable: false,
            value: undefined,
        });
        return signature;
    }
    /**
     * Verify
     * @param sig - signature to verify
     * @param msg - message to verify
     * @param pk - public key
     * @returns - true if the signature is valid, false otherwise
     */
    static verify(sig, msg, pk) {
        const [signature, message, publicKey] = [sig, msg, pk].map(x => {
            if (typeof x === 'string') {
                x = (0, utils_1.hexToBytes)(x);
            }
            return (0, candid_1.uint8FromBufLike)(x);
        });
        return ed25519_1.ed25519.verify(signature, message, publicKey);
    }
}
exports.Ed25519KeyIdentity = Ed25519KeyIdentity;
//# sourceMappingURL=ed25519.js.map