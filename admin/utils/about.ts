import { ContactInfo } from "./typeDefinitions"

// Mock data
const mockHero = {
  title: "About Our Company",
  subtitle: "Building the future together",
  description:
    "We are a team of passionate individuals dedicated to creating innovative solutions that transform industries and improve lives. Our journey began with a simple idea and has evolved into a global mission to drive positive change through technology.",
  image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop",
}

const mockMission = {
  title: "Our Mission",
  content:
    "To empower businesses and individuals with cutting-edge technology solutions that drive growth, efficiency, and innovation. We are committed to delivering exceptional value through our products and services while maintaining the highest standards of integrity and customer satisfaction.",
  image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop",
}

const mockVision = {
  title: "Our Vision",
  content:
    "To be the global leader in technology solutions, recognized for our innovation, excellence, and positive impact on society. We envision a world where our technology enhances human potential and creates sustainable value for all stakeholders.",
  image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=2071&auto=format&fit=crop",
}

const mockValues = [
  {
    title: "Innovation",
    description:
      "We constantly push boundaries and explore new possibilities to create solutions that address complex challenges.",
    icon: "Lightbulb",
  },
  {
    title: "Integrity",
    description: "We uphold the highest ethical standards in all our interactions and decisions.",
    icon: "Shield",
  },
  {
    title: "Collaboration",
    description: "We believe in the power of teamwork and partnership to achieve extraordinary results.",
    icon: "Users",
  },
  {
    title: "Excellence",
    description: "We strive for excellence in everything we do, from product development to customer service.",
    icon: "Star",
  },
]

const mockStats = [
  {
    value: "10+",
    label: "Years of Experience",
  },
  {
    value: "500+",
    label: "Happy Clients",
  },
  {
    value: "50+",
    label: "Team Members",
  },
  {
    value: "20+",
    label: "Countries Served",
  },
]

const mockTimelineEvents = [
  {
    year: "2010",
    title: "Company Founded",
    description: "Our journey began with a small team of visionaries who saw the potential to transform the industry.",
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2069&auto=format&fit=crop",
  },
  {
    year: "2015",
    title: "Global Expansion",
    description: "We expanded our operations to international markets, establishing offices in key regions.",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2069&auto=format&fit=crop",
  },
  {
    year: "2018",
    title: "Product Innovation",
    description: "Launched our flagship product that revolutionized the market and set new industry standards.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
  },
  {
    year: "2023",
    title: "Sustainability Initiative",
    description:
      "Committed to carbon neutrality and implemented comprehensive sustainability practices across all operations.",
    image: "https://images.unsplash.com/photo-1536825211030-094de935f680?q=80&w=2070&auto=format&fit=crop",
  },
]

const mockTeamMembers = [
  {
    name: "Jane Smith",
    role: "CEO & Founder",
    bio: "Jane has over 15 years of experience in the technology industry and is passionate about creating solutions that make a difference.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop",
  },
  {
    name: "John Doe",
    role: "CTO",
    bio: "John leads our technical team with his extensive knowledge of software architecture and emerging technologies.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop",
  },
  {
    name: "Emily Johnson",
    role: "Head of Design",
    bio: "Emily brings creativity and user-centered thinking to every project, ensuring our products are both beautiful and functional.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop",
  },
  {
    name: "Michael Chen",
    role: "Head of Marketing",
    bio: "Michael's strategic approach to marketing has helped us build a strong brand presence in competitive markets.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop",
  },
]

const mockLocations = [
  {
    city: "San Francisco",
    country: "USA",
    address: "123 Tech Avenue, San Francisco, CA 94105",
    image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=2062&auto=format&fit=crop",
    isHeadquarters: true,
  },
  {
    city: "London",
    country: "UK",
    address: "456 Innovation Street, London, EC2A 4NE",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2070&auto=format&fit=crop",
    isHeadquarters: false,
  },
  {
    city: "Singapore",
    country: "Singapore",
    address: "789 Future Boulevard, Singapore, 018956",
    image: "https://images.unsplash.com/photo-1565967511849-76a60a516170?q=80&w=2071&auto=format&fit=crop",
    isHeadquarters: false,
  },
]

