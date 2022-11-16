import { ethers } from "hardhat";
import { getWETH } from "./getWETH";

const main = async () => {
	const value = ethers.utils.parseEther("0.02");
	await getWETH(value);
};

main()
	.then(() => process.exit(0))
	.catch((e) => {
		console.error(e);
		process.exit(1);
	});
