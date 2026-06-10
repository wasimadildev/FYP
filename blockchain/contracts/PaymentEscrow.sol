// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PaymentEscrow is ReentrancyGuard {
    struct Escrow {
        address patient;
        address doctor;
        uint256 amount;
        bool released;
        bool refunded;
    }

    mapping(uint256 => Escrow) public escrows;
    uint256 public escrowCount;

    event Deposited(uint256 indexed escrowId, address indexed patient, address indexed doctor, uint256 amount);
    event Released(uint256 indexed escrowId);
    event Refunded(uint256 indexed escrowId);

    modifier onlyPatient(uint256 escrowId) {
        require(msg.sender == escrows[escrowId].patient, "Only the patient can perform this action");
        _;
    }

    function deposit(address doctor) external payable returns (uint256) {
        require(msg.value > 0, "Amount must be greater than 0");
        require(doctor != address(0), "Invalid doctor address");

        escrowCount++;
        escrows[escrowCount] = Escrow({
            patient: msg.sender,
            doctor: doctor,
            amount: msg.value,
            released: false,
            refunded: false
        });

        emit Deposited(escrowCount, msg.sender, doctor, msg.value);
        return escrowCount;
    }

    function release(uint256 escrowId) external nonReentrant onlyPatient(escrowId) {
        Escrow storage escrow = escrows[escrowId];
        require(!escrow.released, "Already released");
        require(!escrow.refunded, "Already refunded");

        escrow.released = true;
        uint256 amount = escrow.amount;

        (bool success, ) = payable(escrow.doctor).call{value: amount}("");
        require(success, "Transfer to doctor failed");

        emit Released(escrowId);
    }

    function refund(uint256 escrowId) external nonReentrant onlyPatient(escrowId) {
        Escrow storage escrow = escrows[escrowId];
        require(!escrow.released, "Already released");
        require(!escrow.refunded, "Already refunded");

        escrow.refunded = true;
        uint256 amount = escrow.amount;

        (bool success, ) = payable(escrow.patient).call{value: amount}("");
        require(success, "Refund to patient failed");

        emit Refunded(escrowId);
    }

    function getEscrow(uint256 escrowId) external view returns (Escrow memory) {
        require(escrowId > 0 && escrowId <= escrowCount, "Invalid escrow ID");
        return escrows[escrowId];
    }
}
