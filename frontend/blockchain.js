if (typeof Web3 === "undefined") {
  console.error("Web3 not defined. Ensure web3.min.js is loaded in index.html");
}

let web3;
let ehrContract;
let userAccount;
const contractAddress = "0xd0B9Ccf01D4d8Afe043FfcAcd11b3D7b42be2759"; // Updated from build artifacts

// Complete ABI based on your contract
const contractABI = [
  {
    "inputs": [{"internalType": "address", "name": "_patient", "type": "address"}, {"internalType": "string", "name": "_cid", "type": "string"}],
    "name": "addRecord",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_doctor", "type": "address"}],
    "name": "grantAccess",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_patient", "type": "address"}],
    "name": "getRecords",
    "outputs": [{"components": [{"internalType": "string", "name": "cid", "type": "string"}, {"internalType": "address", "name": "addedBy", "type": "address"}, {"internalType": "uint256", "name": "timestamp", "type": "uint256"}], "internalType": "struct EHR.Record[]", "name": "", "type": "tuple[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
      "inputs": [{"internalType": "address", "name": "_doctor", "type": "address"}],
      "name": "revokeAccess",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  }
];

async function initBlockchain() {
    console.log("Initializing Blockchain...");
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            // Request account access
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            userAccount = accounts[0];
            console.log("Wallet Connected:", userAccount);

            // Initialize Contract
            ehrContract = new web3.eth.Contract(contractABI, contractAddress);
            
            // Update UI Button
            const btn = document.getElementById('connectWalletBtn');
            if(btn) {
                // Shorten address for display
                const shortAddr = `${userAccount.substring(0,6)}...${userAccount.substring(38)}`;
                btn.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i> ${shortAddr}`;
                btn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                btn.classList.add('bg-green-600', 'hover:bg-green-700');
                
                // Re-render icons for the new HTML
                if(window.lucide) lucide.createIcons();
            }

            return true;

        } catch (error) {
            console.error("User denied account access or Error:", error);
            return false;
        }
    } else {
        alert("Please install MetaMask!");
        return false;
    }
}

// Function to handle manual connection from button click
async function connectWallet() {
    await initBlockchain();
}

// Try to auto-connect on load if already authorized
window.addEventListener("load", async () => {
    // Make functions globally available
    window.connectWallet = connectWallet;
    window.initBlockchain = initBlockchain;
    window.web3 = web3; // Expose for debugging

    // Attach event listener to button
    const btn = document.getElementById('connectWalletBtn');
    if (btn) {
        btn.addEventListener('click', connectWallet);
    }
    
    // Auto-check if previously connected
     if (window.ethereum && window.ethereum.selectedAddress) {
        await initBlockchain();
     }
});
