/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require('dotenv').config();
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
const { task } = require('hardhat/config');


task("mint", "Bulk mint assets on Dambyurak contract")
  .addParam("address", "Address of the deployed contract")
  .addParam("count", "Number of tokens to be minted")
  .setAction(async (args) => {
    const { ethers } = require("hardhat");

    console.log("Minting started...");

    const Dambyurak = await ethers.getContractFactory("Dambyurak");
    const contract = await Dambyurak.attach(args.address);

    console.log(`===== Contract Attached at address: ${contract.address}=====`);
    const owner = await contract.owner();
    console.log(`===== Minting ${args.count} tokens to contract owner ${owner}=====`);
    const tx = await contract.bulkMint(owner, args.count);
    await tx.wait();

    console.log('Success!');
  })

module.exports = {
  solidity: "0.8.13",
  networks: {
    development: {
      url: "HTTP://127.0.0.1:8545"
    },
    polygon: {
      url: "https://polygon-rpc.com/",
      accounts: [process.env.PRIVATE_KEY]
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_TOKEN
  }
};
