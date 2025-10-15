// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

library VerifySignature {
    using ECDSA for bytes32;

    function recoverSigner(bytes32 digest, bytes memory signature) internal pure returns (address) {
        return digest.recover(signature);
    }
}
