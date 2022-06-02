pragma circom 2.0.0;

include "idOwnershipBySignatureWithRelay.circom";

template VerifyAuthenticationWithRelay(IdOwnershipLevels, RelayLevels) {

	signal input userClaimsTreeRoot;
	signal input userAuthClaimMtp[IdOwnershipLevels];
	signal input userAuthClaim[8];

	signal input userRevTreeRoot;
    signal input userAuthClaimNonRevMtp[IdOwnershipLevels];
    signal input userAuthClaimNonRevMtpNoAux;
    signal input userAuthClaimNonRevMtpAuxHv;
    signal input userAuthClaimNonRevMtpAuxHi;

	signal input userRootsTreeRoot;

	signal input challenge;
	signal input challengeSignatureR8x;
	signal input challengeSignatureR8y;
	signal input challengeSignatureS;

    //todo check if userState should be here
    // we have no constraints for "state" in this circuit, however we introduce "state" input here
    // as it serves as public input which should be the same for prover and verifier
    signal input userState;
    signal input userID;

    signal input relayState;
    signal input userStateInRelayClaimMtp[RelayLevels];
    signal input userStateInRelayClaim[8];
    signal input relayProofValidClaimsTreeRoot;
    signal input relayProofValidRevTreeRoot;
    signal input relayProofValidRootsTreeRoot;

    component checkIdOwnership = IdOwnershipBySignatureWithRelay(IdOwnershipLevels, RelayLevels);

	checkIdOwnership.userClaimsTreeRoot <== userClaimsTreeRoot;
	for (var i=0; i<IdOwnershipLevels; i++) { checkIdOwnership.userAuthClaimMtp[i] <== userAuthClaimMtp[i]; }
    for (var i=0; i<8; i++) { checkIdOwnership.userAuthClaim[i] <== userAuthClaim[i]; }

	checkIdOwnership.userRevTreeRoot <== userRevTreeRoot;
	for (var i=0; i<IdOwnershipLevels; i++) { checkIdOwnership.userAuthClaimNonRevMtp[i] <== userAuthClaimNonRevMtp[i]; }
	checkIdOwnership.userAuthClaimNonRevMtpNoAux <== userAuthClaimNonRevMtpNoAux;
	checkIdOwnership.userAuthClaimNonRevMtpAuxHv <== userAuthClaimNonRevMtpAuxHv;
	checkIdOwnership.userAuthClaimNonRevMtpAuxHi <== userAuthClaimNonRevMtpAuxHi;

    checkIdOwnership.userRootsTreeRoot <== userRootsTreeRoot;

    checkIdOwnership.challenge <== challenge;
    checkIdOwnership.challengeSignatureR8x <== challengeSignatureR8x;
    checkIdOwnership.challengeSignatureR8y <== challengeSignatureR8y;
    checkIdOwnership.challengeSignatureS <== challengeSignatureS;
    
    checkIdOwnership.userID <== userID;

    checkIdOwnership.relayState <== relayState;
    for (var i=0; i<RelayLevels; i++) { checkIdOwnership.userStateInRelayClaimMtp[i] <== userStateInRelayClaimMtp[i]; }
    for (var i=0; i<8; i++) { checkIdOwnership.userStateInRelayClaim[i] <== userStateInRelayClaim[i]; }
    checkIdOwnership.relayProofValidClaimsTreeRoot <== relayProofValidClaimsTreeRoot;
    checkIdOwnership.relayProofValidRevTreeRoot <== relayProofValidRevTreeRoot;
    checkIdOwnership.relayProofValidRootsTreeRoot <== relayProofValidRootsTreeRoot;
}
