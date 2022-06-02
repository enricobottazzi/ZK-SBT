
pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/babyjub.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";
include "../../node_modules/circomlib/circuits/smt/smtverifier.circom";
include "../../node_modules/circomlib/circuits/smt/smtprocessor.circom";
include "idOwnershipBySignature.circom";

template StateTransition(nLevels) {
    // we have no constraints for "id" in this circuit, however we introduce "id" input here
    // as it serves as public input which should be the same for prover and verifier
    signal input userID;
    signal input oldUserState;
    signal input newUserState;
    signal input isOldStateGenesis;

    signal input claimsTreeRoot;
    signal input authClaimMtp[nLevels];
    signal input authClaim[8];

    signal input revTreeRoot;
    signal input authClaimNonRevMtp[nLevels];
    signal input authClaimNonRevMtpNoAux;
    signal input authClaimNonRevMtpAuxHv;
    signal input authClaimNonRevMtpAuxHi;

    signal input rootsTreeRoot;

    signal input signatureR8x;
    signal input signatureR8y;
    signal input signatureS;

    component cutId = cutId();
    cutId.in <== userID;

    component cutState = cutState();
    cutState.in <== oldUserState;

    component isCutIdEqualToCutState = IsEqual();
    isCutIdEqualToCutState.in[0] <== cutId.out;
    isCutIdEqualToCutState.in[1] <== cutState.out;

    // if isOldStateGenesis != 0 then old state is genesis
    // and we must check that userID was derived from that state
    (1 - isCutIdEqualToCutState.out) * isOldStateGenesis === 0;

    // check newUserState is not zero
    component stateIsNotZero = IsZero();
    stateIsNotZero.in <== newUserState;
    stateIsNotZero.out === 0;

    // old & new state checks
    component oldNewNotEqual = IsEqual();
    oldNewNotEqual.in[0] <== oldUserState;
    oldNewNotEqual.in[1] <== newUserState;
    oldNewNotEqual.out === 0;

    // check userID ownership by correct signature of a hash of old state and new state
    component challenge = Poseidon(2);
    challenge.inputs[0] <== oldUserState;
    challenge.inputs[1] <== newUserState;

    component checkIdOwnership = IdOwnershipBySignature(nLevels);

    checkIdOwnership.userClaimsTreeRoot <== claimsTreeRoot;
    for (var i=0; i<nLevels; i++) { checkIdOwnership.userAuthClaimMtp[i] <== authClaimMtp[i]; }
    for (var i=0; i<8; i++) { checkIdOwnership.userAuthClaim[i] <== authClaim[i]; }

    checkIdOwnership.userRevTreeRoot <== revTreeRoot;
    for (var i=0; i<nLevels; i++) { checkIdOwnership.userAuthClaimNonRevMtp[i] <== authClaimNonRevMtp[i]; }
    checkIdOwnership.userAuthClaimNonRevMtpNoAux <== authClaimNonRevMtpNoAux;
    checkIdOwnership.userAuthClaimNonRevMtpAuxHv <== authClaimNonRevMtpAuxHv;
    checkIdOwnership.userAuthClaimNonRevMtpAuxHi <== authClaimNonRevMtpAuxHi;

    checkIdOwnership.userRootsTreeRoot <== rootsTreeRoot;

    checkIdOwnership.challenge <== challenge.out;
    checkIdOwnership.challengeSignatureR8x <== signatureR8x;
    checkIdOwnership.challengeSignatureR8y <== signatureR8y;
    checkIdOwnership.challengeSignatureS <== signatureS;

    checkIdOwnership.userState <== oldUserState;
}
