# MedChain API Reference

Base URL: `http://localhost:5000/api`

All authenticated endpoints require a `Authorization: Bearer <token>` header.

---

## Authentication

### POST /api/auth/register

Create a new user account.

**Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "name": "string (required)",
  "email": "string (required, valid email)",
  "password": "string (required, min 8 chars, 1 uppercase, 1 number)",
  "role": "string (required, 'patient' | 'doctor')"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email."
}
```

**Response 400:**
```json
{
  "success": false,
  "message": "Email already registered."
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@test.com","password":"Password123!","role":"patient"}'
```

---

### POST /api/auth/login

Authenticate and receive a JWT token.

**Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response 200:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "patient | doctor | admin"
  }
}
```

**Response 401:**
```json
{
  "success": false,
  "message": "Invalid email or password."
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"Password123!"}'
```

---

### GET /api/auth/me

Get current authenticated user profile.

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "string",
    "isVerified": "boolean",
    "createdAt": "ISO timestamp"
  }
}
```

**Response 401:**
```json
{
  "success": false,
  "message": "Authentication required."
}
```

**Example:**
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## Health Records

### POST /api/records

Upload a health record to IPFS and store metadata on blockchain.

**Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`

**Request Body:**
| Field    | Type   | Required | Description             |
|----------|--------|----------|-------------------------|
| file     | File   | Yes      | PDF, JPG, or PNG (max 10MB) |
| type     | String | No       | "Lab Report" / "Imaging" / "Prescription" / "Other" |
| notes    | String | No       | Optional patient notes  |

**Response 201:**
```json
{
  "success": true,
  "message": "Health record uploaded successfully.",
  "record": {
    "id": "string",
    "ipfsHash": "string",
    "fileName": "string",
    "fileSize": "number",
    "type": "string",
    "uploadedAt": "ISO timestamp"
  }
}
```

**Response 500:**
```json
{
  "success": false,
  "message": "IPFS upload failed."
}
```

---

### GET /api/records

List records for the authenticated patient or (for doctors) a specific patient.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Param     | Type   | Required | Description                              |
|-----------|--------|----------|------------------------------------------|
| patientId | String | No       | Doctor-only: filter records by patient   |
| type      | String | No       | Filter by record type                    |
| page      | Number | No       | Pagination (default 1)                   |
| limit     | Number | No       | Items per page (default 20, max 100)     |

**Response 200:**
```json
{
  "success": true,
  "records": [
    {
      "id": "string",
      "ipfsHash": "string",
      "fileName": "string",
      "fileSize": "number",
      "type": "string",
      "uploadedAt": "ISO timestamp",
      "accessedBy": ["string"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42
  }
}
```

**Response 403:**
```json
{
  "success": false,
  "message": "Access denied. No consent granted."
}
```

---

### GET /api/records/:id

Get a single record's metadata and IPFS URL.

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "success": true,
  "record": {
    "id": "string",
    "ipfsHash": "Qm...",
    "fileName": "string",
    "fileSize": "number",
    "type": "string",
    "ipfsUrl": "https://ipfs.io/ipfs/Qm...",
    "uploadedAt": "ISO timestamp",
    "accessedBy": [
      { "name": "string", "accessedAt": "ISO timestamp" }
    ]
  }
}
```

**Response 404:**
```json
{
  "success": false,
  "message": "Record not found."
}
```

---

### DELETE /api/records/:id

Delete a health record (patient only).

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "success": true,
  "message": "Record deleted successfully."
}
```

---

## AI

### POST /api/ai/chat

Send a message to the AI symptom analysis chatbot.

**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

**Request Body:**
```json
{
  "message": "string (required, max 2000 chars)",
  "history": [
    { "role": "user | assistant", "content": "string" }
  ]
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Based on your symptoms...",
  "sources": ["string (optional)"]
}
```

**Response 429:**
```json
{
  "success": false,
  "message": "Rate limit exceeded. Please try again later."
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"message":"I have a headache and fever for 2 days."}'
```

---

### POST /api/ai/summarize

Summarize a health record using AI.

**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

**Request Body:**
```json
{
  "recordId": "string (required)"
}
```

**Response 200:**
```json
{
  "success": true,
  "summary": "Patient presents with... Key findings: ...",
  "recordId": "string"
}
```

---

### POST /api/ai/find-specialist

Recommend a specialist based on symptoms.

**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

**Request Body:**
```json
{
  "symptoms": "string (required)",
  "patientAge": "number (optional)",
  "knownConditions": ["string (optional)"]
}
```

**Response 200:**
```json
{
  "success": true,
  "recommendation": {
    "specialty": "Cardiology",
    "reason": "Chest pain and shortness of breath suggest cardiac evaluation.",
    "urgency": "routine | urgent | immediate"
  },
  "availableDoctors": [
    {
      "id": "string",
      "name": "string",
      "rating": "number",
      "nextAvailable": "ISO timestamp"
    }
  ]
}
```

---

## Appointments

### GET /api/appointments

List appointments for the current user (patient or doctor).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Param  | Type   | Required | Description                    |
|--------|--------|----------|--------------------------------|
| status | String | No       | "pending" / "confirmed" / "completed" / "cancelled" |
| from   | Date   | No       | Start date filter              |
| to     | Date   | No       | End date filter                |

