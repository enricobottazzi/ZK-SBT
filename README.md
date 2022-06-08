# ZK-Soul-Bound-Token

One of the major concerns with SBTs presented in the Decentralized Society paper from Glen Wely, Puja Ohlhaver, and Vitalik Buterin has been the assumption that SBTs contain public data on-chain. This assumption has stirred a lot of debate in the Web3 community with what technical substrate to be leveraging in order to represent the key outcomes from the Decentralized Society paper (Verifiable Credentials or assumed technical specs of an SBT). 

As Vitalik Buterin has mentioned [publicly](https://twitter.com/VitalikButerin/status/1530265766032838656?s=20&t=hNyxz5KEaL1cW5crxj01Rw) "I think the optimal technical solution [to represent identity related information] includes both a chain and off-chain data and ZKPs over both". Not only Vitalik, but many thought leaders in the VC and Web3 native communities have agreed that the solution is not binary, but a pluralistic one. 

The key design considerations we took included: portability; provisioned privacy; efficient storage; and composability with Web3 developers. 

In this repository, we provide the tools needed to ensure that: 

- Identity holders are able to protect the contents of their data with the same privacy guarantees of verifiable credentials
- Identity holders are able to participate in the on-chain composable logic that the Web3 infrastructure is built on.
- Identity holders can provision access to data and control over data storage.

In this library developers are provided with the tooling to issue zero-knowledge proof soul bound tokens (ZK SBTs) and verify them on-chain. This library leverages @iden3 [go-libraries](https://github.com/iden3/go-iden3-core) and @iden3 [circuits](https://github.com/iden3/circuits).

ZK SBTs allows for the creation of a composable network of trust. The token is always visible on chain making impossible for a user to hide the existance of an information when requested. The information contained in the claim is obscured using ZK in order to guarantee privacy. The only thing stored on chain is the hash of a signed message.

The proof of concept introduced here is based on this approach. 

# Core Components

### Claim

The core data structure used to represent identity related information is [Iden3's Claim](https://docs.iden3.io/protocol/claims-structure/)

- The information stored in the claim is in a plain text format
- Claims are issued by an issuer to attest to information
- When issued, the issuer signs the claim and passes the signature to the receiver of the claim
- Claims and claims' signatures live off-chain

This example considers an elementary claims that attests someone's age: `ageClaim`

```
Index:
{
    "106590880073303418818490710639556704462", // Schema + header
    "0",
    "25", // first index data slot <- age
    "0"  // second index data slot
}

Value:
{ 
    "0",
    "0",
    "0", // first value data slot
    "0"  // second value data slot
}   
```

### SoulBound Token

The data structure used to represent a claim on-chain is a non-transferable ERC721 [`PrivateSoulMinter`](./contracts/contracts/PrivateSoulMinter.sol)

- The ZK SBT contains an hash of the signed claim. This is the only information related to the claim stored on-chain.
- The ZK SBT is minted by the issuer smart contract to the claim receiver 

### ZKP Generation and Verification

Smart contracts can make query to someone's claim and verify the query inside a Smart Contract. The query can be "you must be over 18 to interact with my contract". 

In this example, the smart contract that gives access to an airdrop only to people that prove being over 18 [`PrivateOver18Airdrop`](./contracts/contracts/PrivateOver18Airdrop.sol).

The query, on a elementary level, looks like this: 

```
    SlotIndex: 2,  // Position inside the claim of the queried value
    Values:    18, // Threshold value
    Operator:  3,  // 3 means "greater than"
```

The ZK SBT owner starting from the signed claim and the verifier's query can generate a proof that includes:

- The information contained inside a claim satisfies verifier's query
- The claim was signed by issuer's key

The proof is generated using the [`verify-claim`](./circuits/lib/verify-claim.circom) circuit.

The proof is then verified inside the smart contract against the hashed signed inside the ZK SBT. The verifier smart contract does not have access to the information stored inside the claim. The verifier smart contract can apply further on-chain logic after the proof is verified.

![PrivateSBT](imgs/PrivateSBT.png "PrivateSBT")

### Scripts

The circuits have been pre-compiled using the `powersOfTau28_hez_final_15.ptau`trusted set-up. 

- Issue, sign the claim, define the query in order to generate the input for the circuit. 

    ```bash
    go run scripts/signClaim.go
    ```
    copy and paste the result inside a new file called `input.json` inside `build/verify/verify_js`

- Deploy the smart contracts

    ```
    npx hardhat run scripts/deploy.js --network mumbai
    ```

-  Mint a SBT that includes an hash of the signature of the claim to the claim's receiver

    ```bash
    npx hardhat run scripts/mint.js --network mumbai
    ```

-  Generate the ZKP proof in solidity calldata format

    ```bash 
    bash scripts/generate.sh verify
    ````

    The output you get from this command represent the solidity calldata needed to verify the proof

- Verify the proof on-chain

    ```bash
    npx hardhat run scripts/verify.js --network mumbai
    ```

### Test

`mocha` to test the contract and the circuit

### Other Design choices

- This library uses babyjubjub signature schema. This schema is more zkp friendly and require far less computation to verify signature inside a circuit. Theoretically, ECDSA schema are already usable inside circuit but the proof generation currently requires a device with 56GB RAM (link to 0xParc Library).
- Iden3's claim schema is much more expandable and can include more complex data information (up to 4 data slots) and features such as expiration, revocation or self attestation
- No need to add a nullified as the proof Cannot be reused  
