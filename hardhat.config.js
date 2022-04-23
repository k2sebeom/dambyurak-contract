/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require('dotenv').config();
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
const { task } = require('hardhat/config');


task("mint", "Mint based on assets on nft directory")
  .addParam("address", "Address of the deployed contract")
  .addParam("cid", "CID for metadata on IPFS")
  .setAction(async (args) => {
    const glob = require('glob');
    const { ethers } = require("hardhat");

    console.log("Minting started...");

    const Dambyurak = await ethers.getContractFactory('Dambyurak');
    const contract = await Dambyurak.attach(args.address);

    console.log(`===== Contract Attached at address: ${contract.address}=====`);
    const owner = await contract.owner();
    console.log(`===== Minting NFT to contract owner ${owner}=====`);

    const gatewayUrl = "https://gateway.pinata.cloud/ipfs/";
    metadataPath = "./nft/metadata";
    const files = glob.sync(metadataPath + '/*.json');
    for(let i = 0; i < files.length; i++) {
        const tokenURI = gatewayUrl + args.cid + `/WALL-${i+1}.json`;
        console.log(`Minting ${tokenURI}...`);
        const tx = await contract.safeMint(owner, tokenURI);
        await tx.wait();
        console.log('Success!');
    }
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
