# MedChain 3-Minute Defense Demo Script

**Total Duration:** 3 minutes (180 seconds)
**Mode:** Live screen-share with pre-seeded data

---

## Step 1: Login as Patient (30 seconds)

**Screen:** Browser at `http://localhost:5173/login`

**Action:**
- Click "Login" button
- Enter email: `alice@medchain.com`
- Enter password: `••••••••`
- Click "Sign In"

**Say:**
> "This is Alice, a returning patient. She logs into MedChain using her email and password. Behind the scenes, the system issues a JWT token and loads her dashboard with her health summary, upcoming appointments, and recent records — all personalized."

**Assertions:**
- Dashboard loads with Alice's name
- Appointment count and record count visible
- Navigation sidebar shows: Dashboard, Records, Appointments, AI Chat, Audit Log

---

## Step 2: Upload Health Record to IPFS/Blockchain (45 seconds)

**Screen:** Records page → Upload form

**Action:**
- Click "Records" in sidebar
- Click "Upload New Record"
- Select file: `blood-test-report.pdf`
- Choose type: "Lab Report"
- Add optional note: "Routine blood work - June 2026"
- Click "Upload"

**Say:**
> "Alice needs to share her latest blood test results. She uploads the PDF. The file is encrypted client-side using AES-256-GCM, then pushed to IPFS. The resulting IPFS hash is stored on-chain via our MedChainRecordNFT contract as a soulbound NFT. This means the record is tamper-proof and its existence is verifiable on the Polygon blockchain — without exposing the actual medical data."

**Assertions:**
- Progress bar shows upload status
- Success toast: "Health record uploaded successfully"
- New record appears in records list with IPFS hash
- Block number and transaction hash visible in record details

---

## Step 3: Book Appointment with Escrow Payment (30 seconds)

**Screen:** Appointments page

**Action:**
- Click "Appointments" in sidebar
- Click "Book Appointment"
- Select doctor: "Dr. Sarah Lee — Cardiology"
- Pick date: June 15, 2026
- Pick time: 10:00 AM
- Click "Confirm Booking"
- MetaMask pops up → Click "Confirm"

**Say:**
> "Alice books a cardiology appointment. The system creates the appointment in pending state. She pays the consultation fee of 0.05 ETH into our MedChainEscrow smart contract. The funds are locked — neither party can access them until the consultation is complete. This protects both patient and doctor."

**Assertions:**
- Slot shows as booked after confirmation
- Appointment status: "Confirmed"
- Transaction hash displayed
- Doctor's available slots updated (10:00 slot gone)

---

## Step 4: AI Chat for Symptom Analysis (30 seconds)

**Screen:** AI Chat page

**Action:**
- Click "AI Chat" in sidebar
- Type: "I've been experiencing chest tightness and shortness of breath after climbing stairs. What could this indicate?"
- Press Enter / Click Send

**Say:**
> "Before her appointment, Alice uses our AI symptom checker. The message is sent to OpenAI's GPT-4 via our backend. The AI responds with a preliminary assessment, recommendations, and crucially — a disclaimer that this is not medical advice. The AI also suggests she consult a cardiologist, which matches her already-booked appointment."

**Assertions:**
- User message appears in chat bubble immediately
- Typing indicator shows while waiting
- AI response appears with formatting
- Disclaimer is visible: "This is not medical advice"
- Chat history persists on page reload

---

## Step 5: Doctor Accesses Record with Consent (30 seconds)

**Screen:** Switch to Doctor view (or second browser)

**Action:**
- Log in as: `dr.smith@medchain.com` / `••••••••`
- Navigate to "My Patients"
- Click on "Alice Johnson"
- Click "Request Access" on blood test record
- Switch back to Alice's browser
- Alice receives notification → clicks "Approve"
- Switch back to Doctor
- Doctor clicks "View" on the record

**Say:**
> "Dr. Smith logs into his portal and sees Alice in his patient list. To view her blood test, he requests access. Alice receives a notification and grants consent for 30 days. This consent is recorded on the MedChainConsent smart contract. Only after the transaction is mined can Dr. Smith decrypt and view the record. Every access is logged immutably."

**Assertions:**
- Doctor sees patient list with Alice
- Access request triggers notification for Alice
- After consent, doctor can view the record
- Audit log on Alice's side shows: "Dr. Smith viewed blood-test-report.pdf"

---

## Step 6: Audit Trail Verification (15 seconds)

**Screen:** Alice's Audit Log page

**Action:**
- Click "Audit Log" in sidebar
- Show the complete activity history

**Say:**
> "Finally, we verify the audit trail. Every single action — record uploads, consent grants, doctor accesses — is recorded on-chain. Alice can see exactly who accessed her data and when. This is the core value of MedChain: patient-controlled, transparent, and auditable health data management."

**Assertions:**
- Audit log shows: record upload, consent grant, doctor access
- Each entry shows timestamp, action type, doctor name, and transaction hash
- Log is sorted chronologically (newest first)

---

## Closing Statement (remaining time)

**Say:**
> "MedChain demonstrates that blockchain technology can solve real problems in healthcare — data silos, lack of patient control, and opaque access logs. By combining IPFS for storage, Polygon for affordable transactions, AI for patient assistance, and smart contracts for consent and escrow, we've built a system that is secure, transparent, and practical. Thank you."

---

## Demo Checklist

- [ ] Test data seeded (Alice patient, Dr. Smith doctor, admin account)
- [ ] Sample PDF file ready for upload
- [ ] MetaMask configured on Polygon Mumbai with test ETH
- [ ] Browser localStorage cleared before demo start
- [ ] Screen recording and audio tested
- [ ] Backup screenshot slides prepared (in case of network issues)
- [ ] Presenter notes printed
