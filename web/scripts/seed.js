import mongoose from "mongoose";
import argon2 from "argon2";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import models
import User from "../models/User.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import Auction from "../models/Auction.js";
import Bid from "../models/Bid.js";
import Order from "../models/Order.js";
import Notification from "../models/Notification.js";
import Advertisement from "../models/Advertisement.js";
import {
  Hero,
  Mission,
  Vision,
  Value,
  Stat,
  TimelineEvent,
  TeamMember,
  Location as OfficeLocation,
  Award,
  Cta,
} from "../models/About.js";

// Ethiopian locations with coordinates [longitude, latitude]
const ethiopianLocations = {
  addisAbaba: { coords: [38.7578, 9.0054], state: "Addis Ababa", city: "Addis Ababa" },
  direDawa: { coords: [42.439, 9.6], state: "Dire Dawa", city: "Dire Dawa" },
  bahirDar: { coords: [37.3833, 11.6], state: "Amhara", city: "Bahir Dar" },
  gondar: { coords: [37.4667, 12.6], state: "Amhara", city: "Gondar" },
  hawassa: { coords: [38.4767, 7.0622], state: "Sidama", city: "Hawassa" },
  mekelle: { coords: [39.4753, 13.4967], state: "Tigray", city: "Mekelle" },
  adama: { coords: [39.2671, 8.54], state: "Oromia", city: "Adama" },
  jimma: { coords: [36.8333, 7.6667], state: "Oromia", city: "Jimma" },
  dessie: { coords: [39.6333, 11.1333], state: "Amhara", city: "Dessie" },
  harar: { coords: [42.1167, 9.3117], state: "Harari", city: "Harar" },
};

// Ethiopian phone numbers format
const generatePhone = () => `+2519${Math.floor(10000000 + Math.random() * 90000000)}`;

// Generate transaction reference
const generateTxRef = () => `TX-${Date.now()}-${Math.random().toString(36).substring(7)}`;

// ===========================================
// SEED DATA
// ===========================================

// Categories
const categoriesData = [
  { name: "Ethiopian Coffee", description: "Premium Ethiopian coffee beans from various regions including Yirgacheffe, Sidamo, and Harar", createdBy: "system" },
  { name: "Traditional Clothing", description: "Habesha kemis, netela, gabi, and other traditional Ethiopian garments", createdBy: "system" },
  { name: "Spices & Herbs", description: "Berbere, mitmita, korerima, and other Ethiopian spices", createdBy: "system" },
  { name: "Handcrafts", description: "Traditional Ethiopian handicrafts, baskets, pottery, and artwork", createdBy: "system" },
  { name: "Jewelry", description: "Ethiopian silver and gold jewelry, traditional crosses, and accessories", createdBy: "system" },
  { name: "Electronics", description: "Mobile phones, laptops, tablets, and electronic accessories", createdBy: "system" },
  { name: "Home & Living", description: "Furniture, home decor, and household items", createdBy: "system" },
  { name: "Fashion", description: "Modern Ethiopian fashion, shoes, bags, and accessories", createdBy: "system" },
  { name: "Food & Groceries", description: "Teff flour, injera, honey, and other Ethiopian food products", createdBy: "system" },
  { name: "Art & Antiques", description: "Ethiopian paintings, antiques, and collectibles", createdBy: "system" },
  { name: "Books & Stationery", description: "Amharic books, educational materials, and office supplies", createdBy: "system" },
  { name: "Health & Beauty", description: "Natural Ethiopian beauty products, shea butter, and wellness items", createdBy: "system" },
];

