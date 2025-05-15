// Script to print Ganache's deterministic private keys
// These are the same private keys that Ganache generates when using --deterministic flag

console.log("Default Ganache Accounts and Private Keys for MetaMask Import\n");

const accounts = [
  {
    privateKey: "0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d",
    address: "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1"
  },
  {
    privateKey: "0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1",
    address: "0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0"
  },
  {
    privateKey: "0x6370fd033278c143179d81c5526140625662b8daa446c22ee2d73db3707e620c",
    address: "0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b"
  },
  {
    privateKey: "0x646f1ce2fdad0e6deeeb5c7e8e5543bdde65e86029e2fd9fc169899c440a7913",
    address: "0xE11BA2b4D45Eaed5996Cd0823791E0C93114882d"
  },
  {
    privateKey: "0xadd53f9a7e588d003326d1cbf9e4a43c061aadd9bc938c843a79e7b4fd2ad743",
    address: "0xd03ea8624C8C5987235048901fB614fDcA89b117"
  }
];

accounts.forEach((account, index) => {
  console.log(`Account ${index}:`);
  console.log(`  Address: ${account.address}`);
  console.log(`  Private Key: ${account.privateKey}`);
  console.log("");
});

console.log("\nTo connect to Ganache in MetaMask:");
console.log("1. Add a new network with these settings:");
console.log("   - Network Name: Ganache");
console.log("   - RPC URL: http://127.0.0.1:8545");
console.log("   - Chain ID: 1337");
console.log("   - Currency Symbol: ETH");
console.log("2. Import an account using one of the private keys above"); 