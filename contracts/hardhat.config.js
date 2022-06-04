require('@nomiclabs/hardhat-waffle');
require("@nomiclabs/hardhat-ethers");
require('dotenv').config();

module.exports = {
  solidity: "0.8.11",
  networks: {
    mumbai: {
      url: `${process.env.ALCHEMY_MUMBAI_URL}`,
      accounts: [`0x${process.env.MUMBAI_PRIVATE_KEY1}`, `0x${process.env.MUMBAI_PRIVATE_KEY2}` ]
    } 
  }
};