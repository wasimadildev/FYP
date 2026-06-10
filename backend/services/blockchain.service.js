const { ethers } = require('ethers');
const contractABIs = {};

let provider;
let signer;

function init() {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    if (process.env.DEPLOYER_PRIVATE_KEY) {
      signer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
    }
  }
}

function getContract(name) {
  init();
  const addressKey = `CONTRACT_${name.toUpperCase()}`;
  const address = process.env[addressKey];
  if (!address) {
    throw new Error(`Contract address not found for ${name}`);
  }
  const abi = contractABIs[name];
  if (!abi) {
    throw new Error(`ABI not found for contract ${name}`);
  }
  return new ethers.Contract(address, abi, signer || provider);
}

async function getHealthRecord(cid) {
  const contract = getContract('registry');
  return contract.getRecord(ethers.encodeBytes32String(cid));
}

async function recordHealth(cid, patientAddress) {
  const contract = getContract('registry');
  const tx = await contract.recordHealth(ethers.encodeBytes32String(cid), patientAddress);
  await tx.wait();
  return tx.hash;
}

async function requestConsent(patientAddress, doctorAddress, duration) {
  const contract = getContract('consent');
  const tx = await contract.requestConsent(patientAddress, doctorAddress, duration);
  await tx.wait();
  return tx.hash;
}

async function grantConsent(doctorAddress, recordCid) {
  const contract = getContract('consent');
  const tx = await contract.grantConsent(doctorAddress, ethers.encodeBytes32String(recordCid));
  await tx.wait();
  return tx.hash;
}

async function revokeConsent(doctorAddress) {
  const contract = getContract('consent');
  const tx = await contract.revokeConsent(doctorAddress);
  await tx.wait();
  return tx.hash;
}

async function depositEscrow(doctorAddress, amount) {
  const contract = getContract('escrow');
  const tx = await contract.deposit(doctorAddress, {
    value: ethers.parseEther(String(amount)),
  });
  await tx.wait();
  return tx.hash;
}

async function releaseEscrow(appointmentId) {
  const contract = getContract('escrow');
  const tx = await contract.release(appointmentId);
  await tx.wait();
  return tx.hash;
}

async function refundEscrow(appointmentId) {
  const contract = getContract('escrow');
  const tx = await contract.refund(appointmentId);
  await tx.wait();
  return tx.hash;
}

async function getAuditEvents(patientAddress) {
  const contract = getContract('audit');
  const filter = contract.filters.AccessEvent(patientAddress);
  const events = await contract.queryFilter(filter);
  return events.map((e) => ({
    accessor: e.args.accessor,
    recordCid: ethers.decodeBytes32String(e.args.recordCid),
    timestamp: Number(e.args.timestamp),
    accessType: e.args.accessType,
  }));
}

module.exports = {
  init,
  getContract,
  getHealthRecord,
  recordHealth,
  requestConsent,
  grantConsent,
  revokeConsent,
  depositEscrow,
  releaseEscrow,
  refundEscrow,
  getAuditEvents,
};
