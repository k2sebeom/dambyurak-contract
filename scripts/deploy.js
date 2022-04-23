const hardhat = require('hardhat');

async function main() {
  console.log("Deployment started...");

  const Dambyurak = await hardhat.ethers.getContractFactory('Dambyurak');
  const contract = await Dambyurak.deploy(
    'ipfs://SOMERANDOMFAKECID/WALL-', '.json', 'http://127.0.0.1:8000/metadata/WALL-', '.json'
  );
  console.log(`===== Contract Deployed at address: ${contract.address}=====`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });