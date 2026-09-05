# SplitEase — Group Expense Splitter

SplitEase is a modern group expense splitter and debt simplifier with an Express REST API backend and a React + Vite + Tailwind CSS frontend.

## Architecture

- **Backend (`backend/`)**: Node.js + Express REST API on port `3001`
  - In-memory expense store with equal split calculations and greedy debt settlement simplification.
  - Endpoints: `GET /health`, `POST/GET/DELETE /expenses`, `GET /balances`, `GET /people`.
- **Frontend (`frontend/`)**: React 18 + Vite + Tailwind CSS + Lucide Icons on port `5173`
  - Dynamic Add Expense form with quick category tags, participant management, and live per-person breakdown.
  - Searchable and filterable expense timeline with deletion support.
  - Balances & Settle-up view showing simplified "who pays who" payments and individual net balances.
  - One-click "Copy Settle-Up Summary" to clipboard.

## Getting Started

### 1. Start the Backend
```bash
cd backend
npm install
npm start
```
Backend runs on `http://localhost:3001`.

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

### 3. Run Backend Unit Tests
```bash
cd backend
npm test
```
