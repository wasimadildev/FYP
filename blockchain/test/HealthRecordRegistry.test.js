const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HealthRecordRegistry", function () {
  let registry;
  let patient, doctor;

  beforeEach(async function () {
    [patient, doctor] = await ethers.getSigners();
    const HealthRecordRegistry = await ethers.getContractFactory("HealthRecordRegistry");
    registry = await HealthRecordRegistry.deploy();
    await registry.waitForDeployment();
  });

  it("should deploy successfully", async function () {
    expect(await registry.getAddress()).to.be.properAddress;
  });

  it("should register a record", async function () {
    const tx = await registry.connect(patient).registerRecord("QmTestCID", "lab-report");
    await expect(tx).to.emit(registry, "RecordRegistered");
    const records = await registry.getPatientRecords(patient.address);
    expect(records.length).to.equal(1);
    expect(records[0].cid).to.equal("QmTestCID");
    expect(records[0].fileType).to.equal("lab-report");
    expect(records[0].isActive).to.be.true;
  });

  it("should return patient records as an array", async function () {
    await registry.connect(patient).registerRecord("QmCID1", "xray");
    await registry.connect(patient).registerRecord("QmCID2", "mri");
    const records = await registry.getPatientRecords(patient.address);
    expect(Array.isArray(records)).to.be.true;
    expect(records.length).to.equal(2);
  });

  it("should increment record count", async function () {
    expect(await registry.getRecordCount(patient.address)).to.equal(0);
    await registry.connect(patient).registerRecord("QmCID", "report");
    expect(await registry.getRecordCount(patient.address)).to.equal(1);
    await registry.connect(patient).registerRecord("QmCID2", "report");
    expect(await registry.getRecordCount(patient.address)).to.equal(2);
  });

  it("should revert on empty CID", async function () {
    await expect(
      registry.connect(patient).registerRecord("", "lab-report")
    ).to.be.revertedWith("CID cannot be empty");
  });

  it("should deactivate a record", async function () {
    await registry.connect(patient).registerRecord("QmTestCID", "lab-report");
    const tx = await registry.connect(patient).deactivateRecord("QmTestCID");
    await expect(tx).to.emit(registry, "RecordDeactivated").withArgs(patient.address, "QmTestCID");
    const records = await registry.getPatientRecords(patient.address);
    expect(records[0].isActive).to.be.false;
  });

  it("should allow any address to register as patient", async function () {
    await expect(
      registry.connect(doctor).registerRecord("QmCID", "report")
    ).to.not.be.reverted;
    const records = await registry.getPatientRecords(doctor.address);
    expect(records.length).to.equal(1);
  });

  it("should revert deactivating non-existent record", async function () {
    await expect(
      registry.connect(patient).deactivateRecord("QmFakeCID")
    ).to.be.revertedWith("Record not found or already inactive");
  });
});
