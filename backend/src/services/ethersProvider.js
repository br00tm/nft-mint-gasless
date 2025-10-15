import { config as loadEnv } from "dotenv";
import { ethers } from "ethers";
import AccessNFTGasless from "../abi/AccessNFTGasless.json" with { type: "json" };
import logger from "../utils/logger.js";

loadEnv();

const { RPC_URL, RELAYER_PRIVATE_KEY, CONTRACT_ADDRESS } = process.env;

if (!RPC_URL) {
  logger.warn("RPC_URL is not set. Provider will throw if used.");
}
if (!RELAYER_PRIVATE_KEY) {
  logger.warn("RELAYER_PRIVATE_KEY is not set. Transactions cannot be signed.");
}
if (!CONTRACT_ADDRESS) {
  logger.warn("CONTRACT_ADDRESS is not set. Contract calls will fail.");
}

const provider = RPC_URL ? new ethers.JsonRpcProvider(RPC_URL) : null;
const wallet =
  provider && RELAYER_PRIVATE_KEY ? new ethers.Wallet(RELAYER_PRIVATE_KEY, provider) : null;
const contract =
  wallet && CONTRACT_ADDRESS
    ? new ethers.Contract(CONTRACT_ADDRESS, AccessNFTGasless.abi, wallet)
    : null;

export function getProvider() {
  if (!provider) {
    throw new Error("Provider is not configured. Please set RPC_URL");
  }
  return provider;
}

export function getWallet() {
  if (!wallet) {
    throw new Error("Relayer wallet is not configured. Please set RELAYER_PRIVATE_KEY");
  }
  return wallet;
}

export function getContract() {
  if (!contract) {
    throw new Error("Contract is not configured. Please set CONTRACT_ADDRESS");
  }
  return contract;
}
