/*
purpose: To access the contract (register.sol) instance from inside the application without repeating these steps 
Etherscan: https://ropsten.etherscan.io/tx/0xde991c52af60d4ed5afec08a3005348074d1d820c0a18be84de02167c347e4aa
*/
import web3 from './web3'; 
import Tracking from './build/Tracking.json'; 

const instance = new web3.eth.Contract(
    Tracking.abi,
    '0xE8f5aA6028a165669A7C6160ddc968464a9aE895'
    //  '0x907b92aAfb4e02AC3b6f7a2736faD551f69fcC29'
     // Address of the tracking.sol contract in ropsten network
);

export default instance; 