// Mint a setofNFT to the privateAidrop contract
const hre = require("hardhat");
const ethers = require('ethers');

async function main() {

    let sigR8x = "5288934873515066744407360021175347774328283521815243825463338156746700965443"
    let sigR8y = "4653388640217130471849235597911239222005917737883282265350750838939007616127"
    let sigS  = "339273884829908499315499470612334526171037569413339691177061986410380854479"

    ethers.utils.solidityKeccak256(["string", "string", "string"], [sigR8x, sigR8y, sigS])

    let soulminter_ADDR = "0xEc9c2e51E5a013cB7484245081a6cEe9a4Df161D";
    let privateSoulMinter = await hre.ethers.getContractAt("PrivateSoulMinter", soulminter_ADDR)
    let to = "0x6dC06eE9aE0F9e240c802E7013eC33c1767379D3"
    let metaURI = "ipfs...."
    let claimHashMetadata = ethers.utils.solidityKeccak256(["string", "string", "string"], [sigR8x, sigR8y, sigS])
    let tx = await privateSoulMinter.mint(to, metaURI,claimHashMetadata );
    tx.wait();
    console.log(`# Private SBT minted to ${to}`)
}

main().then(() => process.exit(0))
    .catch(e => {
        console.error(e);
        process.exit(-1);
    })