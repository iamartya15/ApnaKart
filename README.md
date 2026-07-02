# ApnaKart - India's Smartest AI Shopping Super App

ApnaKart is an enterprise-grade AI-powered marketplace aggregator that allows users to search, scan, compare, and track price histories across all top Indian e-commerce networks (Amazon, Flipkart, Meesho, Myntra, Ajio, Nykaa, and more) within a single beautiful shopping portal.

## 🚀 Tech Stack

### Frontend
- **React 19 & TypeScript**: Core component logic.
- **Vite**: Rapid, optimized hot module development and asset compiling.
- **Redux Toolkit**: Monorepo global state management (Authentication, user profiles, carts).
- **React Query**: Cache synchronization and remote data fetching.
- **TailwindCSS & CSS3 variables**: Custom responsive typography, glassmorphism cards, and transitions.
- **Framer Motion & GSAP**: Sophisticated page transit and searching micro-animations.

### Backend
- **Node.js & Express**: High-concurrency routing and backend handling.
- **TypeScript**: Strictly typed backend APIs and models.
- **Mongoose & MongoDB**: Dynamic schema validation and catalog persistence.
- **Redis & BullMQ**: Multi-threaded request queuing, rate limiting, and cache speed.
- **Passport & JWT**: Secure session access, refresh key rotates, and social authentications.

### AI Engine
- **Gemini / OpenAI API**: Spec comparisons, fake review detectors, and natural language query parsing.

---

## 🛠️ Monorepo Workspace Structure

```text
ApnaKart/
├── backend/            # Express, Mongoose database models & Marketplace Adapters
├── frontend/           # React 19 main store client app
├── admin/              # Dashboard Console for Scraper config & Revenue analytics
├── docker-compose.yml  # Local multi-container development orchestration
├── nginx.conf          # Nginx reverse proxy configuration
└── package.json        # Workspace manager
```

---

## 🚦 Getting Started (Local Development)

### Prerequisites
Make sure you have installed:
- [Node.js](https://nodejs.org/) (v20+ recommended)
- [MongoDB](https://www.mongodb.com/) (running on localhost:27017 or remote URI)
- [Redis](https://redis.io/) (running on localhost:6379)

### 1. Installation
In the project root, run:
```bash
npm install
```
This will automatically traverse all workspaces (`backend`, `frontend`, `admin`) and resolve all dependencies.

### 2. Configure Environment Variables
Copy the template `.env.example` in `backend/.env` and specify details:
```bash
cp backend/.env.example backend/.env
```

### 3. Spin Up Development Servers
Launch all workspaces concurrently from the root directory:
- **Run Backend**: `npm run backend:dev` (runs on `http://localhost:5000`)
- **Run Frontend**: `npm run frontend:dev` (runs on `http://localhost:5173`)
- **Run Admin Panel**: `npm run admin:dev` (runs on `http://localhost:5174`)

---

## 🐳 Docker Deployment
To launch the entire production-ready ecosystem including Nginx, MongoDB, Redis, and all three application nodes, run:
```bash
docker-compose up --build
```
Once healthy, navigate to:
- **Frontend App**: `http://localhost`
- **Admin Console**: `http://localhost/admin`
- **APIs Health**: `http://localhost/api/health`
