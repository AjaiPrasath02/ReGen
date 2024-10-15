/*
purpose: To access the contract (register.sol) instance from inside the application without repeating these steps 
Etherscan: https://ropsten.etherscan.io/tx/0xdd82c9e0dbc600e899aa03ef1232cbf193b16b7617335ea07f37e47a37d275c3
*/
import web3 from './web3'; 
import BottleProduction from './build/BottleProduction.json'; 

const instance = new web3.eth.Contract(
    BottleProduction.abi,
     '0x248217588CFd0529557239F3C756b937103c0Bfc'
     // Address of the bottleproduction.sol contract in ropsten network
);

export default instance; 