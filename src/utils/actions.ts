// import { VRFCoordinatorV2Mock } from './../../hardhat/typechain-types/@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock';
import { useContractWrite, useContractRead, useContractEvent, useBalance } from 'wagmi'
import { ethers } from 'ethers'
import raffle_abi from '../artifacts/contracts/Raffle.sol/Raffle.json'
// import vrf_mock_abi from '../artifacts/@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock.sol/VRFCoordinatorV2Mock.json'

const raffleAddress = '0x316102bAF3E3E17A1830f36c15BcbfC81CFDBDea'
// const vrfMockAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
const raffleABI = raffle_abi.abi
// const vrfMockABI = vrf_mock_abi.abi

let provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`);
const etherContract = new ethers.Contract(raffleAddress, raffleABI, provider)
export const ethersGetTicketsByPlayer = async (address: string) => {
    const tickets = await etherContract.getTicketsEnteredByPlayer(address)
    return Number(tickets)
}

export const listenEvents = (
    name: string,
    callbacks: Array<() => void> = []
) => {
    const unwatch = useContractEvent({
        address: raffleAddress,
        abi: raffleABI,
        eventName: name,
        // chainId: 31337, //hardhat
        chainId: 11155111, //sepolia
        listener: (log) => {
            // console.log(log)
            for (let i = 0; i < callbacks.length; i++) {
                callbacks[i]();
            }
        }
    })

    return unwatch
}

export const getLastWinner = () => {

    const results = useContractRead({
        address: raffleAddress,
        abi: raffleABI,
        functionName: 'getRecentWinner',
        // chainId: 31337, //hardhat
        chainId: 11155111, //sepolia
    })

    return results
}

export const getLastWinningAmount = () => {

    const results = useContractRead({
        address: raffleAddress,
        abi: raffleABI,
        functionName: 'getRecentWinningAmount',
        // chainId: 31337, //hardhat
        chainId: 11155111, //sepolia
    })

    return results
}

export const getInterval = () => {
    const results = useContractRead({
        address: raffleAddress,
        abi: raffleABI,
        functionName: 'getInterval',
        // chainId: 31337, //hardhat
        chainId: 11155111, //sepolia
    })

    return results
}

export const getLastTimeStamp = () => {
    const results = useContractRead({
        address: raffleAddress,
        abi: raffleABI,
        functionName: 'getLastTimeStamp',
        // chainId: 31337, //hardhat
        chainId: 11155111, //sepolia
    })

    return results
}

export const getRaffleState = () => {
    const results = useContractRead({
        address: raffleAddress,
        abi: raffleABI,
        functionName: 'getRaffleState',
        // chainId: 31337, //hardhat
        chainId: 11155111, //sepolia
    })

    return results
}

export const getRaffleBalance = () => {
    const balance = useBalance({
        address: raffleAddress,
        formatUnits: 'ether',
        watch: true,
        // chainId: 31337, //hardhat
        chainId: 11155111, //sepolia
    })
    return balance
}

export const getRafflePlayers = () => {
    const results = useContractRead({
        address: raffleAddress,
        abi: raffleABI,
        functionName: 'getNumOfUniquePlayers',
        // chainId: 31337, //hardhat
        chainId: 11155111, //sepolia
    })

    return results
}

export const getNumOfTickets = () => {
    const results = useContractRead({
        address: raffleAddress,
        abi: raffleABI,
        functionName: 'getNumberOfTickets',
        // chainId: 31337, //hardhat
        chainId: 11155111, //sepolia
    })

    return results
}

export const getRaffleEntranceFee = () => {
    const results = useContractRead({
        address: raffleAddress,
        abi: raffleABI,
        functionName: 'getEntranceFee',
        // chainId: 31337, //hardhat
        chainId: 11155111, //sepolia
    })

    return results
}

export const getTicketsEnteredByPlayer = (address: string | undefined) => {
    let Address = address
    if (Address == undefined) {
        Address = '0x0000000000000000000000000000000000000000'
    }

    const results = useContractRead({
        address: raffleAddress,
        abi: raffleABI,
        functionName: 'getTicketsEnteredByPlayer',
        // chainId: 31337, //hardhat
        chainId: 11155111, //sepolia
        args: [Address]
    })
    return results

}

export const enterRaffle = () => {
    const result = useContractWrite({
        address: raffleAddress,
        abi: raffleABI,
        functionName: 'enterRaffle',
        // chainId: 31337, //hardhat
        chainId: 11155111, //sepolia
    })
    return result
}

export const getPlayers = () => {
    const results = useContractRead({
        address: raffleAddress,
        abi: raffleABI,
        functionName: 'getPlayers',
        // chainId: 31337, //hardhat
        chainId: 11155111, //sepolia
    })

    return results
}

export const endRaffle = () => {
    const result = useContractWrite({
        address: raffleAddress,
        abi: raffleABI,
        functionName: 'endRaffle',
        // chainId: 31337, //hardhat
        chainId: 11155111, //sepolia
    })
    return result
}

export const startRaffle = () => {
    const result = useContractWrite({
        address: raffleAddress,
        abi: raffleABI,
        functionName: 'startRaffle',
        // chainId: 31337, //hardhat
        chainId: 11155111, //sepolia
    })
    return result
}

export const refundRaffle = () => {
    const result = useContractWrite({
        address: raffleAddress,
        abi: raffleABI,
        functionName: 'refundAll',
        // chainId: 31337, //hardhat
        chainId: 11155111, //sepolia
    })
    return result
}

export const updateInterval = () => {
    const result = useContractWrite({
        address: raffleAddress,
        abi: raffleABI,
        functionName: 'changeInterval',
        // chainId: 31337, //hardhat
        chainId: 11155111, //sepolia
    })
    return result
}


