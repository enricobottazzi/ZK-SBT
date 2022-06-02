pragma circom 2.0.0;

include "../../../node_modules/circomlib/circuits/comparators.circom";

// nElements - number of value elements
// Example nElements = 3, '1' v ['12', '1231', '9999'], 1 not in array of values
template IN (valueArraySize){

        signal input in;
        signal input value[valueArraySize];
        signal output out;

        component eq[valueArraySize];
        var count = 0;
        for (var i=0; i<valueArraySize; i++) {
            eq[i] = IsEqual();
            eq[i].in[0] <== in;
            eq[i].in[1] <== value[i];
            count += eq[i].out;
        }

        // Greater then
        component gt = GreaterThan(252);
        gt.in[0] <== count;
        gt.in[1] <== 0;

        out <== gt.out; // 1 - if in signal in the list, 0 - if it is not
}