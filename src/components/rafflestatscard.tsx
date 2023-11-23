"use client"

import { getRaffleBalance, getRafflePlayers, getNumOfTickets, listenEvents } from "@/utils/actions"
import { useEffect, useState } from "react"

const RaffleStatsCard = () => {
    const [balance, setBalance] = useState(0)
    const [totalPlayers, setTotalPlayers] = useState(0)
    const [ticketsSold, setTicketsSold] = useState(0)

    const getBalance = getRaffleBalance()
    const getNumOfPlayers = getRafflePlayers()
    const getTicketNum = getNumOfTickets()

    const unwatch1 = listenEvents("WinnerPicked", [getBalance.refetch, getNumOfPlayers.refetch, getTicketNum.refetch])
    const unwatch2 = listenEvents("RaffleEnter", [getBalance.refetch, getNumOfPlayers.refetch, getTicketNum.refetch])

    useEffect(() => {
        if (getBalance.data && !getBalance.isLoading && getBalance.isSuccess
            && getNumOfPlayers.data && !getNumOfPlayers.isLoading && getNumOfPlayers.isSuccess
            && getTicketNum.data && !getTicketNum.isLoading && getTicketNum.isSuccess) {
            setBalance(Number(getBalance.data.formatted))
            setTotalPlayers(Number(getNumOfPlayers.data))
            setTicketsSold(Number(getTicketNum.data))
        }
        return () => {
            unwatch1?.()
            unwatch2?.()
        }
    }, [getBalance.data, getNumOfPlayers.data, getTicketNum.data])

    return (
        <div className='flex justify-between p-2 space-x-2'>

            <div className="stats">
                <h2 className='text-sm'>Current Pool</h2>
                <p className='text-lg'>{balance} ETH</p>
            </div>

            <div className="stats">
                <h2 className='text-sm'>Total Players</h2>
                <p className='text-lg'>{totalPlayers}</p>
            </div>

            <div className="stats">
                <h2 className='text-sm'>Tickets Sold</h2>
                <p className='text-lg'>{ticketsSold}</p>
            </div>

        </div>
    )
}

export default RaffleStatsCard
