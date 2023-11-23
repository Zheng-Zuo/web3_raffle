import CountDownCard from './countdowncard'
import BuyCard from './buycard'
import RaffleStatsCard from './rafflestatscard'

const DrawBox = () => {
  
  return (
    <div className='space-y-5 md:space-y-0 m-5 md:flex items-start justify-center  md:space-x-5'>

      <div className='stats-container md:w-[55%] md:max-w-[600px]'>

        <h1 className='text-4xl text-white font-semibold text-center mb-3'>
          The Next Draw
        </h1>

        <RaffleStatsCard />

        <div className='mt-5 mb-3'>
          <CountDownCard />
        </div>

        <p className="text-xs text-emerald-300 pt-6">
          Rules: Each player can buy up to 10 tickets at a time. The raffle will draw a winner and reset around every 2 hours, when the winner is drawn, a 3% commission is taken from the total pool. The remaining 97% is distributed to the winner.
          If there's only a single player during the draw (regardless of how many tickets he/she has purchased), he/she will receive the 100% of the pool.
        </p>
      </div>

      <BuyCard />
      
    </div>
  )
}

export default DrawBox
