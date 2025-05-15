# OrganChain: Blockchain Organ Donation DApp

OrganChain is a decentralized application built on Ethereum that facilitates secure, transparent, and real-time organ donation matching. This platform connects donors with patients in need using blockchain technology to ensure data integrity and privacy.

## Features

- **Secure User Registration**: Register as a donor or patient with encrypted medical data
- **Admin Verification**: Hospital admins verify users to ensure authenticity
- **Smart Contract Matching**: Automated, transparent organ matching process
- **Real-time Notifications**: Instant alerts when matches are found
- **Donor NFT Badges**: Blockchain-verified donor badges
- **IPFS Storage**: Secure, decentralized medical data storage
- **ML-assisted Matching**: Compatibility scoring for optimal matches

## Tech Stack

- **Frontend**: Next.js + Tailwind CSS 
- **Blockchain**: Ethereum (Ganache for development), Solidity smart contracts
- **Wallet Integration**: MetaMask
- **Storage**: IPFS/NFT.Storage for encrypted medical records
- **Authentication**: Wallet-based authentication with role management

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- MetaMask browser extension
- Ganache (for local blockchain development)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/organchain.git
   cd organchain
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local blockchain and deploy contracts:
   ```bash
   npm run blockchain
   ```
   This command will:
   - Start a Ganache instance
   - Compile and deploy the smart contracts
   - Update the contract address in the configuration

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

### Using the DApp

1. **Connect Wallet**: Use MetaMask to connect your wallet to the application
2. **Register**: Register as a donor or patient, providing the necessary information
3. **Admin Verification**: Admins can verify registered users
4. **View Matches**: Patients can view and filter potential organ matches
5. **Notifications**: Receive instant notifications for matches and status changes

## Demo Mode

The application includes a demo mode for testing without real data. This lets you:
- View sample donors and patients
- Simulate the matching process
- Test the admin verification flow
- Experience the notification system

## Project Structure

- `/app`: Next.js application code
  - `/components`: Reusable UI components
  - `/context`: React context providers (Web3, IPFS, Notifications)
  - `/pages`: Application pages/routes
- `/contracts`: Solidity smart contracts
- `/scripts`: Deployment and utility scripts
- `/test`: Contract tests

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenZeppelin for smart contract libraries
- IPFS/Filecoin for decentralized storage solutions
- The Ethereum community for blockchain infrastructure
