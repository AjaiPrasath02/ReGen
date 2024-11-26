// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

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

    // Mappings
    mapping(address => CPU) public registeredCPUs; // Maps CPU address to CPU
    mapping(uint => Component) public componentRegistry; // Maps componentID to Component

    // Component counter for unique IDs
    uint private componentCounter;

    // Events
    event CPURegistered(
        address indexed cpuAddress,
        uint manufacturerID,
        string modelName,
        string serialNumber,
        uint productionDate,
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
        string memory modelName,
        string memory serialNumber,
        uint productionDate,
        string[] memory componentTypes,
        string[] memory componentDetails
    ) public onlyRegisteredManufacturers(registerContractAddr) {
        require(componentTypes.length == componentDetails.length, "Component types and details mismatch.");
        require(componentTypes.length == 5, "All five components must be provided.");

        // Get manufacturer ID
        RegisterSC registerSC = RegisterSC(registerContractAddr);
        uint manufacturerID = registerSC.getManufacturerIdentifier(msg.sender);

        // Generate unique CPU address
        address cpuAddress = generateUniqueCPUAddress(manufacturerID, modelName, serialNumber);

        // Create the CPU struct
        CPU storage newCPU = registeredCPUs[cpuAddress];
        newCPU.cpuAddress = cpuAddress;
        newCPU.manufacturerID = manufacturerID;
        newCPU.modelName = modelName;
        newCPU.serialNumber = serialNumber;
        newCPU.status = "Working";
        newCPU.productionDate = productionDate;

        // Register components
        for (uint i = 0; i < componentTypes.length; i++) {
            addComponent(cpuAddress, componentTypes[i], componentDetails[i]);
        }

        emit CPURegistered(cpuAddress, manufacturerID, modelName, serialNumber, productionDate, block.timestamp);
    }

    // Add a component to a CPU
    function addComponent(
        address cpuAddress,
        string memory componentType,
        string memory details
    ) internal {
        require(bytes(registeredCPUs[cpuAddress].serialNumber).length > 0, "CPU not registered.");

        // Generate unique component ID
        uint componentID = ++componentCounter;

        // Create the component
        Component memory newComponent = Component({
            componentID: componentID,
            componentType: componentType,
            details: details,
            status: "Working",
            cpuAddress: cpuAddress // Associate the component with the CPU
        });

        // Add component to CPU
        registeredCPUs[cpuAddress].components.push(newComponent);

        // Add to component registry
        componentRegistry[componentID] = newComponent;

        emit ComponentAdded(componentID, cpuAddress, componentType, "Working", details);
    }

    // Remove a component and update CPU status
    function removeComponent(address cpuAddress, uint componentID) public {
        require(bytes(registeredCPUs[cpuAddress].serialNumber).length > 0, "CPU not registered.");
        require(componentRegistry[componentID].componentID == componentID, "Component not found.");

        // Update component status
        Component storage component = componentRegistry[componentID];
        component.status = "Removed";

        // Update CPU status
        registeredCPUs[cpuAddress].status = "Not Working";

        emit ComponentRemoved(componentID, cpuAddress, component.componentType);
        emit CPUStatusUpdated(cpuAddress, "Not Working");
    }

    // Update component status or details
    function updateComponent(
        uint componentID,
        string memory newStatus,
        string memory newDetails
    ) public {
        require(componentRegistry[componentID].componentID == componentID, "Component not found.");

        // Update the component
        Component storage component = componentRegistry[componentID];
        component.status = newStatus;
        component.details = newDetails;

        emit ComponentUpdated(componentID, component.cpuAddress, newStatus, newDetails);
    }

    // Generate a unique CPU address
    function generateUniqueCPUAddress(
        uint manufacturerID,
        string memory modelName,
        string memory serialNumber
    ) internal view returns (address) {
        bytes32 hash = keccak256(
            abi.encodePacked(manufacturerID, modelName, serialNumber, block.timestamp, msg.sender)
        );
        return address(uint160(uint256(hash)));
    }

    // Get CPU details
    function getCPU(address cpuAddress) public view returns (
        string memory modelName,
        string memory serialNumber,
        string memory status,
        uint productionDate,
        uint componentCount
    ) {
        CPU storage cpu = registeredCPUs[cpuAddress];
        return (
            cpu.modelName,
            cpu.serialNumber,
            cpu.status,
            cpu.productionDate,
            cpu.components.length
        );
    }

    // Get component details
    function getComponent(uint componentID) public view returns (
        uint id,
        string memory componentType,
        string memory details,
        string memory status
    ) {
        Component storage component = componentRegistry[componentID];
        return (
            component.componentID,
            component.componentType,
            component.details,
            component.status
        );
    }
}