// Users (Customers and Merchants)
const usersData = [
  // Customers
  {
    fullName: "Abebe Bikila",
    email: "abebe.bikila@email.com",
    role: "customer",
    bio: "Marathon enthusiast and online shopping lover from Addis Ababa",
    stateName: "Addis Ababa",
    cityName: "Addis Ababa",
    phoneNumber: "+251911234567",
    isEmailVerified: true,
  },
  {
    fullName: "Tigist Bekele",
    email: "tigist.bekele@email.com",
    role: "customer",
    bio: "Coffee lover and traditional craft collector",
    stateName: "Oromia",
    cityName: "Jimma",
    phoneNumber: "+251912345678",
    isEmailVerified: true,
  },
  {
    fullName: "Dawit Haile",
    email: "dawit.haile@email.com",
    role: "customer",
    bio: "Tech enthusiast from Dire Dawa",
    stateName: "Dire Dawa",
    cityName: "Dire Dawa",
    phoneNumber: "+251913456789",
    isEmailVerified: true,
  },
  {
    fullName: "Meron Tadesse",
    email: "meron.tadesse@email.com",
    role: "customer",
    bio: "Fashion enthusiast and entrepreneur",
    stateName: "Amhara",
    cityName: "Bahir Dar",
    phoneNumber: "+251914567890",
    isEmailVerified: true,
  },
  {
    fullName: "Yohannes Gebre",
    email: "yohannes.gebre@email.com",
    role: "customer",
    bio: "Art collector and history enthusiast",
    stateName: "Tigray",
    cityName: "Mekelle",
    phoneNumber: "+251915678901",
    isEmailVerified: true,
  },
  // Merchants
  {
    fullName: "Selam Coffee Traders",
    email: "selam.coffee@email.com",
    role: "merchant",
    bio: "Premium Ethiopian coffee exporter since 2010",
    stateName: "Oromia",
    cityName: "Jimma",
    phoneNumber: "+251920111222",
    isEmailVerified: true,
    approvalStatus: "approved",
    tinNumber: "0012345678",
    uniqueTinNumber: "TIN-0012345678",
    nationalId: "ET-NAT-001234",
    account_name: "Selam Coffee Traders",
    account_number: "1000123456789",
    bank_code: "CBE",
  },
  {
    fullName: "Habesha Fashion House",
    email: "habesha.fashion@email.com",
    role: "merchant",
    bio: "Traditional and modern Ethiopian fashion",
    stateName: "Addis Ababa",
    cityName: "Addis Ababa",
    phoneNumber: "+251920222333",
    isEmailVerified: true,
    approvalStatus: "approved",
    tinNumber: "0023456789",
    uniqueTinNumber: "TIN-0023456789",
    nationalId: "ET-NAT-002345",
    account_name: "Habesha Fashion House",
    account_number: "1000234567890",
    bank_code: "CBE",
  },
  {
    fullName: "Addis Electronics",
    email: "addis.electronics@email.com",
    role: "merchant",
    bio: "Your trusted electronics store in Addis Ababa",
    stateName: "Addis Ababa",
    cityName: "Addis Ababa",
    phoneNumber: "+251920333444",
    isEmailVerified: true,
    approvalStatus: "approved",
    tinNumber: "0034567890",
    uniqueTinNumber: "TIN-0034567890",
    nationalId: "ET-NAT-003456",
    account_name: "Addis Electronics PLC",
    account_number: "1000345678901",
    bank_code: "ABYS",
  },
  {
    fullName: "Lalibela Handicrafts",
    email: "lalibela.crafts@email.com",
    role: "merchant",
    bio: "Authentic Ethiopian handicrafts and souvenirs",
    stateName: "Amhara",
    cityName: "Lalibela",
    phoneNumber: "+251920444555",
    isEmailVerified: true,
    approvalStatus: "approved",
    tinNumber: "0045678901",
    uniqueTinNumber: "TIN-0045678901",
    nationalId: "ET-NAT-004567",
    account_name: "Lalibela Handicrafts",
    account_number: "1000456789012",
    bank_code: "DSBK",
  },
  {
    fullName: "Sheba Spices",
    email: "sheba.spices@email.com",
    role: "merchant",
    bio: "Premium Ethiopian spices and herbs",
    stateName: "Harari",
    cityName: "Harar",
    phoneNumber: "+251920555666",
    isEmailVerified: true,
    approvalStatus: "approved",
    tinNumber: "0056789012",
    uniqueTinNumber: "TIN-0056789012",
    nationalId: "ET-NAT-005678",
    account_name: "Sheba Spices Export",
    account_number: "1000567890123",
    bank_code: "WEGN",
  },
];

