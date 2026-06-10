// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HealthRecordRegistry {
    struct Record {
        string cid;
        uint256 timestamp;
        string fileType;
        bool isActive;
    }

    mapping(address => Record[]) private patientRecords;

    event RecordRegistered(address indexed patient, string cid, uint256 timestamp);
    event RecordDeactivated(address indexed patient, string cid);

    function registerRecord(string memory cid, string memory fileType) external {
        require(bytes(cid).length > 0, "CID cannot be empty");
        patientRecords[msg.sender].push(Record({
            cid: cid,
            timestamp: block.timestamp,
            fileType: fileType,
            isActive: true
        }));
        emit RecordRegistered(msg.sender, cid, block.timestamp);
    }

    function getPatientRecords(address patient) external view returns (Record[] memory) {
        return patientRecords[patient];
    }

    function getRecordCount(address patient) external view returns (uint256) {
        return patientRecords[patient].length;
    }

    function deactivateRecord(string memory cid) external {
        Record[] storage records = patientRecords[msg.sender];
        bool found = false;
        for (uint256 i = 0; i < records.length; i++) {
            if (keccak256(bytes(records[i].cid)) == keccak256(bytes(cid)) && records[i].isActive) {
                records[i].isActive = false;
                found = true;
                emit RecordDeactivated(msg.sender, cid);
                break;
            }
        }
        require(found, "Record not found or already inactive");
    }
}
