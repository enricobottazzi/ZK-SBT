const hre = require("hardhat");

/**
 * Deploys a test set of contracts: PrivateSoulMinter, PrivateOver18Airdrop, verifier
 */
async function main() {

    // Deploy Soul Minter contract
    let PrivateSoulMinterContract = await hre.ethers.getContractFactory("PrivateSoulMinter")
    let privateSoulMinter = await PrivateSoulMinterContract.deploy()
    console.log(`Soul Minter address: ${privateSoulMinter.address}`)

    // Deploy Verifier contract
    let VerifierContract = await hre.ethers.getContractFactory("Verifier")
    let verifier = await VerifierContract.deploy()
    console.log(`Verifier contract address: ${verifier.address}`)

    // Deploy Private contract
    let PrivateOver18AirdropContract = await hre.ethers.getContractFactory("PrivateOver18Airdrop")
    let privateOver18Aidrop = await PrivateOver18AirdropContract.deploy(verifier.address)
    console.log(`PrivateOver18Airdrop contract address: ${privateOver18Aidrop.address}`)
}

main()
    .then(() => process.exit(0))
    .catch(e => {
        console.error(e);
        process.exit(1);
    })