export const getDisplayTickets = (tickets: number) => {
    if (tickets <= 12) {
        return Array(tickets).fill("").map((_, i) => i)
    } else {
        let firstFive = Array.from({ length: 5 }, (_, i) => i);
        let lastSix = Array.from({ length: 6 }, (_, i) => i + tickets - 6);
        return [...firstFive, "...", ...lastSix]
    }
}

export const truncateText = (
    text: string,
    startChars: number,
    endChars: number,
    maxLength: number) => {
    if (text.length > maxLength) {
        const start = text.slice(0, startChars)
        const end = text.slice(text.length - endChars, text.length)
        return `${start}...${end}`
    }
    return text
}
