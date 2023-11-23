import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import verify from '../utils/verify';
import {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS
} from '../helper-hardhat-config';
import { VRFCoordinatorV2Mock } from '../typechain-types/@chainlink/contracts/src/v0.8/mocks';
import { BigNumberish } from 'ethers';

const FUND_AMOUNT = "1000000000000000000000";

const deployRaffle: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, network, ethers } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let vrfCoordinatorV2Address: string | undefined, subscriptionId: BigNumberish | string;

    if (chainId == 31337) {
        const vrfCoordinatorV2Mock: VRFCoordinatorV2Mock = await ethers.getContract('VRFCoordinatorV2Mock');
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.target as string;
        const txResponse = await vrfCoordinatorV2Mock.createSubscription();
        const txReceipt = await txResponse.wait();
        const parsedLogs = txReceipt?.logs.map((log: any) => vrfCoordinatorV2Mock.interface.parseLog(log));
        // console.log(parsedLogs)
        const eventLog = parsedLogs?.find((parsedLog) => parsedLog?.name === 'SubscriptionCreated');
        // console.log(eventLog)
        subscriptionId = eventLog?.args[0];
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT);
        log(`Funded subscription ${subscriptionId} with ${ethers.formatEther(FUND_AMOUNT)} LINK Successfully!`);
        log("")
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId!]['vrfCoordinatorV2'];
        subscriptionId = networkConfig[chainId!]['subscriptionId'] as string;
    }

    const waitBlockConfirmations = developmentChains.includes(network.name) ?
        1
        : VERIFICATION_BLOCK_CONFIRMATIONS;
    log("------------------------------------------------------------------------")
    log("")

    const args: any[] = [
        vrfCoordinatorV2Address,
        subscriptionId,
        networkConfig[chainId!]['gasLane'],
        networkConfig[chainId!]['keepersUpdateInterval'],
        networkConfig[chainId!]['raffleEntranceFee'],
        networkConfig[chainId!]['houseFeePct'],
        networkConfig[chainId!]['callbackGasLimit'],
    ];

    // console.log(subscriptionId)
    const raffle = await deploy('Raffle', {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    });

    if (chainId == 31337) {
        const vrfCoordinatorV2Mock: VRFCoordinatorV2Mock = await ethers.getContract('VRFCoordinatorV2Mock');
        await vrfCoordinatorV2Mock.addConsumer(
            subscriptionId,
            raffle.address
        )
        log("")
        log(`Added Raffle ${raffle.address} as a consumer to subscription ${subscriptionId} Successfully!`);
    }

    log("")
    log("------------------------------------------------------------------------")
    log("")

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying contract: ", raffle.address)
        await verify(raffle.address, args)
    }
}

export default deployRaffle;
deployRaffle.tags = ['all', 'raffle'];
