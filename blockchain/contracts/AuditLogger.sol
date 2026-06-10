// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AuditLogger {
    struct AuditEntry {
        address actor;
        address patient;
        string action;
        string details;
        uint256 timestamp;
    }

    AuditEntry[] public auditLog;
    mapping(address => uint256[]) private patientAuditIndices;

    event ActionLogged(address indexed actor, address indexed patient, string action);

    function logAction(address patient, string calldata action, string calldata details) external {
        auditLog.push(AuditEntry({
            actor: msg.sender,
            patient: patient,
            action: action,
            details: details,
            timestamp: block.timestamp
        }));
        patientAuditIndices[patient].push(auditLog.length - 1);
        emit ActionLogged(msg.sender, patient, action);
    }

    function getPatientAudit(address patient) external view returns (AuditEntry[] memory) {
        uint256[] storage indices = patientAuditIndices[patient];
        AuditEntry[] memory entries = new AuditEntry[](indices.length);
        for (uint256 i = 0; i < indices.length; i++) {
            entries[i] = auditLog[indices[i]];
        }
        return entries;
    }

    function getRecentAudits(uint256 count) external view returns (AuditEntry[] memory) {
        uint256 size = count < auditLog.length ? count : auditLog.length;
        AuditEntry[] memory entries = new AuditEntry[](size);
        for (uint256 i = 0; i < size; i++) {
            entries[i] = auditLog[auditLog.length - size + i];
        }
        return entries;
    }

    function getAuditCount() external view returns (uint256) {
        return auditLog.length;
    }
}
