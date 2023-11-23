"use client"

import PlayerCard from "./playercard"
import { ethersGetTicketsByPlayer, getPlayers, getRaffleEntranceFee, getTicketsEnteredByPlayer, listenEvents } from "@/utils/actions"
import { useEffect, useState } from "react"
import { ethers } from "ethers"

const PlayerTable = () => {
  const [uniqueAddresses, setUniqueAddresses] = useState<string[]>([])
  const [entranceFee, setEntranceFee] = useState<string | null>(null)
  const [players, setPlayers] = useState<any[]>([])

  const rafflePlayers = getPlayers()
  const getEntranceFee = getRaffleEntranceFee()

  const unwatch1 = listenEvents("WinnerPicked", [rafflePlayers.refetch])
  const unwatch2 = listenEvents("RaffleEnter", [rafflePlayers.refetch])

  useEffect(() => {
    // console.log(getEntranceFee.data)
    if (getEntranceFee.data && !getEntranceFee.isLoading && getEntranceFee.isSuccess) {
      setEntranceFee(ethers.formatEther(getEntranceFee.data as bigint))
    }
  }, [getEntranceFee.data])

  useEffect(() => {
    if (rafflePlayers.data && !rafflePlayers.isLoading && rafflePlayers.isSuccess) {
      const uniqueRafflePlayers = Array.from(new Set(rafflePlayers.data as string[]))
      setUniqueAddresses(uniqueRafflePlayers)
    }
  }, [rafflePlayers.data])

  useEffect(() => {
    setPlayers([])
    if (uniqueAddresses.length > 0) {
      const playerPromises = uniqueAddresses.map(async (address) => {
        const tickets = await ethersGetTicketsByPlayer(address)
        return {
          address: address,
          amount: Number(entranceFee) * tickets,
          tickets: tickets
        }
      })

      Promise.all(playerPromises).then(playerList => setPlayers(playerList))
    }
  }, [uniqueAddresses])


  return (
    <div className="flex justify-center flex-col w-[78%] m-auto pt-4 mb-5">
      <div className="max-h-[calc(100vh_-_25rem)] overflow-y-auto
        shadow-md rounded-md w-full mb-10">
        <table className='min-w-full'>
          <thead className='border border-emerald-300/20'>
            <tr>
              <th
                scope="col"
                className="text-sm font-medium px-6 py-4 text-left"
              >
                Address
              </th>
              <th
                scope="col"
                className="text-sm font-medium px-6 py-4 text-left"
              >
                Amount
              </th>
              <th
                scope="col"
                className="text-sm font-medium px-6 py-4 text-left"
              >
                Tickets
              </th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, i) => (
              <PlayerCard key={i} {...player} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PlayerTable
