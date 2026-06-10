const hre = require("hardhat");

async function main() {
  const [deployer, patient, doctor] = await hre.ethers.getSigners();

  console.log("Deployer:", deployer.address);
  console.log("Patient:", patient.address);
  console.log("Doctor:", doctor.address);

  const HealthRecordRegistry = await hre.ethers.getContractFactory("HealthRecordRegistry");
  const healthRecordRegistry = await HealthRecordRegistry.deploy();
  await healthRecordRegistry.waitForDeployment();

  const ConsentManager = await hre.ethers.getContractFactory("ConsentManager");
  const consentManager = await ConsentManager.deploy();
  await consentManager.waitForDeployment();

  const PaymentEscrow = await hre.ethers.getContractFactory("PaymentEscrow");
  const paymentEscrow = await PaymentEscrow.deploy();
  await paymentEscrow.waitForDeployment();

  const AuditLogger = await hre.ethers.getContractFactory("AuditLogger");
  const auditLogger = await AuditLogger.deploy();
  await auditLogger.waitForDeployment();

  const registryWithPatient = healthRecordRegistry.connect(patient);
  const tx1 = await registryWithPatient.registerRecord(
    "QmTest123RecordHashCID",
    "lab-report"
  );
  await tx1.wait();
  console.log("Registered test record for patient");

  const consentWithPatient = consentManager.connect(patient);
  const tx2 = await consentWithPatient.grantAccess(doctor.address, 86400);
  await tx2.wait();
  console.log("Granted 1-day consent to doctor");

  const escrowWithPatient = paymentEscrow.connect(patient);
  const tx3 = await escrowWithPatient.deposit(doctor.address, { value: hre.ethers.parseEther("0.1") });
  await tx3.wait();
  console.log("Deposited 0.1 MATIC escrow for doctor");

  const loggerWithDeployer = auditLogger.connect(deployer);
  const tx4 = await loggerWithDeployer.logAction(
    patient.address,
    "RECORD_ACCESSED",
    "Doctor accessed patient lab report"
  );
  await tx4.wait();
  console.log("Logged audit entry");

  const records = await healthRecordRegistry.getPatientRecords(patient.address);
  console.log(`Patient has ${records.length} record(s)`);

  const hasAccess = await consentManager.hasAccess(patient.address, doctor.address);
  console.log(`Doctor has access: ${hasAccess}`);

  const escrow = await paymentEscrow.getEscrow(1);
  console.log(`Escrow 1: patient=${escrow.patient}, doctor=${escrow.doctor}, amount=${escrow.amount}`);

  const auditCount = await auditLogger.getAuditCount();
  console.log(`Audit log entries: ${auditCount}`);

  console.log("\nSeed complete. Contracts deployed to local network.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
