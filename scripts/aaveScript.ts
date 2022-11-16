import { ethers } from "hardhat";
import { ILendingPoolAddressesProvider } from "../typechain-types/ILendingPoolAddressesProvider";
import { getWETH } from "./getWETH";
import {
	MAINNET_LENDINGPOOLADDRESSESPROVIDER_ADDRESS,
	WETH_MAINNET_ADDRESS,
} from "../helper-hardhat-config";
import { IERC20, ILendingPool } from "../typechain-types";
import { BigNumber } from "ethers";

const main = async () => {
	const { deployer } = await ethers.getNamedSigners();

	const value = ethers.utils.parseEther("0.02");
	await getWETH(value);

	const lendingPool = await getLendingPool(deployer.address);
	console.log("Lending pool address: ", lendingPool.address);

	// approve the spender to use our weth
	await approveErc20(WETH_MAINNET_ADDRESS!, lendingPool.address, value, deployer.address);
	console.log("Approved!");

	// deposit
	await lendingPool.deposit(WETH_MAINNET_ADDRESS!, value, deployer.address, 0);
	console.log("Deposited!");

	// borrow
	const { totalCollateralETH, availableBorrowsETH } = await lendingPool.getUserAccountData(
		deployer.address
	);
	// how much we have as collateral?
	console.log("total collateral: ", totalCollateralETH.toString());
	// how much we can borrow?
	console.log("available to borrow: ", availableBorrowsETH.toString());
	// how much we have borrowed?
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
/**
 * @param erc20Address: address of the erc20 token
 * @param spenderAddress: contract we give our approval to spend our tokens
 * @param amountToSpend: how much we approve the spender contract to spend
 * @param account: our account
 */
const approveErc20 = async (
	erc20Address: string,
	spenderAddress: string,
	amountToSpend: BigNumber,
	account: string
) => {
	const erc20Token: IERC20 = await ethers.getContractAt("IERC20", erc20Address, account);
	const tx = await erc20Token.approve(spenderAddress, amountToSpend);
	await tx.wait(1);
};

main()
	.then(() => process.exit(0))
	.catch((e) => {
		console.error(e);
		process.exit(1);
	});
