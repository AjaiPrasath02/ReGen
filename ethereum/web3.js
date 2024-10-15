// /*
// Purpose: import this file to get access to web3
// Primary provider is MetaMask 
// */


// import Web3 from 'web3'; 


// //current provider is the provider injected by MetaMask 
// let web3;

// //typeof is used to check if window is defined 
// if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
//   // We are in the browser and metamask is running.
//   //Connect metamask to the webapp 
//   console.log('Metamask is enabled');
//   window.ethereum.enable(); 
//   web3 = new Web3(window.web3.currentProvider);

//   if (web3.currentProvider.isMetaMask === true) {
//     console.log('MetaMask is active');
//   }

// } else {
//   // We are on the server *OR* the user is not running metamask
//   console.log('Metamask is not enabled');
//   // Comment and uncomment this line for DApp in mobile view to work
//   window.ethereum.enable(); 
//   const provider = new Web3.providers.HttpProvider( 'https://ropsten.infura.io/v3/a5dc022ed8df4754b509e1f289d10b05');
//   web3 = new Web3(provider);
// }  

// export default web3;

import Web3 from 'web3';

let web3;

if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
  // We are in the browser and MetaMask is running.
  console.log('Metamask is enabled');
  window.ethereum.enable(); 
  web3 = new Web3(window.ethereum);

  if (web3.currentProvider.isMetaMask === true) {
    console.log('MetaMask is active');
  }

} else {
  // We are on the server or the user is not running MetaMask
  console.log('Metamask is not enabled');
  const provider = new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/a5dc022ed8df4754b509e1f289d10b05');
  web3 = new Web3(provider);
}

export default web3;

