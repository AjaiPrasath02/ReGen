/*
purpose: To access the contract (register.sol) instance from inside the application without repeating these steps 
Etherscan: https://ropsten.etherscan.io/tx/0x1569a64e3d51a7f59a41e80773d63a3128b8e740dca7109ead72378257c0d4df
*/
import web3 from './web3'; 
import register from './build/Register.json'; 

const instance = new web3.eth.Contract(
    register.abi,
     '0xe1E62A4956A0aAD7ff4bBb08d881dF80CdeBA229'
     // Address of the regist.sol contract in ropsten network
);

export default instance; 