// Products data (will be populated with merchant IDs after users are created)
const getProductsData = (merchants, categories) => [
  // Coffee products
  {
    merchantDetail: {
      merchantId: merchants[0]._id,
      merchantName: merchants[0].fullName,
      merchantEmail: merchants[0].email,
    },
    productName: "Yirgacheffe Premium Coffee Beans",
    category: { categoryId: categories[0]._id, categoryName: categories[0].name },
    price: 850,
    quantity: 100,
    description: "Premium grade Yirgacheffe coffee beans with fruity and wine-like flavors. Grown at 1,700-2,200 meters altitude in Southern Ethiopia.",
    images: ["/products/yirgacheffe-coffee.jpg"],
    variant: ["Light Roast", "Medium Roast", "Dark Roast"],
    size: ["250g", "500g", "1kg"],
    brand: "Selam Coffee",
    location: { type: "Point", coordinates: ethiopianLocations.jimma.coords },
    delivery: "PERKG",
    deliveryPrice: 50,
    KilogramPerPrice: 50,
  },
  {
    merchantDetail: {
      merchantId: merchants[0]._id,
      merchantName: merchants[0].fullName,
      merchantEmail: merchants[0].email,
    },
    productName: "Sidamo Single Origin Coffee",
    category: { categoryId: categories[0]._id, categoryName: categories[0].name },
    price: 780,
    quantity: 150,
    description: "Sidamo coffee with rich body and complex flavor notes of berries and citrus. Perfect for espresso and pour-over brewing.",
    images: ["/products/sidamo-coffee.jpg"],
    variant: ["Medium Roast", "Dark Roast"],
    size: ["250g", "500g", "1kg"],
    brand: "Selam Coffee",
    location: { type: "Point", coordinates: ethiopianLocations.hawassa.coords },
    delivery: "PERKG",
    deliveryPrice: 50,
    KilogramPerPrice: 50,
  },
  {
    merchantDetail: {
      merchantId: merchants[0]._id,
      merchantName: merchants[0].fullName,
      merchantEmail: merchants[0].email,
    },
    productName: "Harar Wild Coffee",
    category: { categoryId: categories[0]._id, categoryName: categories[0].name },
    price: 920,
    quantity: 80,
    description: "Wild-grown Harar coffee with distinctive blueberry notes and heavy body. A true Ethiopian specialty.",
    images: ["/products/harar-coffee.jpg"],
    variant: ["Light Roast", "Medium Roast"],
    size: ["250g", "500g"],
    brand: "Selam Coffee",
    location: { type: "Point", coordinates: ethiopianLocations.harar.coords },
    delivery: "PERKG",
    deliveryPrice: 60,
    KilogramPerPrice: 60,
  },
  // Traditional Clothing
  {
    merchantDetail: {
      merchantId: merchants[1]._id,
      merchantName: merchants[1].fullName,
      merchantEmail: merchants[1].email,
    },
    productName: "Habesha Kemis - Traditional Ethiopian Dress",
    category: { categoryId: categories[1]._id, categoryName: categories[1].name },
    price: 3500,
    quantity: 25,
    description: "Handwoven traditional Ethiopian dress (Habesha Kemis) with beautiful tibeb embroidery. Perfect for weddings and cultural events.",
    images: ["/products/habesha-kemis.jpg"],
    variant: ["White", "Cream", "Gold"],
    size: ["S", "M", "L", "XL"],
    brand: "Habesha Fashion",
    location: { type: "Point", coordinates: ethiopianLocations.addisAbaba.coords },
    delivery: "FLAT",
    deliveryPrice: 150,
  },
  {
    merchantDetail: {
      merchantId: merchants[1]._id,
      merchantName: merchants[1].fullName,
      merchantEmail: merchants[1].email,
    },
    productName: "Ethiopian Gabi - Traditional Blanket",
    category: { categoryId: categories[1]._id, categoryName: categories[1].name },
    price: 2800,
    quantity: 40,
    description: "Handwoven Ethiopian gabi (traditional blanket/shawl) made from premium cotton. Warm and elegant.",
    images: ["/products/ethiopian-gabi.jpg"],
    variant: ["White with Red Border", "White with Green Border", "Natural"],
    size: ["Standard", "Large"],
    brand: "Habesha Fashion",
    location: { type: "Point", coordinates: ethiopianLocations.addisAbaba.coords },
    delivery: "FLAT",
    deliveryPrice: 100,
  },
  {
    merchantDetail: {
      merchantId: merchants[1]._id,
      merchantName: merchants[1].fullName,
      merchantEmail: merchants[1].email,
    },
    productName: "Men's Ethiopian Traditional Suit",
    category: { categoryId: categories[1]._id, categoryName: categories[1].name },
    price: 4200,
    quantity: 20,
    description: "Complete men's traditional Ethiopian suit with embroidered details. Includes shirt and pants.",
    images: ["/products/mens-traditional.jpg"],
    variant: ["White", "Cream"],
    size: ["M", "L", "XL", "XXL"],
    brand: "Habesha Fashion",
    location: { type: "Point", coordinates: ethiopianLocations.addisAbaba.coords },
    delivery: "FLAT",
    deliveryPrice: 150,
  },
  // Electronics
  {
    merchantDetail: {
      merchantId: merchants[2]._id,
      merchantName: merchants[2].fullName,
      merchantEmail: merchants[2].email,
    },
    productName: "Samsung Galaxy A54 5G",
    category: { categoryId: categories[5]._id, categoryName: categories[5].name },
    price: 25000,
    quantity: 50,
    description: "Samsung Galaxy A54 5G with 128GB storage, 6GB RAM. Official warranty in Ethiopia.",
    images: ["/products/samsung-a54.jpg"],
    variant: ["Black", "White", "Purple"],
    size: ["128GB"],
    brand: "Samsung",
    location: { type: "Point", coordinates: ethiopianLocations.addisAbaba.coords },
    delivery: "FLAT",
    deliveryPrice: 200,
  },
  {
    merchantDetail: {
      merchantId: merchants[2]._id,
      merchantName: merchants[2].fullName,
      merchantEmail: merchants[2].email,
    },
    productName: "TECNO Spark 10 Pro",
    category: { categoryId: categories[5]._id, categoryName: categories[5].name },
    price: 12500,
    quantity: 75,
    description: "TECNO Spark 10 Pro with 256GB storage, great camera, long battery life. Popular choice in Ethiopia.",
    images: ["/products/tecno-spark10.jpg"],
    variant: ["Black", "Blue", "White"],
    size: ["256GB"],
    brand: "TECNO",
    location: { type: "Point", coordinates: ethiopianLocations.addisAbaba.coords },
    delivery: "FLAT",
    deliveryPrice: 150,
  },
  // Handicrafts
  {
    merchantDetail: {
      merchantId: merchants[3]._id,
      merchantName: merchants[3].fullName,
      merchantEmail: merchants[3].email,
    },
    productName: "Ethiopian Mesob - Traditional Basket Table",
    category: { categoryId: categories[3]._id, categoryName: categories[3].name },
    price: 4500,
    quantity: 15,
    description: "Handwoven Ethiopian mesob (injera basket/table). Traditional dining centerpiece, perfect for authentic Ethiopian meals.",
    images: ["/products/mesob.jpg"],
    variant: ["Natural", "Colored"],
    size: ["Medium", "Large"],
    brand: "Hand Made",
    location: { type: "Point", coordinates: ethiopianLocations.gondar.coords },
    delivery: "FLAT",
    deliveryPrice: 300,
  },
  {
    merchantDetail: {
      merchantId: merchants[3]._id,
      merchantName: merchants[3].fullName,
      merchantEmail: merchants[3].email,
    },
    productName: "Ethiopian Orthodox Cross - Silver",
    category: { categoryId: categories[4]._id, categoryName: categories[4].name },
    price: 2200,
    quantity: 30,
    description: "Handcrafted Ethiopian Orthodox cross made from sterling silver. Beautiful Lalibela design.",
    images: ["/products/ethiopian-cross.jpg"],
    variant: ["Lalibela Style", "Axum Style", "Gondar Style"],
    size: ["Small", "Medium", "Large"],
    brand: "Hand Made",
    location: { type: "Point", coordinates: ethiopianLocations.gondar.coords },
    delivery: "FLAT",
    deliveryPrice: 100,
  },
  // Spices
  {
    merchantDetail: {
      merchantId: merchants[4]._id,
      merchantName: merchants[4].fullName,
      merchantEmail: merchants[4].email,
    },
    productName: "Premium Berbere Spice Mix",
    category: { categoryId: categories[2]._id, categoryName: categories[2].name },
    price: 180,
    quantity: 200,
    description: "Authentic Ethiopian berbere spice blend. Made with sun-dried chilies, garlic, ginger, and traditional spices. Essential for Ethiopian cooking.",
    images: ["/products/berbere.jpg"],
    variant: ["Mild", "Medium", "Hot"],
    size: ["100g", "250g", "500g"],
    brand: "Sheba Spices",
    location: { type: "Point", coordinates: ethiopianLocations.harar.coords },
    delivery: "PERKG",
    deliveryPrice: 40,
    KilogramPerPrice: 40,
  },
  {
    merchantDetail: {
      merchantId: merchants[4]._id,
      merchantName: merchants[4].fullName,
      merchantEmail: merchants[4].email,
    },
    productName: "Mitmita Hot Pepper Blend",
    category: { categoryId: categories[2]._id, categoryName: categories[2].name },
    price: 150,
    quantity: 180,
    description: "Fiery Ethiopian mitmita spice. Perfect for kitfo and raw meat dishes. Made from bird's eye chilies.",
    images: ["/products/mitmita.jpg"],
    variant: ["Extra Hot"],
    size: ["100g", "250g"],
    brand: "Sheba Spices",
    location: { type: "Point", coordinates: ethiopianLocations.harar.coords },
    delivery: "PERKG",
    deliveryPrice: 40,
    KilogramPerPrice: 40,
  },
  {
    merchantDetail: {
      merchantId: merchants[4]._id,
      merchantName: merchants[4].fullName,
      merchantEmail: merchants[4].email,
    },
    productName: "Ethiopian Honey - Natural Wild",
    category: { categoryId: categories[8]._id, categoryName: categories[8].name },
    price: 450,
    quantity: 100,
    description: "Pure Ethiopian wild honey from the highlands. Unprocessed and rich in flavor. Great for tej (honey wine) making.",
    images: ["/products/ethiopian-honey.jpg"],
    variant: ["Golden", "Dark"],
    size: ["500g", "1kg"],
    brand: "Sheba Spices",
    location: { type: "Point", coordinates: ethiopianLocations.bahirDar.coords },
    delivery: "PERKG",
    deliveryPrice: 50,
    KilogramPerPrice: 50,
  },
];

