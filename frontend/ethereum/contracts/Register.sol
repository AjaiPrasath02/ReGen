

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
        uint256 manufacturerIdentifier; // Used in bottle address production 
        bool isExist;
    }
    
    // Buyer 
    struct Buyer {
        address buyerAddress; 
        string buyerName; 
        string buyerLocation; 
        string buyerBusinessType; 
        bool isExist;
    }
  
    // Seller - sorting facility 
    struct Seller {
        address sellerAddress; 
        string sellerLocation;
        string sellerName;
        address[] sortingMachineAddress; // Dynamic array 
        bool isExist;
    }
    
    // Constructor - initialize state variables
    constructor() {
        governmentEntity = msg.sender; 
        x = 0; 
    }
    
    // Mappings 
    mapping (address => Manufacturer) public registeredManufacturers; 
    mapping (address => Buyer) public registeredBuyers; 
    mapping (address => Seller) public registeredSellers; 
    
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
        return (registeredManufacturers[addr].manufacturerAddress, registeredManufacturers[addr].manufacturerLocation, registeredManufacturers[addr].manufacturerName);
    }
    
    // Register buyer if it doesn't exist 
    function registerBuyer(address addr, string memory buyerName, string memory buyerLocation, string memory buyerBusinessType) public onlyGovernmentEntity {
        require(!registeredBuyers[addr].isExist, "Buyer is registered already."); 
        registeredBuyers[addr] = Buyer(addr, buyerName, buyerLocation, buyerBusinessType, true);
    }
    
    // Returns buyer details when called from outside the contract 
    function getBuyerDetails(address addr) external view returns (address, string memory, string memory, string memory) {
        return (registeredBuyers[addr].buyerAddress, registeredBuyers[addr].buyerName, registeredBuyers[addr].buyerLocation, registeredBuyers[addr].buyerBusinessType);
    }
    
    // Register seller if it doesn't exist 
    function registerSeller(address addr, string memory sellerLocation, string memory sellerName, address[] memory sortingMachineAddress) public onlyGovernmentEntity {
        require(!registeredSellers[addr].isExist, "Seller is registered already."); 
        
        registeredSellers[addr].sellerAddress = addr; 
        registeredSellers[addr].sellerLocation = sellerLocation; 
        registeredSellers[addr].sellerName = sellerName; 
        registeredSellers[addr].isExist = true;
        for (uint256 i = 0; i < sortingMachineAddress.length; i++)
            registeredSellers[addr].sortingMachineAddress.push(sortingMachineAddress[i]); 
    }
    
    function getSellerDetails(address addr) external view returns (address, string memory, string memory) {
        return (registeredSellers[addr].sellerAddress, registeredSellers[addr].sellerLocation, registeredSellers[addr].sellerName);
    }
    
    function getSellerSortingMachineDetails(address addr) external view returns (address[] memory) {
        return (registeredSellers[addr].sortingMachineAddress); 
    }
    
    function isBuyerExist(address addr) external view returns (bool) {
        return (registeredBuyers[addr].isExist);
    }
    
    function getManufacturerIdentifier(address manufacturerAddress) external view returns (uint256) {
        return registeredManufacturers[manufacturerAddress].manufacturerIdentifier; 
    }
    
    // To be used with the bottleProductionSC
    function isManufacturerExist(address addr) external view returns (bool) {
        return (registeredManufacturers[addr].isExist);
    }
}
