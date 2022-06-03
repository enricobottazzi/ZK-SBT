#!/bin/sh

set -e

generate_proof() {
  CIRCUIT="$(pwd)/build/$1"
  CIRCUIT_JS="$(pwd)/build/$1/$1_js"

  node $CIRCUIT_JS/generate_witness.js $CIRCUIT/circuit.wasm $CIRCUIT_JS/input.json $CIRCUIT_JS/witness.wtns

  snarkjs groth16 prove $CIRCUIT/circuit_final.zkey $CIRCUIT_JS/witness.wtns $CIRCUIT_JS/proof.json $CIRCUIT_JS/public.json

  snarkjs groth16 verify $CIRCUIT/verification_key.json $CIRCUIT_JS/public.json $CIRCUIT_JS/proof.json
}

generate_proof $1
