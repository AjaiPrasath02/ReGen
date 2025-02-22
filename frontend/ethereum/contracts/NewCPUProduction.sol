// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

// Interface for RegisterSC contract
interface RegisterSC {
    function getManufacturerIdentifier(address manufacturerAddress) external view returns (uint);
    function isManufacturerExist(address addr) external view returns (bool);
}

contract EWasteProduction {
    // State variables
    address public manufacturingEntity;

    // CPU structure
    struct CPU {
        string modelName;
        string serialNumber;
        string status; // "Working", "Not Working", "Recycled"
        uint productionDate;
        address cpuAddress;
        uint manufacturerID;
        string labNumber;
        Component[] components; // List of components
    }

    // Component structure
    struct Component {
        uint componentID; // Auto-generated unique ID
        string componentType; // e.g., "Processor", "RAM"
        string details; // Additional details like size, specs, etc.
        string status; // "Working", "Replaced", "Removed"
        address cpuAddress; // Address of the CPU this component belongs to
    }

    // New structs to reduce stack usage
    struct CPUDetails {
        string modelName;
        string serialNumber;
        uint productionDate;
        string labNumber;
    }

    struct ComponentInput {
        string componentType;
        string details;
    }

    // Mappings
    mapping(address => CPU) public registeredCPUs; // Maps CPU address to CPU
    mapping(uint => Component) public componentRegistry; // Maps componentID to Component

    // CPU address storage
    address[] public cpuAddresses; // Stores all CPU addresses

    // Component counter for unique IDs (currently unused but retained for potential future use)
    uint private componentCounter;

    // Events
    event CPURegistered(
        address indexed cpuAddress,
        uint manufacturerID,
        string modelName,
        string serialNumber,
        uint productionDate,
        string labNumber,
        uint time
    );

    event ComponentAdded(
        uint indexed componentID,
        address indexed cpuAddress,
        string componentType,
        string status,
        string details
    );

    event ComponentRemoved(
        uint indexed componentID,
        address indexed cpuAddress,
        string componentType
    );

    event ComponentUpdated(
        uint indexed componentID,
        address indexed cpuAddress,
        string newStatus,
        string newDetails
    );

    event CPUStatusUpdated(address indexed cpuAddress, string newStatus);

    event LabNumberUpdated(address indexed cpuAddress, string newLabNumber);

    // Constructor
    constructor() {
        manufacturingEntity = msg.sender;
    }

    // Modifiers
    modifier onlyRegisteredManufacturers(address registerContractAddr) {
        RegisterSC registerSC = RegisterSC(registerContractAddr);
        bool isManufacturerExist = registerSC.isManufacturerExist(msg.sender);
        require(isManufacturerExist, "Manufacturer not authorized to register CPUs.");
        _;
    }

    // Register a new CPU with all components
    function registerCPUWithComponents(
        address registerContractAddr,
        CPUDetails memory cpuDetails,
        ComponentInput[] memory components
    ) public onlyRegisteredManufacturers(registerContractAddr) returns (address) {
        // Ensure exactly 5 components are provided
        require(components.length == 5, "All five components must be provided.");

        // Get manufacturer ID from RegisterSC
        uint manufacturerID = RegisterSC(registerContractAddr).getManufacturerIdentifier(msg.sender);

        // Generate unique CPU address
        address cpuAddress = generateUniqueCPUAddress(
            manufacturerID,
            cpuDetails.serialNumber
        );

        // Register new CPU
        CPU storage newCPU = registeredCPUs[cpuAddress];
        newCPU.cpuAddress = cpuAddress;
        newCPU.manufacturerID = manufacturerID;
        newCPU.modelName = cpuDetails.modelName;
        newCPU.serialNumber = cpuDetails.serialNumber;
        newCPU.status = "Working";
        newCPU.productionDate = cpuDetails.productionDate;
        newCPU.labNumber = cpuDetails.labNumber;

        // Add CPU address to list
        cpuAddresses.push(cpuAddress);

        // Add components to CPU
        for (uint i = 0; i < components.length; i++) {
            addComponent(
                cpuAddress,
                i,
                components[i].componentType,
                components[i].details
            );
        }

        // Emit CPU registration event
        emit CPURegistered(
            cpuAddress,
            manufacturerID,
            cpuDetails.modelName,
            cpuDetails.serialNumber,
            cpuDetails.productionDate,
            cpuDetails.labNumber,
            block.timestamp
        );

        return cpuAddress;
    }

    // Add a component to a CPU (internal function)
    function addComponent(
        address cpuAddress,
        uint index,
        string memory componentType,
        string memory details
    ) internal {
        require(
            bytes(registeredCPUs[cpuAddress].serialNumber).length > 0,
            "CPU not registered."
        );

        Component memory newComponent = Component({
            componentID: index, // Using index as componentID
            componentType: componentType,
            details: details,
            status: "Working",
            cpuAddress: cpuAddress
        });

        registeredCPUs[cpuAddress].components.push(newComponent);

        emit ComponentAdded(
            index,
            cpuAddress,
            componentType,
            "Working",
            details
        );
    }

    // Update CPU status
    function updateCPUStatus(address cpuAddress, string memory newStatus) public {
        require(
            bytes(registeredCPUs[cpuAddress].serialNumber).length > 0,
            "CPU not registered."
        );
        registeredCPUs[cpuAddress].status = newStatus;
        emit CPUStatusUpdated(cpuAddress, newStatus);
    }

    // Remove a component from a CPU
    function removeComponent(address cpuAddress, uint componentIndex) public {
        require(
            bytes(registeredCPUs[cpuAddress].serialNumber).length > 0,
            "CPU not registered."
        );
        require(
            componentIndex < registeredCPUs[cpuAddress].components.length,
            "Component not found."
        );

        Component storage component = registeredCPUs[cpuAddress].components[componentIndex];
        component.status = "Removed";
        updateCPUStatus(cpuAddress, "Not Working");
        emit ComponentRemoved(componentIndex, cpuAddress, component.componentType);
    }

    // Update component status or details
    function updateComponent(
        address cpuAddress,
        uint componentIndex,
        string memory newStatus,
        string memory newDetails
    ) public {
        require(
            bytes(registeredCPUs[cpuAddress].serialNumber).length > 0,
            "CPU not registered."
        );
        require(
            componentIndex < registeredCPUs[cpuAddress].components.length,
            "Component not found."
        );

        Component storage component = registeredCPUs[cpuAddress].components[componentIndex];
        component.status = newStatus;
        component.details = newDetails;
        emit ComponentUpdated(
            componentIndex,
            component.cpuAddress,
            newStatus,
            newDetails
        );
    }

    // Generate a unique CPU address (internal function)
    function generateUniqueCPUAddress(
    uint manufacturerID,
    string memory serialNumber
) internal pure returns (address) {
    bytes32 hash = keccak256(
        abi.encodePacked(manufacturerID, serialNumber)
    );
    return address(uint160(uint256(hash)));
}

    // Get components of a CPU
    function getComponent(address cpuAddress) public view returns (Component[] memory) {
        require(
            bytes(registeredCPUs[cpuAddress].serialNumber).length > 0,
            "CPU not registered."
        );
        return registeredCPUs[cpuAddress].components;
    }

    // Update lab number of a CPU
    function updateLabNumber(address cpuAddress, string memory newLabNumber) public {
        require(
            bytes(registeredCPUs[cpuAddress].serialNumber).length > 0,
            "CPU not registered."
        );
        registeredCPUs[cpuAddress].labNumber = newLabNumber;
        emit LabNumberUpdated(cpuAddress, newLabNumber);
    }

    // Get details of a specific CPU
    function getCPU(address cpuAddress) public view returns (CPU memory) {
        require(
            bytes(registeredCPUs[cpuAddress].serialNumber).length > 0,
            "CPU not registered."
        );
        return registeredCPUs[cpuAddress];
    }

    // Get details of all CPUs
    function getAllCPUDetails() public view returns (CPU[] memory) {
        uint cpuCount = cpuAddresses.length;
        CPU[] memory cpus = new CPU[](cpuCount);
        for (uint i = 0; i < cpuCount; i++) {
            address cpuAddress = cpuAddresses[i];
            cpus[i] = getCPU(cpuAddress);
        }
        return cpus;
    }
}