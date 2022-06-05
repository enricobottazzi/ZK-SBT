// Mint a setofNFT to the privateAidrop contract
const hre = require("hardhat");
const ethers = require('ethers');

async function main() {

    let singers = await hre.ethers.getSigners();
    let collector = singers[1].address;

    let sigR8x = "19943695123402335361038278910409261486943666562013081004078983534691794123783"
    let sigR8y = "3583905364564918988734176020296508259727800495779186858901608711195287992496"
    let sigS  = "2634157781891944891813338365100638968975123534786713020716025254084096359410"    
    let soulminter_ADDR = "0x9FfE066aE2677EC5276954EBB5378f0f67793891";
    let privateSoulMinter = await hre.ethers.getContractAt("PrivateSoulMinter", soulminter_ADDR)
    let to = collector
    let metaURI = "ipfs...."
    let claimHashMetadata = ethers.utils.solidityKeccak256(["uint", "uint", "uint"], [sigR8x, sigR8y, sigS])
    let tx = await privateSoulMinter.mint(to, metaURI,claimHashMetadata);
    let receipt = await tx.wait();
    let tokenId = receipt.events?.filter((x) => {return x.event == "Transfer"})[0].topics[3]
    console.log(`# Private SBT minted to ${to}, with TokenID: ${tokenId}`)
}

main().then(() => process.exit(0))
    .catch(e => {
        console.error(e);
        process.exit(-1);
    })