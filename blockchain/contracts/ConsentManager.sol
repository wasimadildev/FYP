// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ConsentManager {
    struct Consent {
        bool granted;
        uint256 expiry;
    }

    mapping(address => mapping(address => Consent)) public consents;

    event AccessRequested(address indexed patient, address indexed requester);
    event ConsentGranted(address indexed patient, address indexed requester, uint256 expiry);
    event ConsentRevoked(address indexed patient, address indexed requester);

    modifier onlyPatient(address patient) {
        require(msg.sender == patient, "Only the patient can perform this action");
        _;
    }

    function requestAccess(address patient) external {
        emit AccessRequested(patient, msg.sender);
    }

    function grantAccess(address requester, uint256 expiryInSeconds) external onlyPatient(msg.sender) {
        uint256 expiryTime = block.timestamp + expiryInSeconds;
        consents[msg.sender][requester] = Consent({
            granted: true,
            expiry: expiryTime
        });
        emit ConsentGranted(msg.sender, requester, expiryTime);
    }

    function revokeAccess(address requester) external onlyPatient(msg.sender) {
        consents[msg.sender][requester].granted = false;
        emit ConsentRevoked(msg.sender, requester);
    }

    function hasAccess(address patient, address requester) external view returns (bool) {
        Consent storage consent = consents[patient][requester];
        return consent.granted && consent.expiry > block.timestamp;
    }
}
