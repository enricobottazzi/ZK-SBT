pragma circom 2.0.0;
include "../../../node_modules/circomlib/circuits/mux1.circom";
include "../../../node_modules/circomlib/circuits/bitify.circom";
include "../../../node_modules/circomlib/circuits/comparators.circom";
include "comparators.circom";
include "../idOwnershipBySignatureWithRelay.circom";
include "query.circom";


/**
credentialAtomicQueryMTP.circom - query issuerClaim value and verify issuerClaim MTP

checks:
- identity ownership
- verify credential subject (verify that identity is an owner of a issuerClaim )
- issuerClaim schema
- issuerClaim ownership and issuance state
- issuerClaim non revocation state
- issuerClaim expiration ?
- query data slots

IdOwnershipLevels - Merkle tree depth level for personal claims
IssuerLevels - Merkle tree depth level for claims issued by the issuer
valueLevels - Number of elements in comparison array for in/notin operation if level =3 number of values for
comparison ["1", "2", "3"]

*/
template CredentialAtomicQueryMTPWithRelay(IdOwnershipLevels, IssuerLevels, RelayLevels, valueArraySize) {

    /*
    >>>>>>>>>>>>>>>>>>>>>>>>>>> Inputs <<<<<<<<<<<<<<<<<<<<<<<<<<<<
    */

    /* user id ownership signals */
    signal input userID;

    signal input relayState;
    signal input userStateInRelayClaimMtp[RelayLevels];
    signal input userStateInRelayClaim[8];
	signal input relayProofValidClaimsTreeRoot;
	signal input relayProofValidRevTreeRoot;
	signal input relayProofValidRootsTreeRoot;    

    signal input userClaimsTreeRoot;
    signal input userAuthClaimMtp[IdOwnershipLevels];
    signal input userAuthClaim[8];

    signal input userRevTreeRoot;
    signal input userAuthClaimNonRevMtp[IdOwnershipLevels];
    signal input userAuthClaimNonRevMtpNoAux;
    signal input userAuthClaimNonRevMtpAuxHi;
    signal input userAuthClaimNonRevMtpAuxHv;

    signal input userRootsTreeRoot;

    signal input challenge;
    signal input challengeSignatureR8x;
    signal input challengeSignatureR8y;
    signal input challengeSignatureS;

    /* issuerClaim signals */
    signal input issuerClaim[8];
    signal input issuerClaimMtp[IssuerLevels];
    signal input issuerClaimClaimsTreeRoot;
    signal input issuerClaimRevTreeRoot;
    signal input issuerClaimRootsTreeRoot;
    signal input issuerClaimIdenState;
    signal input issuerID;

    signal input issuerClaimNonRevMtp[IssuerLevels];
    signal input issuerClaimNonRevMtpNoAux;
    signal input issuerClaimNonRevMtpAuxHi;
    signal input issuerClaimNonRevMtpAuxHv;
    signal input issuerClaimNonRevClaimsTreeRoot;
    signal input issuerClaimNonRevRevTreeRoot;
    signal input issuerClaimNonRevRootsTreeRoot;
    signal input issuerClaimNonRevState;

    /* current time */
    signal input timestamp;

    /** Query */
    signal input claimSchema;
    signal input slotIndex;
    signal input operator;
    signal input value[valueArraySize];

    /*
    >>>>>>>>>>>>>>>>>>>>>>>>>>> End Inputs <<<<<<<<<<<<<<<<<<<<<<<<<<<<
    */

    /* Id ownership check*/
    component userIdOwnership = IdOwnershipBySignatureWithRelay(IdOwnershipLevels, RelayLevels);

    userIdOwnership.userClaimsTreeRoot <== userClaimsTreeRoot; // currentUserStateClaimsTreeRoot
    for (var i=0; i<IdOwnershipLevels; i++) { userIdOwnership.userAuthClaimMtp[i] <== userAuthClaimMtp[i]; }
    for (var i=0; i<8; i++) { userIdOwnership.userAuthClaim[i] <== userAuthClaim[i]; }

    userIdOwnership.userRevTreeRoot <== userRevTreeRoot;  // currentUserStateClaimsRevTreeRoot
    for (var i=0; i<IdOwnershipLevels; i++) { userIdOwnership.userAuthClaimNonRevMtp[i] <== userAuthClaimNonRevMtp[i]; }
    userIdOwnership.userAuthClaimNonRevMtpNoAux <== userAuthClaimNonRevMtpNoAux;
    userIdOwnership.userAuthClaimNonRevMtpAuxHv <== userAuthClaimNonRevMtpAuxHv;
    userIdOwnership.userAuthClaimNonRevMtpAuxHi <== userAuthClaimNonRevMtpAuxHi;

    userIdOwnership.userRootsTreeRoot <== userRootsTreeRoot; // currentUserStateClaimsRootsTreeRoot

    userIdOwnership.challenge <== challenge;
    userIdOwnership.challengeSignatureR8x <== challengeSignatureR8x;
    userIdOwnership.challengeSignatureR8y <== challengeSignatureR8y;
    userIdOwnership.challengeSignatureS <== challengeSignatureS;

    userIdOwnership.userID <== userID;

    userIdOwnership.relayState <== relayState;
    for (var i=0; i<RelayLevels; i++) { userIdOwnership.userStateInRelayClaimMtp[i] <== userStateInRelayClaimMtp[i]; }
    for (var i=0; i<8; i++) { userIdOwnership.userStateInRelayClaim[i] <== userStateInRelayClaim[i]; }
	userIdOwnership.relayProofValidClaimsTreeRoot <== relayProofValidClaimsTreeRoot;
	userIdOwnership.relayProofValidRevTreeRoot <== relayProofValidRevTreeRoot;
	userIdOwnership.relayProofValidRootsTreeRoot <== relayProofValidRootsTreeRoot;

    // verify issuerClaim issued and not revoked
    component vci = verifyClaimIssuanceNonRev(IssuerLevels);
    for (var i=0; i<8; i++) { vci.claim[i] <== issuerClaim[i]; }
    for (var i=0; i<IssuerLevels; i++) { vci.claimIssuanceMtp[i] <== issuerClaimMtp[i]; }
    vci.claimIssuanceClaimsTreeRoot <== issuerClaimClaimsTreeRoot;
    vci.claimIssuanceRevTreeRoot <== issuerClaimRevTreeRoot;
    vci.claimIssuanceRootsTreeRoot <== issuerClaimRootsTreeRoot;
    vci.claimIssuanceIdenState <== issuerClaimIdenState;

    // non revocation status
    for (var i=0; i<IssuerLevels; i++) { vci.claimNonRevMtp[i] <== issuerClaimNonRevMtp[i]; }
    vci.claimNonRevMtpNoAux <== issuerClaimNonRevMtpNoAux;
    vci.claimNonRevMtpAuxHi <== issuerClaimNonRevMtpAuxHi;
    vci.claimNonRevMtpAuxHv <== issuerClaimNonRevMtpAuxHv;
    vci.claimNonRevIssuerClaimsTreeRoot <== issuerClaimNonRevClaimsTreeRoot;
    vci.claimNonRevIssuerRevTreeRoot <== issuerClaimNonRevRevTreeRoot;
    vci.claimNonRevIssuerRootsTreeRoot <== issuerClaimNonRevRootsTreeRoot;
    vci.claimNonRevIssuerState <== issuerClaimNonRevState;

    // Check issuerClaim is issued to provided identity
    component claimIdCheck = verifyCredentialSubject();
    for (var i=0; i<8; i++) { claimIdCheck.claim[i] <== issuerClaim[i]; }
    claimIdCheck.id <== userID;

    // Verify issuerClaim schema
    component claimSchemaCheck = verifyCredentialSchema();
    for (var i=0; i<8; i++) { claimSchemaCheck.claim[i] <== issuerClaim[i]; }
    claimSchemaCheck.schema <== claimSchema;

    // verify issuerClaim expiration time
    component claimExpirationCheck = verifyExpirationTime();
    for (var i=0; i<8; i++) { claimExpirationCheck.claim[i] <== issuerClaim[i]; }
    claimExpirationCheck.timestamp <== timestamp;

    // Query
    component getClaimValue = getValueByIndex();
    for (var i=0; i<8; i++) { getClaimValue.claim[i] <== issuerClaim[i]; }
    getClaimValue.index <== slotIndex;

    component q = Query(valueArraySize);
    q.in <== getClaimValue.value;
    q.operator <== operator;
    for(var i = 0; i<valueArraySize; i++){q.value[i] <== value[i];}

    q.out === 1;

}
