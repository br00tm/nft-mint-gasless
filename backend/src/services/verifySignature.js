import { ethers } from "ethers";
import { getContract, getProvider } from "./ethersProvider.js";

const TYPES = {
  MintRequest: [
    { name: "to", type: "address" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
    { name: "uri", type: "string" }
  ]
};

export async function verifyMintSignature({ to, nonce, deadline, uri, signature }) {
  const contract = getContract();
  const provider = getProvider();
  const { chainId } = await provider.getNetwork();

  const normalizedTo = ethers.getAddress(to);

  const domain = {
    name: "AccessNFTGasless",
    version: "1",
    chainId: Number(chainId),
    verifyingContract: contract.target
  };

  const recovered = ethers.verifyTypedData(
    domain,
    TYPES,
    {
      to: normalizedTo,
      nonce,
      deadline,
      uri
    },
    signature
  );

  return ethers.getAddress(recovered) === normalizedTo;
}

export function isDeadlineValid(deadline) {
  const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));
  return deadline >= currentTimestamp;
}
