// Mock API functions for various pages

// Terms of Service API
export async function fetchTermsOfService() {
  console.log("Fetching Terms of Service data from API")

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  return {
    lastUpdated: "April 17, 2025",
    sections: [
      {
        id: "overview",
        title: "Overview",
        content:
          "Welcome to our platform. These Terms of Service govern your use of our website, products, and services. By accessing or using our services, you agree to be bound by these Terms. Please read them carefully.",
        highlights: [
          {
            title: "Account Responsibilities",
            content:
              "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account.",
          },
          {
            title: "Service Modifications",
            content:
              "We reserve the right to modify, suspend, or discontinue any part of our services at any time. We will provide notice when appropriate, but are not obligated to provide notice of all changes.",
          },
        ],
      },
      {
        id: "usage",
        title: "Usage",
        content:
          "Our platform is designed to be used for lawful purposes only. You agree not to use our services for any illegal or unauthorized purpose.",
        guidelines: [
          {
            title: "Content Guidelines",
            content:
              "You may not upload, post, or transmit any content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable.",
          },
          {
            title: "Intellectual Property",
            content:
              "You may not infringe upon the intellectual property rights of others, including copyright, trademark, patent, or other proprietary rights.",
          },
          {
            title: "System Integrity",
            content:
              "You may not attempt to gain unauthorized access to our systems, interfere with the proper working of our services, or bypass any measures we may use to prevent or restrict access.",
          },
        ],
      },
      {
        id: "privacy",
        title: "Privacy",
        content:
          "Your privacy is important to us. Our collection and use of your personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.",
        details: [
          {
            title: "Data Collection",
            content: "We collect information as described in our Privacy Policy to provide and improve our services.",
          },
          {
            title: "Data Usage",
            content: "We use your data to operate our business, provide our services, and communicate with you.",
          },
          {
            title: "Your Rights",
            content:
              "You have certain rights regarding your personal data, including access, correction, and deletion.",
          },
        ],
      },
      {
        id: "legal",
        title: "Legal",
        content:
          'Our services are provided "as is" and "as available" without warranties of any kind, either express or implied.',
        disclaimers: [
          {
            title: "Limitation of Liability",
            content:
              "To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.",
          },
          {
            title: "Governing Law",
            content:
              "These Terms shall be governed by and construed in accordance with the laws of [Jurisdiction], without regard to its conflict of law provisions.",
          },
          {
            title: "Dispute Resolution",
            content:
              "Any dispute arising out of or relating to these Terms shall first be attempted to be resolved through good-faith negotiations. If such negotiations fail, the dispute shall be submitted to binding arbitration.",
          },
        ],
      },
    ],
    fullTerms: [
      {
        title: "1. Acceptance of Terms",
        content:
          "By accessing or using our services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing our services.",
      },
      {
        title: "2. User Accounts",
        content:
          "When you create an account with us, you must provide accurate, complete, and current information. You are solely responsible for the activity that occurs on your account, and you must keep your account password secure. You must notify us immediately of any breach of security or unauthorized use of your account. We will not be liable for any losses caused by any unauthorized use of your account.",
      },
      {
        title: "3. Intellectual Property",
        content:
          "Our platform and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.",
      },
      {
        title: "4. User Content",
        content:
          "You retain all rights to any content you submit, post, or display on or through our services. By submitting, posting, or displaying content on or through our services, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, perform, and display such content.",
      },
      {
        title: "5. Termination",
        content:
          "We may terminate or suspend your account and bar access to our services immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including but not limited to a breach of the Terms.",
      },
      {
        title: "6. Changes to Terms",
        content:
          "We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.",
      },
      {
        title: "7. Contact Us",
        content: "If you have any questions about these Terms, please contact us at legal@example.com.",
      },
    ],
    contactEmail: "legal@example.com",
  }
}

