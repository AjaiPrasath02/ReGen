// getCPU - struct
// updateComp - updated



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

    // CPU address storage
    address[] public cpuAddresses; // Stores all CPU addresses

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
    // Register a new CPU with all components
function registerCPUWithComponents(
    address registerContractAddr,
    string memory modelName,
    string memory serialNumber,
    uint productionDate,
    string[] memory componentTypes,
    string[] memory componentDetails
) public onlyRegisteredManufacturers(registerContractAddr) returns (address) {
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

    // Add the CPU address to the list
    cpuAddresses.push(cpuAddress);

    // Register components
    for (uint i = 0; i < componentTypes.length; i++) {
        addComponent(cpuAddress, i, componentTypes[i], componentDetails[i]);
    }

    emit CPURegistered(cpuAddress, manufacturerID, modelName, serialNumber, productionDate, block.timestamp);

    return cpuAddress;
}

    // Add a component to a CPU
function addComponent(
    address cpuAddress,
    uint index,
    string memory componentType,
    string memory details
) internal {
    require(bytes(registeredCPUs[cpuAddress].serialNumber).length > 0, "CPU not registered.");

    // Create the component
    Component memory newComponent = Component({
        componentID: index, // Use the loop variable as the component ID
        componentType: componentType,
        details: details,
        status: "Working",
        cpuAddress: cpuAddress // Associate the component with the CPU
    });

    // Add the component at the specified index
    registeredCPUs[cpuAddress].components.push(newComponent);

    emit ComponentAdded(index, cpuAddress, componentType, "Working", details);
}

function updateCPUStatus(address cpuAddress, string memory newStatus) public {
    require(bytes(registeredCPUs[cpuAddress].serialNumber).length > 0, "CPU not registered.");

    // Update the status of the CPU
    registeredCPUs[cpuAddress].status = newStatus;

    emit CPUStatusUpdated(cpuAddress, newStatus);
}


    function removeComponent(address cpuAddress, uint componentIndex) public {
    require(bytes(registeredCPUs[cpuAddress].serialNumber).length > 0, "CPU not registered.");
    require(componentIndex < registeredCPUs[cpuAddress].components.length, "Component not found.");

    // Get the component reference from the CPU's components array
    Component storage component = registeredCPUs[cpuAddress].components[componentIndex];

    // Update component status
    component.status = "Removed";
    // registeredCPUs[cpuAddress].status = "Not Working";
    updateCPUStatus(cpuAddress, "Not Working"); // Updates the CPU status to "Not Working"


    emit ComponentRemoved(componentIndex, cpuAddress, component.componentType);
}


function updateComponent(
    address cpuAddress,
    uint componentIndex,
    string memory newStatus,
    string memory newDetails
) public {
    require(bytes(registeredCPUs[cpuAddress].serialNumber).length > 0, "CPU not registered.");
    require(componentIndex < registeredCPUs[cpuAddress].components.length, "Component not found.");
 
    // Get the component reference from the CPU's components array
    Component storage component = registeredCPUs[cpuAddress].components[componentIndex];
    // Update the component details
    component.status = newStatus;
    component.details = newDetails;
    // Check if all components are "Working"
    bool allComponentsWorking = true;
    for (uint i = 0; i < registeredCPUs[cpuAddress].components.length; i++) {
        if (keccak256(abi.encodePacked(registeredCPUs[cpuAddress].components[i].status)) != keccak256(abi.encodePacked("Working"))) {
            allComponentsWorking = false;
            break;
        }
    }
    // Update CPU status to "Working" if all components are "Working"
    if (allComponentsWorking) {
        registeredCPUs[cpuAddress].status = "Working";
        emit CPUStatusUpdated(cpuAddress, "Working");
    }
    // Emit the event with the updated values
    emit ComponentUpdated(componentIndex, component.cpuAddress, newStatus, newDetails);
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

// Function to retrieve all components for a specific CPU
function getComponent(address cpuAddress) public view returns (Component[] memory) {
    require(bytes(registeredCPUs[cpuAddress].serialNumber).length > 0, "CPU not registered.");

    // Return the components array directly
    return registeredCPUs[cpuAddress].components;
}

// Function to retrieve details of a specific CPU including its components
function getCPU(address cpuAddress) public view returns (CPU memory) {
    require(bytes(registeredCPUs[cpuAddress].serialNumber).length > 0, "CPU not registered.");

    // Return the CPU struct directly
    return registeredCPUs[cpuAddress];
}

// Function to retrieve details of all CPUs including their components
function getAllCPUDetails() public view returns (CPU[] memory) {
    uint cpuCount = cpuAddresses.length;

    // Create an array to hold all CPU objects
    CPU[] memory cpus = new CPU[](cpuCount);

    for (uint i = 0; i < cpuCount; i++) {
        address cpuAddress = cpuAddresses[i];
        cpus[i] = getCPU(cpuAddress); // Fetch each CPU using getCPU
    }

    return cpus;
}


    function getCPUAddress(
        uint manufacturerID,
        string memory modelName,
        string memory serialNumber
    ) public view returns (address) {
        return generateUniqueCPUAddress(manufacturerID, modelName, serialNumber);
    }
}
