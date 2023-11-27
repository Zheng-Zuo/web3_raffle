"use client"

import { FaRegStopCircle } from "react-icons/fa";
import { MdOutlineNotStarted } from "react-icons/md";
import { toast } from 'react-hot-toast';
import { CircularProgress } from '@mui/material';
import { useAccount, useNetwork } from "wagmi";
import { updateInterval, endRaffle, refundRaffle, startRaffle, parseErrorMessages } from "@/utils/actions";
import { useState } from "react";


const AdminControls = () => {
  const [interval, setInterval] = useState<number>(7200)

  const { address } = useAccount()
  const { chain } = useNetwork()
  const endTx = endRaffle()
  const startTx = startRaffle()
  const refundTx = refundRaffle()
  const intervalTx = updateInterval()

  const handleClickEnd = async () => {
    if (address && chain && chain.id === 11155111) {
      await endTx.writeAsync().then((result) => {
        toast.success('Successfully ended the raffle')
      }).catch((err) => {
        const errorMessage = parseErrorMessages(err)
        toast.error(errorMessage)
        // console.log(err)
      })
    } else {
      toast.error('Please connect to the Sepolia testnet')
    }
  }

  const handleClickStart = async () => {
    if (address && chain && chain.id === 11155111) {
      await startTx.writeAsync().then((result) => {
        toast.success('Successfully started the raffle')
      }).catch((err) => {
        const errorMessage = parseErrorMessages(err)
        toast.error(errorMessage)
        console.log(err)
      })
    } else {
      toast.error('Please connect to the Sepolia testnet')
    }
  }

  const handleClickRefund = async () => {
    if (address && chain && chain.id === 11155111) {
      await refundTx.writeAsync().then((result) => {
        toast.success('Successfully refunded all players')
      }).catch((err) => {
        const errorMessage = parseErrorMessages(err)
        toast.error(errorMessage)
        console.log(err)
      })
    } else {
      toast.error('Please connect to the Sepolia testnet')
    }
  }

  const handleChangeInterval = async () => {
    if (address && chain && chain.id === 11155111) {
      await intervalTx.writeAsync({
        args: [interval]
      }).then((result) => {
        toast.success('Successfully updated the raffle interval time')
      }).catch((err) => {
        const errorMessage = parseErrorMessages(err)
        toast.error(errorMessage)
        console.log(err)
      })
    } else {
      toast.error('Please connect to the Sepolia testnet')
    }
  }

  if (address !== process.env.NEXT_PUBLIC_CONTRACT_OWNER) {
    return null;  // If not the contract owner, don't render anything
  }

  return (

    <div className='text-white text-center px-5 py-3 rounded-md border-emerald-300/20 border m-auto max-w-[500px] flex flex-col gap-4'>
      <h2 className='font-bold mb-3'>Admin Controls</h2>
      {/* <p className='mb-5'>Total Commission to be withdrawn...</p> */}

      <div className='flex flex-col space-y-2 md:flex-row md:space-y-0 ms:space-x-2 gap-3'>

        {endTx.isLoading ?
          <div className="flex items-center w-[33%] justify-center mt-5 mb-5">
            <CircularProgress />
          </div> :
          <button className='admin-button' onClick={handleClickEnd}>
            <FaRegStopCircle className="h-6 mx-auto my-2" />
            End Game
          </button>}

        {startTx.isLoading ?
          <div className="flex items-center w-[33%] justify-center mt-5 mb-5">
            <CircularProgress />
          </div> :
          <button className='admin-button' onClick={handleClickStart}>
            <MdOutlineNotStarted className="h-6 mx-auto my-2" />
            Start Game
          </button>}

        {refundTx.isLoading ?
          <div className="flex items-center w-[33%] justify-center mt-5 mb-5">
            <CircularProgress />
          </div> :
          <button className='admin-button' onClick={handleClickRefund}>
            <MdOutlineNotStarted className="h-6 mx-auto my-2" />
            Refund All
          </button>}
      </div>

      <div className="flex gap-4">
        <div className='flex text-white items-center space-x-2 bg-[#091B18] border-[#004337] border p-4 w-[65%]'>
          <p>INTERVAL (seconds)</p>
          <input
            type="number"
            className='flex bg-transparent text-right outline-none w-full'
            min={120}
            max={7200}
            value={interval}
            onChange={e => setInterval(parseInt(e.target.value))}
          />
        </div>

        {intervalTx.isLoading ?
          <div className="flex items-center w-[33%] justify-center mt-5 mb-5">
            <CircularProgress />
          </div> :
          <button className='admin-button w-[25%]' onClick={handleChangeInterval}>
            Update
          </button>}
      </div>
    </div>

  )
}

export default AdminControls
