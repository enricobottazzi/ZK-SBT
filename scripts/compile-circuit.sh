#!/bin/sh

set -e

compile_and_ts() {
    CIRCUIT_PATH="$1"
    CIRCUIT=`basename "$CIRCUIT" .circom`

    mkdir -p "$CIRCUIT"
    cd "$CIRCUIT"

#    if command -v git
#    then
#        echo "Built at `date`" > info.txt
#        git show --summary >> info.txt
#    fi


    cp "$CIRCUIT_PATH" circuit.circom

    set -x
    time circom --r1cs --wasm --sym "$CIRCUIT_PATH"
    mv "${CIRCUIT}.r1cs" circuit.r1cs
    mv "${CIRCUIT}_js/${CIRCUIT}.wasm" circuit.wasm
    mv "${CIRCUIT}.sym" circuit.sym
    snarkjs r1cs info circuit.r1cs
    #snarkjs r1cs export json circuit.r1cs circuit.r1cs.json

#    time snarkjs setup -r circuit.r1cs --pk proving_key.json --vk verification_key.json
    time snarkjs groth16 setup circuit.r1cs "$PTAU" circuit_0000.zkey

    ENTROPY1=$(head -c 1024 /dev/urandom | LC_CTYPE=C tr -dc 'a-zA-Z0-9' | head -c 128)
    ENTROPY2=$(head -c 1024 /dev/urandom | LC_CTYPE=C tr -dc 'a-zA-Z0-9' | head -c 128)
    ENTROPY3=$(head -c 1024 /dev/urandom | LC_CTYPE=C tr -dc 'a-zA-Z0-9' | head -c 128)

    time snarkjs zkey contribute circuit_0000.zkey circuit_0001.zkey --name="1st Contribution" -v -e="$ENTROPY1"
    time snarkjs zkey contribute circuit_0001.zkey circuit_0002.zkey --name="2nd Contribution" -v -e="$ENTROPY2"
    time snarkjs zkey contribute circuit_0002.zkey circuit_0003.zkey --name="3rd Contribution" -v -e="$ENTROPY3"
    time snarkjs zkey verify circuit.r1cs "$PTAU" circuit_0003.zkey
    time snarkjs zkey beacon circuit_0003.zkey circuit_final.zkey 0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f 10 -n="Final Beacon phase2"
    time snarkjs zkey verify circuit.r1cs "$PTAU" circuit_final.zkey
    time snarkjs zkey export verificationkey circuit_final.zkey verification_key.json
    time snarkjs zkey export json circuit_final.zkey circuit_final.zkey.json

    time snarkjs zkey export solidityverifier circuit_final.zkey verifier.sol
    set +x
}

if [ "$#" -ne 2 ]
then
    echo "Usage:   $0 CIRCUIT_PATH $1 PTAU_PATH">&2
    echo "Example: ./compile-circuit.sh example.circom powersOfTau28_hez_final_15.ptau" >&2
    exit 1
fi

set -u

CIRCUIT="$(pwd)/$1"
PTAU="$(pwd)/$2"
PATH="$(pwd)/node_modules/.bin:$PATH"

# npm ci
mkdir -p build

cd build
compile_and_ts "$CIRCUIT"
