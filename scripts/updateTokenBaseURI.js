const hardhat = require('hardhat');

const CID = "<MetaData CID>";
const ADDRESS = "<Contract Addree>";

async function main() {
  console.log("Update started...");

  const Dambyurak = await hardhat.ethers.getContractFactory('Dambyurak');
  const contract = await Dambyurak.attach(ADDRESS);
  console.log(`===== Contract Attached at address: ${contract.address}=====`);

  const tx = await contract.setBaseTokenURI(`ipfs://${CID}/WALL-`);
  await tx.wait();
  console.log("===== Base Token URI updated =====");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });