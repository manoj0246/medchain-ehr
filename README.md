# MedChain - Decentralized Electronic Health Records (EHR)

MedChain is a secure, blockchain-based Electronic Health Record system that gives patients control over their medical data. It combines the security of **Ethereum Blockchain** for access control with **MongoDB** for scalable off-chain storage.

![MedChain Dashboard](https://via.placeholder.com/800x400?text=MedChain+Dashboard+Preview)

## 🚀 Features

- **Decentralized Identity**: Patients and Doctors register with their Wallet Address (MetaMask).
- **Secure Record Storage**: Medical records are hashed and stored, with references on the blockchain.
- **Access Control**: Patients must explicitly grant access to doctors to view their records.
- **Audit Trail**: Every access and record addition is verifiable on the blockchain.
- **Role-Based Portals**: Distinct interfaces for Patients (Manage Records) and Doctors (View/Add Records).

## 🛠 Tech Stack

- **Blockchain**: Solidity, Ethereum (Ganache), Web3.js
- **Backend**: Node.js, Express.js, MongoDB (Atlas/Local)
- **Frontend**: HTML5, TailwindCSS, Lucide Icons, Web3.js 1.10
- **Tools**: Truffle, Ganache, VS Code

## 📦 Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/) (or Atlas Account)
- [Ganache](https://trufflesuite.com/ganache/) (for local blockchain)
- [MetaMask](https://metamask.io/) Extension

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/medchain-ehr.git
cd medchain-ehr
```

### 2. Smart Contract Setup
1. Start **Ganache** (Quickstart).
2. Note the RPC Server (usually `http://127.0.0.1:7545`) and Chain ID (`5777`).
3. Deploy the contracts:
   ```bash
   npx truffle migrate --reset
   ```
4. Copy the **Contract Address** from the terminal output.
5. Update `frontend/blockchain.js`:
   ```javascript
   const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
   ```

### 3. Backend Setup
```bash
cd backend
npm install
# Ensure db.js has your correct MongoDB URI
node server.js
```
*Server runs on `http://localhost:3000`*

### 4. Frontend Setup
Simply open `frontend/index.html` in your browser (or use Live Server in VS Code).

## 🧪 Usage Flow

1. **Connect Wallet**: Click "Connect Wallet" (defaults to Ganache accounts).
2. **Register**:
   - Create a **Patient** account (e.g., wallet account #1).
   - Create a **Doctor** account (e.g., wallet account #2).
3. **Add Record**:
   - As a Doctor, request access or add a record for a Patient ID.
4. **Grant Access**:
   - As a Patient, approve the Doctor's request.
5. **View Records**:
   - Doctor can now see the Patient's history.

## 📄 License
MIT
