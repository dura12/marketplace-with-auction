# Gebeya - Ethiopian Online Marketplace with Auction

A full-featured e-commerce marketplace platform with real-time auction capabilities, built specifically for the Ethiopian market. Features include product listings, bidding system, order management, and a comprehensive admin panel

## Features

### Customer Features
- Browse and search products by category, location, and price
- Real-time auction bidding system
- Shopping cart and wishlist
- Order tracking and history
- User reviews and ratings
- Real-time notifications
- Multiple payment options via Chapa

### Merchant Features
- Product listing and management
- Auction creation and management
- Order fulfillment tracking
- Customer management
- Sales analytics
- Bank account integration for payouts

### Admin Features
- User and merchant management
- Product and auction approval
- Order monitoring
- Advertisement management
- System announcements
- Analytics dashboard

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, React 18/19, TailwindCSS |
| **Backend** | Next.js API Routes, Node.js |
| **Database** | MongoDB with Mongoose |
| **Authentication** | NextAuth.js with JWT |
| **Real-time** | Socket.io |
| **Payments** | Chapa Payment Gateway |
| **File Storage** | Firebase Storage |
| **Maps** | Google Maps API |
| **AI** | Google Gemini (Chatbot) |

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18.0.0 or higher
- **MongoDB** v6.0 or higher (local or MongoDB Atlas)
- **npm** or **yarn**
- **Git**

### Installing MongoDB (Windows)

1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run the installer and select "Install MongoDB as a Service"
3. MongoDB will run automatically on `mongodb://127.0.0.1:27017`

