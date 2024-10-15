// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

interface RegisterSC {
    function getManufacturerIdentifier(address manufacturerAddress) external view returns (uint);
    function isManufacturerExist(address addr) external view returns (bool);
}

contract BottleProduction {
    //state variables - stored permanently in contract storage 
    address public bottleAddress;
    
    // manufacturing entity - manufacturer 
    address public manufacturingEntity; 
    
    // Plastic Bottle varibles
    struct PlasticBottle {
        address  bottleAddress; 
        uint bottleManufacturer;
        uint bottlePlasticType;
        uint bottleColor;
        uint bottleSize;
    }
    
    //constructor - initilize state variables
    constructor() {
        manufacturingEntity = msg.sender; 
    }
    
    //events
    event botteIsRegistered(address plasticBottleAddress, uint ManufacturerID, uint bottlePlasticType, uint bottleColor, uint bottleSize, uint time); 
    
    // Mappings 
    mapping (address => PlasticBottle) registeredBottles; 
    
    modifier onlyRegisteredManufacturers (address registerContractAddr) {
    
        RegisterSC registerSC = RegisterSC(registerContractAddr); //pass the deployed register contract address 

        //to check if the manufacturer has been registered
        bool isManufacturerExist = registerSC.isManufacturerExist(msg.sender);
        require(isManufacturerExist, "Manufacturer not authorized to register bottles.");
        _;

    }
    
    function registerBottle (address registerContractAddr, uint bottlePlasticType, uint bottleColor, uint bottleSize) public onlyRegisteredManufacturers(registerContractAddr){
       
        //get id of manufacturer from register contract
        RegisterSC registerSC = RegisterSC(registerContractAddr); 
        uint ManufacturerID = registerSC.getManufacturerIdentifier(msg.sender);
        
        // gets generated address for bottle
        address addr = generateUniqueBottleAddress(ManufacturerID, bottlePlasticType, bottleColor, bottleSize);
        
        //saves address as a state variable to retrieve later
        bottleAddress = addr;
        
        registeredBottles[addr] = PlasticBottle(addr, ManufacturerID, bottlePlasticType, bottleColor, bottleSize);
        
        emit botteIsRegistered(addr, ManufacturerID, bottlePlasticType, bottleColor, bottleSize, block.timestamp);
    }
    
    
    function generateUniqueBottleAddress(uint ManufacturerID, uint bottlePlasticType, uint bottleColor, uint bottleSize) internal view returns (address) {
    bytes32 hash = keccak256(abi.encodePacked(ManufacturerID, bottlePlasticType, bottleColor, bottleSize, block.timestamp, msg.sender));
    return address(uint160(uint256(hash)));
}

    
    function getBottleAddress() public view returns (address) {
        return bottleAddress; 
    }
}