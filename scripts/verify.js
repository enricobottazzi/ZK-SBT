const hre = require("hardhat");

/** Collect an airdrop by proving a proof that user is over 18 yo */
async function main() {

    let singers = await hre.ethers.getSigners();
    let collector = singers[1];
    
    let PRIVATAIDROP_ADDR = ""; // to add

    // A[2] B[[2][2]] C[2] represent the proof
    let a = ["", ""]
    let b = [["", ""],["", ""]]
    let c = ["", ""]
    // input[72] represents the public input of the circuit
    let input = [""] 
    let tokenID = "1"; // to add

    let privateOver18Aidrop = await hre.ethers.getContractAt("PrivateOver18Airdrop", PRIVATAIDROP_ADDR)
    await privateOver18Aidrop.connect(collector).collectAirdrop(a, b, c, input, tokenID);
    console.log(`Proof verified`)


}

main().then(() => process.exit(0))
    .catch(e => {
        console.error(e);
        process.exit(-1);
    })
    
    

