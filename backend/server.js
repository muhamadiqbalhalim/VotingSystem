const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database sementara (Data akan hilang jika server restart)
// Ditambah fullName dan company untuk match dengan frontend
let users = []; 

// Data kiraan undi mengikut calon
let votes = {
    "Siti Nurhaliza": 0,
    "Fasha Sandha": 0,
    "Rajan Kumar": 0
};

// Log setiap request untuk debugging
app.use((req, res, next) => {
    console.log(`${req.method} request ke: ${req.url}`);
    next();
});

// 1. Register - Jana token unik untuk setiap user
app.post('/api/register', (req, res) => {
    const { email, password, fullName, company } = req.body;
    
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ message: "Email sudah berdaftar!" });
    }

    // Jana token rawak (Match logic frontend)
    const newToken = `VOTE-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    users.push({ 
        email, 
        password, 
        fullName,   // Data baru
        company,    // Data baru (Ganti department)
        token: newToken, 
        hasVoted: false 
    });

    console.log(`User berdaftar: ${fullName} (${company}) | Token: ${newToken}`);
    res.json({ message: "Pendaftaran Berjaya! Sila Login." });
});

// 2. Login - Hantar token kepada user
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        return res.status(400).json({ message: "Email atau Password salah!" });
    }
    
    res.json({ 
        token: user.token, 
        fullName: user.fullName,
        company: user.company,
        hasVoted: user.hasVoted 
    });
});

// 3. Forgot Password
app.post('/api/forgot-password', (req, res) => {
    const { email } = req.body;
    const user = users.find(u => u.email === email);

    if (!user) {
        return res.status(404).json({ message: "Emel tidak dijumpai!" });
    }

    res.json({ 
        success: true, 
        message: `Password untuk ${user.fullName} adalah: ${user.password}` 
    });
});

// 4. Verify Token
app.post('/api/verify-token', (req, res) => {
    const { token } = req.body;
    const user = users.find(u => u.token === token);
    
    if (!user) {
        return res.status(404).json({ message: "Token tidak wujud dalam sistem!" });
    }
    
    if (user.hasVoted) {
        return res.status(400).json({ message: "Token has been used." });
    }
    
    res.json({ success: true, user: { name: user.fullName, company: user.company } });
});

// 5. Submit Vote
app.post('/api/vote', (req, res) => {
    const { token, candidateName } = req.body;
    const user = users.find(u => u.token === token);

    if (user) {
        if (user.hasVoted) {
            return res.status(400).json({ message: "Token ini sudah digunakan!" });
        }

        user.hasVoted = true; 

        if (votes.hasOwnProperty(candidateName)) {
            votes[candidateName] += 1;
        }

        console.log(`Undi dari ${user.company} diterima untuk ${candidateName}.`);
        return res.json({ success: true, message: "Undi berjaya direkodkan!" });
    }

    res.status(400).json({ message: "Gagal memproses undi. Token tidak sah." });
});

// 6. Get Live Results
app.get('/api/results', (req, res) => {
    const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);
    res.json({ 
        votes, 
        totalVotes 
    });
});

// 7. Generate Report - Ditambah info Company
app.post('/api/generate-report', async (req, res) => {
    try {
        const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);
        const reportData = {
            timestamp: new Date().toLocaleString('ms-MY'),
            results: votes,
            total: totalVotes,
            voter_details: users.map(u => ({ name: u.fullName, company: u.company, status: u.hasVoted })),
            official_stamp: "CERTIFIED BY E-VOTING SYSTEM"
        };

        console.log("Generating Official Report with Company data...", reportData);
        
        res.json({ 
            success: true, 
            message: "Report berjaya dijana dengan data syarikat." 
        });
    } catch (err) {
        res.status(500).json({ message: "Gagal menjana report." });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server Backend berjalan di port ${PORT}`);
});