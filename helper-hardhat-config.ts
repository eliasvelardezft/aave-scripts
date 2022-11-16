export const developmentChains = ["hardhat", "localhost"];

export const {
	// localhost
	LOCALHOST_RPC_URL,
	// goerli
	GOERLI_RPC_URL,
	GOERLI_CHAINID,
	GOERLI_PRIVATE_KEY,
	// mainnet
	WETH_MAINNET_ADDRESS,
	MAINNET_RPC_URL,
	MAINNET_LENDINGPOOLADDRESSESPROVIDER_ADDRESS,
	// api keys
	ETHERSCAN_API_KEY,
	COINMARKETCAP_API_KEY,
} = process.env;

// network config
interface networkConfigItem {
	blockConfirmations?: number;
	chainId?: number;
}

interface networkConfigInfo {
	[key: string]: networkConfigItem;
}

export const networkConfig: networkConfigInfo = {
	goerli: {
		blockConfirmations: 6,
		chainId: +GOERLI_CHAINID!,
	},
};
