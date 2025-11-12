"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HeroSection } from "./hero-section"
import { MissionVisionSection } from "./mission-vision-section"
import { ValuesSection } from "./values-section"
import { StatsSection } from "./stats-section"
import { TimelineSection } from "./timeline-section"
import { TeamSection } from "./team-section"
import { LocationsSection } from "./locations-section"
import { AwardsSection } from "./awards-section"
import { CtaSection } from "./cta-section"
import { useToast } from "@/hooks/use-toast"
import { Building2, Award, Users, Clock, BarChart3, Heart, Eye, Rocket, MapPin, MessageSquarePlus } from "lucide-react"

export default function AboutSettingsPage() {
  const [activeTab, setActiveTab] = useState("hero")
  const { toast } = useToast()

  const handleSaveSuccess = (section: string) => {
    toast({
      title: "Changes saved",
      description: `Your ${section} settings have been updated successfully.`,
      duration: 3000,
    })
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>About Page Content</CardTitle>
          <CardDescription>
            Update the various sections of your about page. Changes will be reflected on your site after saving.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 mb-8">
              <TabsTrigger value="hero" className="flex items-center gap-2">
                <Rocket className="h-4 w-4" />
                <span className="hidden md:inline">Hero</span>
              </TabsTrigger>
              <TabsTrigger value="mission" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span className="hidden md:inline">Mission</span>
              </TabsTrigger>
              <TabsTrigger value="vision" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span className="hidden md:inline">Vision</span>
              </TabsTrigger>
              <TabsTrigger value="values" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span className="hidden md:inline">Values</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden md:inline">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="hidden md:inline">Timeline</span>
              </TabsTrigger>
              <TabsTrigger value="team" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden md:inline">Team</span>
              </TabsTrigger>
              <TabsTrigger value="locations" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden md:inline">Locations</span>
              </TabsTrigger>
              <TabsTrigger value="awards" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span className="hidden md:inline">Awards</span>
              </TabsTrigger>
              <TabsTrigger value="cta" className="flex items-center gap-2">
                <MessageSquarePlus className="h-4 w-4" />
                <span className="hidden md:inline">CTA</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="hero" className="space-y-4">
              <HeroSection onSaveSuccess={() => handleSaveSuccess("hero")} />
            </TabsContent>

            <TabsContent value="mission" className="space-y-4">
              <MissionVisionSection type="mission" onSaveSuccess={() => handleSaveSuccess("mission")} />
            </TabsContent>

            <TabsContent value="vision" className="space-y-4">
              <MissionVisionSection type="vision" onSaveSuccess={() => handleSaveSuccess("vision")} />
            </TabsContent>

            <TabsContent value="values" className="space-y-4">
              <ValuesSection onSaveSuccess={() => handleSaveSuccess("values")} />
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <StatsSection onSaveSuccess={() => handleSaveSuccess("stats")} />
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <TimelineSection onSaveSuccess={() => handleSaveSuccess("timeline")} />
            </TabsContent>

            <TabsContent value="team" className="space-y-4">
              <TeamSection onSaveSuccess={() => handleSaveSuccess("team")} />
            </TabsContent>

            <TabsContent value="locations" className="space-y-4">
              <LocationsSection onSaveSuccess={() => handleSaveSuccess("locations")} />
            </TabsContent>

            <TabsContent value="awards" className="space-y-4">
              <AwardsSection onSaveSuccess={() => handleSaveSuccess("awards")} />
            </TabsContent>

            <TabsContent value="cta" className="space-y-4">
              <CtaSection onSaveSuccess={() => handleSaveSuccess("cta")} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
