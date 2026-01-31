const API_URL = "http://localhost:3000/api";
let currentUser = null;

// --- AUTH & UI ---

function toggleAuth(view) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authSection = document.getElementById('authSection');

    // Reset animation
    authSection.classList.remove('block-animate');
    void authSection.offsetWidth; // trigger reflow
    authSection.classList.add('block-animate');

    if (view === 'register') {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    } else {
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    }
}

function toggleRegFields() {
    const role = document.getElementById('regRole').value;
    if (role === 'Patient') {
        document.getElementById('patientFields').classList.remove('hidden');
        document.getElementById('doctorFields').classList.add('hidden');
    } else {
        document.getElementById('patientFields').classList.add('hidden');
        document.getElementById('doctorFields').classList.remove('hidden');
    }
}

async function register() {
    try {
        if (!web3 || !userAccount) {
            alert("Please connect your wallet first!");
            await initBlockchain(); // Try to connect
            if(!userAccount) return;
        }

        const role = document.getElementById('regRole').value;
        const name = document.getElementById('regName').value;
        const walletAddress = userAccount; // Use the global userAccount from blockchain.js

        const data = { name, role, walletAddress };

        
        if (role === 'Patient') {
            data.age = document.getElementById('regAge').value;
            data.gender = document.getElementById('regGender').value;
            data.bloodGroup = document.getElementById('regBlood').value;
        } else {
            data.specialization = document.getElementById('regSpec').value;
        }

        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await res.json();
        if (result.userId) {
            alert(`✅ Registration Successful! Your ID: ${result.userId}`);
            toggleAuth('login');
        } else {
            alert("❌ Registration Failed: " + (result.error || "Unknown"));
        }
    } catch (err) {
        alert("Error: " + err.message);
    }
}

async function login() {
    const userId = document.getElementById('loginId').value;
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        
        const result = await res.json();
        if (result.success) {
            currentUser = result;
            showDashboard();
        } else {
            alert("❌ Login Failed: " + result.error);
        }
    } catch (err) {
        alert("Error: " + err.message);
    }
}

function showDashboard() {
    document.getElementById('authSection').classList.add('hidden');
    const dashboard = document.getElementById('dashboard');
    dashboard.classList.remove('hidden');
    
    // Add animation
    dashboard.classList.add('block-animate');

    document.getElementById('userName').innerText = `Welcome, ${currentUser.name} (${currentUser.role})`;

    if (currentUser.role === 'Doctor') {
        document.getElementById('doctorView').classList.remove('hidden');
    } else {
        document.getElementById('patientView').classList.remove('hidden');
        fetchMyRecords();
        checkRequests();
    }
}

function logout() {
    location.reload();
}

// --- DOCTOR FUNCTIONS ---

async function addRecord() {
    const patientId = document.getElementById('recPatientId').value;
    const disease = document.getElementById('recDisease').value;
    const reason = document.getElementById('recReason').value;
    const medicines = document.getElementById('recMedicines').value;
    const precautions = document.getElementById('recPrecautions').value;

    try {
        // 1. Off-chain storage
        const res = await fetch(`${API_URL}/records/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                patientId,
                doctorId: currentUser.userId,
                disease, reason, medicines, precautions
            })
        });

        const result = await res.json();
        if (!result.success) throw new Error(result.error);

        // 2. Blockchain
        await ehrContract.methods.addRecord(result.patientAddress, result.cid)
            .send({ from: currentUser.walletAddress });

        alert("✅ Record Added to Blockchain!");
    } catch (err) {
        console.error(err);
        alert("❌ Failed: " + err.message);
    }
}

async function fetchRecords() {
    const patientId = document.getElementById('searchPatientId').value;
    const container = document.getElementById('recordResults');
    container.innerHTML = "Loading...";

    try {
        // 1. Resolve ID -> Wallet
        const res = await fetch(`${API_URL}/auth/resolve/${patientId}`);
        const { walletAddress } = await res.json();
        if (!walletAddress) throw new Error("Patient not found");

        // 2. Blockchain Fetch
        const records = await ehrContract.methods.getRecords(walletAddress)
            .call({ from: currentUser.walletAddress });

        container.innerHTML = "";
        if (records.length === 0) {
            container.innerHTML = "<p>No records found.</p>";
            return;
        }

        // 3. Fetch Off-chain Details
        for (const rec of records) {
            const detailRes = await fetch(`${API_URL}/records/get/${rec.cid}`);
            const details = await detailRes.json();
            
            const card = document.createElement('div');
            card.className = "bg-slate-800 p-4 rounded border border-slate-700";
            card.innerHTML = `
                <div class="flex justify-between">
                    <h4 class="font-bold text-lg text-blue-300">${details.disease || 'Unknown'}</h4>
                    <span class="text-xs text-slate-400">${new Date(rec.timestamp * 1000).toLocaleDateString()}</span>
                </div>
                <p class="text-sm mt-2"><strong>Medicines:</strong> ${details.medicines || '-'}</p>
                <p class="text-sm"><strong>Reason:</strong> ${details.reason || '-'}</p>
            `;
            container.appendChild(card);
        }

    } catch (err) {
        if (err.message.includes("Access denied")) {
            container.innerHTML = `
                <p class="text-red-400">⛔ Access Denied</p>
                <button onclick="requestAccess('${patientId}')" class="mt-2 px-4 py-2 bg-yellow-600 rounded">Request Access</button>
            `;
        } else {
            container.innerHTML = `<p class="text-red-400">Error: ${err.message}</p>`;
        }
    }
}

async function requestAccess(patientId) {
    try {
        await fetch(`${API_URL}/access/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ doctorId: currentUser.userId, patientId })
        });
        alert("✅ Request sent to patient");
    } catch (err) {
        alert("❌ Failed to send request");
    }
}


