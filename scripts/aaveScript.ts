import { ethers } from "hardhat";
import { ILendingPoolAddressesProvider } from "../typechain-types/ILendingPoolAddressesProvider";
import { getWETH } from "./getWETH";
import {
	MAINNET_LENDINGPOOLADDRESSESPROVIDER_ADDRESS,
	WETH_MAINNET_ADDRESS,
	MAINNET_AGGREGATORV3_ADDRESS,
	DAI_TOKEN_MAINNET,
	InterestRateMode,
} from "../helper-hardhat-config";
import { IERC20, ILendingPool, AggregatorV3Interface } from "../typechain-types";
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

	const daiPrice = (await getDaiPriceInEth()).toNumber();
	console.log("DAI price in ETH: ", (1e18 / daiPrice).toString());

	// CHECK
	await getUserData(lendingPool, deployer.address);

	// get amountToBorrow in Wei, only .95 of the available amount
	const { availableBorrowsETH } = await lendingPool.getUserAccountData(deployer.address);
	// @ts-ignore
	const amountToBorrow = availableBorrowsETH.toString() * 0.95 * (1 / daiPrice);
	const amountToBorrowWei = ethers.utils.parseEther(amountToBorrow.toString());

	// borrow
	await borrowDai(DAI_TOKEN_MAINNET!, lendingPool, amountToBorrowWei, deployer.address);

	// CHECK
	await getUserData(lendingPool, deployer.address);

	// repay
	await repay(DAI_TOKEN_MAINNET!, lendingPool, amountToBorrowWei, deployer.address);

	// CHECK
	await getUserData(lendingPool, deployer.address);
};

const getUserData = async (lendingPool: ILendingPool, account: string) => {
	const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
		await lendingPool.getUserAccountData(account);
	const daiPrice = 1 / (await getDaiPriceInEth()).toNumber();
	// @ts-ignore
	const collateralDai = totalCollateralETH * daiPrice;
	// @ts-ignore
	const debtDai = totalDebtETH * daiPrice;
	// @ts-ignore
	const availableBorrowDai = availableBorrowsETH * daiPrice;
	console.log("total collateral in ETH: ", totalCollateralETH.toString());
	console.log("total debt in ETH: ", totalDebtETH.toString());
	console.log("available borrow in ETH: ", availableBorrowsETH.toString());
	console.log("------------------------------");
	console.log("total collateral in DAI: ", collateralDai.toString());
	console.log("total debt in DAI: ", debtDai.toString());
	console.log("available borrow in DAI: ", availableBorrowDai.toString());
	console.log("*****************************");
	console.log("*****************************");
};

const borrowDai = async (
	daiAddress: string,
	lendingPool: ILendingPool,
	amountToBorrow: BigNumber,
	account: string
) => {
	const interestRateMode = InterestRateMode.STABLE;
	const borrowTx = await lendingPool.borrow(
		daiAddress,
		amountToBorrow,
		interestRateMode,
		0,
		account
	);
	await borrowTx.wait(1);
	console.log("Borrowed: ", amountToBorrow.toString());
};

const repay = async (
	daiAddress: string,
	lendingPool: ILendingPool,
	amount: BigNumber,
	account: string
) => {
	await approveErc20(daiAddress, lendingPool.address, amount, account);

	const repayTx = await lendingPool.repay(daiAddress, amount, InterestRateMode.STABLE, account);
	await repayTx.wait(1);
	console.log("Repayed: ", amount.toString());
};

const getDaiPriceInEth = async () => {
	const daiEthPriceFeed: AggregatorV3Interface = await ethers.getContractAt(
		"AggregatorV3Interface",
		MAINNET_AGGREGATORV3_ADDRESS!
	);
	const daiEthPrice = (await daiEthPriceFeed.latestRoundData())[1];
	return daiEthPrice;
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
