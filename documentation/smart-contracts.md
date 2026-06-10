# MedChain Smart Contracts

**Network:** Polygon Mumbai (Testnet)
**Chain ID:** 80001
**Compiler:** Solidity 0.8.19
**Framework:** Hardhat

---

## Contract 1: MedChainConsent

**Purpose:** Manages granular patient consent for health record access. Patients grant or revoke access to specific doctors for specific records. All consent changes are immutably logged on-chain for audit.

**Address:** `0x...` (to be deployed)

**Deployment TX:** `0x...` (to be deployed)

### Key Functions

```solidity
function grantAccess(address _doctor, bytes32 _recordId, uint256 _durationDays) external returns (bytes32 consentId);
```
- Called by patient (`msg.sender`)
- Grants `_doctor` access to record `_recordId` for `_durationDays`
- Emits `AccessGranted` event
- Returns a unique consent ID

```solidity
function revokeAccess(bytes32 _consentId) external;
```
- Called by patient who owns the consent
- Revokes access before expiry
- Emits `AccessRevoked` event

```solidity
function hasAccess(address _doctor, bytes32 _recordId) external view returns (bool);
```
- Called by the records system to check if doctor can view a record
- Returns `true` if valid consent exists and has not expired

```solidity
function getPatientConsents(address _patient) external view returns (Consent[] memory);
```
- Returns all consent entries for a given patient

```solidity
function getAccessLog(address _patient, uint256 _offset, uint256 _limit)
    external view returns (AccessLogEntry[] memory);
```
- Paginated audit log of all access events

### Events

```solidity
event AccessGranted(bytes32 indexed consentId, address indexed patient, address indexed doctor, bytes32 recordId, uint256 expiresAt);
event AccessRevoked(bytes32 indexed consentId, address indexed patient, address indexed doctor);
event RecordViewed(bytes32 indexed consentId, address indexed doctor, bytes32 recordId, uint256 timestamp);
```

---

## Contract 2: MedChainEscrow

**Purpose:** Escrow-based payment system for doctor appointments. Patients deposit ETH when booking; funds are released to the doctor after consultation completion. Provides dispute resolution with an admin fallback.

**Address:** `0x...` (to be deployed)

**Deployment TX:** `0x...` (to be deployed)

### Key Functions

```solidity
function bookAppointment(address _doctor, uint256 _fee) external payable returns (bytes32 appointmentId);
```
- Called by patient (`msg.sender`)
- Requires `msg.value >= _fee`
- Locks funds in contract
- Emits `AppointmentBooked`
- Returns appointment ID

```solidity
function confirmCompletion(bytes32 _appointmentId) external;
```
- Called by patient to confirm consultation is done
- Releases funds to doctor
- Emits `AppointmentCompleted`

```solidity
function releaseFunds(bytes32 _appointmentId) external;
```
- Auto-release for doctor if patient does not confirm within 24 hours (or doctor can claim)

```solidity
function disputeAppointment(bytes32 _appointmentId) external;
```
- Called by patient or doctor to flag a dispute
- Puts appointment in disputed state
- Emits `AppointmentDisputed`

```solidity
function resolveDispute(bytes32 _appointmentId, bool refundPatient) external;
```
- Admin-only function
- Resolves dispute by refunding patient or releasing funds to doctor

```solidity
function cancelAppointment(bytes32 _appointmentId) external;
```
- Called by patient before the appointment time
- Refunds 90% of fee (10% burn as penalty)
- Emits `AppointmentCancelled`

### Events

```solidity
event AppointmentBooked(bytes32 indexed appointmentId, address indexed patient, address indexed doctor, uint256 fee);
event AppointmentCompleted(bytes32 indexed appointmentId, address indexed doctor, uint256 fee);
event AppointmentCancelled(bytes32 indexed appointmentId, uint256 refundAmount);
event AppointmentDisputed(bytes32 indexed appointmentId);
event DisputeResolved(bytes32 indexed appointmentId, bool refundPatient);
```

---

## Contract 3: MedChainRecordNFT

**Purpose:** Each health record uploaded is minted as a soulbound (non-transferable) NFT to the patient. The NFT serves as an on-chain proof of record existence without revealing the actual data. Metadata includes the IPFS hash of the encrypted record.

**Address:** `0x...` (to be deployed)

**Deployment TX:** `0x...` (to be deployed)

### Key Functions

```solidity
function mintRecord(address _patient, string memory _ipfsHash, string memory _recordType) external returns (uint256 tokenId);
```
- Called by backend (authorized minter role)
- Mints soulbound NFT to patient
- Stores IPFS hash and record type in token URI
- Emits `RecordMinted`

```solidity
function getRecord(uint256 _tokenId) external view returns (Record memory);
```
- Returns record metadata (IPFS hash, type, timestamp)
- Only accessible by patient or authorized doctor

```solidity
function getPatientRecords(address _patient) external view returns (uint256[] memory);
```
- Returns all token IDs owned by patient

```solidity
function burnRecord(uint256 _tokenId) external;
```
- Called by patient to burn (delete) their record NFT
- Emits `RecordBurned`

### Events

```solidity
event RecordMinted(uint256 indexed tokenId, address indexed patient, string ipfsHash, string recordType, uint256 timestamp);
event RecordBurned(uint256 indexed tokenId, address indexed patient);
event MetadataUpdated(uint256 indexed tokenId, string newIpfsHash);
```

---

## Contract 4: MedChainVerification

**Purpose:** On-chain identity verification for doctors and patients. Admin verifies user accounts and issues a verifiable credential. Enables trustless verification of user roles without relying solely on the backend.

**Address:** `0x...` (to be deployed)

**Deployment TX:** `0x...` (to be deployed)

### Key Functions

```solidity
function registerUser(address _user, string memory _name, bytes32 _roleHash) external;
```
- Called by backend (authorized registrar role)
- Registers user with their wallet address
- Stores name and hashed role
- Emits `UserRegistered`

```solidity
function verifyUser(address _user) external;
```
- Admin-only function
- Sets user's `isVerified` flag to `true`
- Emits `UserVerified`

```solidity
function revokeVerification(address _user) external;
```
- Admin-only function
- Revokes verification status
- Emits `VerificationRevoked`

```solidity
function isVerified(address _user) external view returns (bool);
```
- Returns whether a user is verified
- Used by other contracts and backend

```solidity
function getUserRole(address _user) external view returns (string memory);
```
- Returns the role string ("patient", "doctor", "admin")
- Resolves from stored role hash

### Events

```solidity
event UserRegistered(address indexed user, string name, uint256 timestamp);
event UserVerified(address indexed user, address indexed verifier, uint256 timestamp);
event VerificationRevoked(address indexed user, address indexed verifier, uint256 timestamp);
event RegistrarUpdated(address indexed oldRegistrar, address indexed newRegistrar);
```

---

## Deployment Configuration

```json
{
  "network": "polygon-mumbai",
  "rpcUrl": "https://rpc-mumbai.maticvigil.com",
  "confirmations": 2,
  "gasPrice": "auto",
  "contracts": {
    "MedChainConsent":      { "gasLimit": 3000000 },
    "MedChainEscrow":       { "gasLimit": 4000000 },
    "MedChainRecordNFT":    { "gasLimit": 3500000 },
    "MedChainVerification": { "gasLimit": 2500000 }
  }
}
```
