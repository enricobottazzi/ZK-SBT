pragma circom 2.0.0;
include "../../../node_modules/circomlib/circuits/mux1.circom";
include "../../../node_modules/circomlib/circuits/bitify.circom";
include "../../../node_modules/circomlib/circuits/comparators.circom";
include "comparators.circom";
include "../idOwnershipBySignature.circom";
include "query.circom";


/**
credentialAtomicQueryMTP.circom - query issuerClaim value and verify issuerClaim MTP

checks:
- identity ownership
- verify credential subject (verify that identity is an owner of a claim )
- claim schema
- claim ownership and issuance state
- claim non revocation state
- claim expiration ?
- query data slots

IdOwnershipLevels - Merkle tree depth level for personal claims
IssuerLevels - Merkle tree depth level for claims issued by the issuer
valueLevels - Number of elements in comparison array for in/notin operation if level =3 number of values for
comparison ["1", "2", "3"]

*/
template CredentialAtomicQueryMTP(IdOwnershipLevels, IssuerLevels, valueArraySize) {

    /*
    >>>>>>>>>>>>>>>>>>>>>>>>>>> Inputs <<<<<<<<<<<<<<<<<<<<<<<<<<<<
    */

    /* userID ownership signals */
    signal input userID;
    signal input userState;

    signal input userClaimsTreeRoot;
    signal input userAuthClaimMtp[IdOwnershipLevels];
    signal input userAuthClaim[8];

    signal input userRevTreeRoot;
    signal input userAuthClaimNonRevMtp[IdOwnershipLevels];
    signal input userAuthClaimNonRevMtpNoAux;
    signal input userAuthClaimNonRevMtpAuxHi;
    signal input userAuthClaimNonRevMtpAuxHv;

    signal input userRootsTreeRoot;

    /* signature*/
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

    // issuerClaim non rev inputs
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
    component userIdOwnership = IdOwnershipBySignature(IdOwnershipLevels);

    userIdOwnership.userClaimsTreeRoot <== userClaimsTreeRoot; // currentHolderStateClaimsTreeRoot
    for (var i=0; i<IdOwnershipLevels; i++) { userIdOwnership.userAuthClaimMtp[i] <== userAuthClaimMtp[i]; }
    for (var i=0; i<8; i++) { userIdOwnership.userAuthClaim[i] <==userAuthClaim[i]; }

    userIdOwnership.userRevTreeRoot <== userRevTreeRoot;  // currentHolderStateClaimsRevTreeRoot
    for (var i=0; i<IdOwnershipLevels; i++) { userIdOwnership.userAuthClaimNonRevMtp[i] <== userAuthClaimNonRevMtp[i]; }
    userIdOwnership.userAuthClaimNonRevMtpNoAux <== userAuthClaimNonRevMtpNoAux;
    userIdOwnership.userAuthClaimNonRevMtpAuxHv <== userAuthClaimNonRevMtpAuxHv;
    userIdOwnership.userAuthClaimNonRevMtpAuxHi <== userAuthClaimNonRevMtpAuxHi;

    userIdOwnership.userRootsTreeRoot <== userRootsTreeRoot; // currentHolderStateClaimsRootsTreeRoot

    userIdOwnership.challenge <== challenge;
    userIdOwnership.challengeSignatureR8x <== challengeSignatureR8x;
    userIdOwnership.challengeSignatureR8y <== challengeSignatureR8y;
    userIdOwnership.challengeSignatureS <== challengeSignatureS;

    userIdOwnership.userState <== userState;

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