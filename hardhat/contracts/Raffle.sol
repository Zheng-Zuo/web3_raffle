// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/* Errors */
error Raffle__UpkeepNotNeeded(
    uint256 currentBalance,
    uint256 numPlayers,
    uint256 raffleState,
    bool hasPastInterval
);
error Raffle__UnableToEnd(
    address owner,
    uint256 currentBalance,
    uint256 numPlayers,
    uint256 raffleState
);
error Raffle__UnableToStart(
    address owner,
    uint256 currentBalance,
    uint256 numPlayers,
    uint256 raffleState
);

error Raffle__UnableToRefund(
    address owner,
    uint256 currentBalance,
    uint256 numPlayers,
    uint256 raffleState
);

error Raffle__UnableToChangeInterval(uint256 raffleState);

error Raffle__TransferFailed();
error Raffle__InvalidEntranceFee();
error Raffle__RaffleNotOpen();

/**@title Raffle Contract
 * @author Zheng Zuo
 * @notice This contract is for creating a sample raffle contract
 * @dev This implements the Chainlink VRF V2
 */

contract Raffle is Ownable, VRFConsumerBaseV2, AutomationCompatibleInterface {
    /* Type declarations */
    enum RaffleState {
        OPEN,
        CALCULATING,
        ENDED
    }

    /* State variables and Chainlink VRF variables */
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    /* Raffle variables */
    uint256 private i_interval;
    uint256 private immutable i_entranceFee;
    uint256 private immutable i_houseFeePct;
    uint256 private s_lastTimeStamp;
    address private s_recentWinner;
    uint256 private s_recentWinningAmount;
    address[] private s_players;
    RaffleState private s_raffleState;
    mapping(address => uint256) private s_ticketsEntered;
    mapping(address => bool) private s_uniquePlayers;
    uint256 private s_uniquePlayerCnt;

    /* Events */
    event RequestedRaffleWinner(uint256 indexed requestId);
    event RaffleEnter(address indexed player);
    event WinnerPicked(address indexed player);
    event RaffleReset(uint indexed timestamp);
    event RaffleEnd(RaffleState indexed newState);

    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane,
        uint256 interval,
        uint256 entranceFee,
        uint256 houseFeePct,
        uint32 callbackGasLimit
    ) Ownable(msg.sender) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane;
        i_interval = interval;
        i_entranceFee = entranceFee;
        i_houseFeePct = houseFeePct;
        i_callbackGasLimit = callbackGasLimit;
        s_raffleState = RaffleState.OPEN;
        s_lastTimeStamp = block.timestamp;
    }

    function enterRaffle() external payable {
        if (msg.value % i_entranceFee != 0) {
            revert Raffle__InvalidEntranceFee();
        }
        if (s_raffleState != RaffleState.OPEN) {
            revert Raffle__RaffleNotOpen();
        }

        uint256 numTickets = msg.value / i_entranceFee;
        s_ticketsEntered[msg.sender] += numTickets;
        if (!s_uniquePlayers[msg.sender]) {
            s_uniquePlayers[msg.sender] = true;
            s_uniquePlayerCnt++;
        }

        for (uint i = 0; i < numTickets; i++) {
            s_players.push(msg.sender);
        }

        emit RaffleEnter(msg.sender);
    }

    /**
     * @dev This is the function that the Chainlink Keeper nodes call
     * they look for `upkeepNeeded` to return True.
     * the following should be true for this to return true:
     * 1. The time interval has passed between raffle runs.
     * 2. The lottery is open.
     * 3. The contract has ETH.
     * 4. Implicity, your subscription is funded with LINK.
     */
    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        override
        returns (bool upkeepNeeded, bytes memory /* checkData */)
    {
        bool isOpen = s_raffleState == RaffleState.OPEN;
        bool timePassed = ((block.timestamp - s_lastTimeStamp) > i_interval);
        // bool hasPlayers = s_players.length > 0;
        // bool hasBalance = address(this).balance > 0;
        upkeepNeeded = (isOpen && timePassed /*&& hasPlayers && hasBalance*/);
        return (upkeepNeeded, "0x0");
    }

    /**
     * @dev Once `checkUpkeep` is returning `true`, this function is called
     * and it kicks off a Chainlink VRF call to get a random winner.
     */
    function performUpkeep(bytes calldata /* performData */) external override {
        (bool upkeepNeeded, ) = checkUpkeep("");
        if (!upkeepNeeded) {
            revert Raffle__UpkeepNotNeeded(
                address(this).balance,
                s_players.length,
                uint256(s_raffleState),
                ((block.timestamp - s_lastTimeStamp) > i_interval)
            );
        }

        if (s_players.length == 0) {
            s_lastTimeStamp = block.timestamp;
            emit RaffleReset(s_lastTimeStamp);
            return;
        }

        s_raffleState = RaffleState.CALCULATING;

        if (s_uniquePlayerCnt == 1) {
            s_recentWinner = s_players[0];
            //reset player related state variables
            delete s_uniquePlayers[s_recentWinner];
            delete s_ticketsEntered[s_recentWinner];
            s_players = new address[](0);
            s_uniquePlayerCnt = 0;

            s_raffleState = RaffleState.OPEN;
            s_lastTimeStamp = block.timestamp;
            s_recentWinningAmount = address(this).balance;

            payTo(s_recentWinner, s_recentWinningAmount);
            emit WinnerPicked(s_recentWinner);
            return;
        } else {
            uint256 requestId = i_vrfCoordinator.requestRandomWords(
                i_gasLane,
                i_subscriptionId,
                REQUEST_CONFIRMATIONS,
                i_callbackGasLimit,
                NUM_WORDS
            );
            emit RequestedRaffleWinner(requestId);
        }
    }

    /**
     * @dev This is the function that Chainlink VRF node
     * calls to send the money to the random winner.
     */
    function fulfillRandomWords(
        uint256 /* requestId */,
        uint256[] memory randomWords
    ) internal override {
        uint256 indexOfWinner = randomWords[0] % s_players.length;
        address recentWinner = s_players[indexOfWinner];
        s_recentWinner = recentWinner;
        //reset player related state variables
        for (uint256 i = 0; i < s_players.length; i++) {
            if (s_uniquePlayers[s_players[i]]) {
                delete s_uniquePlayers[s_players[i]];
                delete s_ticketsEntered[s_players[i]];
            }
        }
        s_players = new address[](0);
        s_uniquePlayerCnt = 0;

        s_raffleState = RaffleState.OPEN;
        s_lastTimeStamp = block.timestamp;

        uint256 houseFee = (address(this).balance * i_houseFeePct) / 100;
        s_recentWinningAmount = address(this).balance - houseFee;

        payTo(owner(), houseFee);
        payTo(recentWinner, s_recentWinningAmount);
        emit WinnerPicked(recentWinner);
    }

    function endRaffle() external onlyOwner {
        if (
            s_raffleState != RaffleState.OPEN ||
            s_players.length > 0 ||
            address(this).balance > 0
        ) {
            revert Raffle__UnableToEnd(
                msg.sender,
                address(this).balance,
                s_players.length,
                uint256(s_raffleState)
            );
        } else {
            s_raffleState = RaffleState.ENDED;
            emit RaffleEnd(s_raffleState);
        }
    }

    function startRaffle() external onlyOwner {
        if (
            s_raffleState != RaffleState.ENDED ||
            s_players.length > 0 ||
            address(this).balance > 0
        ) {
            revert Raffle__UnableToStart(
                msg.sender,
                address(this).balance,
                s_players.length,
                uint256(s_raffleState)
            );
        } else {
            s_raffleState = RaffleState.OPEN;
            s_lastTimeStamp = block.timestamp;
            emit RaffleReset(s_lastTimeStamp);
        }
    }

    /* in case fulfillRandomWords call back function call 
    fails at chainlink, owner can refund all players */
    function refundAll() external onlyOwner {
        if (
            s_raffleState != RaffleState.CALCULATING ||
            s_players.length == 0 ||
            address(this).balance == 0
        ) {
            revert Raffle__UnableToRefund(
                msg.sender,
                address(this).balance,
                s_players.length,
                uint256(s_raffleState)
            );
        }

        for (uint256 i = 0; i < s_players.length; i++) {
            if (s_uniquePlayers[s_players[i]]) {
                address player = s_players[i];
                uint256 amount = s_ticketsEntered[player] * i_entranceFee;
                payTo(player, amount);
                delete s_uniquePlayers[s_players[i]];
                delete s_ticketsEntered[s_players[i]];
            }
        }

        s_players = new address[](0);
        s_uniquePlayerCnt = 0;

        s_raffleState = RaffleState.ENDED;
        emit RaffleEnd(s_raffleState);
    }

    function payTo(address recipient, uint amount) internal {
        (bool success, ) = payable(recipient).call{value: amount}("");
        if (!success) {
            revert Raffle__TransferFailed();
        }
    }

    function changeInterval(uint256 newInterval) external onlyOwner {
        if (s_raffleState != RaffleState.ENDED) {
            revert Raffle__UnableToChangeInterval(uint256(s_raffleState));
        }
        i_interval = newInterval;
    }

    /* Getter Functions */
    function getRaffleState() public view returns (RaffleState) {
        return s_raffleState;
    }

    function getNumWords() public pure returns (uint256) {
        return NUM_WORDS;
    }

    function getHouseFee() public view returns (uint256) {
        return i_houseFeePct;
    }

    function getRequestConfirmations() public pure returns (uint256) {
        return REQUEST_CONFIRMATIONS;
    }

    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }

    function getRecentWinningAmount() public view returns (uint256) {
        return s_recentWinningAmount;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }

    function getPlayers() public view returns (address[] memory) {
        return s_players;
    }

    function getLastTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }

    function getInterval() public view returns (uint256) {
        return i_interval;
    }

    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getNumberOfTickets() public view returns (uint256) {
        return s_players.length;
    }

    function getNumOfUniquePlayers() public view returns (uint256) {
        return s_uniquePlayerCnt;
    }

    function getTicketsEnteredByPlayer(
        address player
    ) public view returns (uint256) {
        return s_ticketsEntered[player];
    }
}
