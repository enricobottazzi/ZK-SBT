// Mint a setofNFT to the privateAidrop contract
const hre = require("hardhat");
const ethers = require('ethers');

async function main() {

    let singers = await hre.ethers.getSigners();
    let collector = singers[1].address;

    let sigR8x = "5288934873515066744407360021175347774328283521815243825463338156746700965443"
    let sigR8y = "4653388640217130471849235597911239222005917737883282265350750838939007616127"
    let sigS  = "339273884829908499315499470612334526171037569413339691177061986410380854479"

    console.log(ethers.utils.solidityKeccak256(["uint", "uint", "uint"], [sigR8x, sigR8y, sigS]))
    
    let soulminter_ADDR = "0xc00bf97015057494A6f72Da13f888040051C286C";
    let privateSoulMinter = await hre.ethers.getContractAt("PrivateSoulMinter", soulminter_ADDR)
    let to = collector
    let metaURI = "ipfs...."
    let claimHashMetadata = ethers.utils.solidityKeccak256(["uint", "uint", "uint"], [sigR8x, sigR8y, sigS])
    console.log(claimHashMetadata)
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