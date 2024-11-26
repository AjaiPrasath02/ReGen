/*
purpose: To access the contract (register.sol) instance from inside the application without repeating these steps 
Etherscan: https://ropsten.etherscan.io/tx/0xdd82c9e0dbc600e899aa03ef1232cbf193b16b7617335ea07f37e47a37d275c3
*/
import web3 from './web3'; 
import CPUProduction from './build/CPUProduction.json'; 
// import BottleProduction from './build/BottleProduction.json'; 

const instance = new web3.eth.Contract(
    CPUProduction.abi,
    '0x183Af8c5435d50171c383685B21d00aD4E117F37'
    // '0x4D34A4A5EaAca5BcFfb0e37c605B8BB57f7361ae'
    // BottleProduction.abi,
    // '0x2FFe4FBAeCb080E29501873538dE8FD14F52D8e7'
    // '0xBD4EBcd089d08Ed5eDd1A603C7af7E4509B45D82'
    //  '0x248217588CFd0529557239F3C756b937103c0Bfc'
     // Address of the bottleproduction.sol contract in ropsten network
);

export default instance; 