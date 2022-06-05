# ZKP-Soul-Bound-Token

Library to issue Private Soul Bound Token and verify it on-chain. 
The library leverages @iden3 [go-libraries](https://github.com/iden3/go-iden3-core) and @iden3 [circuits](https://github.com/iden3/circuits).

As @Vitalik.eth mentioned [here](https://twitter.com/VitalikButerin/status/1530265766032838656?s=20&t=hNyxz5KEaL1cW5crxj01Rw) "I think the optimal technical solution [to represent identity related information] includes both a chain and off-chain data and ZKPs over both".

The proof of concept introduced here is based on this approach. 

## Claim

The core data structure used to represent identity related information is [Iden3's Claim](https://docs.iden3.io/protocol/claims-structure/)

- The information are stored in the claim in a plain format
- Claims are issued by an issuer to another to attest any information
- When issued, the issuer signs the claim and pass the signature to the receiver of the claim
- Claims and claims' signatures live off-chain

This example considers an elementary claims that attests someone's age: `ageClaim`

## SoulBound Token

The data structure used to represent a claim on-chain is a Non Transferable ERC721 [`PrivateSoulMinter`](./contracts/contracts/PrivateSoulMinter.sol)

- The SBT contains an hash of the signed claim. This is the only information related to the claim stored on-chain.
- The SBT is minted by the issuer smart contract to the claim receiver 

## ZKP Generation and Verification

Smart contracts can make query to someone's claim and verify the query inside a Smart Contract. The query can be "you must be over 18 to interact with my contract". In this example I created a smart contract that gives access to an airdrop only to people that prove being over 18 [`PrivateOver18Airdrop`](./contracts/contracts/PrivateOver18Airdrop.sol).

The SBT owner starting from the signed claim and the verifier's query can generate a proof that includes:

- The information contained inside a claim satisfies verifier's query
- The claim was signed by issuer's key

The proof is generated using the [`verify-claim`](./circuits/lib/verify-claim.circom) 
circuit.

The proof is then verified inside the smart contract against the hashed signed inside the SBT. The verifier smart contract does not have access to the information stored inside the claim. The verifier smart contract can apply further on-chain logic after the proof is verified.

![PrivateSBT](imgs/PrivateSBT.png "PrivateSBT")

### Scripts

A) Compile the circuit 

``` bash
bash scripts/compile-circuit.sh circuits/verify.circom powersOfTau28_hez_final_15.ptau
```

B) Issue, sign the claim, define the query in order to generate the input for the circuit. 

```bash
go run scripts/sign-claim-go/signClaim.go
```

- copy and paste the result inside a new file calles `input.json` inside `build/verify/verify_js

C) Deploy the smart contracts

// Modify the public inside the verification of the contract to match the private key that signed your contract

cd contracts 
npm i
npx hardhat run scripts/deploy.js --network mumbai
```

D) Mint a SBT that includes an hash of the signature of the claim to the claim's receiver

Change the signature data according to the ones you get inside your input.json file 
Change the address according to the one you got from the previous tutorial
Explain it inside the code

```bash
npx hardhat run scripts/mint.js --network mumbai
```

F) Generate the ZKP proof in solidity calldata format





bash scripts/generate.sh verify
E) Verify the proof on-chain



- to compile the circuit: bash scripts/compile-circuit.sh circuits/verify.circom powersOfTau28_hez_final_15.ptau 
- add input.json to build/sbt-query/sbt-query_js
- 
- to export solidity calldata snarkjs zkey export soliditycalldata public.json proof.json

### Test

### Other Design choices

- This library uses babyjubjub signature schema. This schema is more zkp friendly and require far less computation to verify signature inside a circuit. Theoretically, ECDSA schema are already usable inside circuit but the proof generation currently requires a device with 56GB RAM (link to 0xParc Library).
- Iden3's claim schema is much more expandable and can include more complex data information (up to 4 data slots) and features such as expiration and revocation
- Non ready for production 
- Use ERC-4973 incoming, 
- Expand the smart contract
- No need to add a nullified as the proof Cannot be reused  

### To-do

- Export solidity calldata add it inside the script
- Better specify the query
- Add reference to the age claim