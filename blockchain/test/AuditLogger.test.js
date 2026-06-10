const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AuditLogger", function () {
  let auditLogger;
  let deployer, patient, doctor;

  beforeEach(async function () {
    [deployer, patient, doctor] = await ethers.getSigners();
    const AuditLogger = await ethers.getContractFactory("AuditLogger");
    auditLogger = await AuditLogger.deploy();
    await auditLogger.waitForDeployment();
  });

  it("should deploy successfully", async function () {
    expect(await auditLogger.getAddress()).to.be.properAddress;
  });

  it("should log an action and emit event", async function () {
    const tx = await auditLogger.connect(deployer).logAction(patient.address, "RECORD_VIEWED", "Viewed lab report");
    await expect(tx).to.emit(auditLogger, "ActionLogged").withArgs(deployer.address, patient.address, "RECORD_VIEWED");
  });

  it("should return patient audit entries", async function () {
    await auditLogger.connect(deployer).logAction(patient.address, "RECORD_VIEWED", "Viewed lab report");
    await auditLogger.connect(doctor).logAction(patient.address, "RECORD_MODIFIED", "Updated prescription");

    const entries = await auditLogger.getPatientAudit(patient.address);
    expect(entries.length).to.equal(2);
    expect(entries[0].action).to.equal("RECORD_VIEWED");
    expect(entries[0].actor).to.equal(deployer.address);
    expect(entries[1].action).to.equal("RECORD_MODIFIED");
    expect(entries[1].actor).to.equal(doctor.address);
  });

  it("should return correct audit count", async function () {
    expect(await auditLogger.getAuditCount()).to.equal(0);
    await auditLogger.connect(deployer).logAction(patient.address, "ACTION1", "detail1");
    expect(await auditLogger.getAuditCount()).to.equal(1);
    await auditLogger.connect(deployer).logAction(patient.address, "ACTION2", "detail2");
    expect(await auditLogger.getAuditCount()).to.equal(2);
  });

  it("should return empty array for patient with no audit entries", async function () {
    const entries = await auditLogger.getPatientAudit(patient.address);
    expect(entries.length).to.equal(0);
  });

  it("should return recent audits", async function () {
    await auditLogger.connect(deployer).logAction(patient.address, "A1", "d1");
    await auditLogger.connect(deployer).logAction(patient.address, "A2", "d2");
    await auditLogger.connect(deployer).logAction(patient.address, "A3", "d3");

    const recent = await auditLogger.getRecentAudits(2);
    expect(recent.length).to.equal(2);
    expect(recent[0].action).to.equal("A2");
    expect(recent[1].action).to.equal("A3");
  });

  it("should return all audits when count exceeds log size", async function () {
    await auditLogger.connect(deployer).logAction(patient.address, "A1", "d1");
    await auditLogger.connect(deployer).logAction(patient.address, "A2", "d2");

    const all = await auditLogger.getRecentAudits(10);
    expect(all.length).to.equal(2);
  });
});
