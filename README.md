# MedChain FYP

A blockchain-secured electronic health record (EHR) system with AI-powered diagnostics and telemedicine.

## Architecture

```
backend/      Node.js + Express API
blockchain/   Hardhat + Solidity smart contracts
frontend/     React + Vite + Tailwind CSS
testing/      Cypress E2E tests
documentation/        Report materials
```

## Setup

### Prerequisites

- Node.js >= 18
- MongoDB Atlas account
- Pinata (IPFS) account
- OpenAI API key
- Twilio account
- MetaMask wallet
- Polygon Mumbai testnet MATIC

### 1. Backend

```bash
cd backend
cp .env.example .env
# Fill in your env vars
npm install
npm run dev
```

### 2. Blockchain

```bash
cd blockchain
npm install
npx hardhat test
npx hardhat run scripts/deploy.js --network mumbai
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### 4. Tests

```bash
# Backend unit tests
cd backend && npm test

# Blockchain tests
cd blockchain && npx hardhat test

# E2E tests
cd testing && npx cypress run
```

## Live URL

<!-- Add deployment URL when available -->

## Stack

- **Backend:** Node.js, Express, MongoDB/Mongoose, JWT
- **Blockchain:** Solidity, Hardhat, ethers.js, Polygon Mumbai
- **Frontend:** React, Vite, Tailwind CSS, Chart.js
- **Storage:** IPFS via Pinata
- **Video:** Twilio Programmable Video
- **AI:** OpenAI GPT-4
- **Testing:** Jest, Supertest, Hardhat tests, Cypress
