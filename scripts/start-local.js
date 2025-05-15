const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const configPath = path.join(__dirname, '../app/config.js');

// Function to extract contract address from deployment output
function extractContractAddress(output) {
  const match = output.match(/OrganDonation contract deployed to: (0x[a-fA-F0-9]{40})/);
  return match ? match[1] : null;
}

// Main function
async function main() {
  try {
    console.log('Starting local development environment...');
    
    // Start Ganache in the background (assumes Ganache CLI is installed)
    console.log('Starting Ganache...');
    const ganacheProcess = require('child_process').spawn(
      'npx', 
      ['ganache-cli', '--deterministic'], 
      {
        detached: true,
        stdio: 'inherit',
        shell: true
      }
    );
    
    console.log('Ganache started with PID:', ganacheProcess.pid);
    
    // Wait a bit for Ganache to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Compile the contracts
    console.log('Compiling contracts...');
    execSync('npx hardhat compile', { stdio: 'inherit' });
    
    // Deploy the contracts
    console.log('Deploying contracts to local Ganache...');
    const deployOutput = execSync('npx hardhat run scripts/deploy.js --network ganache').toString();
    console.log(deployOutput);
    
    // Extract the contract address
    const contractAddress = extractContractAddress(deployOutput);
    
    if (contractAddress) {
      console.log(`Contract deployed at: ${contractAddress}`);
      
      // Update the config.js file with the new contract address
      console.log('Updating config.js with contract address...');
      
      let configContent = fs.readFileSync(configPath, 'utf8');
      configContent = configContent.replace(
        /export const contractAddress = "[0-9a-zA-Z]+";/,
        `export const contractAddress = "${contractAddress}";`
      );
      
      fs.writeFileSync(configPath, configContent);
      console.log('Config updated successfully!');
    } else {
      console.error('Failed to extract contract address from deployment output.');
    }
    
    console.log('\nSetup complete! Your local blockchain environment is ready.');
    console.log('Run "npm run dev" to start the Next.js development server.');
    console.log('\nPress Ctrl+C to stop Ganache when you\'re done.');
    
    // Keep the script running so Ganache stays alive
    process.stdin.resume();
    
  } catch (error) {
    console.error('Error setting up local environment:', error);
    process.exit(1);
  }
}

// Run the main function
main(); 