"use client";

import { useEffect, useState } from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { LeadershipTeam } from "@/components/contact/leadership-team";
import { ContactForm } from "@/components/contact/contact-form";
import { fetchLeadershipTeam } from "@/utils/api-mock";
import LocationMap from "@/components/location/LocationMap";

export default function ContactPage() {
  const [leadershipData, setLeadershipData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState({
    leadership: true,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const leadership = await fetchLeadershipTeam();
        setLeadershipData(leadership);
      } catch (err) {
        console.error("Failed to fetch contact page data:", err);
        setError("Failed to load some content. Please try again later.");
      } finally {
        setIsLoading({
          leadership: false,
        });
      }
    };

    loadData();
  }, []);

  return (
    <div className="container relative mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8 max-w-7xl">
      <div className="mx-auto max-w-3xl text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight md:text-5xl bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
          Contact Us
        </h1>
        <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-8 text-muted-foreground">
          We&apos;d love to hear from you. Get in touch with our team.
        </p>
      </div>

      {/* Hero section with contact options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-16">
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold">Get in Touch</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Have questions about our products or services? Need help with an
            order? Our team is here to assist you.
          </p>

          <div className="grid gap-4">
            <div className="flex flex-col sm:flex-row sm:items-start">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3 sm:mb-0">
                <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="sm:ml-4">
                <h3 className="text-base sm:text-lg font-medium">Email Us</h3>
                <p className="text-muted-foreground text-sm">
                  Our friendly team is here to help.
                </p>
                <a
                  href="mailto:hello@example.com"
                  className="text-emerald-600 dark:text-emerald-400 hover:underline mt-1 block"
                >
                  support@bahirmart.com
                </a>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center mb-3 sm:mb-0">
                <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="sm:ml-4">
                <h3 className="text-base sm:text-lg font-medium">Call Us</h3>
                <p className="text-muted-foreground text-sm">
                  Mon-Fri from 8am to 5pm.
                </p>
                <a
                  href="tel:+15551234567"
                  className="text-cyan-600 dark:text-cyan-400 hover:underline mt-1 block"
                >
                  +251 975 40 9859
                </a>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3 sm:mb-0">
                <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="sm:ml-4">
                <h3 className="text-base sm:text-lg font-medium">Visit Us</h3>
                <p className="text-muted-foreground text-sm">
                  Come say hello at our office.
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  Belay Zeleke, Suite 500
                  <br />
                  Bahir Dar, CA 6000
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center mb-3 sm:mb-0">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="sm:ml-4">
                <h3 className="text-base sm:text-lg font-medium">
                  Business Hours
                </h3>
                <p className="text-muted-foreground text-sm">
                  Monday - Saturday: 9am - 5pm
                </p>
                <p className="text-muted-foreground text-sm">Sunday: Closed</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-950/30 dark:to-cyan-950/30 p-4 sm:p-8 rounded-xl border border-emerald-100 dark:border-emerald-900">
          <ContactForm />
        </div>
      </div>

      {/* Leadership Team Section */}
      <div className="mb-12 sm:mb-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-12">
          Our Leadership Team
        </h2>
        {isLoading.leadership ? (
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-96 w-full" />
            ))}
          </div>
        ) : (
          <LeadershipTeam leadershipData={leadershipData} />
        )}
      </div>

      {/* Map Section */}
      <div className="mb-8 sm:mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-8">
          Find Us
        </h2>
        <div className="aspect-video w-full rounded-xl overflow-hidden border">
          <LocationMap
            location={[37.3833, 11.6]}
            title="Our Location in Bahir Dar"
            className="w-full h-full"
          />
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-8 sm:mb-16 max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-base sm:text-lg font-medium mb-2">
                What are your business hours?
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Our office is open Monday through Friday from 9am to 5pm,
                Saturday from 10am to 2pm, and closed on Sundays.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-base sm:text-lg font-medium mb-2">
                How quickly do you respond to inquiries?
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                We aim to respond to all inquiries within 24 business hours. For
                urgent matters, please call our office directly.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-base sm:text-lg font-medium mb-2">
                Do you offer virtual meetings?
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Yes, we offer virtual meetings via Zoom, Google Meet, or
                Microsoft Teams. Please indicate your preference when
                scheduling.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
