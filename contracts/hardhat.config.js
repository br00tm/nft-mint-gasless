import { config as loadEnv } from "dotenv";
import "@nomicfoundation/hardhat-toolbox";

loadEnv();

const { RPC_URL, RELAYER_PRIVATE_KEY } = process.env;

/** @type {import("hardhat/config").HardhatUserConfig} */
const config = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: RPC_URL || "",
      accounts: RELAYER_PRIVATE_KEY ? [RELAYER_PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "",
  },
};

export default config;