// --- PATIENT FUNCTIONS ---

async function fetchMyRecords() {
    // Similar to fetchRecords, but for self (no need to rely on API resolve, we have wallet)
    // Actually we can reuse logic or just write specific one.
    const container = document.getElementById('myRecordsList');
    container.innerHTML = "Loading...";
    
    try {
         const records = await ehrContract.methods.getRecords(currentUser.walletAddress)
            .call({ from: currentUser.walletAddress });

         container.innerHTML = "";
         if (records.length === 0) container.innerHTML = "<p>No records found.</p>";

         for (const rec of records) {
            const detailRes = await fetch(`${API_URL}/records/get/${rec.cid}`);
            const details = await detailRes.json();
            
            const card = document.createElement('div');
            card.className = "bg-slate-800 p-4 rounded border border-slate-700";
            card.innerHTML = `
                <h4 class="font-bold text-lg text-green-300">Dr. ${details.doctorId}</h4>
                <p><strong>Disease:</strong> ${details.disease}</p>
                <p><strong>Medicines:</strong> ${details.medicines}</p>
                <p class="text-xs text-slate-400 mt-2">Date: ${new Date(rec.timestamp * 1000).toLocaleString()}</p>
            `;
            container.appendChild(card);
         }
    } catch (err) {
        container.innerHTML = `<p class="text-red-400">Error: ${err.message}</p>`;
    }
}

async function checkRequests() {
    const container = document.getElementById('requestList');
    try {
        const res = await fetch(`${API_URL}/access/pending/${currentUser.userId}`);
        const requests = await res.json();
        
        container.innerHTML = "";
        if (requests.length === 0) {
            container.innerHTML = "<p class='text-sm text-gray-500'>No pending requests</p>";
            return;
        }

        for (const req of requests) {
            const div = document.createElement('div');
            div.className = "flex justify-between items-center bg-slate-700 p-3 rounded";
            div.innerHTML = `
                <span>Doctor <strong>${req.doctorId}</strong> wants access</span>
                <div class="space-x-2">
                    <button onclick="approveAccess('${req._id}', '${req.doctorId}')" class="px-3 py-1 bg-green-600 text-xs rounded">Approve</button>
                    <button class="px-3 py-1 bg-red-600 text-xs rounded">Reject</button>
                </div>
            `;
            container.appendChild(div);
        }
    } catch (err) {
        console.error(err);
    }
}

async function approveAccess(reqId, doctorId) {
    try {
        // 1. Get Doctor Wallet
        const res = await fetch(`${API_URL}/auth/resolve/${doctorId}`);
        const { walletAddress } = await res.json();

        // 2. Blockchain Tx
        await ehrContract.methods.grantAccess(walletAddress)
            .send({ from: currentUser.walletAddress });

        // 3. Update DB
        await fetch(`${API_URL}/access/respond`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId: reqId, status: "Approved" })
        });

        alert("✅ Access Granted!");
        checkRequests(); // Refresh

    } catch (err) {
        alert("❌ Failed: " + err.message);
    }
}

