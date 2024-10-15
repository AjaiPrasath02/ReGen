// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface RegisterSC {
    function getSellerSortingmMachineDetails(address addr) external view returns (address[] memory);
}
//getSellerSortingmMachineDetails
contract PlasticBale {
    address[] public plasticBale;
    address payable[] public contributors;
    address public seller;
    string public IPFSHash;

    constructor(
        address[] memory _plasticBale,
        address payable[] memory _contributors,
        address _seller,
        string memory _IPFSHash
    ) {
        plasticBale = _plasticBale;
        contributors = _contributors;
        seller = _seller;
        IPFSHash = _IPFSHash;
    }
}

contract Tracking {

    string public IPFSHash;
    string public status;
    address public caller;

    //variables for counting plastic bottles scanned in the sorting machine
    uint256 public bottlesSortedCounter;
    uint256 public bottlesSortedLimit;
    address[] public plasticBale;
    address payable[] public plasticBaleContributorsAddresses;
    address[] public deployedPlasticBales;

    //constructor - initialize state variables
    constructor() {
        status = 'NoStatus';
        IPFSHash = 'NoPicture';
        bottlesSortedCounter = 0;
    }

    event updateStatusRecycler(address indexed recycler, address indexed plasticBottleAddress, string status, uint256 time);
    event updateStatusMachine(address indexed plasticBottleAddress, address indexed sellerAddress, string status, uint256 time);
    event plasticBaleCompleted(address[] plasticBale, address payable[] plasticBaleContributorsAddresses, address indexed sellerAddress, address plasticbale, uint256 bottlesInBaleNo, string IPFSHash, uint256 time);

    modifier sortingMachineOnly(address registerContractAddr, address sellerAddr) {
        address[] memory tempArray;
        RegisterSC registerSC = RegisterSC(registerContractAddr);
        tempArray = registerSC.getSellerSortingmMachineDetails(sellerAddr);
        bool isAuthorized = false;
        for(uint256 i = 0; i < tempArray.length; i++) {
            if (msg.sender == tempArray[i]) {
                isAuthorized = true;
                break;
            }
        }
        require(isAuthorized, "Unauthorized sorting machine");
        _;
    }

    mapping(address=>address payable) bottleToRecycler;

    function setBottlesSortedLimit(uint256 _bottlesSortedLimit) public {
        bottlesSortedLimit = _bottlesSortedLimit;
    }

    function setBaleIPFSHash(string memory _IPFSHash) public {
        IPFSHash = _IPFSHash;
    }

    function updateStatusDisposed(address plasticBottleAddress) public {
        bottleToRecycler[plasticBottleAddress] = payable(msg.sender);
        status = 'Disposed';
        emit updateStatusRecycler(msg.sender, plasticBottleAddress, status, block.timestamp);
    }

    function updateStatusSorted(address registerContractAddr, address payable sellerAddr, address plasticBottleAddress) public sortingMachineOnly(registerContractAddr, sellerAddr) {

        plasticBaleContributorsAddresses.push(bottleToRecycler[plasticBottleAddress]);
        plasticBale.push(plasticBottleAddress);
        bottlesSortedCounter++;
        status = 'Sorted';

        emit updateStatusMachine(plasticBottleAddress, sellerAddr, status, block.timestamp);

        if(bottlesSortedCounter == bottlesSortedLimit ) {
            createPlasticBale(sellerAddr);
        }
    }

    function createPlasticBale(address payable sellerAddr) public {
        bottlesSortedCounter = 0;
        PlasticBale newBale = new PlasticBale(plasticBale, plasticBaleContributorsAddresses, sellerAddr, IPFSHash);
        deployedPlasticBales.push(address(newBale));
        emit plasticBaleCompleted(plasticBale, plasticBaleContributorsAddresses, sellerAddr, address(newBale), bottlesSortedLimit, IPFSHash, block.timestamp);
    }

    function getDeployedBales() public view returns (address[] memory) {
        return deployedPlasticBales;
    }
}