const mockAwards = [
  {
    title: "Innovation Excellence Award",
    organization: "Tech Industry Association",
    year: "2022",
    description: "Recognized for groundbreaking advancements in artificial intelligence applications.",
  },
  {
    title: "Best Workplace Award",
    organization: "Global HR Excellence",
    year: "2021",
    description: "Honored for creating an exceptional workplace culture that fosters growth and well-being.",
  },
  {
    title: "Sustainability Leadership",
    organization: "Green Business Council",
    year: "2023",
    description: "Acknowledged for implementing sustainable practices and reducing environmental impact.",
  },
]

const mockCta = {
  title: "Join Our Journey",
  description:
    "Discover how our solutions can transform your business and help you achieve your goals. Our team is ready to provide personalized guidance and support.",
  buttonText: "Contact Us",
  buttonLink: "https://example.com/contact",

}

const mockContactInfo = {
  email: "hello@example.com",
  phone: "+1 (555) 123-4567",
  address: "123 Business Avenue, Suite 500\nSan Francisco, CA 94107",
  businessHours: "Monday - Friday: 9am - 5pm\nSaturday: 10am - 2pm\nSunday: Closed",
}

// Hero
export async function fetchHero() {
  try {
    const res = await fetch("/api/about/hero");
    if (!res.ok) throw new Error("Failed to fetch hero data");
    const result = await res.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching hero:", error);
    return null;
  }
}

// Mission
export async function fetchMission() {
  try {
    const res = await fetch("/api/about/mission");
    if (!res.ok) throw new Error("Failed to fetch mission data");
    const result = await res.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching mission:", error);
    return null;
  }
}

// Vision
export async function fetchVision() {
  try {
    const res = await fetch("/api/about/vision");
    if (!res.ok) throw new Error("Failed to fetch vision data");
    const result = await res.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching vision:", error);
    return null;
  }
}

// Values
export async function fetchValues() {
  try {
    const res = await fetch("/api/about/values");
    if (!res.ok) throw new Error("Failed to fetch values data");
    const result = await res.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching values:", error);
    return [];
  }
}

// Stats
export async function fetchStats() {
  try {
    const res = await fetch("/api/about/stats");
    if (!res.ok) throw new Error("Failed to fetch stats data");
    const result = await res.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching stats:", error);
    return [];
  }
}

// Timeline Events
export async function fetchTimelineEvents() {
  try {
    const res = await fetch("/api/about/timeline");
    if (!res.ok) throw new Error("Failed to fetch timeline events");
    const result = await res.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching timeline events:", error);
    return [];
  }
}

// Team Members
export async function fetchTeamMembers() {
  try {
    const res = await fetch("/api/about/team");
    if (!res.ok) throw new Error("Failed to fetch team members");
    const result = await res.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching team members:", error);
    return [];
  }
}

// Locations
export async function fetchLocations() {
  try {
    const res = await fetch("/api/about/locations");
    if (!res.ok) throw new Error("Failed to fetch locations");
    const result = await res.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching locations:", error);
    return [];
  }
}

// Awards
export async function fetchAwards() {
  try {
    const res = await fetch("/api/about/awards");
    if (!res.ok) throw new Error("Failed to fetch awards");
    const result = await res.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching awards:", error);
    return [];
  }
}

// CTA
export async function fetchCta() {
  try {
    const res = await fetch("/api/about/cta");
    if (!res.ok) throw new Error("Failed to fetch CTA");
    const result = await res.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching CTA:", error);
    return null;
  }
}

// Hero
export async function updateHero(data: typeof mockHero) {
  try {
    const res = await fetch("/api/about/hero", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Failed to update hero data");
    }

    const result = await res.json();
    return result.data;
  } catch (error) {
    console.error("Error updating hero:", error);
    throw error; // Re-throw the error for the caller to handle
  }
}