// Auctions data
const getAuctionsData = (merchants, categories) => {
  const now = new Date();
  const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  
  return [
    {
      auctionTitle: "Rare Antique Ethiopian Coffee Pot (Jebena)",
      merchantId: merchants[3]._id,
      description: "Antique clay jebena from 1950s Ethiopia. Perfect condition with traditional designs. A collector's item.",
      condition: "used",
      startTime: now,
      endTime: oneWeekLater,
      itemImg: ["/auctions/antique-jebena.jpg"],
      startingPrice: 5000,
      reservedPrice: 15000,
      bidIncrement: 500,
      status: "active",
      adminApproval: "approved",
      totalQuantity: 1,
      category: "Art & Antiques",
    },
    {
      auctionTitle: "Vintage Habesha Kemis with Gold Embroidery",
      merchantId: merchants[1]._id,
      description: "Beautiful vintage Habesha kemis with intricate gold tibeb embroidery. Circa 1980s, excellent condition.",
      condition: "used",
      startTime: now,
      endTime: oneWeekLater,
      itemImg: ["/auctions/vintage-kemis.jpg"],
      startingPrice: 8000,
      reservedPrice: 25000,
      bidIncrement: 1000,
      status: "active",
      adminApproval: "approved",
      totalQuantity: 1,
      category: "Traditional Clothing",
    },
    {
      auctionTitle: "Limited Edition Ethiopian Art Print Collection",
      merchantId: merchants[3]._id,
      description: "Collection of 5 limited edition prints by renowned Ethiopian artist. Numbered and signed.",
      condition: "new",
      startTime: now,
      endTime: twoWeeksLater,
      itemImg: ["/auctions/art-collection.jpg"],
      startingPrice: 12000,
      reservedPrice: 35000,
      bidIncrement: 2000,
      status: "active",
      adminApproval: "approved",
      totalQuantity: 1,
      category: "Art & Antiques",
    },
    {
      auctionTitle: "Handcrafted Silver Ethiopian Cross Set",
      merchantId: merchants[3]._id,
      description: "Set of 3 handcrafted silver Ethiopian Orthodox crosses representing Lalibela, Axum, and Gondar styles.",
      condition: "new",
      startTime: now,
      endTime: oneWeekLater,
      itemImg: ["/auctions/cross-set.jpg"],
      startingPrice: 6000,
      reservedPrice: 18000,
      bidIncrement: 500,
      status: "active",
      adminApproval: "approved",
      totalQuantity: 1,
      category: "Jewelry",
    },
    {
      auctionTitle: "Premium Aged Yirgacheffe Coffee - 50kg Lot",
      merchantId: merchants[0]._id,
      description: "Premium lot of aged Yirgacheffe coffee beans. Perfect for specialty coffee shops and connoisseurs.",
      condition: "new",
      startTime: now,
      endTime: twoWeeksLater,
      itemImg: ["/auctions/aged-coffee.jpg"],
      startingPrice: 25000,
      reservedPrice: 60000,
      bidIncrement: 2500,
      status: "active",
      adminApproval: "approved",
      totalQuantity: 1,
      category: "Ethiopian Coffee",
    },
  ];
};

