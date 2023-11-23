import { AdminControls, DrawBox, Footer, MarqueeCard, PlayerTable } from "@/components";


export default function Home() {
  return (
    <main>
      <div className="pt-24">
        <MarqueeCard />
        <AdminControls />
        <DrawBox />
        <PlayerTable />
        <Footer />
      </div>
    </main>
  )
}
