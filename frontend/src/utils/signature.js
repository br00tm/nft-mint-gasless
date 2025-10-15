import { CONTRACT_ADDRESS, CONTRACT_NAME, CONTRACT_VERSION, TARGET_CHAIN_ID, DEFAULT_METADATA } from "./constants.js";

export const MINT_TYPES = {
  MintRequest: [
    { name: "to", type: "address" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
    { name: "uri", type: "string" }
  ]
};

function toBase64(value) {
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    return window.btoa(unescape(encodeURIComponent(value)));
  }
  if (typeof globalThis !== "undefined" && globalThis.Buffer) {
    return globalThis.Buffer.from(value, "utf-8").toString("base64");
  }
  throw new Error("Base64 encoding is not supported in this environment");
}

export function encodeMetadata(metadata = DEFAULT_METADATA) {
  const json = JSON.stringify(metadata);
  const base64 = toBase64(json);
  return `data:application/json;base64,${base64}`;
}

export function createMintRequest({ account, nonce, minutesToExpire = 10, metadata }) {
  const now = Math.floor(Date.now() / 1000);
  const deadline = BigInt(now + minutesToExpire * 60);

  return {
    to: account,
    nonce: BigInt(nonce ?? 0),
    deadline,
    uri: encodeMetadata(metadata)
  };
}

export async function signMintRequest({ signer, request, contractAddress = CONTRACT_ADDRESS, chainId = TARGET_CHAIN_ID }) {
  if (!contractAddress) {
    throw new Error("CONTRACT_ADDRESS não configurado no frontend");
  }

  const domain = {
    name: CONTRACT_NAME,
    version: CONTRACT_VERSION,
    chainId,
    verifyingContract: contractAddress
  };

  const signature = await signer.signTypedData(domain, MINT_TYPES, request);
  return signature;
}
