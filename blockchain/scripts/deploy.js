const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  const HealthRecordRegistry = await hre.ethers.getContractFactory("HealthRecordRegistry");
  const healthRecordRegistry = await HealthRecordRegistry.deploy();
  await healthRecordRegistry.waitForDeployment();
  const healthRecordRegistryAddress = await healthRecordRegistry.getAddress();
  console.log("HealthRecordRegistry deployed to:", healthRecordRegistryAddress);

  const ConsentManager = await hre.ethers.getContractFactory("ConsentManager");
  const consentManager = await ConsentManager.deploy();
  await consentManager.waitForDeployment();
  const consentManagerAddress = await consentManager.getAddress();
  console.log("ConsentManager deployed to:", consentManagerAddress);

  const PaymentEscrow = await hre.ethers.getContractFactory("PaymentEscrow");
  const paymentEscrow = await PaymentEscrow.deploy();
  await paymentEscrow.waitForDeployment();
  const paymentEscrowAddress = await paymentEscrow.getAddress();
  console.log("PaymentEscrow deployed to:", paymentEscrowAddress);

  const AuditLogger = await hre.ethers.getContractFactory("AuditLogger");
  const auditLogger = await AuditLogger.deploy();
  await auditLogger.waitForDeployment();
  const auditLoggerAddress = await auditLogger.getAddress();
  console.log("AuditLogger deployed to:", auditLoggerAddress);

  const deployment = {
    network: hre.network.name,
    chainId: (await deployer.provider.getNetwork()).chainId,
    deployer: deployer.address,
    contracts: {
      HealthRecordRegistry: healthRecordRegistryAddress,
      ConsentManager: consentManagerAddress,
      PaymentEscrow: paymentEscrowAddress,
      AuditLogger: auditLoggerAddress,
    },
    timestamp: new Date().toISOString(),
  };

  const deploymentPath = path.join(__dirname, "deployment.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));
  console.log("Deployment info written to:", deploymentPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
