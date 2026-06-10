import { Contract } from 'ethers';

const REGISTRY_ABI = [
  'function registerUser(address _user, string memory _role) external',
  'function isRegistered(address _user) external view returns (bool)',
  'function getUserRole(address _user) external view returns (string memory)',
];

const CONSENT_ABI = [
  'function grantAccess(address _doctor) external',
  'function revokeAccess(address _doctor) external',
  'function hasAccess(address _doctor, address _patient) external view returns (bool)',
  'function getPendingRequests() external view returns (address[] memory)',
];

const ESCROW_ABI = [
  'function createAppointment(address _doctor, uint256 _amount) external payable',
  'function cancelAppointment(uint256 _appointmentId) external',
  'function releasePayment(uint256 _appointmentId) external',
];

const AUDIT_ABI = [
  'function logAccess(address _accessedBy, string memory _action) external',
  'function getAuditLogs() external view returns (tuple(address user, string action, uint256 timestamp)[])',
];

/**
 * @param {import('ethers').Signer} signer
 * @returns {import('ethers').Contract}
 */
export function getRegistryContract(signer) {
  return new Contract(import.meta.env.VITE_CONTRACT_REGISTRY, REGISTRY_ABI, signer);
}

/**
 * @param {import('ethers').Signer} signer
 * @returns {import('ethers').Contract}
 */
export function getConsentContract(signer) {
  return new Contract(import.meta.env.VITE_CONTRACT_CONSENT, CONSENT_ABI, signer);
}

/**
 * @param {import('ethers').Signer} signer
 * @returns {import('ethers').Contract}
 */
export function getEscrowContract(signer) {
  return new Contract(import.meta.env.VITE_CONTRACT_ESCROW, ESCROW_ABI, signer);
}

/**
 * @param {import('ethers').Signer} signer
 * @returns {import('ethers').Contract}
 */
export function getAuditContract(signer) {
  return new Contract(import.meta.env.VITE_CONTRACT_AUDIT, AUDIT_ABI, signer);
}

export async function registerUserOnChain(signer, role) {
  const contract = getRegistryContract(signer);
  const tx = await contract.registerUser(await signer.getAddress(), role);
  await tx.wait();
  return tx;
}

export async function grantAccess(signer, doctorAddress) {
  const contract = getConsentContract(signer);
  const tx = await contract.grantAccess(doctorAddress);
  await tx.wait();
  return tx;
}

export async function revokeAccess(signer, doctorAddress) {
  const contract = getConsentContract(signer);
  const tx = await contract.revokeAccess(doctorAddress);
  await tx.wait();
  return tx;
}

export async function createAppointmentEscrow(signer, doctorAddress, amount) {
  const contract = getEscrowContract(signer);
  const tx = await contract.createAppointment(doctorAddress, amount, { value: amount });
  await tx.wait();
  return tx;
}
