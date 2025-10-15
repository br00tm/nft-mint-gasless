export const CONTRACT_NAME = "AccessNFTGasless";
export const CONTRACT_VERSION = "1";
export const TARGET_CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID || 11155111);
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "";
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const DEFAULT_METADATA = {
  name: "Gasless Access Pass",
  description: "NFT exclusivo cunhado via assinatura off-chain.",
  image: import.meta.env.VITE_DEFAULT_IMAGE || "https://placehold.co/600x600/020617/ffffff?text=Gasless+Mint",
  external_url: "https://example.com"
};