// About page data
const aboutData = {
  hero: {
    title: "Gebeya - Ethiopia's Premier Online Marketplace",
    subtitle: "Connecting Ethiopian Artisans with the World",
    description: "Since 2020, we've been dedicated to showcasing the best of Ethiopian products, from world-renowned coffee to exquisite traditional crafts.",
    image: "/about/hero.jpg",
  },
  mission: {
    title: "Our Mission",
    content: "To empower Ethiopian merchants and artisans by providing a modern, secure, and accessible e-commerce platform that connects them with customers across Ethiopia and beyond.",
    image: "/about/mission.jpg",
  },
  vision: {
    title: "Our Vision",
    content: "To become East Africa's leading online marketplace, celebrating Ethiopian heritage while embracing innovation, and creating economic opportunities for millions.",
    image: "/about/vision.jpg",
  },
  values: [
    { title: "Trust", description: "Building lasting relationships through transparency and reliability", icon: "shield" },
    { title: "Quality", description: "Curating only the finest Ethiopian products", icon: "star" },
    { title: "Community", description: "Supporting local merchants and artisans", icon: "users" },
    { title: "Innovation", description: "Leveraging technology for better shopping experiences", icon: "lightbulb" },
    { title: "Heritage", description: "Preserving and promoting Ethiopian cultural treasures", icon: "landmark" },
  ],
  stats: [
    { value: "50,000+", label: "Happy Customers" },
    { value: "2,500+", label: "Verified Merchants" },
    { value: "100,000+", label: "Products Listed" },
    { value: "11", label: "Regions Covered" },
  ],
  timeline: [
    { year: "2020", title: "Foundation", description: "Gebeya was founded in Addis Ababa with a vision to digitize Ethiopian commerce", image: "/about/2020.jpg" },
    { year: "2021", title: "Expansion", description: "Expanded to all major Ethiopian cities including Dire Dawa, Bahir Dar, and Hawassa", image: "/about/2021.jpg" },
    { year: "2022", title: "Auction Launch", description: "Introduced our unique auction feature for rare and valuable items", image: "/about/2022.jpg" },
    { year: "2023", title: "Mobile App", description: "Launched our mobile app for Android and iOS users", image: "/about/2023.jpg" },
    { year: "2024", title: "International", description: "Started serving Ethiopian diaspora worldwide", image: "/about/2024.jpg" },
  ],
  team: [
    { name: "Amanuel Tekle", role: "CEO & Founder", bio: "Former software engineer with a passion for Ethiopian entrepreneurship", image: "/team/amanuel.jpg" },
    { name: "Sara Mekonnen", role: "CTO", bio: "Tech leader with 10+ years in e-commerce platforms", image: "/team/sara.jpg" },
    { name: "Kidus Haile", role: "Head of Operations", bio: "Operations expert ensuring smooth marketplace experiences", image: "/team/kidus.jpg" },
    { name: "Bethlehem Assefa", role: "Head of Marketing", bio: "Brand strategist connecting Ethiopian products with global audiences", image: "/team/bethlehem.jpg" },
  ],
  locations: [
    { city: "Addis Ababa", country: "Ethiopia", address: "Bole Road, Brass Building, 5th Floor", image: "/locations/addis.jpg", isHeadquarters: true },
    { city: "Dire Dawa", country: "Ethiopia", address: "Kezira District, Main Street", image: "/locations/dire-dawa.jpg", isHeadquarters: false },
    { city: "Bahir Dar", country: "Ethiopia", address: "Near Blue Nile Bridge", image: "/locations/bahir-dar.jpg", isHeadquarters: false },
  ],
  awards: [
    { title: "Best E-Commerce Platform", organization: "Ethiopian ICT Awards", year: "2023", description: "Recognized for excellence in digital marketplace innovation" },
    { title: "Top Startup to Watch", organization: "Africa Tech Summit", year: "2022", description: "Featured among Africa's most promising tech startups" },
    { title: "Community Impact Award", organization: "Ethiopian Business Forum", year: "2024", description: "For empowering local artisans and small businesses" },
  ],
  cta: {
    title: "Ready to Explore Ethiopian Treasures?",
    description: "Join thousands of satisfied customers and discover authentic Ethiopian products from verified merchants.",
    buttonText: "Start Shopping",
    buttonLink: "/products",
  },
};

