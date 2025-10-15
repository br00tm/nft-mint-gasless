import { config as loadEnv } from "dotenv";
import hardhat from "hardhat";

loadEnv();

async function main() {
  const relayersFromEnv = process.env.DEPLOY_RELAYER_ADDRESSES || "";
  const initialRelayers = relayersFromEnv
    .split(",")
    .map((address) => address.trim())
    .filter((address) => address.length > 0);

  const { ethers } = hardhat;
  const AccessNFTGasless = await ethers.getContractFactory("AccessNFTGasless");

  const contract = await AccessNFTGasless.deploy("Gasless Access Pass", "GAP", initialRelayers);
  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log(`AccessNFTGasless deployed at ${address}`);
  console.log("Relayers:", initialRelayers.length > 0 ? initialRelayers.join(", ") : "(none provided)");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
