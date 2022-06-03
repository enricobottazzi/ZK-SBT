pragma circom 2.0.0;

include "lib/sbt-verification.circom";

component main {public [sigR8x,sigR8y,sigS,pubKeyX,pubKeyY,claimSchema,slotIndex,operator,value]} = SbtVerification(64);