Alternatively, use [MongoDB Atlas](https://cloud.mongodb.com) for a free cloud database.

## Project Structure

```
marketplace-with-auction/
├── web/                    # Main marketplace application (port 3001)
│   ├── app/               # Next.js app router pages & API routes
│   ├── components/        # React components
│   ├── models/           # Mongoose database models
│   ├── libs/             # Utility functions
│   ├── scripts/          # Database seeders
│   └── public/           # Static assets
│
├── admin/                  # Admin panel application (port 3000)
│   ├── app/              # Next.js app router pages & API routes
│   ├── components/       # React components
│   ├── models/          # Mongoose database models
│   ├── utils/           # Utility functions
│   └── scripts/         # Database seeders
│
└── context/               # Project documentation
```

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/marketplace-with-auction.git
cd marketplace-with-auction
```

### 2. Install Dependencies

```bash
# Install web (marketplace) dependencies
cd web
npm install

# Install admin panel dependencies
cd ../admin
npm install
```

### 3. Configure Environment Variables

Create `.env` files in both `web/` and `admin/` directories:

#### Web Application (`web/.env`)

```env
# ===========================================
# DATABASE
# ===========================================
MONGO_URL=mongodb://127.0.0.1:27017/marketplace

# ===========================================
# NEXTAUTH CONFIGURATION
# ===========================================
NEXTAUTH_SECRET=your-super-secret-key-change-in-production
NEXTAUTH_URL=http://localhost:3001

# ===========================================
# EMAIL CONFIGURATION (Gmail)
# ===========================================
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# ===========================================
# CHAPA PAYMENT GATEWAY
# ===========================================
CHAPA_SECRET_KEY=your-chapa-secret-key
CHAPA_CALLBACK_URL=http://localhost:3001/api/callback

# ===========================================
# GOOGLE AI (Gemini Chatbot)
# ===========================================
GOOGLE_API_KEY=your-google-api-key

# ===========================================
# SOCKET.IO & APP URLs
# ===========================================
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3001

# ===========================================
# FIREBASE CONFIGURATION
# ===========================================
NEXT_PUBLIC_API_KEY=your-firebase-api-key
NEXT_PUBLIC_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_PROJECT_ID=your-project-id
NEXT_PUBLIC_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_APP_ID=your-app-id
NEXT_PUBLIC_MEASUREMENT_ID=G-XXXXXXXXXX

# ===========================================
# GOOGLE MAPS
# ===========================================
NEXT_PUBLIC_MAPS_KEY=your-google-maps-api-key

# ===========================================
# NODE ENVIRONMENT
# ===========================================
NODE_ENV=development
```

#### Admin Panel (`admin/.env`)

```env
# ===========================================
# DATABASE
# ===========================================
MONGO_URL=mongodb://127.0.0.1:27017/marketplace

# ===========================================
# NEXTAUTH CONFIGURATION
# ===========================================
NEXTAUTH_SECRET=your-super-secret-key-change-in-production
NEXTAUTH_URL=http://localhost:3000

# ===========================================
# EMAIL CONFIGURATION
# ===========================================
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
AACEPTOR_EMAIL=contact@yourdomain.com

# ===========================================
# CHAPA PAYMENT GATEWAY
# ===========================================
CHAPA_SECRET_KEY=your-chapa-secret-key

# ===========================================
# FRONTEND URL
# ===========================================
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3001

# ===========================================
# FIREBASE CONFIGURATION
# ===========================================
NEXT_PUBLIC_API_KEY=your-firebase-api-key
NEXT_PUBLIC_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_PROJECT_ID=your-project-id
NEXT_PUBLIC_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_APP_ID=your-app-id
NEXT_PUBLIC_MEASUREMENT_ID=G-XXXXXXXXXX

# ===========================================
# GOOGLE MAPS
# ===========================================
NEXT_PUBLIC_MAPS_KEY=your-google-maps-api-key

# ===========================================
# NODE ENVIRONMENT
# ===========================================
NODE_ENV=development
```

### 4. Seed the Database

Populate the database with sample Ethiopian data:

```bash
# Seed marketplace data (users, products, categories, auctions)
cd web
npm run seed

# Seed admin data (admins, announcements)
cd ../admin
npm run seed
```

### 5. Start the Applications

Open two terminal windows:

**Terminal 1 - Web Application:**
```bash
cd web
npm run dev
```

**Terminal 2 - Admin Panel:**
```bash
cd admin
npm run dev
```

## Accessing the Applications

| Application | URL | Description |
|-------------|-----|-------------|
| **Marketplace** | http://localhost:3001 | Customer & Merchant portal |
| **Admin Panel** | http://localhost:3000 | Administration dashboard |

## Test Credentials

After seeding the database, use these credentials to test:

### Marketplace (Web)

| Role | Email | Password |
|------|-------|----------|
| Customer | abebe.bikila@email.com | Password123! |
| Customer | tigist.bekele@email.com | Password123! |
| Merchant | selam.coffee@email.com | Password123! |
| Merchant | habesha.fashion@email.com | Password123! |

### Admin Panel

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@gebeya.com | SuperAdmin123! |
| Admin | admin@gebeya.com | Admin123! |

## Sample Data Included

The seeders create Ethiopia-focused sample data:

### Categories (12)
- Ethiopian Coffee, Traditional Clothing, Spices & Herbs
- Handcrafts, Jewelry, Electronics, Home & Living
- Fashion, Food & Groceries, Art & Antiques
- Books & Stationery, Health & Beauty

### Products (13)
- **Coffee**: Yirgacheffe, Sidamo, Harar varieties
- **Clothing**: Habesha Kemis, Gabi, Traditional Suits
- **Electronics**: Samsung, TECNO phones
- **Crafts**: Mesob, Ethiopian Crosses
- **Spices**: Berbere, Mitmita, Ethiopian Honey

### Auctions (5)
- Antique Jebena (coffee pot)
- Vintage Habesha Kemis
- Ethiopian Art Collection
- Silver Cross Set
- Premium Coffee Lot

### Ethiopian Cities
Addis Ababa, Dire Dawa, Bahir Dar, Gondar, Hawassa, Mekelle, Adama, Jimma, Dessie, Harar

## API Documentation

### Authentication Endpoints
```
POST /api/auth/[...nextauth]  - NextAuth.js authentication
POST /api/auth/verify-otp     - OTP verification
POST /api/sendOtp             - Send OTP email
POST /api/forgotPassword      - Password reset
```

### Product Endpoints
```
GET    /api/products          - List products
GET    /api/products/[id]     - Get product details
POST   /api/products          - Create product (merchant)
PUT    /api/products/[id]     - Update product
DELETE /api/products/[id]     - Delete product
```

### Auction Endpoints
```
GET    /api/auctions          - List auctions
GET    /api/auctions/[id]     - Get auction details
POST   /api/auctions          - Create auction
POST   /api/bid               - Place bid
GET    /api/bid/[auctionId]   - Get bid history
```

### Order Endpoints
```
GET    /api/orders            - List orders
GET    /api/orders/[id]       - Get order details
POST   /api/order             - Create order
PUT    /api/orders/[id]       - Update order status
POST   /api/checkout          - Process payment
```

## Scripts Reference

### Web Application
```bash
npm run dev        # Start development server (port 3001)
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run seed       # Seed database with sample data
```

### Admin Panel
```bash
npm run dev        # Start development server (port 3000)
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run seed       # Seed admin database
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URL` | Yes | MongoDB connection string |
| `NEXTAUTH_SECRET` | Yes | Secret for JWT signing |
| `NEXTAUTH_URL` | Yes | Application base URL |
| `EMAIL_USER` | Yes | SMTP email address |
| `EMAIL_PASS` | Yes | SMTP email password/app password |
| `CHAPA_SECRET_KEY` | Yes | Chapa API secret key |
| `GOOGLE_API_KEY` | No | Google Gemini API key |
| `NEXT_PUBLIC_MAPS_KEY` | No | Google Maps API key |
| `NEXT_PUBLIC_API_KEY` | No | Firebase API key |

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running (Windows)
net start MongoDB

# Or start MongoDB manually
mongod --dbpath "C:\data\db"
```

### Port Already in Use
```bash
# Find and kill process on port 3001 (Windows)
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
The `tsconfig.json` includes `typeRoots` configuration to resolve d3 type issues:
```json
{
  "compilerOptions": {
    "typeRoots": ["./node_modules/@types"]
  }
}
```

## Docker Support

```bash
# Start with Docker Compose
cd web
docker-compose up -d

# This starts:
# - Next.js application on port 5173 (mapped to 3000)
# - MongoDB on port 27017
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@gebeya.com or join our Telegram community.

---

**Built with love for Ethiopian entrepreneurs and artisans**
