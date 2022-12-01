import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-deploy";

import {
	GOERLI_CHAINID,
	GOERLI_RPC_URL,
	GOERLI_PRIVATE_KEY,
	LOCALHOST_RPC_URL,
	ETHERSCAN_API_KEY,
	COINMARKETCAP_API_KEY,
	MAINNET_RPC_URL,
} from "./helper-hardhat-config";

const config: HardhatUserConfig = {
	defaultNetwork: "hardhat",
	solidity: {
		compilers: [
			{ version: "0.8.17" },
			{ version: "0.8.0" },
			{ version: "0.6.12" },
			{ version: "0.4.19" },
		],
	},
	networks: {
		hardhat: {
			forking: {
				url: MAINNET_RPC_URL!,
			},
		},
		goerli: {
			url: GOERLI_RPC_URL,
			accounts: [GOERLI_PRIVATE_KEY!],
			chainId: +GOERLI_CHAINID!,
		},
		localhost: {
			url: LOCALHOST_RPC_URL,
		},
	},
	etherscan: {
		apiKey: ETHERSCAN_API_KEY,
	},
	gasReporter: {
		enabled: false,
		outputFile: "gas-report.txt",
		noColors: true,
		currency: "USD",
		coinmarketcap: COINMARKETCAP_API_KEY,
	},
	namedAccounts: {
		deployer: 0,
	},
};

export default config;
