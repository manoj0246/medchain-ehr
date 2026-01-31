// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract EHR {

    struct Record {
        string cid;      // IPFS/DB Content ID
        address addedBy; // Doctor who added it
        uint timestamp;
    }

    // Mapping patient_address => Records[]
    mapping(address => Record[]) private patientRecords;
    
    // Mapping patient_address => doctor_address => isApproved
    mapping(address => mapping(address => bool)) public accessGranted;

    event RecordAdded(address indexed patient, address indexed doctor, string cid, uint time);
    event AccessGranted(address indexed patient, address indexed doctor, uint time);
    event AccessRevoked(address indexed patient, address indexed doctor, uint time);

    // Doctor adds record for a patient
    function addRecord(address _patient, string memory _cid) public {
        patientRecords[_patient].push(
            Record(_cid, msg.sender, block.timestamp)
        );
        emit RecordAdded(_patient, msg.sender, _cid, block.timestamp);
    }

    // Patient grants doctor access
    function grantAccess(address _doctor) public {
        accessGranted[msg.sender][_doctor] = true;
        emit AccessGranted(msg.sender, _doctor, block.timestamp);
    }

    // Patient revokes access
    function revokeAccess(address _doctor) public {
        accessGranted[msg.sender][_doctor] = false;
        emit AccessRevoked(msg.sender, _doctor, block.timestamp);
    }

    // Fetch records
    function getRecords(address _patient) public view returns (Record[] memory) {
        require(
            msg.sender == _patient || accessGranted[_patient][msg.sender],
            "Access denied"
        );
        return patientRecords[_patient];
    }
}
