pragma circom 2.0.0;

include "../../../node_modules/circomlib/circuits/bitify.circom";
include "../../../node_modules/circomlib/circuits/eddsaposeidon.circom";
include "../../../node_modules/circomlib/circuits/smt/smtverifier.circom";
include "../../../node_modules/circomlib/circuits/mux3.circom";
include "../../../node_modules/circomlib/circuits/mux1.circom";

// getIdenState caclulates the Identity state out of the claims tree root,
// revocations tree root and roots tree root.
template getIdenState() {
	signal input claimsTreeRoot;
	signal input revTreeRoot;
	signal input rootsTreeRoot;

	signal output idenState;

	component calcIdState = Poseidon(3);
	calcIdState.inputs[0] <== claimsTreeRoot;
	calcIdState.inputs[1] <== revTreeRoot;
	calcIdState.inputs[2] <== rootsTreeRoot;

	idenState <== calcIdState.out;
}

// checkClaimExists verifies that claim is included into the claim tree root
template checkClaimExists(IssuerLevels) {
	signal input claim[8];
	signal input claimMTP[IssuerLevels];
	signal input treeRoot;

	component claimHiHv = getClaimHiHv();
	for (var i=0; i<8; i++) { claimHiHv.claim[i] <== claim[i]; }

	component smtClaimExists = SMTVerifier(IssuerLevels);
	smtClaimExists.enabled <== 1;
	smtClaimExists.fnc <== 0; // Inclusion
	smtClaimExists.root <== treeRoot;
	for (var i=0; i<IssuerLevels; i++) { smtClaimExists.siblings[i] <== claimMTP[i]; }
	smtClaimExists.oldKey <== 0;
	smtClaimExists.oldValue <== 0;
	smtClaimExists.isOld0 <== 0;
	smtClaimExists.key <== claimHiHv.hi;
	smtClaimExists.value <== claimHiHv.hv;
}

template checkClaimNotRevoked(treeLevels) {
    signal input claim[8];
    signal input claimNonRevMTP[treeLevels];
    signal input treeRoot;
    signal input noAux;
    signal input auxHi;
    signal input auxHv;

	component claimRevNonce = getClaimRevNonce();
	for (var i=0; i<8; i++) { claimRevNonce.claim[i] <== claim[i]; }

    component smtClaimNotExists = SMTVerifier(treeLevels);
    smtClaimNotExists.enabled <== 1;
    smtClaimNotExists.fnc <== 1; // Non-inclusion
    smtClaimNotExists.root <== treeRoot;
    for (var i=0; i<treeLevels; i++) { smtClaimNotExists.siblings[i] <== claimNonRevMTP[i]; }
    smtClaimNotExists.oldKey <== auxHi;
    smtClaimNotExists.oldValue <== auxHv;
    smtClaimNotExists.isOld0 <== noAux;
    smtClaimNotExists.key <== claimRevNonce.revNonce;
    smtClaimNotExists.value <== 0;
}

// checkIdenStateMatchesRoots checks that a hash of 3 tree
// roots is equal to expected identity state
template checkIdenStateMatchesRoots() {
	signal input claimsTreeRoot;
	signal input revTreeRoot;
	signal input rootsTreeRoot;
	signal input expectedState;

	component isProofValidIdenState = getIdenState();
	isProofValidIdenState.claimsTreeRoot <== claimsTreeRoot;
	isProofValidIdenState.revTreeRoot <== revTreeRoot;
	isProofValidIdenState.rootsTreeRoot <== rootsTreeRoot;

	isProofValidIdenState.idenState === expectedState;
}

