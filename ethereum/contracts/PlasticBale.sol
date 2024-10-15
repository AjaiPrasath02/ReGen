// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface RegisterSC {
    function isBuyerExist(address addr) external view returns (bool); 
}

contract PlasticBale {
    address[] public plasticBale; 
    address payable[] public contributors; 
    address payable[] public tempArray; 
    uint public contribution;  
    string public baleHash; 
    bool public isOpen; 
    uint public highestBid; 
    address payable public highestBidder; 
    uint public startTime; 
    uint public endTime; 
    address payable public auctionOwner;
    uint public totalBidders; 
  
    struct Buyer {
        bool isExist; 
        uint placedBids; 
        uint deposit; 
    }
  
    mapping(address => Buyer) public bidder; 
  
    modifier onlyOwner {
        require(msg.sender == auctionOwner, "Auction owner is not authorized"); 
        _; 
    }
    
    modifier onlyBidder(address registerContractAddr) {
        RegisterSC registerSC = RegisterSC(registerContractAddr); 
        require(registerSC.isBuyerExist(msg.sender), "Bidder is not registered"); 
        _;                                                                      
    }
    
    event BidderRegistered(address indexed baleAddress, address indexed bidderAddress); 
    event AuctionStarted(address indexed baleAddress, uint startingAmount, uint closingTime, string baleHash); 
    event BidPlaced(address indexed baleAddress, address indexed bidderAddress, uint amount);
    event BidderExited(address indexed baleAddress, address indexed bidderAddress); 
    event AuctionEnded(address indexed baleAddress, address highestBidder, uint highestBid, uint closingTime); 
    event RecyclerRewarded(address indexed recycler, uint etherReward);
    event UpdateStatusBuyer(address buyer, address indexed plasticBottleAddress, string status, uint time); 
    
    constructor(address[] memory _plasticBale, address payable[] memory _contributors, address payable seller, string memory _baleHash) {
        plasticBale = _plasticBale; 
        contributors = _contributors; 
        auctionOwner = seller; 
        baleHash = _baleHash; 
        totalBidders = 0; 
    }  
    
    function addBidder(address registerContractAddr, address bidderAddr) onlyBidder(registerContractAddr) public {
        require(bidder[bidderAddr].isExist == false, "Bidder already joined the Auction.");
        totalBidders++; 
        bidder[bidderAddr] = Buyer(true, 0, 0); 
        emit BidderRegistered(address(this), bidderAddr);
    }
    
    function startAuction(uint closingTime, uint startPrice) onlyOwner payable public {
        require(isOpen == false, "Auction is already open."); 
        require(closingTime > block.timestamp, "Auction time can only be set in future.");
        isOpen = true; 
        highestBid = startPrice; 
        highestBidder = payable(address(0)); 
        startTime = block.timestamp; 
        endTime = closingTime; 
        emit AuctionStarted(address(this), startPrice, closingTime, baleHash); 
    }
    
    function placeBid(address registerContractAddr, uint amount) onlyBidder(registerContractAddr) payable public {
        require(bidder[msg.sender].isExist, "Buyer Address is not registered."); 
        require(isOpen, "Auction is not opened."); 
        require(amount > highestBid, "Place a higher bid."); 
        require(msg.value == amount, "Insufficient Deposit."); 
        bidder[msg.sender].placedBids++; 
        bidder[msg.sender].deposit += msg.value; 
        highestBid = amount; 
        highestBidder = payable(msg.sender); 
        emit BidPlaced(address(this), msg.sender, amount); 
    }
    
    function exitAuction(address registerContractAddr) onlyBidder(registerContractAddr) public {
        require(bidder[msg.sender].placedBids == 0, "Buyer has placed a bid already."); 
        bidder[msg.sender] = Buyer(false, 0, 0); 
        totalBidders--; 
        emit BidderExited(address(this), msg.sender); 
    }
    
    function endAuction() public {
        require(isOpen, "Auction is not available.");
        require(block.timestamp > endTime, "Auction duration is not up yet.");
        require(highestBidder != address(0), "No bids have been placed"); 
        
        isOpen = false; 
        uint halfAmount = highestBid / 2;
    
        auctionOwner.transfer(halfAmount); 
        
        uint contributionRate = 0; 
        uint reward; 
        
        for(uint i = 0; i < contributors.length; i++) {
            uint j;
            for(j = 0; j < i; j++) {
                if(contributors[i] == contributors[j])
                    break;
            }
            if(i == j)
                tempArray.push(contributors[i]);
        }
        
        for(uint i = 0; i < tempArray.length; i++) {
            contribution = 0;
            for(uint z = 0; z < contributors.length; z++) {
                if(tempArray[i] == contributors[z])
                    contribution++;
            }
            contribution = contribution * 100;
            contributionRate = contribution / plasticBale.length;
            reward = ((contributionRate * halfAmount) / 100) + 1;
            tempArray[i].transfer(reward); 
            rewardRecycler(tempArray[i], reward); 
        }
          
        for(uint i = 0; i < plasticBale.length; i++)
            updateBottleStatus(highestBidder, plasticBale[i]); 
        
        emit AuctionEnded(address(this), highestBidder, highestBid, block.timestamp); 
    }
    
    function updateBottleStatus(address buyerAddress, address plasticBottleAddress) public {
        emit UpdateStatusBuyer(buyerAddress, plasticBottleAddress, "Purchased", block.timestamp); 
    }
    
    function rewardRecycler(address recycler, uint reward) public {
        emit RecyclerRewarded(recycler, reward);
    }
    
    function contractBalance() public view returns(uint) {
        return address(this).balance;
    }
}