const hardhat = require('hardhat');

const CID = "";
const ASSET_URL = 'https://k2sebeom.github.io/dambyurak-nft/assetdata/WALL-';

async function main() {
  console.log("Deployment started...");

  const Dambyurak = await hardhat.ethers.getContractFactory('Dambyurak');
  const contract = await Dambyurak.deploy(
    `ipfs://${CID}/WALL-`, '.json', ASSET_URL, '.json'
  );
  console.log(`===== Contract Deployed at address: ${contract.address}=====`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });