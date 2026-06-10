const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ConsentManager", function () {
  let consentManager;
  let patient, doctor, other;

  beforeEach(async function () {
    [patient, doctor, other] = await ethers.getSigners();
    const ConsentManager = await ethers.getContractFactory("ConsentManager");
    consentManager = await ConsentManager.deploy();
    await consentManager.waitForDeployment();
  });

  it("should deploy successfully", async function () {
    expect(await consentManager.getAddress()).to.be.properAddress;
  });

  it("should request access and emit event", async function () {
    const tx = await consentManager.connect(doctor).requestAccess(patient.address);
    await expect(tx).to.emit(consentManager, "AccessRequested").withArgs(patient.address, doctor.address);
  });

  it("should grant access and emit event", async function () {
    const tx = await consentManager.connect(patient).grantAccess(doctor.address, 3600);
    await expect(tx).to.emit(consentManager, "ConsentGranted");
  });

  it("should return true when access is granted and not expired", async function () {
    await consentManager.connect(patient).grantAccess(doctor.address, 3600);
    expect(await consentManager.hasAccess(patient.address, doctor.address)).to.be.true;
  });

  it("should revoke access", async function () {
    await consentManager.connect(patient).grantAccess(doctor.address, 3600);
    const tx = await consentManager.connect(patient).revokeAccess(doctor.address);
    await expect(tx).to.emit(consentManager, "ConsentRevoked").withArgs(patient.address, doctor.address);
    expect(await consentManager.hasAccess(patient.address, doctor.address)).to.be.false;
  });

  it("should return false when no access granted", async function () {
    expect(await consentManager.hasAccess(patient.address, doctor.address)).to.be.false;
  });

  it("should store consent under caller as patient", async function () {
    await consentManager.connect(doctor).grantAccess(patient.address, 3600);
    expect(await consentManager.hasAccess(doctor.address, patient.address)).to.be.true;
  });

  it("should expire access after expiry time", async function () {
    await consentManager.connect(patient).grantAccess(doctor.address, 1);
    expect(await consentManager.hasAccess(patient.address, doctor.address)).to.be.true;
    await ethers.provider.send("evm_increaseTime", [2]);
    await ethers.provider.send("evm_mine");
    expect(await consentManager.hasAccess(patient.address, doctor.address)).to.be.false;
  });
});
