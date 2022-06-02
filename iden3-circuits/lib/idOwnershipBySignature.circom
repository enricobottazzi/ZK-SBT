/*
# idOwnershipBySignature.circom

Circuit to check that the prover is the owner of the identity
- prover is owner of the private key
- prover public key is in a ClaimKeyBBJJ that is inside its Identity State (in Claim tree)
*/

pragma circom 2.0.0;

include "utils/claimUtils.circom";
include "utils/treeUtils.circom";

template IdOwnershipBySignature(nLevels) {
    signal input userState;

	signal input userClaimsTreeRoot;
	signal input userAuthClaimMtp[nLevels];
	signal input userAuthClaim[8];

	signal input userRevTreeRoot;
    signal input userAuthClaimNonRevMtp[nLevels];
    signal input userAuthClaimNonRevMtpNoAux;
    signal input userAuthClaimNonRevMtpAuxHi;
    signal input userAuthClaimNonRevMtpAuxHv;

	signal input userRootsTreeRoot;

	signal input challenge;
	signal input challengeSignatureR8x;
	signal input challengeSignatureR8y;
	signal input challengeSignatureS;


    component verifyAuthClaim = VerifyAuthClaimAndSignature(nLevels);
    for (var i=0; i<8; i++) { verifyAuthClaim.authClaim[i] <== userAuthClaim[i]; }
	for (var i=0; i<nLevels; i++) { verifyAuthClaim.authClaimMtp[i] <== userAuthClaimMtp[i]; }
	verifyAuthClaim.claimsTreeRoot <== userClaimsTreeRoot;
	verifyAuthClaim.revTreeRoot <== userRevTreeRoot;
	for (var i=0; i<nLevels; i++) { verifyAuthClaim.authClaimNonRevMtp[i] <== userAuthClaimNonRevMtp[i]; }
	verifyAuthClaim.authClaimNonRevMtpNoAux <== userAuthClaimNonRevMtpNoAux;
	verifyAuthClaim.authClaimNonRevMtpAuxHv <== userAuthClaimNonRevMtpAuxHv;
	verifyAuthClaim.authClaimNonRevMtpAuxHi <== userAuthClaimNonRevMtpAuxHi;

    verifyAuthClaim.challengeSignatureS <== challengeSignatureS;
    verifyAuthClaim.challengeSignatureR8x <== challengeSignatureR8x;
    verifyAuthClaim.challengeSignatureR8y <== challengeSignatureR8y;
    verifyAuthClaim.challenge <== challenge;

    component checkUserState = checkIdenStateMatchesRoots();
    checkUserState.claimsTreeRoot <== userClaimsTreeRoot;
    checkUserState.revTreeRoot <== userRevTreeRoot;
    checkUserState.rootsTreeRoot <== userRootsTreeRoot;
    checkUserState.expectedState <== userState;
}

