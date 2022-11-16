import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { WETH_MAINNET_ADDRESS } from "../helper-hardhat-config";
import { IWeth } from "../typechain-types";

export const getWETH = async (amount: BigNumber) => {
	const { deployer } = await ethers.getNamedSigners();
	const weth: IWeth = await ethers.getContractAt("IWeth", WETH_MAINNET_ADDRESS!, deployer);

	const tx = await weth.deposit({ value: amount });
	await tx.wait(1);

	const balance = await weth.balanceOf(deployer.address);
	console.log("WETH balance: ", balance.toString());
};
