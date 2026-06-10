const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const deploymentPath = path.join(__dirname, "deployment.json");
  if (!fs.existsSync(deploymentPath)) {
    console.error("deployment.json not found. Run deploy.js first.");
    process.exitCode = 1;
    return;
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const contracts = deployment.contracts;

  for (const [name, address] of Object.entries(contracts)) {
    console.log(`Verifying ${name} at ${address}...`);
    try {
      await hre.run("verify:verify", {
        address: address,
        contract: `contracts/${name}.sol:${name}`,
        constructorArguments: [],
      });
      console.log(`${name} verified successfully`);
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log(`${name} already verified`);
      } else {
        console.error(`Failed to verify ${name}:`, error.message);
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
