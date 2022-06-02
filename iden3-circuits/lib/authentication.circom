pragma circom 2.0.0;

include "idOwnershipBySignature.circom";

template VerifyAuthentication(IdOwnershipLevels) {

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
	
    signal input userState;
    // we have no constraints for "id" in this circuit, however we introduce "id" input here
    // as it serves as public input which should be the same for prover and verifier
    signal input userID;

    component checkIdOwnership = IdOwnershipBySignature(IdOwnershipLevels);

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
    
    checkIdOwnership.userState <== userState;
}
