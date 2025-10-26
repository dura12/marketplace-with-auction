import mongoose from "mongoose";

// 🦸‍♂️ Hero
const heroSchema = new mongoose.Schema(
  {
    title: String,
    subtitle: String,
    description: String,
    image: String,
  },
  { timestamps: true }
);

const Hero = mongoose.models.Hero || mongoose.model("Hero", heroSchema);

// 🧭 Mission
const missionSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    image: String,
  },
  { timestamps: true }
);

const Mission =
  mongoose.models.Mission || mongoose.model("Mission", missionSchema);

// 👁 Vision
const visionSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    image: String,
  },
  { timestamps: true }
);

const Vision = mongoose.models.Vision || mongoose.model("Vision", visionSchema);

// 💎 Value
const valueSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    icon: String,
  },
  { timestamps: true }
);

const Value = mongoose.models.Value || mongoose.model("Value", valueSchema);

// 📊 Stat
const statSchema = new mongoose.Schema(
  {
    value: String,
    label: String,
  },
  { timestamps: true }
);

const Stat = mongoose.models.Stat || mongoose.model("Stat", statSchema);

// 🕰 TimelineEvent
const timelineEventSchema = new mongoose.Schema(
  {
    year: String,
    title: String,
    description: String,
    image: String,
  },
  { timestamps: true }
);

const TimelineEvent =
  mongoose.models.TimelineEvent ||
  mongoose.model("TimelineEvent", timelineEventSchema);

// 👤 TeamMember
const teamMemberSchema = new mongoose.Schema(
  {
    name: String,
    role: String,
    bio: String,
    image: String,
  },
  { timestamps: true }
);

const TeamMember =
  mongoose.models.TeamMember || mongoose.model("TeamMember", teamMemberSchema);

// 📍 Location
const locationSchema = new mongoose.Schema(
  {
    city: String,
    country: String,
    address: String,
    image: String,
    isHeadquarters: Boolean,
  },
  { timestamps: true }
);

const Location =
  mongoose.models.Location || mongoose.model("Location", locationSchema);

// 🏆 Award
const awardSchema = new mongoose.Schema(
  {
    title: String,
    organization: String,
    year: String,
    description: String,
  },
  { timestamps: true }
);

const Award = mongoose.models.Award || mongoose.model("Award", awardSchema);

// 📣 Call to Action (CTA)
const ctaSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    buttonText: String,
    buttonLink: String,
  },
  { timestamps: true }
);

const Cta = mongoose.models.Cta || mongoose.model("Cta", ctaSchema);

const contactInfoSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    businessHours: { type: String, required: true },
  },
  { timestamps: true }
);

// Avoid model overwrite error in development
const ContactInfo =
  mongoose.models.ContactInfo ||
  mongoose.model("ContactInfo", contactInfoSchema);

// ✅ Export all models
export {
  Hero,
  Mission,
  Vision,
  Value,
  Stat,
  TimelineEvent,
  TeamMember,
  Location,
  Award,
  Cta,
  ContactInfo,
};
