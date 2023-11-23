import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { assert, expect } from "chai";
import { network, deployments, ethers } from "hardhat";
import { developmentChains, networkConfig } from "../../helper-hardhat-config";
import { Raffle, VRFCoordinatorV2Mock } from "../../typechain-types";

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle Unit Tests", function () {
    console.log("")
    console.log(`Detected network: ${network.name}, starting unit tests...`)
    let raffle: Raffle;
    let raffleContract: Raffle;
    let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock;
    let raffleEntranceFee: bigint;
    let raffleHouseFeePct: bigint;
    let interval: number;
    let player: SignerWithAddress;
    let accounts: SignerWithAddress[];

    beforeEach(async () => {
      accounts = await ethers.getSigners()
      player = accounts[1]
      await deployments.fixture(["mocks", "raffle"])
      vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
      raffleContract = await ethers.getContract("Raffle")
      raffle = raffleContract.connect(player)
      raffleEntranceFee = await raffle.getEntranceFee()
      raffleHouseFeePct = await raffle.getHouseFee()
      interval = Number(await raffle.getInterval())
    })

    describe("Constructor", function () {

      it("Raffle initialized with the correct state", async function () {
        const rafflestate = (await raffle.getRaffleState()).toString()
        assert.equal(rafflestate, "0")
      })

      it("Raffle initialized with the correct interval", async function () {
        assert.equal(
          interval.toString(),
          networkConfig[network.config.chainId!]["keepersUpdateInterval"]
        )
      })

      it("Raffle initialized with the correct entrance fee", async function () {
        assert.equal(
          raffleEntranceFee.toString(),
          networkConfig[network.config.chainId!]["raffleEntranceFee"]
        )
      })

      it("Raffle initialized with the correct percentage house fee ", async function () {
        assert.equal(
          raffleHouseFeePct.toString(),
          networkConfig[network.config.chainId!]["houseFeePct"]
        )
      })
    })

    describe("EnterRaffle", function () {

      it("revert when you don't pay enough", async () => {
        const amount = Number(ethers.formatEther(raffleEntranceFee)) - 0.001
        await expect(raffle.enterRaffle({ value: ethers.parseEther(amount.toString()) }))
          .to
          .be
          .revertedWithCustomError(
            raffle,
            'Raffle__InvalidEntranceFee'
          )
      })

      it("revert when your pay is not % by raffle entrance fee", async () => {
        const amount = Number(ethers.formatEther(raffleEntranceFee)) * 1.05
        await expect(raffle.enterRaffle({ value: ethers.parseEther(amount.toString()) }))
          .to
          .be
          .revertedWithCustomError(
            raffle,
            'Raffle__InvalidEntranceFee'
          )
      })

      it("records player when they enter", async () => {
        await raffle.enterRaffle({ value: raffleEntranceFee })
        const contractPlayer = await raffle.getPlayer(0)
        assert.equal(contractPlayer, player.address)
      })

      it("records the correct number of unique players", async () => {
        const amount = Number(ethers.formatEther(raffleEntranceFee)) * 5
        await raffle.enterRaffle({ value: ethers.parseEther(amount.toString()) })
        const numOfUniquePlayers = await raffle.getNumOfUniquePlayers()
        assert.equal(numOfUniquePlayers.toString(), "1")
      })

      it("records the correct number of total players", async () => {
        const additionalEntrances = 5
        const startingIndex = 2
        for (let i = startingIndex; i < additionalEntrances + startingIndex; i++) {
          raffle = raffleContract.connect(accounts[i])
          await raffle.enterRaffle({ value: raffleEntranceFee })
        }
        const numOfUniquePlayers = await raffle.getNumOfUniquePlayers()
        assert.equal(numOfUniquePlayers.toString(), additionalEntrances.toString())
      })

      it("records the correct number of total tickets by player", async () => {
        const numOfTickets = 5
        const amount = Number(ethers.formatEther(raffleEntranceFee)) * numOfTickets
        await raffle.enterRaffle({ value: ethers.parseEther(amount.toString()) })
        const totalTicketsByPlayer = await raffle.getTicketsEnteredByPlayer(player.address)
        assert.equal(totalTicketsByPlayer.toString(), numOfTickets.toString())
      })

      it("emits event on enter", async () => {
        await expect(raffle.enterRaffle({ value: raffleEntranceFee }))
          .to
          .emit(raffle, "RaffleEnter")
          .withArgs(player.address)
      })

      it("doesn't allow entrance when raffle is calculating", async () => {
        const additionalEntrances = 5
        const startingIndex = 2
        for (let i = startingIndex; i < additionalEntrances + startingIndex; i++) {
          raffle = raffleContract.connect(accounts[i])
          await raffle.enterRaffle({ value: raffleEntranceFee })
        }
        await network.provider.send("evm_increaseTime", [interval + 1])
        await network.provider.request({ method: "evm_mine", params: [] })
        await raffle.performUpkeep("0x")
        raffle = raffleContract.connect(player)
        await expect(raffle.enterRaffle({ value: raffleEntranceFee }))
          .to
          .be
          .revertedWithCustomError(
            raffle,
            'Raffle__RaffleNotOpen'
          )
        const rafflestate = (await raffle.getRaffleState()).toString()
        assert.equal(rafflestate, "1")
      })
    })

    describe("CheckUpkeep", function () {
      it("returns true if as long as enough time has past", async () => {
        await network.provider.send("evm_increaseTime", [interval + 1])
        await network.provider.request({ method: "evm_mine", params: [] })
        const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x")
        assert.equal(upkeepNeeded, true)
      })

      it("returns false if raffle is not open", async () => {
        const additionalEntrances = 5
        const startingIndex = 2
        for (let i = startingIndex; i < additionalEntrances + startingIndex; i++) {
          raffle = raffleContract.connect(accounts[i])
          await raffle.enterRaffle({ value: raffleEntranceFee })
        }
        await network.provider.send("evm_increaseTime", [interval + 1])
        await network.provider.request({ method: "evm_mine", params: [] })
        await raffle.performUpkeep("0x")
        const raffleState = await raffle.getRaffleState()
        const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x")
        assert.equal(upkeepNeeded === false, raffleState.toString() === "1")
      })

      it("returns false if not enough time has passed", async () => {
        const additionalEntrances = 5
        const startingIndex = 2
        for (let i = startingIndex; i < additionalEntrances + startingIndex; i++) {
          raffle = raffleContract.connect(accounts[i])
          await raffle.enterRaffle({ value: raffleEntranceFee })
          // console.log("Current timestamp is: ", (await raffle.getBlockTimestamp()).toString())
        }
        await network.provider.send("evm_increaseTime", [interval - additionalEntrances - 1])
        await network.provider.request({ method: "evm_mine", params: [] })
        // console.log("Current timestamp is: ", (await raffle.getBlockTimestamp()).toString())
        // console.log('last timestamp: ', (await raffle.getLastTimeStamp()).toString())
        const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x")
        assert.equal(upkeepNeeded, false)
      })

      it("returns true if enough time has passed and has players and is open", async () => {
        const additionalEntrances = 5
        const startingIndex = 2
        for (let i = startingIndex; i < additionalEntrances + startingIndex; i++) {
          raffle = raffleContract.connect(accounts[i])
          await raffle.enterRaffle({ value: raffleEntranceFee })
          // console.log("Current timestamp is: ", (await raffle.getBlockTimestamp()).toString())
        }
        await network.provider.send("evm_increaseTime", [interval])
        await network.provider.request({ method: "evm_mine", params: [] })
        // console.log("Current timestamp is: ", (await raffle.getBlockTimestamp()).toString())
        // console.log('last timestamp: ', (await raffle.getLastTimeStamp()).toString())
        const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x")
        assert.equal(upkeepNeeded, true)
      })
    })

    describe("PerformUpkeep", function () {
      it("can only run if checkupkeep is true", async () => {
        await raffle.enterRaffle({ value: raffleEntranceFee })
        await network.provider.send("evm_increaseTime", [interval])
        await network.provider.request({ method: "evm_mine", params: [] })
        const tx = raffle.performUpkeep("0x")
        assert(tx)
      })

      it("reset the game if no one has entered but enough time has passed", async () => {
        const initialTimeStamp = await raffle.getLastTimeStamp()
        await network.provider.send("evm_increaseTime", [interval])
        await network.provider.request({ method: "evm_mine", params: [] })
        await expect(raffle.performUpkeep("0x"))
          .to
          .emit(raffle, "RaffleReset")
        const endingTimeStamp = await raffle.getLastTimeStamp()
        assert(endingTimeStamp > initialTimeStamp)
        const raffleState = await raffle.getRaffleState()
        assert.equal(raffleState.toString(), "0")
        const numOfUniquePlayers = await raffle.getNumOfUniquePlayers()
        assert.equal(numOfUniquePlayers.toString(), "0")
      })

      it("reverts if checkupkeep is false", async () => {
        await expect(raffle.performUpkeep("0x"))
          .to
          .be
          .revertedWithCustomError(
            raffle,
            'Raffle__UpkeepNotNeeded'
          )
      })

      it("updates the raffle state and emits a requestId", async () => {
        const additionalEntrances = 5
        const startingIndex = 2
        for (let i = startingIndex; i < additionalEntrances + startingIndex; i++) {
          raffle = raffleContract.connect(accounts[i])
          await raffle.enterRaffle({ value: raffleEntranceFee })
        }
        await network.provider.send("evm_increaseTime", [interval])
        await network.provider.request({ method: "evm_mine", params: [] })
        const tx = await raffle.performUpkeep("0x")
        const receipt = await tx.wait(1)
        // console.log("receipt: ", receipt)
        if ('args' in receipt!.logs[1]) {
          const requestId = receipt!.logs[1].args.requestId
          assert(requestId > 0)
        } else { assert(false) }
        const raffleState = await raffle.getRaffleState()
        assert.equal(raffleState.toString(), "1")
      })
    })

    describe("EndRaffle", function () {
      it("can only be called by the owner", async () => {
        // await raffle.endRaffle()
        await expect(raffle.endRaffle())
          .to
          .be
          .revertedWithCustomError(
            raffle,
            'OwnableUnauthorizedAccount',
          )
          .withArgs(player.address)
      })

      it("can only be called when raffle is open and no players", async () => {
        const raffleOwner = raffleContract.connect(accounts[0])
        const initialState = await raffle.getRaffleState()
        const numOfUniquePlayers = await raffle.getNumOfUniquePlayers()
        assert.equal(numOfUniquePlayers.toString(), "0")
        assert.equal(initialState.toString(), "0")
        await raffleOwner.endRaffle()
        const endingState = await raffle.getRaffleState()
        assert.equal(endingState.toString(), "2")
      })

      it("can not be called when there's player in the game", async () => {
        const raffleOwner = raffleContract.connect(accounts[0])
        await raffle.enterRaffle({ value: raffleEntranceFee })
        const numOfUniquePlayers = await raffle.getNumOfUniquePlayers()
        assert.equal(numOfUniquePlayers.toString(), "1")
        await expect(raffleOwner.endRaffle())
          .to
          .be
          .revertedWithCustomError(
            raffle,
            'Raffle__UnableToEnd',
          )
          .withArgs(
            accounts[0].address,
            raffleEntranceFee,
            numOfUniquePlayers,
            0)
      })
    })

    describe("StartRaffle", function () {
      it("can only be called by the owner", async () => {
        await expect(raffle.startRaffle())
          .to
          .be
          .revertedWithCustomError(
            raffle,
            'OwnableUnauthorizedAccount',
          )
          .withArgs(player.address)
      })

      it("can not be called when raffle is open", async () => {
        const raffleOwner = raffleContract.connect(accounts[0])
        await expect(raffleOwner.startRaffle())
          .to
          .be
          .revertedWithCustomError(
            raffle,
            'Raffle__UnableToStart',
          )
          .withArgs(
            accounts[0].address,
            BigInt(0),
            BigInt(0),
            0)
      })

      it("can only be called after raffle has been ended", async () => {
        const raffleOwner = raffleContract.connect(accounts[0])
        await raffleOwner.endRaffle()
        const initialState = await raffle.getRaffleState()
        assert.equal(initialState.toString(), "2")
        await raffleOwner.startRaffle()
        const endingState = await raffle.getRaffleState()
        assert.equal(endingState.toString(), "0")
      })

    })

    describe("fulfillRandomWords", function () {
      this.beforeEach(async () => {
        const additionalEntrances = 5
        const startingIndex = 2
        for (let i = startingIndex; i < additionalEntrances + startingIndex; i++) {
          raffle = raffleContract.connect(accounts[i])
          await raffle.enterRaffle({ value: raffleEntranceFee })
        }
        await network.provider.send("evm_increaseTime", [interval])
        await network.provider.request({ method: "evm_mine", params: [] })
      })

      it("it can only be called after performUpkeep", async () => {
        await expect(vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.target))
          .to
          .be
          .revertedWith('nonexistent request')
      })

      it("picks a winner, resets, and sends money", async () => {
        const startingTimeStamp = await raffle.getLastTimeStamp()


        await new Promise<void>(async (resolve, reject) => {
          raffle.once(raffle.filters.WinnerPicked(), async () => {
            console.log("WinnerPicked event emitted")
            try {
              const recentWinner = await raffle.getRecentWinner()
              console.log("Recent winner is: ", recentWinner)

              const raffleState = await raffle.getRaffleState()
              const winnerBalance = await ethers.provider.getBalance(recentWinner)
              const endingTimeStamp = await raffle.getLastTimeStamp()
              await expect(raffle.getPlayer(0)).to.be.reverted
              assert.equal(raffleState.toString(), "0")
              assert.equal(recentWinner, accounts[3].address)
              assert(endingTimeStamp > startingTimeStamp)

              const totalAmount = raffleEntranceFee * BigInt(5)
              const houseFee = (totalAmount * raffleHouseFeePct) / BigInt(100)

              assert.equal(
                winnerBalance.toString(),
                (startingBalance + totalAmount - houseFee).toString()
              )
              console.log("Ending balance is: ", (ethers.formatEther(winnerBalance)).toString())

              resolve()
            } catch (e) {
              reject(e)
            }
          })

          const tx = await raffle.performUpkeep("0x")
          const receipt = await tx.wait(1)
          const startingBalance = await ethers.provider.getBalance(accounts[3].address)
          console.log("Starting balance is: ",
            ethers.formatEther(startingBalance.toString()),
            "for address: ", accounts[3].address
          )

          let requestId: bigint
          if ('args' in receipt!.logs[1]) {
            requestId = receipt!.logs[1].args.requestId
            assert(requestId > 0)
          } else { assert(false) }

          await vrfCoordinatorV2Mock.fulfillRandomWords(
            requestId,
            raffle.target
          )
        })
      })
    })
  })