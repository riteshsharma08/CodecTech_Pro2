# CodecTech_Project2

## FinTech Digital Wallet & Peer-to-Peer Payments System

An enterprise-grade, secure digital wallet engineered with React, Node.js, and simulated payment gateway APIs. Designed with zero-trust security architecture, real-time heuristic fraud detection, multi-factor authentication (2FA), and comprehensive financial analytics.

---

### Key Features

1. **Wallet Balance & Real-Time Ledger Activity**
   - Multi-currency checking wallet (USD primary, live EUR & GBP currency conversion).
   - High-yield Savings Vault reserve (4.85% APY) with instant transfer & release controls.
   - Comprehensive ledger search, multi-criteria filtering (Sent, Received, Deposits, Withdrawals, Escrow review).
   - Cryptographic receipt drawer with downloadable and printable transaction slips.

2. **Peer-to-Peer (P2P) Instant Transfers**
   - Zero-fee peer transfers via `$PayTag`, email, or phone.
   - Frequent payees quick-send ribbon with verified contact credentials.
   - Request Money & Split-the-Bill engine with automated participant division.
   - Dynamic SVG QR code generator and interactive viewfinder payment scanner.

3. **Two-Factor Authentication (2FA) Security Architecture**
   - RFC 6238 Time-based One-Time Password (TOTP) authenticator engine.
   - Real-time rotating 30-second token generation with visual countdown timers.
   - Configurable security thresholds (mandatory 2FA for transfers exceeding threshold).
   - SMS OTP simulation with automatic delivery & clock-drift tolerance.

4. **Autonomous Fraud Detection & Risk Scoring Engine**
   - Real-time heuristic scoring radar (0–100 risk score) evaluated prior to transaction execution:
     - **Velocity Anomaly**: Intercepts rapid repeated transfers within 60 seconds.
     - **High-Value Anomaly Spike**: Flags sudden transfers exceeding 40% of liquid assets or high thresholds.
     - **Unverified / Flagged Payee Checks**: Intercepts transactions directed toward suspicious blacklisted accounts.
     - **Geo-IP & Proxy Anomaly**: Identifies anomalous device fingerprints, VPN proxy nodes, and Tor exit hops.
     - **Abnormal Off-Hours Spending**: Flags unusual late-night fund drains.
   - Interactive Fraud Rules Matrix to toggle heuristics, customize thresholds, and review active security events.

5. **Payment Gateway APIs Simulation**
   - Seamless top-up via Visa / Mastercard Debit, Plaid Instant ACH, or Apple Pay.
   - Bank payouts with Instant Card Payout (Visa Direct) and Standard ACH Clearing.
   - Complete webhook lifecycle simulation (`charge.succeeded`, `payout.created`).

6. **Payment Analytics & Intelligence**
   - Interactive monthly Inflow vs Outflow velocity charts.
   - Expenditure breakdown by spending category with percentage distribution.
   - Peer transaction exchange volume ranking.
   - Net cash retention and cash flow analytics.

---

### Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Motion
- **Icons & Visuals**: Lucide React, Canvas Confetti, SVG QR Rendering
- **Security Protocols**: RFC 6238 TOTP, 256-bit TLS simulated encryption
- **Build System**: Vite 8, Node.js

---

### Security & Credential Masking

All sensitive environment variables, private keys, API tokens, and credentials are protected and excluded via `.gitignore`:
- `.env*` files masked
- `firebase-applet-config.json` and service account keys excluded
- `.pem`, `.key`, and `.cert` files excluded
- Only non-sensitive `.env.example` template tracked

---

### Getting Started

```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Build production bundle
npm run build
```

---

### Repository Deployment

```bash
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/riteshsharma08/CodecTech_Project2.git
git push -u origin main
```
