import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const BASE_FEE = "250000000000000000"
const GAS_PRICE_LINK = 1e9

const deployMocks: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, network } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    /* if we are on a development network, we need to deploy mocks */
    if (chainId == 31337) {
        log("------------------------------------------------------------------------")
        log("")
        log("Local network detected! Deploying mocks...")
        log("")
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: [BASE_FEE, GAS_PRICE_LINK],
        })
        log("Mocks deployed!")
        log("")
        log("You are deploying to a local network, you will need a local network running to interact with the contract")
        log("")
        log("------------------------------------------------------------------------")
        log("")
    }
};

export default deployMocks;
deployMocks.tags = ['all', 'mocks'];
