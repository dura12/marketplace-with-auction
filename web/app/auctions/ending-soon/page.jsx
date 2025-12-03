
import { EndingSoonAuctions } from "@/components/auction/ending-soon-auctions"

export const metadata = {
  title: "Ending Soon Auctions | Auction Marketplace",
  description: "Browse auctions that are ending within the next 24 hours",
}

export default function EndingSoonPage() {
  return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Ending Soon</h1>
          <p className="text-muted-foreground mt-2">
            These auctions are ending within the next 24 hours. Don't miss your chance to bid!
          </p>
        </div>

        <EndingSoonAuctions />
      </div>
    
  )
}

