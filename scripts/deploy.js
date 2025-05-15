const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying OrganDonation contract...");
  
  // Get the contract factory
  const OrganDonation = await ethers.getContractFactory("OrganDonation");
  
  // Deploy the contract
  const organDonation = await OrganDonation.deploy();
  
  // Wait for deployment to finish
  await organDonation.deployed();
  
  // Get the deployed contract address
  const contractAddress = organDonation.address;
  
  console.log("OrganDonation contract deployed to:", contractAddress);
}

// Run the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 