require("@nomicfoundation/hardhat-toolbox");
const dotenv = require("dotenv");

dotenv.config();
dotenv.config({ path: `.env.local`, override: true });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    holesky: {
      url: process.env.RPC,
      accounts: [process.env.PRIVATE_KEY],
    }
  },
  etherscan: {
    apiKey: process.env.API_KEY
  },
  sourcify: {
    enabled: false
  }
};
