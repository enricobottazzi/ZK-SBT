pragma circom 2.0.0;

include "../../../node_modules/circomlib/circuits/bitify.circom";
include "../../../node_modules/circomlib/circuits/eddsaposeidon.circom";
include "../../../node_modules/circomlib/circuits/smt/smtverifier.circom";
include "../../../node_modules/circomlib/circuits/mux3.circom";
include "../../../node_modules/circomlib/circuits/mux1.circom";
include "../../../node_modules/circomlib/circuits/mux2.circom";

// getClaimSubjectOtherIden checks that a claim Subject is OtherIden and outputs the identity within.
template getClaimSubjectOtherIden() {
	signal input claim[8];
	signal output id;

    // get header flags from claim.
	component header = getClaimHeader();
	for (var i=0; i<8; i++) { header.claim[i] <== claim[i]; }

    // get subject location from header flags.
    component subjectLocation = getSubjectLocation();
    for (var i = 0; i < 32; i++) { subjectLocation.claimFlags[i] <== header.claimFlags[i]; }

    component mux = Mux2();
    component n2b = Num2Bits(2);
    n2b.in <== subjectLocation.out;

    mux.s[0] <== n2b.out[0];
    mux.s[1] <== n2b.out[1];

    mux.c[0] <== 0;
    mux.c[1] <== 0;
    mux.c[2] <== claim[0*4 + 1];
    mux.c[3] <== claim[1*4 + 1];

    id <== mux.out;
}


// getClaimHeader gets the header of a claim, outputing the claimType as an
// integer and the claimFlags as a bit array.
template getClaimHeader() {
	signal input claim[8];

	signal output claimType;
	signal output claimFlags[32];

 	component i0Bits = Num2Bits(256);
	i0Bits.in <== claim[0];

	component claimTypeNum = Bits2Num(128);

	for (var i=0; i<128; i++) {
		claimTypeNum.in[i] <== i0Bits.out[i];
	}
	claimType <== claimTypeNum.out;

	for (var i=0; i<32; i++) {
		claimFlags[i] <== i0Bits.out[128 + i];
	}
}

// getClaimSchema gets the schema of a claim
template getClaimSchema() {
	signal input claim[8];

	signal output schema;

 	component i0Bits = Num2Bits(256);
	i0Bits.in <== claim[0];

	component schemaNum = Bits2Num(128);

	for (var i=0; i<128; i++) {
		schemaNum.in[i] <== i0Bits.out[i];
	}
	schema <== schemaNum.out;
}

// getClaimRevNonce gets the revocation nonce out of a claim outputing it as an integer.
template getClaimRevNonce() {
	signal input claim[8];

	signal output revNonce;

	component claimRevNonce = Bits2Num(64);

 	component v0Bits = Num2Bits(256);
	v0Bits.in <== claim[4];
	for (var i=0; i<64; i++) {
		claimRevNonce.in[i] <== v0Bits.out[i];
	}
	revNonce <== claimRevNonce.out;
}

//  getClaimHiHv calculates the hashes Hi and Hv of a claim (to be used as
//  key,value in an SMT).
template getClaimHiHv() {
	signal input claim[8];

	signal output hi;
	signal output hv;

	component hashHi = Poseidon(4);
	for (var i=0; i<4; i++) {
		hashHi.inputs[i] <== claim[i];
	}
	hi <== hashHi.out;

	component hashHv = Poseidon(4);
	for (var i=0; i<4; i++) {
		hashHv.inputs[i] <== claim[4 + i];
	}
	hv <== hashHv.out;
}

//  getClaimHash calculates the hash a claim
template getClaimHash() {
	signal input claim[8];
	signal output hash;
	signal output hi;
	signal output hv;

    component hihv = getClaimHiHv();
	for (var i=0; i<8; i++) {
		hihv.claim[i] <== claim[i];
	}

	component hashAll = Poseidon(2);
	hashAll.inputs[0] <== hihv.hi;
	hashAll.inputs[1] <== hihv.hv;
	hash <== hashAll.out;
	hi <== hihv.hi;
	hv <== hihv.hv;
}

// verifyCredentialSubject verifies that claim is issued to a specified identity
template verifyCredentialSubject() {
	signal input claim[8];
	signal input id;

	component header = getClaimHeader();
	for (var i=0; i<8; i++) { header.claim[i] <== claim[i]; }

	component subjectOtherIden = getClaimSubjectOtherIden();
	for (var i=0; i<8; i++) { subjectOtherIden.claim[i] <== claim[i]; }

    subjectOtherIden.id === id;
}

