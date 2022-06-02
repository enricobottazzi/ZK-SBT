/*
Circuit to check that the prover is the owner of the identity
- prover is owner of the private key
- prover public key is in a ClaimKeyBBJJ that is inside its Identity State (in Claim tree)
- the Identity State, in turn, is inside Relay state as specific claim
*/

pragma circom 2.0.0;

include "utils/claimUtils.circom";
include "utils/treeUtils.circom";

template IdOwnershipBySignatureWithRelay(nLevelsUser, nLevelsRelay) {

    /*
    >>>>>>>>>>>>>>>>>>>>>>>>>>> Inputs <<<<<<<<<<<<<<<<<<<<<<<<<<<<
    */

	signal input userClaimsTreeRoot;
	signal input userAuthClaimMtp[nLevelsUser];
	signal input userAuthClaim[8];

	signal input userRevTreeRoot;
    signal input userAuthClaimNonRevMtp[nLevelsUser];
    signal input userAuthClaimNonRevMtpNoAux;
    signal input userAuthClaimNonRevMtpAuxHi;
    signal input userAuthClaimNonRevMtpAuxHv;

	signal input userRootsTreeRoot;

	signal input challenge;
	signal input challengeSignatureR8x;
	signal input challengeSignatureR8y;
	signal input challengeSignatureS;

    signal input userID;

    signal input relayState;
    signal input userStateInRelayClaimMtp[nLevelsRelay];
    signal input userStateInRelayClaim[8];
	signal input relayProofValidClaimsTreeRoot;
	signal input relayProofValidRevTreeRoot;
	signal input relayProofValidRootsTreeRoot;

    /*
    >>>>>>>>>>>>>>>>>>>>>>>>>>> End Inputs <<<<<<<<<<<<<<<<<<<<<<<<<<<<
    */

    component verifyAuthClaim = VerifyAuthClaimAndSignature(nLevelsUser);
    for (var i=0; i<8; i++) { verifyAuthClaim.authClaim[i] <== userAuthClaim[i]; }
	for (var i=0; i<nLevelsUser; i++) { verifyAuthClaim.authClaimMtp[i] <== userAuthClaimMtp[i]; }
	verifyAuthClaim.claimsTreeRoot <== userClaimsTreeRoot;
	verifyAuthClaim.revTreeRoot <== userRevTreeRoot;
	for (var i=0; i<nLevelsUser; i++) { verifyAuthClaim.authClaimNonRevMtp[i] <== userAuthClaimNonRevMtp[i]; }
	verifyAuthClaim.authClaimNonRevMtpNoAux <== userAuthClaimNonRevMtpNoAux;
	verifyAuthClaim.authClaimNonRevMtpAuxHv <== userAuthClaimNonRevMtpAuxHv;
	verifyAuthClaim.authClaimNonRevMtpAuxHi <== userAuthClaimNonRevMtpAuxHi;

    verifyAuthClaim.challengeSignatureS <== challengeSignatureS;
    verifyAuthClaim.challengeSignatureR8x <== challengeSignatureR8x;
    verifyAuthClaim.challengeSignatureR8y <== challengeSignatureR8y;
    verifyAuthClaim.challenge <== challenge;

	// get claim for identity state and check that it is included into Relay's state

    component checkUserState = checkIdenStateMatchesRoots();
    checkUserState.claimsTreeRoot <== userClaimsTreeRoot;
    checkUserState.revTreeRoot <== userRevTreeRoot;
    checkUserState.rootsTreeRoot <== userRootsTreeRoot;
    checkUserState.expectedState <== userStateInRelayClaim[6];

    // verify relay claim schema
     var RELAY_SCHEMA_HASH  = 114902544861707262506546142943811022306; // hex e22dd9c0f7aef15788c130d4d86c7156
     component verifyRelaySchema  = verifyCredentialSchema();
     for (var i=0; i<8; i++) {
          verifyRelaySchema.claim[i] <== userStateInRelayClaim[i];
     }
     verifyRelaySchema.schema <== RELAY_SCHEMA_HASH;

	component header = getClaimHeader();
	for (var i=0; i<8; i++) { header.claim[i] <== userStateInRelayClaim[i]; }

	component subjectOtherIden = getClaimSubjectOtherIden();
	for (var i=0; i<8; i++) { subjectOtherIden.claim[i] <== userStateInRelayClaim[i]; }

    userID === subjectOtherIden.id;
    component checkUserStateInRelay = checkClaimExists(nLevelsRelay);
    for (var i=0; i<8; i++) { checkUserStateInRelay.claim[i] <== userStateInRelayClaim[i]; }
	for (var i=0; i<nLevelsRelay; i++) { checkUserStateInRelay.claimMTP[i] <== userStateInRelayClaimMtp[i]; }
    checkUserStateInRelay.treeRoot <== relayProofValidClaimsTreeRoot;

    component checkRelayState = checkIdenStateMatchesRoots();
    checkRelayState.claimsTreeRoot <== relayProofValidClaimsTreeRoot;
    checkRelayState.revTreeRoot <== relayProofValidRevTreeRoot;
    checkRelayState.rootsTreeRoot <== relayProofValidRootsTreeRoot;
    checkRelayState.expectedState <== relayState;
}
