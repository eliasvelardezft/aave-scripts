import { ethers } from "hardhat";
import { ILendingPoolAddressesProvider } from "../typechain-types/ILendingPoolAddressesProvider";
import { getWETH } from "./getWETH";
import { MAINNET_LENDINGPOOLADDRESSESPROVIDER_ADDRESS } from "../helper-hardhat-config";
import { ILendingPool } from "../typechain-types";

const main = async () => {
	const { deployer } = await ethers.getNamedSigners();

	const value = ethers.utils.parseEther("0.02");
	await getWETH(value);

	const lendingPool = await getLendingPool(deployer.address);
	console.log("Lending pool address: ", lendingPool.address);
};

const getLendingPool = async (account: string): Promise<ILendingPool> => {
	const lendingPoolAddressesProvider: ILendingPoolAddressesProvider = await ethers.getContractAt(
		"ILendingPoolAddressesProvider",
		MAINNET_LENDINGPOOLADDRESSESPROVIDER_ADDRESS!,
		account
	);
	const lendingPoolAddress = await lendingPoolAddressesProvider.getLendingPool();
	const lendingPool: ILendingPool = await ethers.getContractAt(
		"ILendingPool",
		lendingPoolAddress,
		account
	);
	return lendingPool;
};

main()
	.then(() => process.exit(0))
	.catch((e) => {
		console.error(e);
		process.exit(1);
	});
