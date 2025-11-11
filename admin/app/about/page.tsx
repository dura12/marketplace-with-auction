"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Award,
  ChevronRight,
  Globe,
  Lightbulb,
  MapPin,
  Shield,
  Target,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Partners } from "@/components/contact/partners";
import { Testimonials } from "@/components/contact/testimonial";
import { fetchPartners, fetchTestimonials } from "@/utils/api-mock";

// Fetch function to retrieve About Us content
async function fetchAboutUsContent() {
  const sections = [
    "hero",
    "mission",
    "vision",
    "values",
    "stats",
    "timeline",
    "team",
    "locations",
    "awards",
    "cta",
  ];

  const fetchSection = async (section: string) => {
    try {
      const res = await fetch(`/api/about/${section}`);
      if (!res.ok) throw new Error(`Failed to fetch ${section}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.error(`Failed to fetch ${section}:`, err);
      return null;
    }
  };

  const results = await Promise.all(sections.map(fetchSection));

  return {
    hero: results[0],
    mission: results[1],
    vision: results[2],
    values: results[3],
    stats: results[4],
    history: results[5],
    team: results[6],
    locations: results[7],
    awards: results[8],
    cta: results[9],
  };
}

export default function AboutUsPage() {
  const [aboutData, setAboutData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [partnersData, setPartnersData] = useState<any[]>([]);
  const [testimonialsData, setTestimonialsData] = useState<any[]>([]);
  const [isLoadingPartners, setIsLoadingPartners] = useState(true);
  const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(true);

  useEffect(() => {
    const loadAboutData = async () => {
      try {
        const data = await fetchAboutUsContent();
        console.log("History data:", data.history); // Debug the data
        setAboutData(data);
      } catch (err) {
        console.error("Failed to fetch about us data:", err);
        setError("Failed to load About Us content. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    const loadPartnersAndTestimonials = async () => {
      try {
        const [partners, testimonials] = await Promise.all([
          fetchPartners(),
          fetchTestimonials(),
        ]);
        setPartnersData(partners);
        setTestimonialsData(testimonials);
      } catch (err) {
        console.error("Failed to fetch partners and testimonials:", err);
      } finally {
        setIsLoadingPartners(false);
        setIsLoadingTestimonials(false);
      }
    };

    loadAboutData();
    loadPartnersAndTestimonials();
  }, []);

  // Function to render the appropriate icon
  const renderIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case "Lightbulb":
        return <Lightbulb className={className} />;
      case "Shield":
        return <Shield className={className} />;
      case "Award":
        return <Award className={className} />;
      case "Users":
        return <Users className={className} />;
      default:
        return <Lightbulb className={className} />;
    }
  };

  if (error) {
    return (
      <div className="container relative mx-auto px-4 py-12 lg:px-8 max-w-7xl">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Error
          </h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container relative mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8 max-w-7xl">
      <div className="relative mb-16">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-1/2 mx-auto" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : aboutData?.hero ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight md:text-5xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {aboutData.hero.title}
              </h1>
              <p className="mt-4 text-xl font-medium text-purple-600 dark:text-purple-400">
                {aboutData.hero.subtitle}
              </p>
              <p className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto">
                {aboutData.hero.description}
              </p>
            </div>

            <div className="relative h-64 sm:h-96 rounded-xl overflow-hidden">
              <Image
                src={aboutData.hero.image || "/placeholder.svg"}
                alt="About our company"
                fill
                className="object-cover"
                priority
              />
            </div>
          </>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {isLoading ? (
          <>
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </>
        ) : (
          <>
            {aboutData?.mission && (
              <Card className="overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={aboutData.mission.image || "/placeholder.svg"}
                    alt="Our mission"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Target className="h-6 w-6 text-purple-600 mr-2" />
                    <h2 className="text-2xl font-bold">
                      {aboutData.mission.title}
                    </h2>
                  </div>
                  <p className="text-muted-foreground">
                    {aboutData.mission.content}
                  </p>
                </CardContent>
              </Card>
            )}

            {aboutData?.vision && (
              <Card className="overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={aboutData.vision.image || "/placeholder.svg"}
                    alt="Our vision"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Globe className="h-6 w-6 text-indigo-600 mr-2" />
                    <h2 className="text-2xl font-bold">
                      {aboutData.vision.title}
                    </h2>
                  </div>
                  <p className="text-muted-foreground">
                    {aboutData.vision.content}
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      <div className="mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
          Our Core Values
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : aboutData?.values?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {aboutData.values.map((value: any) => (
              <Card
                key={value.id}
                className="overflow-hidden transition-all hover:shadow-md"
              >
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                    {renderIcon(
                      value.icon,
                      "h-6 w-6 text-purple-600 dark:text-purple-400"
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
          {isLoading ? (
            <Skeleton className="h-8 w-64 mx-auto" />
          ) : (
            "Our History"
          )}
        </h2>

        {isLoading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : aboutData?.history?.length > 0 ? (
          <div className="relative">
            <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 h-full w-1 bg-purple-200 dark:bg-purple-900/50"></div>

            <div className="space-y-12">
              {aboutData.history.map((event: any, index: number) => (
                <div
                  key={event.id || `history-${event.year}-${index}`}
                  className={`relative flex flex-col md:flex-row ${
                    index % 2 === 0 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  <div className="md:w-1/2 mb-4 md:mb-0">
                    <div
                      className={`relative ${
                        index % 2 === 0 ? "md:pl-8" : "md:pr-8"
                      } p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm`}
                    >
                      <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        {event.year}
                      </h3>
                      <h4 className="text-lg font-semibold mb-2">
                        {event.title}
                      </h4>
                      <p className="text-muted-foreground">
                        {event.description}
                      </p>
                    </div>
                  </div>

                  <div className="md:w-1/2 flex justify-center items-center">
                    <div className="absolute left-0 md:left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-purple-600 border-4 border-white dark:border-gray-900 z-10"></div>
                    <div className="hidden md:block w-24 h-24 rounded-full overflow-hidden mx-auto">
                      <Image
                        src={event.image || "/placeholder.svg"}
                        alt={event.title}
                        width={96}
                        height={96}
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            No history data available.
          </p>
        )}
      </div>

      <div className="mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
          Our Global Presence
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : aboutData?.locations?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aboutData.locations.map((location: any) => (
              <Card key={location.id} className="overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={location.image || "/placeholder.svg"}
                    alt={location.city}
                    fill
                    className="object-cover"
                  />
                  {location.isHeadquarters && (
                    <Badge className="absolute top-2 right-2 bg-purple-600">
                      Headquarters
                    </Badge>
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-purple-600 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-lg">
                        {location.city}, {location.country}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {location.address}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
          Awards & Recognition
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : aboutData?.awards?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {aboutData.awards.map((award: any) => (
              <Card key={award.id} className="overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={award.image || "/placeholder.svg"}
                    alt={award.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Award className="h-6 w-6 text-purple-600 mr-2" />
                    <h3 className="text-xl font-bold">{award.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{award.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {award.tags?.map((tag: string) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mb-16">
        <Tabs defaultValue="partners" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 sm:mb-8">
            <TabsTrigger value="partners">Our Partners</TabsTrigger>
            <TabsTrigger value="testimonials">Client Testimonials</TabsTrigger>
          </TabsList>
          <TabsContent value="partners">
            {isLoadingPartners ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
            ) : (
              <Partners partnersData={partnersData} />
            )}
          </TabsContent>
          <TabsContent value="testimonials">
            {isLoadingTestimonials ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
            ) : (
              <Testimonials testimonialsData={testimonialsData} />
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-xl p-8 mb-16">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : aboutData?.stats?.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {aboutData.stats.map((stat: any) => (
              <div key={stat.id} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-purple-600 dark:text-purple-400">
                  {stat.value}
                </p>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
