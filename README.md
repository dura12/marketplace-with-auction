<div align="center">

# 🛒 Marketplace with Auction

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/dura12/marketplace-with-auction/graphs/commit-activity)

**A modern, full-featured online marketplace that seamlessly combines traditional e-commerce with competitive auction bidding.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Architecture](#-architecture) • [API Reference](#-api-reference) • [Contributing](#-contributing)

</div>

---

## 📋 Overview

**Marketplace with Auction** is a comprehensive e-commerce platform that bridges the gap between fixed-price retail and dynamic auction-based selling. Whether you're a seller looking to maximize value through competitive bidding or a buyer hunting for deals, this platform provides the tools and features needed for a seamless experience.

### Why This Project?

Traditional marketplaces force sellers to choose between fixed prices or auctions. Our platform lets sellers:
- List items at fixed prices for immediate sales
- Create time-limited auctions to maximize value
- Use hybrid listings with "Buy Now" prices alongside auction bidding
- Reach a wider audience of both bargain hunters and instant buyers

---

## ✨ Features

### 🏪 Marketplace Features
- **Product Listings** — Rich product pages with multiple images, descriptions, and specifications
- **Category Management** — Hierarchical categories with filtering and search
- **Shopping Cart** — Persistent cart with guest checkout support
- **Wishlist** — Save items for later with price drop notifications
- **Reviews & Ratings** — Verified purchase reviews with seller responses

### 🔨 Auction Features
- **Timed Auctions** — Set start/end times with automatic winner selection
- **Reserve Prices** — Hidden minimum prices that must be met
- **Buy Now Option** — Allow instant purchase during active auctions
- **Bid History** — Complete transparency with full bid logs
- **Proxy Bidding** — Set maximum bids with automatic incremental bidding
- **Auction Extensions** — Anti-sniping protection extends auctions on late bids
- **Watchlist** — Track auctions with outbid notifications

### 👤 User Management
- **Authentication** — Secure login with email, OAuth (Google, GitHub, Facebook)
- **User Profiles** — Customizable profiles with avatars and bio
- **Seller Dashboard** — Analytics, inventory management, and sales reports
- **Buyer Dashboard** — Order history, active bids, and saved searches
- **Reputation System** — Trust scores based on transaction history

### 💳 Payments & Security
- **Multiple Payment Methods** — Credit cards, PayPal, cryptocurrency
- **Escrow System** — Secure payment holding until delivery confirmation
- **Fraud Detection** — AI-powered suspicious activity monitoring
- **PCI Compliance** — Secure payment data handling

### 📱 Additional Features
- **Real-time Notifications** — WebSocket-powered instant updates
- **Mobile Responsive** — Optimized for all device sizes
- **Search & Filters** — Advanced search with multiple filter options
- **Internationalization** — Multi-language and multi-currency support
- **Admin Panel** — Complete platform management interface

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **PostgreSQL** | Primary database |
| **Redis** | Caching & session storage |
| **Socket.io** | Real-time communication |
| **Bull** | Job queue for background tasks |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI library |
| **TypeScript** | Type safety |
| **Redux Toolkit** | State management |
| **TailwindCSS** | Styling |
| **React Query** | Server state management |
| **Framer Motion** | Animations |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Nginx** | Reverse proxy & load balancing |
| **AWS S3** | File storage |
| **Stripe** | Payment processing |
| **SendGrid** | Email services |
| **Elasticsearch** | Search engine |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- Node.js (v18.0.0 or higher)
- PostgreSQL (v14 or higher)
- Redis (v6 or higher)
- Docker & Docker Compose (optional, recommended)

### Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/dura12/marketplace-with-auction.git
cd marketplace-with-auction

# Copy environment variables
cp .env.example .env

# Start all services
docker-compose up -d

# Run database migrations
docker-compose exec api npm run migrate

# Seed sample data (optional)
docker-compose exec api npm run seed
```

The application will be available at `http://localhost:3000`

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/dura12/marketplace-with-auction.git
cd marketplace-with-auction

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install

# Set up environment variables
cd ..
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
cd server
npm run migrate

# Start development servers
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/marketplace
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Payments
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# File Storage
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name

# Email
SENDGRID_API_KEY=your-sendgrid-key

# App Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
```

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Load Balancer                           │
│                           (Nginx)                               │
└─────────────────────────────┬───────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   Frontend    │   │   API Server  │   │   WebSocket   │
│   (React)     │   │   (Express)   │   │   Server      │
└───────────────┘   └───────┬───────┘   └───────┬───────┘
                            │                   │
        ┌───────────────────┼───────────────────┘
        │                   │
        ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  PostgreSQL   │   │    Redis      │   │ Elasticsearch │
│  (Primary DB) │   │   (Cache)     │   │   (Search)    │
└───────────────┘   └───────────────┘   └───────────────┘
        │
        ▼
┌───────────────┐   ┌───────────────┐
│  Background   │   │   Storage     │
│  Jobs (Bull)  │   │   (AWS S3)    │
└───────────────┘   └───────────────┘
```

### Directory Structure

```
marketplace-with-auction/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── features/       # Feature-based modules
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Route pages
│   │   ├── services/       # API service layer
│   │   ├── store/          # Redux store configuration
│   │   ├── styles/         # Global styles
│   │   └── utils/          # Utility functions
│   └── package.json
│
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── jobs/           # Background job processors
│   │   ├── utils/          # Utility functions
│   │   └── websocket/      # WebSocket handlers
│   ├── migrations/         # Database migrations
│   ├── seeds/              # Database seeders
│   └── package.json
│
├── docker-compose.yml
├── .env.example
├── LICENSE
└── README.md
```

---

## 📚 API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| GET | `/api/products/:id` | Get product details |
| POST | `/api/products` | Create new product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

### Auctions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auctions` | List active auctions |
| GET | `/api/auctions/:id` | Get auction details |
| POST | `/api/auctions` | Create new auction |
| POST | `/api/auctions/:id/bid` | Place a bid |
| GET | `/api/auctions/:id/bids` | Get bid history |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List user orders |
| GET | `/api/orders/:id` | Get order details |
| POST | `/api/orders` | Create new order |
| PUT | `/api/orders/:id/status` | Update order status |

Full API documentation available at `/api/docs` when running the server.

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suite
npm test -- --grep "Auction"

# Run e2e tests
npm run test:e2e
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Write tests for new features
- Update documentation as needed
- Keep commits atomic and well-described

### Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Stripe](https://stripe.com) for payment processing
- [Socket.io](https://socket.io) for real-time features
- [TailwindCSS](https://tailwindcss.com) for styling
- All our amazing contributors!

---

<div align="center">

**Built with ❤️ by the community**

[⬆ Back to Top](#-marketplace-with-auction)

</div>
