# ZKP-SOUL-BOUND-TOKEN

Library to issue Private Soul Bound Token and verify it on-chain. The library leverages @iden3 go-libraries and circuits.

The core data structure to represent the information that wants to be kept private is defined claim. A claim can encompass any type of information about a subject. The Soul Bound Token contains an hash of the signed claim. The owner of the Soul Bound Token can therefore prove information about the claim without revealing it.

The 3 main actors involved in the process are: 

- An issuer, attests someone's age and issues SBT 
- An ID holder, who receives a SBT from the issuer
- A verifier, who opens an airdrop only to 18+ users.  

// ADD illustration here. Specify on-chain and off-chain processes

Process 

A) Design the claim => Add reference to iden3 to design the claim. Explain which type of claim I used here
B) Sign the claim => Explain the key used and why.
C) Deploy NFT contract and transfer it. Create the NFT that includes an hash of the signature in it. Note: the hash of the signature is generated as keccak-256 hash of "sigR8x" + "." + "sigR8y" + "." + "sigS"
D) Generate the input for the circuits. Add go files for that
E) Deploy verifier, explain where it comes from
F) Deploy Airdrop contract, explain its rules. Remember that if you want to modify the requirement you should modify the require included in the airdrop contract too!
G)  



### Circuits

### Contracts

### Scripts

- to compile the circuit: bash scripts/compile-circuit.sh circuits/sbt-query.circom powersOfTau28_hez_final_15.ptau 
- add input.json to build/sbt-query/sbt-query_js
- bash scripts/generate.sh sbt-query
- to export solidity calldata snarkjs zkey export soliditycalldata public.json proof.json

### Test

### Design choices

- This library uses babyjubjub signature schema. This schema is more zkp friendly and require far less computation to verify signature inside a circuit. Theoretically, ECDSA schema are already usable inside circuit but the proof generation currently requires a device with 56GB RAM (link to 0xParc Library).
- Iden3's claim schema is much more expandable and can include more complex data information (up to 4 data slots) and features such as expiration and revocation
- Non ready for production 
- Use ERC-4973 incoming, 
- Expand the smart contract

### To-do

- Create a NFT with hash (done!)
- Export solidity calldata add it inside the script
- Add on-chain verification with query
- Add nullifier
- Add off-zkp more verification inside the contract 
    - Hash in the NFT has to be equal to the hash of the signature.
- Make the verifyProof function non public! 
- Why the value array has to be that long?