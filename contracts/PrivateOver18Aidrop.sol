// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

/// @title over18Airdrop
/// @author Enrico Bottazzi
/// @notice Verify attribute of a claim with ZKP and, if verified, execute logic.

interface IVerifier {
    function verifyProof(uint[2] memory a,
            uint[2][2] memory b,
            uint[2] memory c,
            uint[73] memory input)
        external view returns(bool);
}

interface IPrivateSoulMinter {
    function claimSignatureHash(uint256) external view returns (bytes32);
    function ownerOf(uint256) external view returns (address);
}

/// @title An example airdrop contract utilizing zk-proof for claim's attributes verification.
contract PrivateOver18Airdrop {

    IVerifier verifier;
    IPrivateSoulMinter privateSoulMinter;

    mapping(address => bool) public isElegibleForAirdrop;

    constructor(
        IVerifier _verifier,
        IPrivateSoulMinter _privateSoulMinter
    ) {
        verifier = _verifier;
        privateSoulMinter = _privateSoulMinter;
    }

    // @notice verifies the validity of the proof, and make further verifications on the public input of the circuit, if verified add the address to the list of eligible addresses
    function collectAirdrop(uint[2] memory a,
            uint[2][2] memory b,
            uint[2] memory c,
            uint[73] memory publicValues,
            uint256 _tokenID
            ) public 
    {   

        // here I need to call the PrivateSoulMinter contract to get the hash metadata
        // @dev check if the public input used to generate the proof are legit
        require(isElegibleForAirdrop[msg.sender] == false, "You already claimed your airdrop!");
        require(privateSoulMinter.ownerOf(_tokenID) == msg.sender,"This token belongs to another soul");
        require(publicValues[0] == 0x0000000000000000000000000000000000000000000000000000000000000001, "The claim doesn't satisfy the query condition");
        require(privateSoulMinter.claimSignatureHash(_tokenID) == keccak256(abi.encodePacked(publicValues[1], publicValues[2], publicValues[3])), "The signature is not valid");
        require(publicValues[4] == 0x152f5044240ef872cf7e6742fe202b9e07ed6188e9e734c09b06939704852358 && publicValues[5] == 0x2865441cd3e276643c84e55004ad259dff282c8c47c6e8c151afacdadf6f6db3, "The claim was signed by a wrong public key");
        require(publicValues[6] == 0x0000000000000000000000000000000087b9b4c689c2024c54d1bf962cb16bce, "Wrong Claim schema used to generate the proof");
        require(publicValues[7] == 0x0000000000000000000000000000000000000000000000000000000000000002, "Invalid slot index used to generate the proof");
        require(publicValues[8] == 0x0000000000000000000000000000000000000000000000000000000000000003, "Invalid operator used to generate the proof");
        require(publicValues[9] == 0x0000000000000000000000000000000000000000000000000000000000000012, "Invalid threshold value used to generate the proof");

        require(
            verifier.verifyProof(a, b, c, publicValues),
            "Proof verification failed"
        );
        isElegibleForAirdrop[msg.sender] = true;
    }
}