// Privacy Policy API
export async function fetchPrivacyPolicy() {
  console.log("Fetching Privacy Policy data from API")

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    lastUpdated: "April 17, 2025",
    sections: [
      {
        id: "data-collection",
        title: "Data Collection",
        icon: "Lock",
        content:
          "We collect information you provide directly, data about your usage of our services, and information from third parties.",
      },
      {
        id: "data-usage",
        title: "Data Usage",
        icon: "ShieldCheck",
        content:
          "We use your data to provide our services, improve user experience, communicate with you, and ensure security.",
      },
      {
        id: "your-rights",
        title: "Your Rights",
        icon: "UserCheck",
        content:
          "You have the right to access, correct, delete your data, and opt out of certain processing activities.",
      },
    ],
    faq: [
      {
        question: "How do you protect my personal information?",
        answer:
          "We implement a variety of security measures to maintain the safety of your personal information when you enter, submit, or access your personal information. We use industry-standard encryption protocols and secure our databases to protect sensitive information.",
      },
      {
        question: "Do you share my data with third parties?",
        answer:
          "We may share your information with third-party service providers who perform services on our behalf, such as payment processing, data analysis, email delivery, hosting services, and customer service. These providers have access to your personal information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.",
      },
      {
        question: "How can I access or delete my data?",
        answer:
          "You can access, update, or delete your personal information by logging into your account settings or by contacting our support team. We will respond to your request within the timeframe specified by applicable data protection laws.",
      },
      {
        question: "How long do you keep my data?",
        answer:
          "We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your personal information, we will securely delete or anonymize it.",
      },
      {
        question: "What are my rights under GDPR and other privacy laws?",
        answer:
          "Depending on your location, you may have rights to access, correct, delete, or restrict processing of your personal data. You may also have the right to data portability and to withdraw consent. We honor these rights where applicable and provide mechanisms for you to exercise them.",
      },
    ],
    fullPolicy: [
      {
        title: "1. Information We Collect",
        content:
          "We collect several types of information from and about users of our services, including personal information, usage data, device information, and location data.",
      },
      {
        title: "2. How We Use Your Information",
        content:
          "We use the information we collect to provide and improve our services, process transactions, send communications, personalize your experience, and detect and prevent fraud.",
      },
      {
        title: "3. Sharing of Information",
        content:
          "We may share your information with service providers, business partners, when required by law, or in connection with a merger or acquisition.",
      },
      {
        title: "4. Your Rights and Choices",
        content:
          "You have rights regarding your personal information, including access, correction, deletion, and opting out of marketing communications.",
      },
      {
        title: "5. Data Security",
        content:
          "We implement appropriate technical and organizational measures to protect your personal information, though no method of transmission is 100% secure.",
      },
      {
        title: "6. International Data Transfers",
        content: "Your information may be transferred to countries with different data protection laws than your own.",
      },
      {
        title: "7. Changes to This Privacy Policy",
        content: "We may update our Privacy Policy from time to time and will notify you of significant changes.",
      },
      {
        title: "8. Contact Us",
        content: "If you have questions about this Privacy Policy, please contact us at privacy@example.com.",
      },
    ],
    contactEmail: "privacy@example.com",
  }
}

// Contact Page API
export async function fetchLeadershipTeam() {
  console.log("Fetching Leadership Team data from API")

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 700))

  return [
    {
      id: "ceo",
      name: "Abdelaziz Ebrahim",
      role: "Chief Executive Officer",
      image: "/placeholder.svg?height=300&width=300",
      bio: "Abdelaziz brings over 15 years of industry experience and a passion for innovation. He has led the company through significant growth and transformation since founding it in 2018. His vision for sustainable technology solutions has positioned the company as a leader in the industry.",
      linkedin: "https://linkedin.com/in/abdelaziz-ebrahim",
      twitter: "https://twitter.com/abdelazizebrahim",
      email: "abdelaziz@example.com",
      education: "MBA, Harvard Business School",
      achievements: ["Forbes 30 Under 30", "Tech Innovator Award 2022"],
    },
    {
      id: "cto",
      name: "Danya Abdella",
      role: "Chief Technology Officer",
      image: "/placeholder.svg?height=300&width=300",
      bio: "Danya oversees all technical aspects of the company. With a background in computer science and AI, she drives our product innovation and technology strategy. Her expertise in machine learning and data analytics has been instrumental in developing our cutting-edge solutions.",
      linkedin: "https://linkedin.com/in/danya-abdella",
      twitter: "https://twitter.com/danyaabdella",
      email: "danya@example.com",
      education: "Ph.D. in Computer Science, MIT",
      achievements: ["Women in Tech Leadership Award", "Patent holder for 5 technology innovations"],
    },
    {
      id: "coo",
      name: "Sntayehu Getahun",
      role: "Chief Operations Officer",
      image: "/placeholder.svg?height=300&width=300",
      bio: "Sntayehu manages our day-to-day operations and ensures operational excellence across all departments. His strategic vision has been instrumental in optimizing our business processes. With a background in supply chain management and finance, he has streamlined operations and improved efficiency.",
      linkedin: "https://linkedin.com/in/sntayehu-getahun",
      twitter: "https://twitter.com/sntayehugetahun",
      email: "sntayehu@example.com",
      education: "MSc in Operations Management, London Business School",
      achievements: ["Operations Excellence Award 2023", "Six Sigma Black Belt"],
    },
  ]
}

