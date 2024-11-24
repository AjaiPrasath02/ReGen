/*
purpose: To access the contract (register.sol) instance from inside the application without repeating these steps 
Etherscan: https://ropsten.etherscan.io/tx/0x1569a64e3d51a7f59a41e80773d63a3128b8e740dca7109ead72378257c0d4df
*/
import web3 from './web3'; 
import register from './build/Register.json'; 

const instance = new web3.eth.Contract(
    register.abi,
    '0x8a8C4a9E8D9E8252B7f3Ac8ffF87E7dC84CD05cB'
    //  '0xe1E62A4956A0aAD7ff4bBb08d881dF80CdeBA229'
    // '0x358a6F2E06730C574101603851156c2B2463dC59'
     // Address of the regist.sol contract in ropsten network
);

export default instance; 