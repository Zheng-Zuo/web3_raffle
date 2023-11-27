"use client"

import { useEffect, useState } from 'react'
import { getDisplayTickets } from '@/utils'
import { enterRaffle, getRaffleEntranceFee, getTicketsEnteredByPlayer, listenEvents, parseErrorMessages } from '@/utils/actions'
import { ethers } from 'ethers'
import { useGlobalStates } from "@/providers/GlobalStatesProvider"
import { useAccount, useNetwork } from 'wagmi';
import { toast } from 'react-hot-toast';
import { CircularProgress } from '@mui/material';

const BuyCard = () => {
  const { address } = useAccount()
  const { chain } = useNetwork()

  const { raffleState, drawTimeStamp } = useGlobalStates()

  const [disabled, setDisabled] = useState<boolean>(false)
  const [quantity, setQuantity] = useState<number>(1)
  const [purchasedTickets, setPurchasedTickets] = useState<number>(0)
  const [entranceFee, setEntranceFee] = useState<string | null>(null)

  const getEntranceFee = getRaffleEntranceFee()
  const getPurchasedTickets = getTicketsEnteredByPlayer(address)
  const enterTx = enterRaffle()

  const unwatch1 = listenEvents("WinnerPicked", [getPurchasedTickets.refetch])
  const unwatch2 = listenEvents("RaffleEnter", [getPurchasedTickets.refetch])

  const handleClick = async () => {
    if (address && chain && chain.id === 11155111) {
      await enterTx.writeAsync({
        value: ethers.parseEther((quantity * Number(entranceFee)).toString()),
      }).then((result) => {
        toast.success('Successfully entered the raffle')
      }).catch((err) => {
        const errorMessage = parseErrorMessages(err)
        toast.error(errorMessage)
        // console.log(err)
      })
    } else {
      toast.error('Please connect to the Sepolia testnet')
    }
  }

  useEffect(() => {
    // console.log(getEntranceFee.data)
    if (getEntranceFee.data && !getEntranceFee.isLoading && getEntranceFee.isSuccess) {
      setEntranceFee(ethers.formatEther(getEntranceFee.data as bigint))
    }
  }, [getEntranceFee.data])

  useEffect(() => {
    const fetchPurchasedTickets = async () => {
      const res = await getPurchasedTickets.refetch()
      if (res.data && !res.isLoading && res.isSuccess) {
        setPurchasedTickets(Number(res.data))
      } else {
        setPurchasedTickets(0); // reset tickets when address changes
      }
    }
    fetchPurchasedTickets();
  }, [address])

  useEffect(() => {
    if (getPurchasedTickets.data && !getPurchasedTickets.isLoading && getPurchasedTickets.isSuccess) {
      setPurchasedTickets(Number(getPurchasedTickets.data))
    }
    return () => {
      unwatch1?.()
      unwatch2?.()
    }
  }, [getPurchasedTickets.data])

  useEffect(() => {
    if (raffleState != 0) {
      setDisabled(true)
    } else if (drawTimeStamp) {
      if (Date.now() > drawTimeStamp.getTime()) {
        setDisabled(true)
      }
    } else {
      setDisabled(false)
    }
  }, [raffleState, drawTimeStamp])


  return (
    <div className='stats-container space-y-2 md:w-[35%] md:max-w-[450px]'>

      <div className="stats-container">

        <div className='flex justify-between items-center text-white pb-2 gap-4'>
          <h2>Price per ticket</h2>
          <p>{entranceFee} ETH</p>
        </div>

        <div className='flex text-white items-center space-x-2 bg-[#091B18] border-[#004337] border p-4'>
          <p>TICKETS</p>
          <input
            type="number"
            className='flex w-full bg-transparent text-right outline-none'
            min={1}
            max={10}
            value={quantity}
            onChange={e => setQuantity(parseInt(e.target.value))}
          />
        </div>

        <div className="space-y-2 mt-5">

          <div className='flex items-center justify-between text-emerald-300 text-sm italic font-extrabold'>
            <p>Total cost of tickets</p>
            <p>{quantity * Number(entranceFee)}</p>
          </div>

          <div className='flex items-center justify-between text-emerald-300 text-xs italic'>
            <p>+ Network Fees</p>
            <p>TBC</p>
          </div>

        </div>

        {enterTx.isLoading ?
          <div className="flex items-center w-full justify-center mt-5 mb-5">
            <CircularProgress />
          </div> :
          <button
            disabled={disabled}
            className='mt-5 w-full bg-gradient-to-br from-orange-500 to-emerald-600 px-10 py-5
        rounded-md text-white shadow-xl font-semibold disabled:from-gray-600 disabled:to-gray-600 
        disabled:text-gray-100 disabled:cursor-not-allowed'
            onClick={handleClick}
          >
            Buy {quantity} tickets for {quantity * Number(entranceFee)} ETH
          </button>
        }

      </div>

      {address && (
        <div className="stats">
          <p className="text-sm mb-2">
            You now have {purchasedTickets} tickets in this draw
          </p>

          <div className='flex max-w-sm flex-wrap gap-2'>
            {getDisplayTickets(purchasedTickets).map((ticket, index) => (
              typeof ticket === 'number' ?
                <p
                  key={index}
                  className='text-white h-16 w-12 bg-emerald-500/30 rounded-lg
                  flex flex-shrink-0 items-center justify-center text-xs italic'>
                  {ticket + 1}
                </p>
                :
                <p
                  key={index}
                  className='text-white h-16 w-12 bg-emerald-500/30 rounded-lg
                  flex flex-shrink-0 items-center justify-center text-xs italic'>
                  {ticket} {/* ... */}
                </p>
            ))}
          </div>

        </div>
      )}

    </div>
  )
}

export default BuyCard