export async function fetchPartners() {
  console.log("Fetching Partners data from API")

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 600))

  return [
    {
      id: "partner1",
      name: "TechNova Solutions",
      logo: "/placeholder.svg?height=80&width=200",
      description: "A leading technology provider specializing in cloud infrastructure and AI solutions.",
      website: "https://technova.example.com",
      partnerSince: "2019",
      category: "Technology",
    },
    {
      id: "partner2",
      name: "GlobalFinance Group",
      logo: "/placeholder.svg?height=80&width=200",
      description: "Financial services partner offering secure payment processing and financial analytics.",
      website: "https://globalfinance.example.com",
      partnerSince: "2020",
      category: "Finance",
    },
    {
      id: "partner3",
      name: "EcoSmart Systems",
      logo: "/placeholder.svg?height=80&width=200",
      description: "Sustainable technology solutions focused on reducing environmental impact.",
      website: "https://ecosmart.example.com",
      partnerSince: "2021",
      category: "Sustainability",
    },
    {
      id: "partner4",
      name: "DataVision Analytics",
      logo: "/placeholder.svg?height=80&width=200",
      description: "Data analytics and business intelligence partner helping derive insights from complex data.",
      website: "https://datavision.example.com",
      partnerSince: "2020",
      category: "Analytics",
    },
    {
      id: "partner5",
      name: "SecureNet Cybersecurity",
      logo: "/placeholder.svg?height=80&width=200",
      description: "Cybersecurity experts providing advanced threat protection and security consulting.",
      website: "https://securenet.example.com",
      partnerSince: "2022",
      category: "Security",
    },
    {
      id: "partner6",
      name: "InnovateTech Labs",
      logo: "/placeholder.svg?height=80&width=200",
      description: "Research and development partner focused on emerging technologies and innovation.",
      website: "https://innovatetech.example.com",
      partnerSince: "2021",
      category: "Research",
    },
  ]
}

export async function fetchTestimonials() {
  console.log("Fetching Testimonials data from API")

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return [
    {
      id: "testimonial1",
      quote:
        "Working with this team has been transformative for our business. Their innovative solutions and dedicated support have helped us achieve remarkable growth.",
      author: "Sarah Johnson",
      position: "CEO",
      company: "TechStart Inc.",
      avatar: "/placeholder.svg?height=100&width=100",
      rating: 5,
      date: "2023-10-15",
    },
    {
      id: "testimonial2",
      quote:
        "The level of expertise and professionalism is unmatched. They delivered our project on time and exceeded all our expectations. Highly recommended!",
      author: "Michael Chen",
      position: "CTO",
      company: "InnovateCorp",
      avatar: "/placeholder.svg?height=100&width=100",
      rating: 5,
      date: "2023-11-22",
    },
    {
      id: "testimonial3",
      quote:
        "Their strategic approach to problem-solving has been invaluable. They don't just provide solutions; they become true partners in your success.",
      author: "Elena Rodriguez",
      position: "Marketing Director",
      company: "Global Brands Ltd.",
      avatar: "/placeholder.svg?height=100&width=100",
      rating: 4,
      date: "2024-01-08",
    },
    {
      id: "testimonial4",
      quote:
        "We've worked with many vendors over the years, but none have demonstrated the commitment to excellence that this team consistently delivers.",
      author: "David Okafor",
      position: "Operations Manager",
      company: "Logistics Plus",
      avatar: "/placeholder.svg?height=100&width=100",
      rating: 5,
      date: "2024-02-14",
    },
    {
      id: "testimonial5",
      quote:
        "From the initial consultation to ongoing support, the entire experience has been seamless. They truly understand our business needs and deliver accordingly.",
      author: "Aisha Patel",
      position: "Product Manager",
      company: "NextGen Solutions",
      avatar: "/placeholder.svg?height=100&width=100",
      rating: 5,
      date: "2024-03-05",
    },
    {
      id: "testimonial6",
      quote:
        "The team's attention to detail and commitment to quality is evident in everything they do. They've helped us streamline operations and increase efficiency.",
      author: "Thomas Weber",
      position: "Finance Director",
      company: "European Ventures",
      avatar: "/placeholder.svg?height=100&width=100",
      rating: 4,
      date: "2024-03-20",
    },
  ]
}

