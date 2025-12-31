# Spur AI Live Chat

A production-quality AI live chat web application built for the Spur Founding Engineer take-home assignment.
Designed with **TanStack AI** + **Google Gemini** for efficient streaming and state management.

## 🚀 Why TanStack AI?

We chose TanStack AI to optimize developer velocity and ensure correctness in handling the complexities of LLM interactions:

- **Unified State**: Manages streaming, loading, and error states out of the box.
- **Protocol Agnostic**: Uses standard Server-Sent Events (SSE) for robust streaming.
- **Persistence**: Easily integrates with our database to save chat history.
- **Performance**: Optimized for speed and efficiency.

## 🧱 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **AI**: TanStack AI + Google Gemini (`gemini-2.5-flash`)
- **Database**: PostgreSQL (via Prisma 5)
- **Cache**: Redis (via Docker)
- **Auth**: Custom JWT (Email/Password) with `bcryptjs` + `jose`
- **Styling**: Tailwind CSS v4
- **Version Control**: Git

## 🛠️ Setup & Run

### Prerequisites

- Node.js v22 (managed via `.nvmrc`)
- Docker & Docker Compose

### Steps

1. **Clone & Install**

   ```bash
   npm install
   ```

2. **Environment Setup**
   The project includes a pre-configured `.env` file for local development using the Docker containers.
   **Important**: Add your Google Gemini API Key to `.env`:

   ```env
   GEMINI_API_KEY="your-api-key-here"
   ```

3. **Start Infrastructure**

   ```bash
   docker compose up -d
   ```

   _Runs Postgres on port 5440 and Redis on 6380._

4. **Initialize Database**

   ```bash
   npx prisma migrate dev
   ```

5. **Run Application**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## 🧠 Design Decisions

### Architecture

We used a **Fullstack Next.js** architecture rather than a separate Node.js backend to simplify deployment and leverage the serverless capabilities of API Routes. This fits perfectly with TanStack AI's lighter weight backend requirements.

### Authentication

Implemented a custom secure JWT solution instead of NextAuth to demonstrate core understanding of auth flows (hashing, signing, cookie security). Authentication middleware protects all chat routes.

### AI Model Strategy

Configured with **Gemini 2.5 Flash** for low latency and high throughput. The System Prompt injects store policies (Shipping, Returns) directly into the context.

## 🔮 Future Improvements

- **Optimistic Updates**: Improve UI perception of speed.
- **Tool Calling**: Allow AI to fetch real-time order status from DB.
- **RAG**: Implement vector search (pgvector) for larger knowledge bases.
