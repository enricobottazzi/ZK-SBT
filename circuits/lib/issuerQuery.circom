pragma circom 2.0.0;
include "../../node_modules/circomlib/circuits/mux3.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";
include "../../iden3-circuits/lib/query/query.circom";
include "../../iden3-circuits/lib/utils/claimUtils.circom";

template SBTClaimQuery(valueArraySize) {

    signal input issuerClaim[8];
    /** Query */
    signal input claimSchema;
    signal input slotIndex;
    signal input operator;
    signal input value[valueArraySize];

    // Verify issuerClaim schema
    component claimSchemaCheck = verifyCredentialSchema();
    for (var i=0; i<8; i++) { claimSchemaCheck.claim[i] <== issuerClaim[i]; }
    claimSchemaCheck.schema <== claimSchema;

    // query
    component getClaimValue = getValueByIndex();
    for (var i=0; i<8; i++) { 
        getClaimValue.claim[i] <== issuerClaim[i];
    }
    
    getClaimValue.index <== slotIndex;

    component q = Query(valueArraySize);
    q.in <== getClaimValue.value;
    q.operator <== operator;
    for(var i = 0; i<valueArraySize; i++){q.value[i] <== value[i];}
    q.out === 1;
}