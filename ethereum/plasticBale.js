/*
purpose: Returns a new instance of plasticbale.sol 
*/

import web3 from './web3'; 
import plasticbale from './build/PlasticBale.json'; 

// const instance = new web3.eth.Contract(
//     plasticbale.abi,
//     '0x75b5672Adb065372E1D7a2FC5A595896cCEd3559'
     
//      // Address of the regist.sol contract in ropsten network
// );

// export default instance; 
export default (address) => {
    console.log(address);
return new web3.eth.Contract(plasticbale.abi,
    address
    ); 

};