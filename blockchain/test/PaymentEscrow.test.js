const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PaymentEscrow", function () {
  let escrow;
  let patient, doctor, other;

  beforeEach(async function () {
    [patient, doctor, other] = await ethers.getSigners();
    const PaymentEscrow = await ethers.getContractFactory("PaymentEscrow");
    escrow = await PaymentEscrow.deploy();
    await escrow.waitForDeployment();
  });

  it("should deploy successfully", async function () {
    expect(await escrow.getAddress()).to.be.properAddress;
  });

  it("should deposit and create escrow", async function () {
    const amount = ethers.parseEther("1.0");
    const tx = await escrow.connect(patient).deposit(doctor.address, { value: amount });
    await expect(tx).to.emit(escrow, "Deposited").withArgs(1, patient.address, doctor.address, amount);
    const escrowData = await escrow.getEscrow(1);
    expect(escrowData.patient).to.equal(patient.address);
    expect(escrowData.doctor).to.equal(doctor.address);
    expect(escrowData.amount).to.equal(amount);
    expect(escrowData.released).to.be.false;
    expect(escrowData.refunded).to.be.false;
  });

  it("should release to doctor", async function () {
    const amount = ethers.parseEther("1.0");
    await escrow.connect(patient).deposit(doctor.address, { value: amount });

    const doctorBalanceBefore = await ethers.provider.getBalance(doctor.address);
    const tx = await escrow.connect(patient).release(1);
    await expect(tx).to.emit(escrow, "Released").withArgs(1);
    const doctorBalanceAfter = await ethers.provider.getBalance(doctor.address);
    expect(doctorBalanceAfter - doctorBalanceBefore).to.equal(amount);
  });

  it("should refund to patient", async function () {
    const amount = ethers.parseEther("1.0");
    await escrow.connect(patient).deposit(doctor.address, { value: amount });

    const tx = await escrow.connect(patient).refund(1);
    await expect(tx).to.emit(escrow, "Refunded").withArgs(1);
    const escrowData = await escrow.getEscrow(1);
    expect(escrowData.refunded).to.be.true;
  });

  it("should revert when non-patient tries to release", async function () {
    const amount = ethers.parseEther("1.0");
    await escrow.connect(patient).deposit(doctor.address, { value: amount });
    await expect(
      escrow.connect(doctor).release(1)
    ).to.be.revertedWith("Only the patient can perform this action");
  });

  it("should revert when non-patient tries to refund", async function () {
    const amount = ethers.parseEther("1.0");
    await escrow.connect(patient).deposit(doctor.address, { value: amount });
    await expect(
      escrow.connect(doctor).refund(1)
    ).to.be.revertedWith("Only the patient can perform this action");
  });

  it("should revert deposit with zero value", async function () {
    await expect(
      escrow.connect(patient).deposit(doctor.address, { value: 0 })
    ).to.be.revertedWith("Amount must be greater than 0");
  });

  it("should revert releasing already released escrow", async function () {
    const amount = ethers.parseEther("1.0");
    await escrow.connect(patient).deposit(doctor.address, { value: amount });
    await escrow.connect(patient).release(1);
    await expect(
      escrow.connect(patient).release(1)
    ).to.be.revertedWith("Already released");
  });

  it("should revert refunding already refunded escrow", async function () {
    const amount = ethers.parseEther("1.0");
    await escrow.connect(patient).deposit(doctor.address, { value: amount });
    await escrow.connect(patient).refund(1);
    await expect(
      escrow.connect(patient).refund(1)
    ).to.be.revertedWith("Already refunded");
  });

  it("should prevent reentrancy", async function () {
    const ReentrancyAttacker = await ethers.getContractFactory("ReentrancyAttacker");
    const attacker = await ReentrancyAttacker.deploy(await escrow.getAddress());
    await attacker.waitForDeployment();

    const amount = ethers.parseEther("1.0");
    await escrow.connect(patient).deposit(await attacker.getAddress(), { value: amount });

    await attacker.connect(patient).setEscrowId(1);
    await expect(
      attacker.connect(patient).attack()
    ).to.be.reverted;
  });
});
