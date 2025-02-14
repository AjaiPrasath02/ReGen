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

    /**
     * New Struct: LabAssistant
     * Includes an additional field labNumber.
     */
    struct LabAssistant {
        address labAssistantAddress; 
        string labAssistantLocation;
        string labAssistantName;
        uint256 labAssistantIdentifier; // Used in identifier production 
        string labNumber;
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
    mapping (address => LabAssistant) public registeredLabAssistants;

    modifier onlyGovernmentEntity {
        require(msg.sender == governmentEntity, "Entity not authorized to register stakeholders.");
        _;
    }

    //--------------------------------------------------------------------------
    // Manufacturer functions
    //--------------------------------------------------------------------------
    
    // Register manufacturer if it doesn't exist 
    function registerManufacturer(
        address addr, 
        string memory manufacturerLocation, 
        string memory manufacturerName
    ) 
        public 
        onlyGovernmentEntity 
    {
        require(!registeredManufacturers[addr].isExist, "Manufacturer is registered already."); 
        registeredManufacturers[addr] = Manufacturer(
            addr, 
            manufacturerLocation, 
            manufacturerName, 
            x, 
            true
        );
        x++; // Increment identifier 
    }

    // Returns manufacturer details
    function getManufacturerDetails(address addr) 
        external 
        view 
        returns (address, string memory, string memory) 
    {
        return (
            registeredManufacturers[addr].manufacturerAddress, 
            registeredManufacturers[addr].manufacturerLocation, 
            registeredManufacturers[addr].manufacturerName
        );
    }

    function getManufacturerIdentifier(address manufacturerAddress) 
        external 
        view 
        returns (uint256) 
    {
        return registeredManufacturers[manufacturerAddress].manufacturerIdentifier; 
    }

    function isManufacturerExist(address addr) 
        external 
        view 
        returns (bool) 
    {
        return registeredManufacturers[addr].isExist;
    }

    //--------------------------------------------------------------------------
    // Technician functions
    //--------------------------------------------------------------------------

    // Register technician if it doesn't exist 
    function registerTechnician(
        address addr, 
        string memory technicianLocation, 
        string memory technicianName
    ) 
        public 
        onlyGovernmentEntity 
    {
        require(!registeredTechnicians[addr].isExist, "Technician is registered already."); 
        registeredTechnicians[addr] = Technician(
            addr, 
            technicianLocation, 
            technicianName, 
            x, 
            true
        );
        x++; // Increment identifier 
    }

    // Returns technician details
    function getTechnicianDetails(address addr) 
        external 
        view 
        returns (address, string memory, string memory) 
    {
        return (
            registeredTechnicians[addr].technicianAddress, 
            registeredTechnicians[addr].technicianLocation, 
            registeredTechnicians[addr].technicianName
        );
    }

    function getTechnicianIdentifier(address technicianAddress) 
        external 
        view 
        returns (uint256) 
    {
        return registeredTechnicians[technicianAddress].technicianIdentifier; 
    }

    function isTechnicianExist(address addr) 
        external 
        view 
        returns (bool) 
    {
        return registeredTechnicians[addr].isExist;
    }

    //--------------------------------------------------------------------------
    // LabAssistant functions (New Role)
    //--------------------------------------------------------------------------

    /**
     * @dev Register lab assistant if it doesn't exist.
     * @param addr The wallet address of the lab assistant.
     * @param labAssistantLocation The location of the lab assistant.
     * @param labAssistantName The name of the lab assistant.
     * @param labNumber The lab number for the lab assistant (e.g., "L101").
     */
    function registerLabAssistant(
        address addr,
        string memory labAssistantLocation,
        string memory labAssistantName,
        string memory labNumber
    )
        public
        onlyGovernmentEntity
    {
        require(!registeredLabAssistants[addr].isExist, "Lab Assistant is registered already.");
        registeredLabAssistants[addr] = LabAssistant(
            addr,
            labAssistantLocation,
            labAssistantName,
            x,
            labNumber,
            true
        );
        x++; // Increment identifier
    }

    /**
     * @dev Get the details of a lab assistant.
     * @param addr The wallet address of the lab assistant.
     * @return The address, location, name, and lab number of the lab assistant.
     */
    function getLabAssistantDetails(address addr)
        external
        view
        returns (
            address,
            string memory,
            string memory,
            string memory
        )
    {
        LabAssistant memory labAsst = registeredLabAssistants[addr];
        return (
            labAsst.labAssistantAddress,
            labAsst.labAssistantLocation,
            labAsst.labAssistantName,
            labAsst.labNumber
        );
    }

    /**
     * @dev Get the identifier for a lab assistant.
     * @param labAssistantAddress The wallet address of the lab assistant.
     * @return The unique identifier assigned to the lab assistant.
     */
    function getLabAssistantIdentifier(address labAssistantAddress)
        external
        view
        returns (uint256)
    {
        return registeredLabAssistants[labAssistantAddress].labAssistantIdentifier;
    }

    /**
     * @dev Checks if a lab assistant exists.
     * @param addr The wallet address of the lab assistant.
     * @return True if the lab assistant exists, otherwise false.
     */
    function isLabAssistantExist(address addr)
        external
        view
        returns (bool)
    {
        return registeredLabAssistants[addr].isExist;
    }
}