import { Router } from "express";
import { ethers } from "ethers";
import { getContract } from "../services/ethersProvider.js";
import { isDeadlineValid, verifyMintSignature } from "../services/verifySignature.js";
import logger from "../utils/logger.js";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const { to, signature, nonce, deadline, uri } = req.body ?? {};

    if (!to || !signature || nonce === undefined || deadline === undefined || typeof uri !== "string") {
      const error = new Error("Missing required fields: to, signature, nonce, deadline, uri");
      error.status = 400;
      throw error;
    }

    const normalizedTo = ethers.getAddress(to);
    let parsedNonce;
    let parsedDeadline;

    try {
      parsedNonce = BigInt(nonce);
      parsedDeadline = BigInt(deadline);
    } catch (parseError) {
      const error = new Error("Nonce and deadline must be integers");
      error.status = 400;
      throw error;
    }

    if (!isDeadlineValid(parsedDeadline)) {
      const error = new Error("Signature deadline has expired");
      error.status = 400;
      throw error;
    }

    const isValidSignature = await verifyMintSignature({
      to: normalizedTo,
      nonce: parsedNonce,
      deadline: parsedDeadline,
      uri,
      signature
    });

    if (!isValidSignature) {
      const error = new Error("Invalid signature for request");
      error.status = 400;
      throw error;
    }

    const contract = getContract();
    const tx = await contract.mintWithSignature(
      {
        to: normalizedTo,
        nonce: parsedNonce,
        deadline: parsedDeadline,
        uri
      },
      signature
    );

    logger.info(`Submitted mint tx ${tx.hash} for ${normalizedTo}`);

    const receipt = await tx.wait();

    let tokenId = null;
    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog(log);
        if (parsedLog && parsedLog.name === "Minted") {
          tokenId = parsedLog.args.tokenId.toString();
          break;
        }
      } catch {
        // Ignore logs that do not belong to the contract
      }
    }

    res.status(201).json({
      success: true,
      txHash: tx.hash,
      tokenId,
      to: normalizedTo
    });
  } catch (error) {
    next(error);
  }
});

export default router;