**Response 200:**
```json
{
  "success": true,
  "appointments": [
    {
      "id": "string",
      "doctorId": "string",
      "doctorName": "string",
      "patientName": "string",
      "date": "YYYY-MM-DD",
      "time": "HH:mm",
      "status": "pending | confirmed | completed | cancelled",
      "fee": "string (ETH)",
      "txHash": "string | null"
    }
  ]
}
```

---

### POST /api/appointments

Create a new appointment.

**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

**Request Body:**
```json
{
  "doctorId": "string (required)",
  "date": "YYYY-MM-DD (required)",
  "time": "HH:mm (required)",
  "notes": "string (optional)"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Appointment booked. Payment required.",
  "appointment": {
    "id": "string",
    "doctorId": "string",
    "date": "YYYY-MM-DD",
    "time": "HH:mm",
    "fee": "0.05",
    "status": "pending_payment"
  }
}
```

**Response 400:**
```json
{
  "success": false,
  "message": "Time slot is already booked."
}
```

---

### POST /api/appointments/payment

Confirm appointment payment via blockchain escrow.

**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

**Request Body:**
```json
{
  "appointmentId": "string (required)",
  "txHash": "string (required, from MetaMask)"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Payment confirmed. Appointment locked.",
  "appointment": {
    "id": "string",
    "status": "confirmed",
    "txHash": "string"
  }
}
```

---

### PATCH /api/appointments/:id/cancel

Cancel an appointment.

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "success": true,
  "message": "Appointment cancelled. Refund processed."
}
```

---

## Video Consultation

### POST /api/video/token

Generate a video consultation token (used with Daily.co or similar).

**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

**Request Body:**
```json
{
  "appointmentId": "string (required)"
}
```

**Response 200:**
```json
{
  "success": true,
  "token": "video-token-string",
  "roomName": "medchain-room-abc123",
  "roomUrl": "https://medchain.daily.co/abc123",
  "expiresAt": "ISO timestamp"
}
```

**Response 403:**
```json
{
  "success": false,
  "message": "Only confirmed appointments can start a video call."
}
```

---

## Blockchain

### POST /api/blockchain/consent

Grant or revoke data access consent for a doctor.

**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

**Request Body:**
```json
{
  "doctorId": "string (required)",
  "recordIds": ["string (optional, empty = all records)"],
  "action": "grant | revoke",
  "duration": "number (optional, days, default 30)"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Access granted to Dr. Smith.",
  "txHash": "0xabc123def456",
  "expiresAt": "ISO timestamp"
}
```

---

### GET /api/blockchain/audit

Get access audit logs for the patient's records.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Param  | Type   | Required | Description                        |
|--------|--------|----------|------------------------------------|
| recordId | String | No     | Filter by specific record          |
| from   | Date   | No       | Start date                         |
| to     | Date   | No       | End date                           |

**Response 200:**
```json
{
  "success": true,
  "logs": [
    {
      "id": "string",
      "action": "ACCESS_GRANTED | ACCESS_REVOKED | RECORD_VIEWED | RECORD_UPLOADED",
      "doctor": "string",
      "doctorId": "string",
      "recordId": "string",
      "recordName": "string",
      "timestamp": "ISO timestamp",
      "txHash": "string",
      "blockNumber": "number"
    }
  ]
}
```

**Example:**
```bash
curl http://localhost:5000/api/blockchain/audit \
  -H "Authorization: Bearer <token>"
```

---

## Admin

### GET /api/admin/users

List users by verification status.

**Headers:** `Authorization: Bearer <token>` (admin only)

**Query Parameters:**
| Param  | Type   | Required | Description                      |
|--------|--------|----------|----------------------------------|
| status | String | Yes      | "unverified" or "verified"       |
| role   | String | No       | Filter by role                   |
| page   | Number | No       | Pagination                       |

**Response 200:**
```json
{
  "success": true,
  "users": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "registeredAt": "ISO timestamp",
      "verifiedAt": "ISO timestamp | null"
    }
  ]
}
```

---

### PATCH /api/admin/users/:id/verify

Verify a user account.

**Headers:** `Authorization: Bearer <token>` (admin only)

**Response 200:**
```json
{
  "success": true,
  "message": "User verified successfully."
}
```

---

### GET /api/doctors

List available doctors for appointment booking.

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "success": true,
  "doctors": [
    {
      "id": "string",
      "name": "string",
      "specialty": "string",
      "fee": "string (ETH)",
      "rating": "number",
      "availableSlots": ["string"]
    }
  ]
}
```

---

## Common Error Codes

| Code | Description                    |
|------|--------------------------------|
| 200  | Success                        |
| 201  | Created                        |
| 400  | Bad request / validation error |
| 401  | Unauthenticated                |
| 403  | Forbidden / insufficient role  |
| 404  | Resource not found             |
| 429  | Rate limit exceeded            |
| 500  | Internal server error          |

All error responses follow the format:
```json
{
  "success": false,
  "message": "Human-readable error description."
}
```