// Announcements
const announcementsData = [
  {
    title: "Welcome to Gebeya Marketplace!",
    description: "Discover amazing Ethiopian products from verified merchants across the country. Shop with confidence!",
    link: "/products",
  },
  {
    title: "New Auction Feature Launched",
    description: "Bid on rare and unique Ethiopian items. Our new auction system is now live!",
    link: "/auctions",
  },
  {
    title: "Holiday Sale - Meskel Special",
    description: "Celebrate Meskel with special discounts on traditional items. Up to 30% off on selected products!",
    link: "/products?sale=meskel",
  },
];

// ===========================================
// SEEDING FUNCTIONS
// ===========================================

async function clearDatabase() {
  console.log("🗑️  Clearing existing data...");
  
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Auction.deleteMany({}),
    Bid.deleteMany({}),
    Order.deleteMany({}),
    Notification.deleteMany({}),
    Advertisement.deleteMany({}),
    Hero.deleteMany({}),
    Mission.deleteMany({}),
    Vision.deleteMany({}),
    Value.deleteMany({}),
    Stat.deleteMany({}),
    TimelineEvent.deleteMany({}),
    TeamMember.deleteMany({}),
    OfficeLocation.deleteMany({}),
    Award.deleteMany({}),
    Cta.deleteMany({}),
  ]);
  
  console.log("✅ Database cleared");
}

async function seedCategories() {
  console.log("📁 Seeding categories...");
  const categories = await Category.insertMany(categoriesData);
  console.log(`✅ Created ${categories.length} categories`);
  return categories;
}

