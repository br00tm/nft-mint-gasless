import { config as loadEnv } from "dotenv";
import hardhat from "hardhat";

loadEnv();

async function main() {
  const address = process.env.CONTRACT_ADDRESS;
  if (!address) {
    throw new Error("CONTRACT_ADDRESS is not defined in the environment");
  }

  const relayersFromEnv = process.env.DEPLOY_RELAYER_ADDRESSES || "";
  const initialRelayers = relayersFromEnv
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  await hardhat.run("verify:verify", {
    address,
    constructorArguments: ["Gasless Access Pass", "GAP", initialRelayers],
  });

  console.log(`Verification request sent for ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
