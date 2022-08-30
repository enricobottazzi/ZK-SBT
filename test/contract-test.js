const { expect, assert } = require("chai");
const hre = require("hardhat");
const { genProof } = require ("../node_builder/solidity-proof-builder");

describe("SBT minting and verification - Claim being 25yo", function () {

  let privateSoulMinter;
  let verifier;
  let privateOver18Aidrop;
  let input;
  let proof;

  beforeEach(async function () {
    signers = await hre.ethers.getSigners();
    collector = signers[1];
    collectorAddress = collector.address;

    // Deploy Private Soul Minter contract
    let PrivateSoulMinterContract = await hre.ethers.getContractFactory("PrivateSoulMinter")
    privateSoulMinter = await PrivateSoulMinterContract.deploy()

    // Deploy Verifier contract
    let VerifierContract = await hre.ethers.getContractFactory("Verifier")
    verifier = await VerifierContract.deploy()

    // Deploy Private Over 18 Airdrop contract
    let PrivateOver18AirdropContract = await hre.ethers.getContractFactory("PrivateOver18Airdrop")
    privateOver18Aidrop = await PrivateOver18AirdropContract.deploy(verifier.address, privateSoulMinter.address)

    input = {"claim":["180410020913331409885634153623124536270","0","25","0","0","0","336737128474383336282658235915348616107","0"],"sigR8x":"688686946388831233557331308711465468733905585065835441272184276693094325978","sigR8y":"15493455084309177729624010447416297675278563058012340962877178938865628051716","sigS":"1253140816100276199982817073373872106759313192093348519283565096151748155862","pubKeyX":"9582165609074695838007712438814613121302719752874385708394134542816240804696","pubKeyY":"18271435592817415588213874506882839610978320325722319742324814767882756910515","claimSchema":"180410020913331409885634153623124536270","slotIndex":2,"operator":3,"value":[18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}

    proof = await genProof(input)

    // input correct claim signature by the issuer
    let sigR8x = "688686946388831233557331308711465468733905585065835441272184276693094325978"
    let sigR8y = "15493455084309177729624010447416297675278563058012340962877178938865628051716"
    let sigS  = "1253140816100276199982817073373872106759313192093348519283565096151748155862"    

    // mint the NFT to the collector
    metaURI = "https://bafybeibodo3cnumo76lzdf2dlatuoxtxahgowxuihwiqeyka7k2qt7eupy.ipfs.nftstorage.link/"
    claimHashMetadata = hre.ethers.utils.solidityKeccak256(["uint", "uint", "uint"], [sigR8x, sigR8y, sigS])

    let tx = await privateSoulMinter.mint(collectorAddress, metaURI,claimHashMetadata);

    let receipt = await tx.wait();
    tokenId = receipt.events?.filter((x) => {return x.event == "Transfer"})[0].topics[3]
  });

  it("the SBT should not be transferable", async function () {
    await expect(privateSoulMinter.connect(collector).transferFrom(collectorAddress, signers[2].address, tokenId)).to.be.reverted;
  });

  it("shouldn't allow accounts that are not contract owner to mint SBTs", async function () {
    await expect(privateSoulMinter.mint(collectorAddress, metaURI, claimHashMetadata)).to.be.revertedWith("You can only have one token associated to your soul");
  });

  it("a user cannot have more than 1 SBT attesting their age", async function () {
    await expect(privateSoulMinter.connect(collector).mint(collectorAddress, metaURI, claimHashMetadata)).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("should include the user in the airdrop after presenting a correct proof", async function () {

    let a = proof.a
    let b = proof.b
    let c = proof.c
    let pubsig = proof.PubSignals
    await privateOver18Aidrop.connect(collector).collectAirdrop(a, b, c, pubsig, tokenId);

    assert.equal(await privateOver18Aidrop.isElegibleForAirdrop(collectorAddress), true);

  });


  it("should revert if a user presents the same proof twice", async function () {
    
    let a = proof.a
    let b = proof.b
    let c = proof.c
    let pubsig = proof.PubSignals
    
    // 1st attempt => should succeed
    await privateOver18Aidrop.connect(collector).collectAirdrop(a, b, c, pubsig, tokenId);

    // 2nd attempt => should revert
    await expect(privateOver18Aidrop.connect(collector).collectAirdrop(a, b, c, pubsig, tokenId)).to.be.revertedWith("You already claimed your airdrop!");
  });

  it("should revert if the correct proof is presented by someone who is not the owner of the SBT", async function () {

    let a = proof.a
    let b = proof.b
    let c = proof.c
    let pubsig = proof.PubSignals
      
    await expect(privateOver18Aidrop.connect(signers[2]).collectAirdrop(a, b, c, pubsig, tokenId)).to.be.revertedWith("This token belongs to another soul");
  });

  it("should revert if presented a proof based on an invalid schema", async function () {

    // Generate a proof based on an invalid schema

    let a = proof.a
    let b = proof.b
    let c = proof.c
    let pubsig = proof.PubSignals

    let invalidSchemaHash =  "0x0000000000000000000000000000000087b9b4c689c2024c54d1bf962cb16bcd"
    pubsig[6] = invalidSchemaHash

    await expect(privateOver18Aidrop.connect(collector).collectAirdrop(a, b, c, pubsig, tokenId)).to.be.revertedWith("Wrong Claim schema used to generate the proof");
  });

  it("should revert if presented a proof based on a different query #1 ", async function () {

    let a = proof.a
    let b = proof.b
    let c = proof.c
    let pubsig = proof.PubSignals

    // Using a query based on a slot index 3 instead of slot index 2
    let invalidQuerySlot = "0x0000000000000000000000000000000000000000000000000000000000000003"

    pubsig[7] = invalidQuerySlot

    await expect(privateOver18Aidrop.connect(collector).collectAirdrop(a, b, c, pubsig, tokenId)).to.be.revertedWith("Invalid slot index used to generate the proof");
  });

  it("should revert if presented a proof based on a different query #2 ", async function () {
    
    let a = proof.a
    let b = proof.b
    let c = proof.c
    let pubsig = proof.PubSignals

    // Using a query based on a operator 3 (greater than) we use operator 2 (less than)
    let invalidQueryOperator = "0x0000000000000000000000000000000000000000000000000000000000000002"

    pubsig[8] = invalidQueryOperator
    await expect(privateOver18Aidrop.connect(collector).collectAirdrop(a, b, c, pubsig, tokenId)).to.be.revertedWith("Invalid operator used to generate the proof");
  });

  it("should revert if a user passes in a wrong signature", async function () {

    let a = proof.a
    let b = proof.b
    let c = proof.c
    let pubsig = proof.PubSignals

    // Use an invalid claim signature    
    let invalidClaimSignature = "0x153f5044240ef872cf7e6742fe202b9e07ed6188e9e734c09b06939704852354"

    pubsig[2] = invalidClaimSignature

    await expect(privateOver18Aidrop.connect(collector).collectAirdrop(a, b, c, pubsig, tokenId)).to.be.revertedWith("The signature is not valid");
  });

});

describe("SBT minting and verification - Claim being 17yo", function () {

  let privateSoulMinter;
  let verifier;
  let privateOver18Aidrop;
  let input;
  let proof;

  beforeEach(async function () {
    signers = await hre.ethers.getSigners();
    collector = signers[1];
    collectorAddress = collector.address;

    // Deploy Private Soul Minter contract
    let PrivateSoulMinterContract = await hre.ethers.getContractFactory("PrivateSoulMinter")
    privateSoulMinter = await PrivateSoulMinterContract.deploy()

    // Deploy Verifier contract
    let VerifierContract = await hre.ethers.getContractFactory("Verifier")
    verifier = await VerifierContract.deploy()

    // Deploy Private Over 18 Airdrop contract
    let PrivateOver18AirdropContract = await hre.ethers.getContractFactory("PrivateOver18Airdrop")
    privateOver18Aidrop = await PrivateOver18AirdropContract.deploy(verifier.address, privateSoulMinter.address)

    // Claim says that user is 17yo
    input = {"claim":["180410020913331409885634153623124536270","0","17","0","0","0","270623411705926516277061521506879403803","0"],"sigR8x":"484006122857858474768390272692218988298541536766289714365106950400874453056","sigR8y":"17338242285456116649338134826905980971143640415491643229235579798877579219981","sigS":"171476993416419189003009726870488284814518693715362207176563201344920600239","pubKeyX":"9582165609074695838007712438814613121302719752874385708394134542816240804696","pubKeyY":"18271435592817415588213874506882839610978320325722319742324814767882756910515","claimSchema":"180410020913331409885634153623124536270","slotIndex":2,"operator":3,"value":[18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}
    proof = await genProof(input)

    // input correct claim signature by the issuer
    let sigR8x = "484006122857858474768390272692218988298541536766289714365106950400874453056"
    let sigR8y = "17338242285456116649338134826905980971143640415491643229235579798877579219981"
    let sigS  = "171476993416419189003009726870488284814518693715362207176563201344920600239"    

    // mint the NFT to the collector
    metaURI = "https://bafybeibodo3cnumo76lzdf2dlatuoxtxahgowxuihwiqeyka7k2qt7eupy.ipfs.nftstorage.link/"
    claimHashMetadata = hre.ethers.utils.solidityKeccak256(["uint", "uint", "uint"], [sigR8x, sigR8y, sigS])

    let tx = await privateSoulMinter.mint(collectorAddress, metaURI,claimHashMetadata);

    let receipt = await tx.wait();
    tokenId = receipt.events?.filter((x) => {return x.event == "Transfer"})[0].topics[3]

  });

  it("should revert as the SBT is based on a claim that doesn't satisfy the query - user is 17yo", async function () {

    // Input for the circuit that takes a claim attesting that the user is 17 years old 
    let a = proof.a
    let b = proof.b
    let c = proof.c
    let pubsig = proof.PubSignals

    await expect(privateOver18Aidrop.connect(collector).collectAirdrop(a, b, c, pubsig, tokenId)).to.be.revertedWith("The claim doesn't satisfy the query condition")
  });
});