async function seedUsers() {
  console.log("👥 Seeding users...");
  
  const hashedPassword = await argon2.hash("Password123!");
  
  const usersWithPassword = usersData.map(user => ({
    ...user,
    password: hashedPassword,
  }));
  
  const users = await User.insertMany(usersWithPassword);
  console.log(`✅ Created ${users.length} users`);
  
  const customers = users.filter(u => u.role === "customer");
  const merchants = users.filter(u => u.role === "merchant");
  
  return { customers, merchants, allUsers: users };
}

async function seedProducts(merchants, categories) {
  console.log("📦 Seeding products...");
  const productsData = getProductsData(merchants, categories);
  const products = await Product.insertMany(productsData);
  console.log(`✅ Created ${products.length} products`);
  return products;
}

async function seedAuctions(merchants, categories) {
  console.log("🔨 Seeding auctions...");
  const auctionsData = getAuctionsData(merchants, categories);
  const auctions = await Auction.insertMany(auctionsData);
  console.log(`✅ Created ${auctions.length} auctions`);
  return auctions;
}

async function seedBids(auctions, customers) {
  console.log("💰 Seeding bids...");
  
  const bidsData = auctions.slice(0, 3).map((auction, index) => ({
    auctionId: auction._id,
    bids: [
      {
        bidderId: customers[0]._id,
        bidderEmail: customers[0].email,
        bidderName: customers[0].fullName,
        bidAmount: auction.startingPrice + auction.bidIncrement,
        status: "outbid",
      },
      {
        bidderId: customers[1]._id,
        bidderEmail: customers[1].email,
        bidderName: customers[1].fullName,
        bidAmount: auction.startingPrice + (auction.bidIncrement * 2),
        status: "outbid",
      },
      {
        bidderId: customers[2]._id,
        bidderEmail: customers[2].email,
        bidderName: customers[2].fullName,
        bidAmount: auction.startingPrice + (auction.bidIncrement * 3),
        status: "active",
      },
    ],
    highestBid: auction.startingPrice + (auction.bidIncrement * 3),
    highestBidder: customers[2]._id,
    totalBids: 3,
  }));
  
  const bids = await Bid.insertMany(bidsData);
  console.log(`✅ Created ${bids.length} bid records`);
  return bids;
}

async function seedOrders(customers, merchants, products) {
  console.log("🛒 Seeding orders...");
  
  const ordersData = [
    {
      customerDetail: {
        customerId: customers[0]._id,
        customerName: customers[0].fullName,
        phoneNumber: customers[0].phoneNumber,
        customerEmail: customers[0].email,
        address: { state: customers[0].stateName, city: customers[0].cityName },
      },
      merchantDetail: {
        merchantId: merchants[0]._id,
        merchantName: merchants[0].fullName,
        merchantEmail: merchants[0].email,
        phoneNumber: merchants[0].phoneNumber,
        account_name: merchants[0].account_name,
        account_number: merchants[0].account_number,
        bank_code: merchants[0].bank_code,
      },
      products: [
        {
          productId: products[0]._id,
          productName: products[0].productName,
          quantity: 2,
          price: products[0].price,
          delivery: products[0].delivery,
          deliveryPrice: products[0].deliveryPrice,
          categoryName: products[0].category.categoryName,
        },
      ],
      totalPrice: (products[0].price * 2) + products[0].deliveryPrice,
      status: "Received",
      paymentStatus: "Paid",
      location: { type: "Point", coordinates: ethiopianLocations.addisAbaba.coords },
      transactionRef: generateTxRef(),
      chapaRef: `CHAPA-${Date.now()}`,
    },
    {
      customerDetail: {
        customerId: customers[1]._id,
        customerName: customers[1].fullName,
        phoneNumber: customers[1].phoneNumber,
        customerEmail: customers[1].email,
        address: { state: customers[1].stateName, city: customers[1].cityName },
      },
      merchantDetail: {
        merchantId: merchants[1]._id,
        merchantName: merchants[1].fullName,
        merchantEmail: merchants[1].email,
        phoneNumber: merchants[1].phoneNumber,
        account_name: merchants[1].account_name,
        account_number: merchants[1].account_number,
        bank_code: merchants[1].bank_code,
      },
      products: [
        {
          productId: products[3]._id,
          productName: products[3].productName,
          quantity: 1,
          price: products[3].price,
          delivery: products[3].delivery,
          deliveryPrice: products[3].deliveryPrice,
          categoryName: products[3].category.categoryName,
        },
      ],
      totalPrice: products[3].price + products[3].deliveryPrice,
      status: "Dispatched",
      paymentStatus: "Paid",
      location: { type: "Point", coordinates: ethiopianLocations.jimma.coords },
      transactionRef: generateTxRef(),
      chapaRef: `CHAPA-${Date.now() + 1}`,
    },
    {
      customerDetail: {
        customerId: customers[2]._id,
        customerName: customers[2].fullName,
        phoneNumber: customers[2].phoneNumber,
        customerEmail: customers[2].email,
        address: { state: customers[2].stateName, city: customers[2].cityName },
      },
      merchantDetail: {
        merchantId: merchants[2]._id,
        merchantName: merchants[2].fullName,
        merchantEmail: merchants[2].email,
        phoneNumber: merchants[2].phoneNumber,
        account_name: merchants[2].account_name,
        account_number: merchants[2].account_number,
        bank_code: merchants[2].bank_code,
      },
      products: [
        {
          productId: products[6]._id,
          productName: products[6].productName,
          quantity: 1,
          price: products[6].price,
          delivery: products[6].delivery,
          deliveryPrice: products[6].deliveryPrice,
          categoryName: products[6].category.categoryName,
        },
      ],
      totalPrice: products[6].price + products[6].deliveryPrice,
      status: "Pending",
      paymentStatus: "Pending",
      location: { type: "Point", coordinates: ethiopianLocations.direDawa.coords },
      transactionRef: generateTxRef(),
    },
  ];
  
  const orders = await Order.insertMany(ordersData);
  console.log(`✅ Created ${orders.length} orders`);
  return orders;
}

