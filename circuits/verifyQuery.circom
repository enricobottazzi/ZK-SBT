pragma circom 2.0.0;

include "lib/issuerQuery.circom";

component main {public [claimSchema,slotIndex,operator, value]} = SBTClaimQuery(64);