// Mission
export async function updateMission(data: typeof mockMission) {
  try {
    const res = await fetch("/api/about/mission", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Failed to update mission data");
    }

    const result = await res.json();
    return result.data;
  } catch (error) {
    console.error("Error updating mission:", error);
    throw error;
  }
}

// Vision
export async function updateVision(data: typeof mockVision) {
  try {
    const res = await fetch("/api/about/vision", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Failed to update vision data");
    }

    const result = await res.json();
    return result.data;
  } catch (error) {
    console.error("Error updating vision:", error);
    throw error;
  }
}

// Values
export async function updateValues(data: { title: string, description: string, icon: string }[]) {
  try {
    const res = await fetch("/api/about/values", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Failed to update values data");
    }

    const result = await res.json();
    console.log("Data response in values: ", result);
    return result.data;
  } catch (error) {
    console.error("Error updating values:", error);
    throw error;
  }
}

// Stats
export async function updateStats(data: { value: string, label: string }[]) {
  try {
    const res = await fetch("/api/about/stats", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Failed to update stats data");
    }

    const result = await res.json();
    return result.data;
  } catch (error) {
    console.error("Error updating stats:", error);
    throw error;
  }
}

// Timeline Events
export async function updateTimelineEvents(data: { title: string, description: string, date: string }[]) {
  try {
    const res = await fetch("/api/about/timeline", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Failed to update timeline events");
    }

    const result = await res.json();
    return result.data;
  } catch (error) {
    console.error("Error updating timeline events:", error);
    throw error;
  }
}

// Team Members
export async function updateTeamMembers(data: Array<{ name: string; role: string; bio: string; image: string }>) {
  try {
    const res = await fetch("/api/about/team", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Failed to update team members data");
    }

    const result = await res.json();
    return result.data;
  } catch (error) {
    console.error("Error updating team members:", error);
    throw error;
  }
}

// Locations
export async function updateLocations(data: typeof mockLocations) {
  try {
    const res = await fetch("/api/about/locations", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Failed to update locations data");
    }

    const result = await res.json();
    return result.data;
  } catch (error) {
    console.error("Error updating locations:", error);
    throw error;
  }
}

// Awards
export async function updateAwards(data: typeof mockAwards) {
  try {
    const res = await fetch("/api/about/awards", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Failed to update awards data");
    }

    const result = await res.json();
    return result.data;
  } catch (error) {
    console.error("Error updating awards:", error);
    throw error;
  }
}

// CTA
export async function updateCta(data: typeof mockCta) {
  try {
    const res = await fetch("/api/about/cta", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Failed to update CTA data");
    }

    const result = await res.json();
    return result.data;
  } catch (error) {
    console.error("Error updating CTA:", error);
    throw error;
  }
}

export async function deleteHero() {
  return true;
}

export async function deleteMission() {
  return true;
}

export async function deleteVision() {
  return true;
}

export async function deleteValues() {
  return true;
}

export async function deleteStats() {
  return true;
}

export async function deleteTimelineEvents() {
  return true;
}

export async function deleteTeamMember(id: string) {
  try {
    const res = await fetch(`/api/about/team?id=${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Failed to delete team member");
    }

    return true;
  } catch (error) {
    console.error("Error deleting team member:", error);
    throw error;
  }
}


export async function deleteLocations() {
  return true;
}

export async function deleteAwards() {
  return true;
}

export async function deleteCta() {
  return true;
}

export async function fetchContactInfo(): Promise<ContactInfo> {
  const res = await fetch("/api/about/contact-info", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store", // prevent Next.js from caching during SSR
  });

  if (!res.ok) {
    throw new Error("Failed to fetch contact info");
  }

  const result = await res.json();
  return result.data;
}

export async function updateContactInfo(data: ContactInfo): Promise<ContactInfo> {
  const res = await fetch("/api/about/contact-info", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to update contact info");
  }

  const result = await res.json();
  return result.data;
}
