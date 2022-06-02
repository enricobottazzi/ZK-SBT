pragma circom 2.0.0;

include "../iden3-circuits/lib/utils/claimUtils.circom";

component main {public [sigR8x,sigR8y,sigS,pubKeyX, pubKeyY]} = verifyClaimSignature();