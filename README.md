# ZKP-SOUL-BOUND-TOKEN

Library to issue Private Soul Bound Token and verify it on-chain. The library leverages @iden3 go-libraries and circuits.

The core data structure to represent the information that wants to be kept private is defined claim. A claim can encompass any type of information about a subject. The Soul Bound Token contains an hash of the signed claim. The owner of the Soul Bound Token can therefore prove information about the claim without revealing it.

The 3 main actors involved in the process are: 

- An issuer, attests someone's age and issues SBT 
- An ID holder, who receives a SBT from the issuer
- A verifier, who opens an airdrop only to 18+ users.  

### Circuits

### Contracts

### Scripts

- to compile the circuit: bash scripts/compile.sh circuits/signature.circom circuits/powersOfTau28_hez_final_15.ptau or bash scripts/compile.sh circuits/claim-query.circom circuits/powersOfTau28_hez_final_15.ptau
- to generate and verify the proof for the signature circuit: bash scripts/generate-signature-proof.sh signature
- to generate and verify the proof for the claim query circuit: bash scripts/generate-claim-query-proof.sh claim-query


### Test

### Design choices

- This library uses babyjubjub signature schema. This schema is more zkp friendly and require far less computation to verify signature inside a circuit. Theoretically, ECDSA schema are already usable inside circuit but the proof generation currently requires a device with 56GB RAM.
- Iden3's claim schema is much more expandable and can include more complex data information (up to 4 data slots) and features such as expiration and revocation

### To-do

- Modify package.json


 circom verifyQuery.circom --r1cs --wasm --sym --c
 1014   snarkjs plonk setup verifyQuery.r1cs powersOfTau28_hez_final_16.ptau verifyQuery.zkey
 1015  node verifyQuery_js/generate_witness.js verifyQuery_js/verifyQuery.wasm input.json witness.wtns
 1016  snarkjs plonk prove verifyQuery.zkey witness.wtns proof.json public.json
 1017  snarkjs zkey export verificationkey verifyQuery.zkey verification_key.json
 1018  snarkjs plonk verify verification_key.json public.json proof.json