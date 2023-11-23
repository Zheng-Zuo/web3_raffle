"use client"

import { getInterval, getLastTimeStamp, getRaffleState, listenEvents } from "@/utils/actions"
import { useEffect } from "react"
import Countdown from "react-countdown"
import { useGlobalStates } from "@/providers/GlobalStatesProvider"

interface Props {
  hours: number;
  minutes: number;
  seconds: number;
  completed: boolean;
}

const CountDownCard = () => {
  const { drawTimeStamp, setDrawTimeStamp, raffleState, setRaffleState } = useGlobalStates()
  const raffle_interval = getInterval()
  const raffleLastTimeStamp = getLastTimeStamp()
  const raffle_State = getRaffleState()
  const unwatch1 = listenEvents("WinnerPicked", [raffleLastTimeStamp.refetch, raffle_State.refetch, raffle_State.refetch])
  const unwatch2 = listenEvents("RaffleReset", [raffleLastTimeStamp.refetch, raffle_State.refetch, raffle_State.refetch])
  const unwatch3 = listenEvents("RequestedRaffleWinner", [raffle_State.refetch])
  // console.log(raffleState)

  useEffect(() => {
    if (raffle_interval.data && !raffle_interval.isLoading && raffle_interval.isSuccess
      && raffleLastTimeStamp.data && !raffleLastTimeStamp.isLoading && raffleLastTimeStamp.isSuccess) {
      const timestampInSeconds = (Number(raffleLastTimeStamp.data) + Number(raffle_interval.data))
      setDrawTimeStamp(new Date(timestampInSeconds * 1000))
    }
    return () => {
      unwatch1?.()
      unwatch2?.()
    }
  }, [raffleLastTimeStamp.data])

  useEffect(() => {
    if (raffle_State.data && !raffle_State.isLoading && raffle_State.isSuccess) {
      setRaffleState(Number(raffle_State.data))
    }
    return () => {
      unwatch3?.()
    }
  }, [raffle_State.data])

  const TIME_LABELS = ['hours', 'minutes', 'seconds'];
  const renderCountdownSection = (time: number, label: string, index: number) => (
    <div className="flex-1" key={index}>
      <div className="countdown">{time}</div>
      <div className="countdown-label">{label}</div>
    </div>
  );

  const renderer = ({ hours, minutes, seconds, completed }: Props) => {
    let countdownMessage = "Time Remaining"
    let timeValues = [hours, minutes, seconds]

    if (raffleState == 1 || (raffleState == 0 && completed)) {
      countdownMessage = "Picking a winner, please wait for the next round";
      timeValues = [0, 0, 0];
    } else if (raffleState === 2) {
      countdownMessage = "Raffle has ended, ticket sales have now CLOSED";
      timeValues = [0, 0, 0];
    }

    return (
      <div>
        <h3 className="text-white text-xl mb-3 italic text-center animate-bounce">
          {countdownMessage}
        </h3>

        <div className="flex gap-4 w-full flex-wrap">
          {timeValues.map((time, index) => renderCountdownSection(time, TIME_LABELS[index], index))}
        </div>
      </div>
    )
  }

  return (
    <div>
      {drawTimeStamp && <Countdown date={drawTimeStamp} renderer={renderer} />}
    </div>
  )
}

export default CountDownCard
