pragma circom 2.0.0;

include "lib/verify-claim.circom";

component main {public [sigR8x,sigR8y,sigS,pubKeyX,pubKeyY,claimSchema,slotIndex,operator,value]} = verifyClaim(64);
