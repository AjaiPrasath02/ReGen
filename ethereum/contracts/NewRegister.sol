// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Register {
    
    // Government entity - municipality 
    address public governmentEntity; 
    uint256 public x; 
    
    // Manufacturer
    struct Manufacturer {
        address manufacturerAddress; 
        string manufacturerLocation;
        string manufacturerName;
        uint256 manufacturerIdentifier; // Used in identifier production 
        bool isExist;
    }

    // Technician
    struct Technician {
        address technicianAddress; 
        string technicianLocation;
        string technicianName;
        uint256 technicianIdentifier; // Used in identifier production 
        bool isExist;
    }

    // Constructor - initialize state variables
    constructor() {
        governmentEntity = msg.sender; 
        x = 0; 
    }
    
    // Mappings 
    mapping (address => Manufacturer) public registeredManufacturers; 
    mapping (address => Technician) public registeredTechnicians; 

    modifier onlyGovernmentEntity {
        require(msg.sender == governmentEntity, "Entity not authorized to register stakeholders.");
        _;
    }

    // Register manufacturer if it doesn't exist 
    function registerManufacturer(address addr, string memory manufacturerLocation, string memory manufacturerName) public onlyGovernmentEntity {
        require(!registeredManufacturers[addr].isExist, "Manufacturer is registered already."); 
        registeredManufacturers[addr] = Manufacturer(addr, manufacturerLocation, manufacturerName, x, true);
        x++; // Increment identifier 
    }

    // Returns manufacturer details when called from outside the contract 
    function getManufacturerDetails(address addr) external view returns (address, string memory, string memory) {
        return (
            registeredManufacturers[addr].manufacturerAddress, 
            registeredManufacturers[addr].manufacturerLocation, 
            registeredManufacturers[addr].manufacturerName
        );
    }

    function getManufacturerIdentifier(address manufacturerAddress) external view returns (uint256) {
        return registeredManufacturers[manufacturerAddress].manufacturerIdentifier; 
    }

    function isManufacturerExist(address addr) external view returns (bool) {
        return registeredManufacturers[addr].isExist;
    }

    // Register technician if it doesn't exist 
    function registerTechnician(address addr, string memory technicianLocation, string memory technicianName) public onlyGovernmentEntity {
        require(!registeredTechnicians[addr].isExist, "Technician is registered already."); 
        registeredTechnicians[addr] = Technician(addr, technicianLocation, technicianName, x, true);
        x++; // Increment identifier 
    }

    // Returns technician details when called from outside the contract 
    function getTechnicianDetails(address addr) external view returns (address, string memory, string memory) {
        return (
            registeredTechnicians[addr].technicianAddress, 
            registeredTechnicians[addr].technicianLocation, 
            registeredTechnicians[addr].technicianName
        );
    }

    function getTechnicianIdentifier(address technicianAddress) external view returns (uint256) {
        return registeredTechnicians[technicianAddress].technicianIdentifier; 
    }

    function isTechnicianExist(address addr) external view returns (bool) {
        return registeredTechnicians[addr].isExist;
    }
}