async function seedNotifications(customers, auctions) {
  console.log("🔔 Seeding notifications...");
  
  const notificationsData = [
    {
      userId: customers[0]._id,
      title: "Welcome to Gebeya!",
      description: "Thank you for joining Ethiopia's premier online marketplace. Start exploring amazing products!",
      type: "system",
      read: false,
    },
    {
      userId: customers[0]._id,
      title: "You've been outbid!",
      description: `Someone placed a higher bid on "${auctions[0].auctionTitle}". Place a new bid to stay in the lead!`,
      type: "outbid",
      read: false,
      data: {
        auctionId: auctions[0]._id,
        bidAmount: auctions[0].startingPrice + auctions[0].bidIncrement,
      },
    },
    {
      userId: customers[1]._id,
      title: "Auction ending soon!",
      description: `The auction for "${auctions[1].auctionTitle}" ends in 24 hours. Don't miss your chance!`,
      type: "ending",
      read: false,
      data: {
        auctionId: auctions[1]._id,
      },
    },
    {
      userId: customers[2]._id,
      title: "Your order has been dispatched!",
      description: "Your order is on its way. Track your delivery in the orders section.",
      type: "system",
      read: true,
    },
  ];
  
  const notifications = await Notification.insertMany(notificationsData);
  console.log(`✅ Created ${notifications.length} notifications`);
  return notifications;
}

async function seedAboutContent() {
  console.log("ℹ️  Seeding about page content...");
  
  await Promise.all([
    Hero.create(aboutData.hero),
    Mission.create(aboutData.mission),
    Vision.create(aboutData.vision),
    Value.insertMany(aboutData.values),
    Stat.insertMany(aboutData.stats),
    TimelineEvent.insertMany(aboutData.timeline),
    TeamMember.insertMany(aboutData.team),
    OfficeLocation.insertMany(aboutData.locations),
    Award.insertMany(aboutData.awards),
    Cta.create(aboutData.cta),
  ]);
  
  console.log("✅ Created about page content");
}

// ===========================================
// MAIN SEED FUNCTION
// ===========================================

async function seed() {
  try {
    console.log("\n🌱 Starting database seeding...\n");
    console.log(`📡 Connecting to: ${process.env.MONGO_URL}\n`);
    
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Connected to MongoDB\n");
    
    // Clear existing data
    await clearDatabase();
    
    // Seed in order (respecting dependencies)
    const categories = await seedCategories();
    const { customers, merchants, allUsers } = await seedUsers();
    const products = await seedProducts(merchants, categories);
    const auctions = await seedAuctions(merchants, categories);
    await seedBids(auctions, customers);
    await seedOrders(customers, merchants, products);
    await seedNotifications(customers, auctions);
    await seedAboutContent();
    
    console.log("\n" + "=".repeat(50));
    console.log("🎉 Database seeding completed successfully!");
    console.log("=".repeat(50));
    console.log("\n📊 Summary:");
    console.log(`   • Categories: ${categories.length}`);
    console.log(`   • Users: ${allUsers.length} (${customers.length} customers, ${merchants.length} merchants)`);
    console.log(`   • Products: ${products.length}`);
    console.log(`   • Auctions: ${auctions.length}`);
    console.log("\n🔐 Test Credentials:");
    console.log("   Customer: abebe.bikila@email.com / Password123!");
    console.log("   Merchant: selam.coffee@email.com / Password123!");
    console.log("\n");
    
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log("📡 Disconnected from MongoDB");
  }
}

// Run seeder
seed();
