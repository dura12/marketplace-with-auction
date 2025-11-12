import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from 'lucide-react'

type PartnersProps = {
  partnersData: any[]; // Ideally, replace `any[]` with the actual structure of your data
};

// Partner data
const partners = [
  {
    name: "TechNova Solutions",
    logo: "/placeholder.svg?height=80&width=200",
    description: "A leading technology provider specializing in cloud infrastructure and AI solutions.",
    website: "https://technova.example.com"
  },
  {
    name: "GlobalFinance Group",
    logo: "/placeholder.svg?height=80&width=200",
    description: "Financial services partner offering secure payment processing and financial analytics.",
    website: "https://globalfinance.example.com"
  },
  {
    name: "EcoSmart Systems",
    logo: "/placeholder.svg?height=80&width=200",
    description: "Sustainable technology solutions focused on reducing environmental impact.",
    website: "https://ecosmart.example.com"
  },
  {
    name: "DataVision Analytics",
    logo: "/placeholder.svg?height=80&width=200",
    description: "Data analytics and business intelligence partner helping derive insights from complex data.",
    website: "https://datavision.example.com"
  },
  {
    name: "SecureNet Cybersecurity",
    logo: "/placeholder.svg?height=80&width=200",
    description: "Cybersecurity experts providing advanced threat protection and security consulting.",
    website: "https://securenet.example.com"
  },
  {
    name: "InnovateTech Labs",
    logo: "/placeholder.svg?height=80&width=200",
    description: "Research and development partner focused on emerging technologies and innovation.",
    website: "https://innovatetech.example.com"
  }
]

export function Partners({ partnersData }: PartnersProps) {
  return (
    <div>
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-3">Our Trusted Partners</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          We collaborate with industry leaders to deliver exceptional solutions and services to our clients.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.map((partner) => (
          <Card key={partner.name} className="overflow-hidden transition-all hover:shadow-md">
            <CardContent className="p-6">
              <div className="h-20 flex items-center justify-center mb-4 bg-muted rounded-md">
                <img 
                  src={partner.logo || "/placeholder.svg"} 
                  alt={`${partner.name} logo`} 
                  className="max-h-12 max-w-[80%]" 
                />
              </div>
              <h4 className="text-lg font-semibold mb-2">{partner.name}</h4>
              <p className="text-muted-foreground text-sm mb-4">{partner.description}</p>
              <Button variant="outline" size="sm" asChild className="group">
                <a href={partner.website} target="_blank" rel="noopener noreferrer">
                  Visit Website
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <h4 className="text-lg font-medium mb-3">Interested in becoming a partner?</h4>
        <p className="text-muted-foreground mb-6">
          We're always looking to expand our network of partners to bring more value to our clients.
        </p>
        <Button className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700">
          Partner With Us
        </Button>
      </div>
    </div>
  )
}
