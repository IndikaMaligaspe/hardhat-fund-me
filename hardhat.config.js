// require("@nomicfoundation/hardhat-waffle");
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require("hardhat-deploy");
// require("solidity-coverage");

// My tasks
// require("./tasks/block-number");

/** @type import('hardhat/config').HardhatUserConfig */
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const CONMARKETCAP_API_KEY = process.env.CONMARKETCAP_API_KEY;

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 5,
            blockConfirmations: 6
        },
        localhost: {
            url: "http://127.0.0.1:8545",
            // accounts: [PRIVATE_KEY],
            chainId: 31337
        }
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY
    },
    namedAccounts: {
        deployer: {
            default: 0
        }
    },
    gasReporter: {
        enabled: false,
        outputFile: "gasReporter.txt",
        noColor: true,
        currency: "USD",
        coinmarketcap: CONMARKETCAP_API_KEY
    },
    solidity: {
        compilers: [
            { version: "0.6.6" },
            { version: "0.8.0" },
            { version: "0.8.8" }
        ]
    }
};
