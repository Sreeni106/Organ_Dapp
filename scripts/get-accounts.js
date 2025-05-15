const { ethers } = require("hardhat");

async function main() {
  console.log("Getting accounts from Ganache...");
  
  // Get all signers (accounts)
  const accounts = await ethers.getSigners();
  
  console.log("\nAccounts to import into MetaMask:\n");
  
  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];
    const address = await account.getAddress();
    const balance = await ethers.provider.getBalance(address);
    
    console.log(`Account ${i}:`);
    console.log(`  Address: ${address}`);
    
    // IMPORTANT: DO NOT LOG PRIVATE KEYS IN PRODUCTION
    // This is only for local development purposes
    if (i < 3) { // Only showing first 3 accounts for brevity
      // Get private key - might not be available in all environments
      try {
        // This is a placeholder - in a real setup you'd use a secure way to get keys
        console.log("  Private Key: Use Ganache UI to view or run ganache CLI with --deterministic flag");
      } catch (error) {
        console.log("  Private Key: Not available (use Ganache UI to view)");
      }
    }
    
    console.log(`  Balance: ${ethers.formatEther(balance)} ETH\n`);
  }
  
  console.log("\nTo connect to Ganache in MetaMask:");
  console.log("1. Add a new network with these settings:");
  console.log("   - Network Name: Ganache");
  console.log("   - RPC URL: http://127.0.0.1:8545");
  console.log("   - Chain ID: 1337");
  console.log("   - Currency Symbol: ETH");
  console.log("2. Import an account using one of the private keys from Ganache");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 