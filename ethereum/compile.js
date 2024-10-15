/*
Purpose: compile specific contracts and puts their output in a build file 
Updates build files whenever the contracts are updated 
This code was ran 3 times for each solidity file (register, tracking, bottleproduction)
cmd: node complie.js (inside ethereum directory)
*/
const path = require('path'); 
const solc = require('solc'); 
const fs = require('fs-extra'); 

// Deletes content of build folder 
const buildPath = path.resolve(__dirname,'build'); 
//fs.removeSync(buildPath); 

// Read content in contracts folder 
const ContractPath = path.resolve(__dirname,'contracts', 'BottleProduction.sol'); 
const source = fs.readFileSync(ContractPath, 'utf8'); 

//complie the source of the file & pull the contracts property from the compiler
// Have to use var input for solidity version 0.5.0 and up 
//Register.sol 
var input = {
    language: 'Solidity',
    sources: {
        'BottleProduction.sol' : {
            content: source
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': [ '*' ]
            }
        }
    }
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

//creates build folder 
fs.ensureDirSync(buildPath); 

//Put output of contract in a build file 
fs.outputJsonSync(
    path.resolve(buildPath, 'BottleProduction.json'), 
   {
    abi: output.contracts['BottleProduction.sol']['BottleProduction']["abi"],
    bytecode: output.contracts['BottleProduction.sol']['BottleProduction']["evm"]["bytecode"]["object"]
   },
   {
       spaces: 2,
       EOL: "\n"
   }
); 

