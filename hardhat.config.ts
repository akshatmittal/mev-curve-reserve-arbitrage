import "dotenv/config";
import "@typechain/hardhat";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-gas-reporter";
import "hardhat-contract-sizer";
import "hardhat-abi-exporter";
import "hardhat-deploy";

import { HardhatUserConfig } from "hardhat/config";
import { SolcUserConfig } from "hardhat/types";
import { ethers } from "ethers";

const mnemonic = process.env.HARDHAT_MNEMONIC || "test test test test test test test test test test test junk";

const COMPILER_SETTINGS: SolcUserConfig[] = [
  {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
      metadata: {
        bytecodeHash: "none",
      },
    },
  },
];

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  abiExporter: {
    path: "./abi",
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    deploy: "./deploy",
  },
  typechain: {
    outDir: "./typechain",
    target: "ethers-v5",
  },
  namedAccounts: {
    deployer: 1,
  },
  gasReporter: {
    enabled: true,
    token: "ETH",
  },
  networks: {
    hardhat: {
      autoImpersonate: true,
      forking: {
        url: "https://rpc.ankr.com/eth",
        // blockNumber: 16970452,
      },
      chainId: 1,
      accounts: {
        mnemonic,
        accountsBalance: ethers.utils.parseEther("10").toString(),
      },
      saveDeployments: true,
    },
    ethereum: {
      url: "https://rpc.ankr.com/eth",
      accounts: {
        mnemonic,
      },
    },
    flashbots: {
      url: "https://rpc.flashbots.net",
      accounts: {
        mnemonic,
      },
    },
    anvil: {
      url: "http://127.0.0.1:8545/",
      timeout: 0,
      // accounts: {
      //   mnemonic,
      // },
    },
  },
  solidity: {
    compilers: COMPILER_SETTINGS,
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
  mocha: {
    timeout: 0,
  },
};

export default config;
