// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract OrganDonation {
    enum Role { None, Donor, Patient, Admin }
    enum OrganType { Kidney, Liver, Heart, Lung, Pancreas }

    struct Donor {
        address donorAddress;
        string name;
        uint age;
        string bloodType;
        OrganType[] organs;
        string location;
        bool deceased;
        bool verified;
        bool suspended;
        bool flagged;
        bool committed;
        string ipfsHash; // Encrypted medical data
    }

    struct Patient {
        address patientAddress;
        string name;
        uint age;
        string bloodType;
        string neededOrgan;
        string urgency;
        string location;
        bool verified;
        bool suspended;
        bool flagged;
        string ipfsHash; // Encrypted medical data
    }

    address public owner;
    mapping(address => Role) public roles;
    mapping(address => Donor) public donors;
    mapping(address => Patient) public patients;
    address[] public donorList;
    address[] public patientList;

    // Events
    event OrganRegistered(address indexed donor, OrganType[] organs, uint age);
    event MatchFound(address indexed donor, address indexed patient);
    event DonorDeceased(address indexed donor);
    event UserVerified(address indexed user, Role role);
    event UserSuspended(address indexed user);
    event UserFlagged(address indexed user);
    event DonorCommitmentRevoked(address indexed donor);
    event DonorCommitmentValidated(address indexed donor);

    modifier onlyAdmin() {
        require(roles[msg.sender] == Role.Admin, "Only admin");
        _;
    }
    modifier onlyVerified(Role _role) {
        require(roles[msg.sender] == _role, "Invalid role");
        if (_role == Role.Donor) require(donors[msg.sender].verified, "Not verified");
        if (_role == Role.Patient) require(patients[msg.sender].verified, "Not verified");
        _;
    }

    constructor() {
        owner = msg.sender;
        roles[msg.sender] = Role.Admin;
    }

    function registerDonor(
        string memory name,
        uint _age,
        string memory bloodType,
        OrganType[] memory organs,
        string memory location,
        string memory ipfsHash
    ) public {
        require(bytes(name).length > 0, "Name is required");
        require(_age >= 18, "Donor must be at least 18 years old");
        require(bytes(bloodType).length > 0, "Blood type is required");
        require(organs.length > 0, "At least one organ must be specified");
        require(bytes(location).length > 0, "Location is required");
        donors[msg.sender] = Donor(msg.sender, name, _age, bloodType, organs, location, false, false, false, false, false, ipfsHash);
        roles[msg.sender] = Role.Donor;
        donorList.push(msg.sender);
        emit OrganRegistered(msg.sender, organs, _age);
    }

    function registerPatient(string memory name, string memory bloodType, string memory neededOrgan, string memory urgency, string memory location, string memory ipfsHash, uint _age) public {
        require(bytes(name).length > 0, "Name is required");
        require(bytes(bloodType).length > 0, "Blood type is required");
        require(bytes(neededOrgan).length > 0, "Needed organ is required");
        require(bytes(urgency).length > 0, "Urgency is required");
        require(bytes(location).length > 0, "Location is required");
        require(_age > 0, "Age must be greater than 0");
        patients[msg.sender] = Patient(msg.sender, name, _age, bloodType, neededOrgan, urgency, location, false, false, false, ipfsHash);
        roles[msg.sender] = Role.Patient;
        patientList.push(msg.sender);
    }

    function verifyUser(address user, Role roleToVerify) public onlyAdmin {
        require(roleToVerify == Role.Donor || roleToVerify == Role.Patient, "Can only verify Donor or Patient roles");

        if (roleToVerify == Role.Donor) {
            require(roles[user] == Role.Donor, "User is not registered as a Donor to verify");
            donors[user].verified = true;
        } else if (roleToVerify == Role.Patient) {
            // This assumes 'roles[user]' was set during patient registration.
            require(roles[user] == Role.Patient, "User is not registered as a Patient to verify");
            patients[user].verified = true;
        }
        // Note: The line that might have previously re-assigned `roles[user] = roleToVerify;` is intentionally removed
        // as verification should only update the 'verified' status of an existing role, not change the role itself.
        emit UserVerified(user, roleToVerify);
    }

    function suspendUser(address user) public onlyAdmin {
        if (roles[user] == Role.Donor) {
            donors[user].suspended = true;
        } else if (roles[user] == Role.Patient) {
            patients[user].suspended = true;
        }
        emit UserSuspended(user);
    }

    function flagUser(address user) public onlyAdmin {
        if (roles[user] == Role.Donor) {
            donors[user].flagged = true;
        } else if (roles[user] == Role.Patient) {
            patients[user].flagged = true;
        }
        emit UserFlagged(user);
    }

    function revokeDonorCommitment(address donor) public onlyAdmin {
        donors[donor].committed = false;
        emit DonorCommitmentRevoked(donor);
    }

    function validateDonorCommitment(address donor) public onlyAdmin {
        donors[donor].committed = true;
        emit DonorCommitmentValidated(donor);
    }

    function markOrganAsMatched(address donor, address patient) public onlyAdmin {
        emit MatchFound(donor, patient);
    }

    function markDonorDeceased(address donor) public onlyAdmin {
        donors[donor].deceased = true;
        emit DonorDeceased(donor);
    }

    function getAvailableOrgans() public view returns (Donor[] memory) {
        uint count = 0;
        for (uint i = 0; i < donorList.length; i++) {
            if (!donors[donorList[i]].deceased && donors[donorList[i]].verified) {
                count++;
            }
        }
        Donor[] memory available = new Donor[](count);
        uint idx = 0;
        for (uint i = 0; i < donorList.length; i++) {
            if (!donors[donorList[i]].deceased && donors[donorList[i]].verified) {
                available[idx++] = donors[donorList[i]];
            }
        }
        return available;
    }

   // function getMatches(address patientAddr) public view returns (Donor[] memory) {
        // Placeholder: Matching logic to be implemented off-chain/ML
        // For now, return all available donors
      //  return getAvailableOrgans();
    //}
    // Added function to return donor list addresses
function getDonorList() public view returns (address[] memory) {
    return donorList;
}

function getPatientDetails(address _patientAddress) public view returns (
    address patientAddress,
    string memory name,
    uint age,
    string memory bloodType,
    string memory neededOrgan,
    string memory urgency,
    string memory location,
    bool verified,
    bool suspended,
    bool flagged,
    string memory ipfsHash
) {
    require(roles[_patientAddress] == Role.Patient, "Address is not a registered patient");
    Patient memory patient = patients[_patientAddress];
    return (
        patient.patientAddress,
        patient.name,
        patient.age,
        patient.bloodType,
        patient.neededOrgan,
        patient.urgency,
        patient.location,
        patient.verified,
        patient.suspended,
        patient.flagged,
        patient.ipfsHash
    );
}

function getDonorDetails(address _donorAddress) public view returns (
    address donorAddress,
    string memory name,
    uint age,
    string memory bloodType,
    OrganType[] memory organs,
    string memory location,
    bool deceased,
    bool verified,
    bool suspended,
    bool flagged,
    bool committed,
    string memory ipfsHash
) {
    require(roles[_donorAddress] == Role.Donor, "Address is not a registered donor");
    Donor memory donor = donors[_donorAddress];
    return (
        donor.donorAddress,
        donor.name,
        donor.age,
        donor.bloodType,
        donor.organs,
        donor.location,
        donor.deceased,
        donor.verified,
        donor.suspended,
        donor.flagged,
        donor.committed,
        donor.ipfsHash
    );
}

function getPatientList() public view returns (address[] memory) {
    return patientList;
}

}
