const fs = require('fs');
const path = require('path');

if (process.argv.length < 3) {
  console.error('Usage: node update-contract-address.js <new_contract_address>');
  process.exit(1);
}

const newAddress = process.argv[2];
const contractFilePath = path.join(__dirname, '../app/contracts/OrganDonation-updated.ts');

let content = fs.readFileSync(contractFilePath, 'utf8');

// Replace the old contract address with the new one
const updatedContent = content.replace(/export const CONTRACT_ADDRESS = '0x[a-fA-F0-9]{40}';/, `export const CONTRACT_ADDRESS = '${newAddress}';`);

fs.writeFileSync(contractFilePath, updatedContent, 'utf8');

console.log(`Updated contract address to ${newAddress} in app/contracts/OrganDonation-updated.ts`);
