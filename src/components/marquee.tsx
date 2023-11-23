"use client"

import { getLastWinner, getLastWinningAmount, listenEvents } from "@/utils/actions";
import { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import { ethers } from "ethers";

const MarqueeCard = () => {
  const [lastWinner, setLastWinner] = useState<string | null>(null)
  const [lastWinningAmount, setLastWinningAmount] = useState<string | null>(null)
  const getlastWinner = getLastWinner()
  const getlastWinningAmount = getLastWinningAmount()
  const unwatch = listenEvents("WinnerPicked", [getlastWinner.refetch, getlastWinningAmount.refetch])

  useEffect(() => {
    if (getlastWinner.data && !getlastWinner.isLoading && getlastWinner.isSuccess
      && getlastWinningAmount.data && !getlastWinningAmount.isLoading && getlastWinningAmount.isSuccess) {
        setLastWinner(getlastWinner.data as string) 
        const amount = ethers.formatEther(getlastWinningAmount.data as bigint)
        setLastWinningAmount(amount.toString())
    }
    return () => {
      unwatch?.()
    }
  }, [getlastWinner.data, getlastWinningAmount.data])

  return (
    <Marquee className="bg-[#10302b] p-2 mb-8" gradient={false} speed={100}>
      <div className="flex space-x-2 mx-10">
        <h4 className="text-white font-bold">Last Winner: {lastWinner}</h4>
        <h4 className="text-white font-bold">Previous winnings: {lastWinningAmount}</h4>
      </div>
    </Marquee>
  )
}

export default MarqueeCard
