const Web3 = require("web3");
const contractData = require("../build/contracts/EHR.json");

const web3 = new Web3("http://127.0.0.1:7545");
const contractAddress = "0xEf36361064e4cC0d2A91625A8a97aE1C84411D56"; // REPLACE WITH YOUR LATEST DEPLOYED ADDRESS

const ehrContract = new web3.eth.Contract(contractData.abi, contractAddress);

async function addRecordOnChain(doctorAddress, patientAddress, cid) {
    try {
        await ehrContract.methods.addRecord(patientAddress, cid).send({ from: doctorAddress, gas: 3000000 });
        return true;
    } catch (error) {
        console.error("Blockchain Error (addRecord):", error);
        throw error;
    }
}

async function grantAccessOnChain(patientAddress, doctorAddress) {
    try {
        await ehrContract.methods.grantAccess(doctorAddress).send({ from: patientAddress, gas: 3000000 });
        return true;
    } catch (error) {
        console.error("Blockchain Error (grantAccess):", error);
        throw error;
    }
}

async function revokeAccessOnChain(patientAddress, doctorAddress) {
    try {
        await ehrContract.methods.revokeAccess(doctorAddress).send({ from: patientAddress, gas: 3000000 });
        return true;
    } catch (error) {
        console.error("Blockchain Error (revokeAccess):", error);
        throw error;
    }
}

async function getRecordsOnChain(viewerAddress, patientAddress) {
    try {
        return await ehrContract.methods.getRecords(patientAddress).call({ from: viewerAddress });
    } catch (error) {
        console.error("Blockchain Error (getRecords):", error);
        throw error;
    }
}

module.exports = { 
    addRecordOnChain, 
    grantAccessOnChain, 
    revokeAccessOnChain,
    getRecordsOnChain,
    web3 
};
