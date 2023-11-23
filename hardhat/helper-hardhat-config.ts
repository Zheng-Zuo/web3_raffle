import { ethers } from "hardhat";

export interface networkConfigItem {
    name?: string;
    subscriptionId?: string;
    gasLane?: string;
    keepersUpdateInterval?: string;
    raffleEntranceFee?: string;
    houseFeePct?: string;
    callbackGasLimit?: string;
    vrfCoordinatorV2?: string;
}

export interface networkConfigInfo {
    [key: number]: networkConfigItem;
}

export const networkConfig: networkConfigInfo = {
    31337: {
        name: "localhost",
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
        keepersUpdateInterval: "60",
        raffleEntranceFee: ethers.parseEther("0.01").toString(),
        houseFeePct: "3",
        callbackGasLimit: "2500000",
    },

    11155111: {
        name: "sepolia",
        subscriptionId: "6836",
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
        keepersUpdateInterval: "500",
        raffleEntranceFee: ethers.parseEther("0.01").toString(),
        houseFeePct: "3",
        callbackGasLimit: "2500000",
        vrfCoordinatorV2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
    },
}

export const developmentChains = ["hardhat", "localhost"];
export const VERIFICATION_BLOCK_CONFIRMATIONS = 6;