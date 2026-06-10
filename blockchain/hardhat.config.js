require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: "../.env" });

const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL || "";
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "";

const networks = {};

if (POLYGON_RPC_URL && DEPLOYER_PRIVATE_KEY) {
  networks.mumbai = {
    url: POLYGON_RPC_URL,
    accounts: [DEPLOYER_PRIVATE_KEY],
  };
}

module.exports = {
  solidity: "0.8.20",
  networks,
  etherscan: {
    apiKey: {
      polygonMumbai: POLYGONSCAN_API_KEY,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
};
