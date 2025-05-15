const { ethers } = require("ethers");
const { CONTRACT_ADDRESS, CONTRACT_ABI } = require("../app/contracts/OrganDonation-updated");

async function main() {
  // Connect to local Ganache
  const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

  // Fetch donor list
  const donorList = await contract.getDonorList();
  console.log("Registered Donors:");
  for (const donorAddress of donorList) {
    const donor = await contract.donors(donorAddress);
    console.log(`Address: ${donorAddress}, Name: ${donor.name}, Verified: ${donor.verified}`);
  }

  // Fetch patient list
  const patientList = await contract.patientList();
  console.log("Registered Patients:");
  for (const patientAddress of patientList) {
    const patient = await contract.patients(patientAddress);
    console.log(`Address: ${patientAddress}, Name: ${patient.name}, Verified: ${patient.verified}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error checking registrations:", error);
    process.exit(1);
  });
