const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database sementara (Data akan hilang jika server restart)
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
    const { email, password } = req.body;
    
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ message: "Email sudah berdaftar!" });
    }

    // Jana token rawak
    const newToken = `VOTE-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    users.push({ 
        email, 
        password, 
        token: newToken, 
        hasVoted: false 
    });

    console.log(`User berdaftar: ${email} | Token: ${newToken}`);
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
        hasVoted: user.hasVoted 
    });
});

// 3. Forgot Password - Mencari password dalam database sementara
app.post('/api/forgot-password', (req, res) => {
    const { email } = req.body;
    const user = users.find(u => u.email === email);

    if (!user) {
        return res.status(404).json({ message: "Emel tidak dijumpai!" });
    }

    // Menghantar password secara terus (Development mode sahaja)
    res.json({ 
        success: true, 
        message: `Password anda adalah: ${user.password}` 
    });
});

// 4. Verify Token - Cek status token sebelum masuk ke Ballot
app.post('/api/verify-token', (req, res) => {
    const { token } = req.body;
    const user = users.find(u => u.token === token);
    
    if (!user) {
        return res.status(404).json({ message: "Token tidak wujud dalam sistem!" });
    }
    
    if (user.hasVoted) {
        return res.status(400).json({ message: "Token has been used." });
    }
    
    res.json({ success: true });
});

// 5. Submit Vote (Burn Token) - Terima undi dan kemaskini keputusan live
app.post('/api/vote', (req, res) => {
    const { token, candidateName } = req.body;
    const user = users.find(u => u.token === token);

    if (user) {
        if (user.hasVoted) {
            return res.status(400).json({ message: "Token ini sudah digunakan!" });
        }

        // Tandakan user sudah mengundi
        user.hasVoted = true; 

        // Tambah kiraan undi jika nama calon sah
        if (votes.hasOwnProperty(candidateName)) {
            votes[candidateName] += 1;
        }

        console.log(`Undi diterima untuk ${candidateName}. Token ${token} dinyahaktifkan.`);
        return res.json({ success: true, message: "Undi berjaya direkodkan!" });
    }

    res.status(400).json({ message: "Gagal memproses undi. Token tidak sah." });
});

// 6. Get Live Results - Untuk paparan progress bar
app.get('/api/results', (req, res) => {
    const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);
    res.json({ 
        votes, 
        totalVotes 
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server Backend berjalan di port ${PORT}`);
});
// Endpoint untuk hantar data ke Google Sheets (Report Formal)
app.post('/api/generate-report', async (req, res) => {
    try {
        const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);
        const reportData = {
            timestamp: new Date().toLocaleString('ms-MY'),
            results: votes,
            total: totalVotes,
            official_stamp: "CERTIFIED BY E-VOTING SYSTEM"
        };

        // Note: Di sini kita akan panggil Google Sheets API atau 
        // cara paling mudah guna Webhook/AppScript (Aku terangkan di bawah)
        console.log("Generating Official Report to Google Sheets...", reportData);
        
        res.json({ 
            success: true, 
            message: "Report berjaya dihantar ke Google Sheets untuk rekod rasmi." 
        });
    } catch (err) {
        res.status(500).json({ message: "Gagal menjana report." });
    }
});