// verifyClaimIssuance verifies that claim is issued by the issuer and not revoked
template verifyClaimIssuanceNonRev(IssuerLevels) {
	signal input claim[8];
	signal input claimIssuanceMtp[IssuerLevels];
	signal input claimIssuanceClaimsTreeRoot;
	signal input claimIssuanceRevTreeRoot;
	signal input claimIssuanceRootsTreeRoot;
	signal input claimIssuanceIdenState;

	signal input claimNonRevMtp[IssuerLevels];
	signal input claimNonRevMtpNoAux;
	signal input claimNonRevMtpAuxHi;
	signal input claimNonRevMtpAuxHv;
	signal input claimNonRevIssuerClaimsTreeRoot;
	signal input claimNonRevIssuerRevTreeRoot;
	signal input claimNonRevIssuerRootsTreeRoot;
	signal input claimNonRevIssuerState;

    // verify country claim is included in claims tree root
    component claimIssuanceCheck = checkClaimExists(IssuerLevels);
    for (var i=0; i<8; i++) { claimIssuanceCheck.claim[i] <== claim[i]; }
    for (var i=0; i<IssuerLevels; i++) { claimIssuanceCheck.claimMTP[i] <== claimIssuanceMtp[i]; }
    claimIssuanceCheck.treeRoot <== claimIssuanceClaimsTreeRoot;

    // verify issuer state includes country claim
    component verifyClaimIssuanceIdenState = checkIdenStateMatchesRoots();
    verifyClaimIssuanceIdenState.claimsTreeRoot <== claimIssuanceClaimsTreeRoot;
    verifyClaimIssuanceIdenState.revTreeRoot <== claimIssuanceRevTreeRoot;
    verifyClaimIssuanceIdenState.rootsTreeRoot <== claimIssuanceRootsTreeRoot;
    verifyClaimIssuanceIdenState.expectedState <== claimIssuanceIdenState;

    // check non-revocation proof for claim
    component verifyClaimNotRevoked = checkClaimNotRevoked(IssuerLevels);
    for (var i=0; i<8; i++) { verifyClaimNotRevoked.claim[i] <== claim[i]; }
    for (var i=0; i<IssuerLevels; i++) {
        verifyClaimNotRevoked.claimNonRevMTP[i] <== claimNonRevMtp[i];
    }
    verifyClaimNotRevoked.noAux <== claimNonRevMtpNoAux;
    verifyClaimNotRevoked.auxHi <== claimNonRevMtpAuxHi;
    verifyClaimNotRevoked.auxHv <== claimNonRevMtpAuxHv;
    verifyClaimNotRevoked.treeRoot <== claimNonRevIssuerRevTreeRoot;

    // check issuer state matches for non-revocation proof
    component verifyClaimNonRevIssuerState = checkIdenStateMatchesRoots();
    verifyClaimNonRevIssuerState.claimsTreeRoot <== claimNonRevIssuerClaimsTreeRoot;
    verifyClaimNonRevIssuerState.revTreeRoot <== claimNonRevIssuerRevTreeRoot;
    verifyClaimNonRevIssuerState.rootsTreeRoot <== claimNonRevIssuerRootsTreeRoot;
    verifyClaimNonRevIssuerState.expectedState <== claimNonRevIssuerState;
}

template VerifyAuthClaimAndSignature(nLevels) {
	signal input claimsTreeRoot;
	signal input authClaimMtp[nLevels];
	signal input authClaim[8];

	signal input revTreeRoot;
    signal input authClaimNonRevMtp[nLevels];
    signal input authClaimNonRevMtpNoAux;
    signal input authClaimNonRevMtpAuxHi;
    signal input authClaimNonRevMtpAuxHv;

	signal input challenge;
	signal input challengeSignatureR8x;
	signal input challengeSignatureR8y;
	signal input challengeSignatureS;

    var AUTH_SCHEMA_HASH  = 304427537360709784173770334266246861770;
    component verifyAuthSchema  = verifyCredentialSchema();
    for (var i=0; i<8; i++) {
            verifyAuthSchema.claim[i] <== authClaim[i];
    }
    verifyAuthSchema.schema <== AUTH_SCHEMA_HASH;

    component claimExists = checkClaimExists(nLevels);
    for (var i=0; i<8; i++) { claimExists.claim[i] <== authClaim[i]; }
	for (var i=0; i<nLevels; i++) { claimExists.claimMTP[i] <== authClaimMtp[i]; }
    claimExists.treeRoot <== claimsTreeRoot;

    component smtClaimNotRevoked = checkClaimNotRevoked(nLevels);
    for (var i=0; i<8; i++) { smtClaimNotRevoked.claim[i] <== authClaim[i]; }
    for (var i=0; i<nLevels; i++) {
        smtClaimNotRevoked.claimNonRevMTP[i] <== authClaimNonRevMtp[i];
    }
    smtClaimNotRevoked.treeRoot <== revTreeRoot;
    smtClaimNotRevoked.noAux <== authClaimNonRevMtpNoAux;
    smtClaimNotRevoked.auxHi <== authClaimNonRevMtpAuxHi;
    smtClaimNotRevoked.auxHv <== authClaimNonRevMtpAuxHv;

    component sigVerifier = checkDataSignatureWithPubKeyInClaim();
    for (var i=0; i<8; i++) {
        sigVerifier.claim[i] <== authClaim[i];
    }
    sigVerifier.signatureS <== challengeSignatureS;
    sigVerifier.signatureR8X <== challengeSignatureR8x;
    sigVerifier.signatureR8Y <== challengeSignatureR8y;
    sigVerifier.data <== challenge;
}

template cutId() {
	signal input in;
	signal output out;

	component idBits = Num2Bits(256);
	idBits.in <== in;

	component cutted = Bits2Num(256-16-16-8);
	for (var i=16; i<256-16-8; i++) {
		cutted.in[i-16] <== idBits.out[i];
	}
	out <== cutted.out;
}

template cutState() {
	signal input in;
	signal output out;

	component stateBits = Num2Bits(256);
	stateBits.in <== in;

	component cutted = Bits2Num(256-16-16-8);
	for (var i=0; i<256-16-16-8; i++) {
		cutted.in[i] <== stateBits.out[i+16+16+8];
	}
	out <== cutted.out;
}
