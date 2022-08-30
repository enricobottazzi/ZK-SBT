require('@nomiclabs/hardhat-waffle');
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require('dotenv').config();

module.exports = {
  solidity: "0.8.11",
  networks: {
    mumbai: {
      url: `${process.env.ALCHEMY_MUMBAI_URL}`,
      accounts: [`0x${process.env.MUMBAI_PRIVATE_KEY2}`, `0x${process.env.MUMBAI_PRIVATE_KEY8}` ]
    },
    goerli: {
      url: `${process.env.ALCHEMY_GOERLI_URL}`,
      accounts: [`0x${process.env.MUMBAI_PRIVATE_KEY2}`, `0x${process.env.MUMBAI_PRIVATE_KEY8}` ]
    } 
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY
  }
};