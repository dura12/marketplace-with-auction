import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Linkedin, Twitter, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

type LeadershipTeamProps = {
  leadershipData: any[]; // or replace `any[]` with your proper type
};

// Leadership team data
const leadershipTeam = [
  {
    name: "Abdelaziz Ebrahim",
    role: "Chief Executive Officer",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Abdelaziz brings over 15 years of industry experience and a passion for innovation. He has led the company through significant growth and transformation since founding it in 2018.",
    linkedin: "https://linkedin.com/in/abdelaziz-ebrahim",
    twitter: "https://twitter.com/abdelazizebrahim",
    email: "abdelaziz@example.com",
  },
  {
    name: "Danya Abdella",
    role: "Chief Technology Officer",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Danya oversees all technical aspects of the company. With a background in computer science and AI, she drives our product innovation and technology strategy.",
    linkedin: "https://linkedin.com/in/danya-abdella",
    twitter: "https://twitter.com/danyaabdella",
    email: "danya@example.com",
  },
  {
    name: "Sntayehu Getahun",
    role: "Chief Operations Officer",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Sntayehu manages our day-to-day operations and ensures operational excellence across all departments. His strategic vision has been instrumental in optimizing our business processes.",
    linkedin: "https://linkedin.com/in/sntayehu-getahun",
    twitter: "https://twitter.com/sntayehugetahun",
    email: "sntayehu@example.com",
  },
]

export function LeadershipTeam({ leadershipData }: LeadershipTeamProps) {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {leadershipTeam.map((leader) => (
        <Card key={leader.name} className="overflow-hidden transition-all hover:shadow-lg">
          <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-emerald-100 to-cyan-100 dark:from-emerald-900/30 dark:to-cyan-900/30">
            <Avatar className="h-full w-full rounded-none">
              <AvatarImage src={leader.image || "/placeholder.svg"} alt={leader.name} className="object-cover" />
              <AvatarFallback className="text-4xl rounded-none h-full">
                {leader.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold">{leader.name}</h3>
            <p className="text-emerald-600 dark:text-emerald-400 font-medium mb-3">{leader.role}</p>
            <p className="text-muted-foreground mb-4 text-sm">{leader.bio}</p>
            <div className="flex space-x-2">
              <Button size="icon" variant="outline" asChild className="rounded-full">
                <a
                  href={leader.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${leader.name}'s LinkedIn`}
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              </Button>
              <Button size="icon" variant="outline" asChild className="rounded-full">
                <a
                  href={leader.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${leader.name}'s Twitter`}
                >
                  <Twitter className="h-4 w-4" />
                </a>
              </Button>
              <Button size="icon" variant="outline" asChild className="rounded-full">
                <a href={`mailto:${leader.email}`} aria-label={`Email ${leader.name}`}>
                  <Mail className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