export async function submitContactForm(formData: any) {
  console.log("Submitting contact form data to API:", formData)

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Simulate validation
  if (!formData.email || !formData.name || !formData.message) {
    throw new Error("Please fill in all required fields")
  }

  // Simulate successful submission
  return {
    success: true,
    message: "Your message has been received. We'll get back to you shortly.",
    ticketId: `TICKET-${Math.floor(Math.random() * 10000)}`,
  }
}

export async function fetchAboutUsContent() {
  const sections = [
    "hero",
    "mission",
    "vision",
    "value",
    "stats",
    "timeline",
    "team",
    "location",
    "award",
    "cta",
  ];

  const fetchSection = async (section: any) => {
    try {
      const res = await fetch(`/api/about/${section}`);
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
    value: results[3],
    stat: results[4],
    timeline: results[5],
    team: results[6],
    location: results[7],
    award: results[8],
    cta: results[9],
  };
}

// Content Management APIs
export async function updateTermsOfService(data: any) {
  console.log("Updating Terms of Service content:", data)

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1200))

  // Simulate successful update
  return {
    success: true,
    message: "Terms of Service content updated successfully",
  }
}

export async function updatePrivacyPolicy(data: any) {
  console.log("Updating Privacy Policy content:", data)

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1200))

  // Simulate successful update
  return {
    success: true,
    message: "Privacy Policy content updated successfully",
  }
}

export async function updateContactContent(data: any) {
  console.log("Updating Contact page content:", data)

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1200))

  // Simulate successful update
  return {
    success: true,
    message: "Contact page content updated successfully",
  }
}

export async function updateAboutContent(data: any) {
  console.log("Updating About Us content:", data)

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1200))

  // Simulate successful update
  return {
    success: true,
    message: "About Us content updated successfully",
  }
}

// Profile API - already implemented in the previous code
// Keeping this for reference to ensure all APIs are consistent
export async function fetchAdminProfile() {
  console.log("Fetching admin profile from API")

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // For demo purposes, randomly return one of the mock profiles
  const profiles = [
    {
      id: "admin_123",
      email: "admin@example.com",
      fullname: "John Admin",
      phone: "+1 (555) 123-4567",
      role: "admin",
      image: "https://i.pravatar.cc/300?img=68",
      isBanned: false,
      isDeleted: false,
      createdAt: "2023-01-15T09:30:00Z",
      updatedAt: "2023-04-10T14:45:00Z",
    },
    {
      id: "superadmin_456",
      email: "superadmin@example.com",
      fullname: "Sarah Super",
      phone: "+1 (555) 987-6543",
      role: "superAdmin",
      image: "https://i.pravatar.cc/300?img=48",
      createdAt: "2022-06-20T10:00:00Z",
      updatedAt: "2023-03-15T11:20:00Z",
    },
    {
      id: "admin_789",
      email: "banned@example.com",
      fullname: "Banned User",
      phone: "+1 (555) 555-5555",
      role: "admin",
      image: "https://i.pravatar.cc/300?img=60",
      isBanned: true,
      isDeleted: false,
      banReason: "Violation of platform policies",
      createdAt: "2023-02-10T08:15:00Z",
      updatedAt: "2023-05-01T16:30:00Z",
    },
    {
      id: "admin_101",
      email: "deleted@example.com",
      fullname: "Deleted User",
      phone: "+1 (555) 444-3333",
      role: "admin",
      image: null,
      isBanned: false,
      isDeleted: true,
      trashDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      createdAt: "2023-03-05T13:45:00Z",
      updatedAt: "2023-05-10T09:20:00Z",
    },
  ]

  return profiles[Math.floor(Math.random() * profiles.length)]
}

export async function changeAdminPassword(passwordData: { currentPassword: string; newPassword: string }) {
  // In a real implementation, this would change the admin's password
  console.log("Changing admin password")

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Simulate validation of current password
  if (passwordData.currentPassword !== "password123") {
    throw new Error("Current password is incorrect")
  }

  // Return success for demo
  return { success: true, message: "Password changed successfully" }
}
