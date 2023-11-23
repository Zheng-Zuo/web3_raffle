"use client"

import { PropsWithChildren, createContext, useContext, useState } from "react"

type ContextState = {
    drawTimeStamp: Date | null;
    setDrawTimeStamp: (date: Date) => void;

    raffleState: number;
    setRaffleState: (state: number) => void;

}

export const globalStates = createContext<ContextState | null>(null)

export const GlobalStatesProvider = (props: PropsWithChildren) => {

    const [drawTimeStamp, setDrawTimeStamp] = useState<Date | null>(null)
    const [raffleState, setRaffleState] = useState(0)

    const default_value = {
        drawTimeStamp,
        setDrawTimeStamp,
        raffleState,
        setRaffleState,
    }

    return (
        <globalStates.Provider value={default_value}>
            {props.children}
        </globalStates.Provider>
    )
}

export const useGlobalStates = () => {
    const context = useContext(globalStates)
    if (!context) {
        throw new Error("Please use filter provider in the parent element")
    }
    return context
}