// verifyCredentialSchema verifies that claim matches provided schema
template verifyCredentialSchema() {
	signal input claim[8];
	signal input schema;

	component claimSchema = getClaimSchema();
	for (var i=0; i<8; i++) { claimSchema.claim[i] <== claim[i]; }

	claimSchema.schema === schema;
}

// verifyClaimSignature verifies that claim is signed with the provided public key
template verifyClaimSignature() {
	signal input claim[8];
	signal input sigR8x;
	signal input sigR8y;
	signal input sigS;
	signal input pubKeyX;
	signal input pubKeyY;

    component hash = getClaimHash();
    for (var i=0; i<8; i++) { hash.claim[i] <== claim[i]; }

    // signature verification
    component sigVerifier = EdDSAPoseidonVerifier();
    sigVerifier.enabled <== 1;

    sigVerifier.Ax <== pubKeyX;
    sigVerifier.Ay <== pubKeyY;

    sigVerifier.S <== sigS;
    sigVerifier.R8x <== sigR8x;
    sigVerifier.R8y <== sigR8y;

    sigVerifier.M <== hash.hash;
}

template checkDataSignatureWithPubKeyInClaim() {
    signal input claim[8];
    signal input signatureS;
    signal input signatureR8X;
    signal input signatureR8Y;
    signal input data;

    component getPubKey = getPubKeyFromClaim();
    for (var i=0; i<8; i++){ getPubKey.claim[i] <== claim[i]; }

    component sigVerifier = EdDSAPoseidonVerifier();
    sigVerifier.enabled <== 1;
    sigVerifier.Ax <== getPubKey.Ax;
    sigVerifier.Ay <== getPubKey.Ay;
    sigVerifier.S <== signatureS;
    sigVerifier.R8x <== signatureR8X;
    sigVerifier.R8y <== signatureR8Y;
    sigVerifier.M <== data;
}

template getPubKeyFromClaim() {
    signal input claim[8];
    signal output Ax;
    signal output Ay;

    Ax <== claim[2]; // Ax should be in indexSlotA
    Ay <== claim[3]; // Ay should be in indexSlotB
}

// getValueByIndex select slot from claim by given index
template getValueByIndex(){
  signal input claim[8];
  signal input index;
  signal output value; // value from the selected slot claim[index]

  component mux = Mux3();
  component n2b = Num2Bits(8);
  n2b.in <== index;
  for(var i=0;i<8;i++){
    mux.c[i] <== claim[i];
  }

  mux.s[0] <== n2b.out[0];
  mux.s[1] <== n2b.out[1];
  mux.s[2] <== n2b.out[2];

  value <== mux.out;
}

// verify that the claim has expiration time and it is less then timestamp
template verifyExpirationTime() {
    signal input claim[8];
    signal input timestamp;

    component header = getClaimHeader();
    for (var i=0; i<8; i++) { header.claim[i] <== claim[i]; }

    component expirationComp =  getClaimExpiration();
    for (var i=0; i<8; i++) { expirationComp.claim[i] <== claim[i]; }

    component lt = LessEqThan(252); // timestamp < expirationComp.expiration
    lt.in[0] <== timestamp;
    lt.in[1] <== expirationComp.expiration;

    component res = Mux1();
    res.c[0] <== 1;
    res.c[1] <== lt.out;
    res.s <== header.claimFlags[3];

    res.out === 1;
}

// getClaimExpiration extract expiration date from claim
template getClaimExpiration() {
	signal input claim[8];

	signal output expiration;

	component expirationBits = Bits2Num(64);

 	component v0Bits = Num2Bits(256);
	v0Bits.in <== claim[4];
	for (var i=0; i<64; i++) {
		expirationBits.in[i] <== v0Bits.out[i+64];
	}
	expiration <== expirationBits.out;
}

// getSubjectLocation extract subject from claim flags.
template getSubjectLocation() {
    signal input claimFlags[32];
    signal output out;

    component subjectBits = Bits2Num(3);

    for (var i=0; i<3; i++) {
        subjectBits.in[i] <== claimFlags[i];
    }

    out <== subjectBits.out;
}

// isExpirable return 1 if expiration flag is set otherwise 0.
template isExpirable() {
        signal input claimFlags[32];
        signal output out;

        out <== claimFlags[3];
}

// isUpdatable return 1 if updatable flag is set otherwise 0.
template isUpdatable() {
        signal input claimFlags[32];
        signal output out;

        out <== claimFlags[4];
}
