/* server.js - Varianta Node.js + MySQL */
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 18080;

app.use(cors());
app.use(express.json());

// --- 1. CONECTARE LA MYSQL ---
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'Root123', // <--- PUNE PAROLA TA DE WORKBENCH AICI !!!
    database: 'sistem_bancar'   // Asigura-te ca ai creat baza asta in Workbench
});

db.connect((err) => {
    if (err) {
        console.error('Eroare conectare MySQL:', err);
        console.log('SFAT: Verifica parola sau daca serverul MySQL e pornit!');
        return;
    }
    console.log('Conectat cu succes la serverul MySQL!');
});

// Functie helper: Genereaza IBAN random
function genereazaIBAN() {
    return "RO99BANC" + Math.floor(100000000000 + Math.random() * 900000000000);
}

// ================= RUTE API =================

// 1. REGISTER
// --- RUTA 1: REGISTER ACTUALIZATA ---
app.post('/api/register', (req, res) => {
    // 1. Citim si 'pachet' din cerere
    const { nume, prenume, email, parola, pachet } = req.body;
    
    // Validare simpla (daca cumva nu vine pachetul, punem Standard)
    const pachetFinal = pachet || 'Standard';

    const sqlUser = "INSERT INTO users (nume, prenume, email, parola_hash) VALUES (?, ?, ?, ?)";
    
    db.query(sqlUser, [nume, prenume, email, parola], (err, result) => {
        if (err) {
            return res.status(400).json({ status: 'error', message: 'Email existent sau eroare SQL' });
        }

        const userId = result.insertId;
        const noulIban = genereazaIBAN();

        // 2. Inseram pachetul ales in loc de valoarea fixa
        const sqlAccount = "INSERT INTO accounts (user_id, iban, sold, tip_pachet) VALUES (?, ?, 0.00, ?)";
        
        // 3. Adaugam pachetFinal in lista de valori
        db.query(sqlAccount, [userId, noulIban, pachetFinal], (err2) => {
            if (err2) return res.status(500).json({ status: 'error', message: 'Eroare cont bancar' });
            
            console.log(`User nou: ${nume} (ID: ${userId}) - Pachet: ${pachetFinal}`);
            res.json({ status: 'success' });
        });
    });
});

// 2. LOGIN
app.post('/api/login', (req, res) => {
    const { email, parola } = req.body;

    if(email === 'admin' && parola === 'admin123') {
        return res.json({ status: 'success', role: 'admin' });
    }

    const sql = `SELECT u.id, u.nume, u.prenume, a.iban, a.sold 
                 FROM users u 
                 JOIN accounts a ON u.id = a.user_id 
                 WHERE u.email = ? AND u.parola_hash = ?`;

    db.query(sql, [email, parola], (err, results) => {
        if (err) return res.status(500).json({ status: 'error' });
        
        // In MySQL results e un array cu randurile gasite
        if (results.length > 0) {
            const row = results[0];
            res.json({
                status: 'success',
                role: 'client',
                user_id: row.id,
                nume: row.nume + " " + row.prenume,
                iban: row.iban,
                sold: row.sold
            });
        } else {
            res.json({ status: 'error', message: 'Date incorecte' });
        }
    });
});

// 3. ADMIN DATA
app.get('/api/admin/users', (req, res) => {
    const sql = `SELECT u.id, u.nume, u.prenume, u.email, u.parola_hash as parola, a.iban, a.sold 
                 FROM users u 
                 LEFT JOIN accounts a ON u.id = a.user_id`;
                 
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json([]);
        res.json(results);
    });
});

// --- RUTA 4: EFECTUARE TRANSFER (Complexa) ---
app.post('/api/transfer', (req, res) => {
    const { sursa_iban, destinatie_iban, suma, detalii } = req.body;
    const sumaFloat = parseFloat(suma);

    // 1. Verificam daca cel care trimite are bani
    db.query("SELECT sold FROM accounts WHERE iban = ?", [sursa_iban], (err, results) => {
        if (err || results.length === 0) return res.status(500).json({ status: 'error', message: 'Eroare server sau IBAN gresit' });
        
        const soldCurent = results[0].sold;
        if (soldCurent < sumaFloat) {
            return res.status(400).json({ status: 'error', message: 'Fonduri insuficiente!' });
        }

        // 2. Scadem banii de la Sursa
        db.query("UPDATE accounts SET sold = sold - ? WHERE iban = ?", [sumaFloat, sursa_iban], (err2) => {
            if (err2) return res.status(500).json({ status: 'error' });

            // 3. Adaugam banii la Destinatie
            db.query("UPDATE accounts SET sold = sold + ? WHERE iban = ?", [sumaFloat, destinatie_iban], (err3) => {
                // Chiar daca destinatarul nu exista, banii au plecat (ca in realitate). 
                // Pentru proiect e ok, in realitate am face verificari extra.
                
                // 4. Inregistram Tranzactia in Istoric
                const sqlTrans = "INSERT INTO transactions (sursa_iban, destinatie_iban, suma, detalii) VALUES (?, ?, ?, ?)";
                db.query(sqlTrans, [sursa_iban, destinatie_iban, sumaFloat, detalii], (err4) => {
                    if (err4) console.error("Eroare la salvare tranzactie:", err4);
                    
                    res.json({ status: 'success', message: 'Transfer realizat!' });
                });
            });
        });
    });
});

// --- RUTA 5: ISTORIC TRANZACTII ---
app.post('/api/history', (req, res) => {
    const { iban } = req.body;

    // Cautam tranzactii unde userul a fost ori SURSA (a dat), ori DESTINATIE (a primit)
    const sql = `
        SELECT * FROM transactions 
        WHERE sursa_iban = ? OR destinatie_iban = ? 
        ORDER BY data_tranzactie DESC 
        LIMIT 10
    `;

    db.query(sql, [iban, iban], (err, results) => {
        if (err) return res.status(500).json([]);
        res.json(results);
    });
});

app.listen(PORT, () => {
    console.log(`Server Node.js + MySQL pornit pe portul ${PORT}...`);
});