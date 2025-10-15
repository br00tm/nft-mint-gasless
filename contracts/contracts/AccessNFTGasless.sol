// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "./utils/VerifySignature.sol";

contract AccessNFTGasless is ERC721URIStorage, EIP712, Ownable {
    bytes32 public constant MINT_TYPEHASH =
        keccak256("MintRequest(address to,uint256 nonce,uint256 deadline,string uri)");

    struct MintRequest {
        address to;
        uint256 nonce;
        uint256 deadline;
        string uri;
    }

    uint256 private _tokenIdTracker;
    mapping(address => uint256) private _nonces;
    mapping(address => bool) public relayers;

    event RelayerUpdated(address indexed relayer, bool allowed);
    event Minted(address indexed to, uint256 indexed tokenId, string tokenUri);

    modifier onlyRelayer() {
        require(relayers[_msgSender()], "AccessNFTGasless: caller is not an authorized relayer");
        _;
    }

    constructor(string memory name_, string memory symbol_, address[] memory initialRelayers)
        ERC721(name_, symbol_)
        EIP712("AccessNFTGasless", "1")
        Ownable(msg.sender)
    {
        if (initialRelayers.length == 0) {
            relayers[_msgSender()] = true;
            emit RelayerUpdated(_msgSender(), true);
        } else {
            for (uint256 i = 0; i < initialRelayers.length; i++) {
                relayers[initialRelayers[i]] = true;
                emit RelayerUpdated(initialRelayers[i], true);
            }
        }
    }

    function setRelayer(address relayer, bool allowed) external onlyOwner {
        relayers[relayer] = allowed;
        emit RelayerUpdated(relayer, allowed);
    }

    function nextNonce(address account) external view returns (uint256) {
        return _nonces[account];
    }

    function mintWithSignature(MintRequest calldata request, bytes calldata signature)
        external
        onlyRelayer
        returns (uint256)
    {
        require(request.deadline >= block.timestamp, "AccessNFTGasless: signature expired");
        require(request.nonce == _nonces[request.to], "AccessNFTGasless: invalid nonce");

        bytes32 structHash = keccak256(
            abi.encode(
                MINT_TYPEHASH,
                request.to,
                request.nonce,
                request.deadline,
                keccak256(bytes(request.uri))
            )
        );
        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = VerifySignature.recoverSigner(digest, signature);

        require(signer == request.to, "AccessNFTGasless: invalid signer");

        _nonces[request.to] += 1;
        _tokenIdTracker += 1;
        uint256 newTokenId = _tokenIdTracker;

        _safeMint(request.to, newTokenId);
        _setTokenURI(newTokenId, request.uri);

        emit Minted(request.to, newTokenId, request.uri);
        return newTokenId;
    }

}
