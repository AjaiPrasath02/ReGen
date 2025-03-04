/*
purpose: To access the contract (register.sol) instance from inside the application without repeating these steps 
Etherscan: https://ropsten.etherscan.io/tx/0x1569a64e3d51a7f59a41e80773d63a3128b8e740dca7109ead72378257c0d4df
*/
import web3 from './web3'; 
// import register from './build/Register.json'; 
import register from './build/newRegister.json'; 
const instance = new web3.eth.Contract(
    register.abi,
    '0x6b2e6052d10fc6865F0504d94C18fF41970E7C23'
    // '0xF804b9f3b3cf54738C435F9055A4B09423C61c81'
    // '0x55cC96dDBE947f14bd3472eDa1ce70aDF32A9322'
    // '0x24eaCB0b427C5312A53e259718FfCdB89317Ad96'
    //  '0xe1E62A4956A0aAD7ff4bBb08d881dF80CdeBA229'
    //  '0x358a6F2E06730C574101603851156c2B2463dC59'
    //  Address of the regist.sol contract in ropsten network
);

export default instance; 