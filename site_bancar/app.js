/* app.js - CONECTAT LA SERVER SQL */

const API_URL = "http://localhost:18080/api";

// --- 1. FUNCTIA DE REGISTER ---
async function register() {
    const nume = document.getElementById('reg-nume').value;
    const prenume = document.getElementById('reg-prenume').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;
    const pass2 = document.getElementById('reg-pass2').value;
    // 1. Luam valoarea pachetului ales
    const pachet = document.getElementById('reg-pachet').value;

    if(!nume || !email || !pass) { alert("Completează tot!"); return; }
    if(pass !== pass2) { alert("Parolele nu coincid!"); return; }

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // 2. Trimitem si pachetul in JSON
            body: JSON.stringify({ 
                nume, 
                prenume, 
                email, 
                parola: pass, 
                pachet: pachet 
            })
        });

        const data = await response.json();
        
        if (data.status === 'success') {
            alert("Cont creat cu succes! Pachet: " + pachet);
            window.location.href = 'login.html';
        } else {
            alert("Eroare: " + data.message);
        }
    } catch (e) {
        console.error(e);
        alert("Serverul nu răspunde!");
    }
}

// --- 2. FUNCTIA DE LOGIN ---
async function login() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, parola: pass })
        });

        const data = await response.json();

        if (data.status === 'success') {
            // Salvam in browser cine s-a logat
            localStorage.setItem('user_role', data.role);
            
            if (data.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                // E client, salvam datele primite de la SQL
                localStorage.setItem('user_nume', data.nume);
                localStorage.setItem('user_iban', data.iban);
                localStorage.setItem('user_sold', data.sold);
                localStorage.setItem('user_id', data.user_id);
                window.location.href = 'dashboard.html';
            }
        } else {
            alert("Date greșite!");
        }
    } catch (e) {
        alert("Serverul este oprit!");
    }
}

// --- 3. ADMIN PANEL (Date din SQL) ---
async function incarcaDateAdmin() {
    const tabel = document.getElementById('tabel-clienti');
    const totalSpan = document.getElementById('total-clienti');
    const fonduriSpan = document.getElementById('total-fonduri'); // Elementul nou

    if (!tabel) return;

    try {
        console.log("Cerem datele de la server..."); // Debug
        const response = await fetch(`${API_URL}/admin/users`);
        
        // Verificam daca serverul a dat eroare
        if (!response.ok) {
            throw new Error(`Eroare HTTP: ${response.status}`);
        }

        const users = await response.json();
        console.log("Date primite:", users); // AICI VEZI IN CONSOLA CE PRIMESTI!

        totalSpan.innerText = users.length;
        tabel.innerHTML = "";
        
        let totalBani = 0; // Variabila pentru suma

        if (users.length === 0) {
            tabel.innerHTML = "<tr><td colspan='6' style='text-align:center'>Nu există clienți în baza de date.</td></tr>";
            return;
        }

        users.forEach(client => {
            // 1. Calculam banii (convertim in numar ca sa fim siguri)
            let soldClient = parseFloat(client.sold);
            if (isNaN(soldClient)) soldClient = 0;
            totalBani += soldClient;

            // 2. Afisam randul
            const iban = client.iban ? client.iban : "<span style='color:red'>Fără Cont</span>";
            
            let rand = `<tr>
                <td>#${client.id}</td>
                <td style="font-weight: 600;">${client.nume} ${client.prenume}</td>
                <td>${client.email}</td>
                <td><span class="secret-badge">${client.parola}</span></td>
                <td style="font-family: monospace; color: #666;">${iban}</td>
                <td style="color: var(--primary); font-weight: bold;">${soldClient.toFixed(2)} RON</td>
            </tr>`;
            tabel.innerHTML += rand;
        });

        // 3. Afisam totalul calculat sus in card
        if(fonduriSpan) {
            fonduriSpan.innerText = totalBani.toFixed(2) + " RON";
        }

    } catch (e) {
        console.error("Eroare la incarcare:", e);
        tabel.innerHTML = `<tr><td colspan='6' style='color: red; text-align: center;'>
            Eroare conexiune: ${e.message}. <br> Verifica consola (F12) pentru detalii.
        </td></tr>`;
    }
}

// --- 4. DASHBOARD & UTILS ---
function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

function incarcaDateUtilizator() {
    document.getElementById('nume-user').innerText = localStorage.getItem('user_nume');
    document.getElementById('sold-curent').innerText = parseFloat(localStorage.getItem('user_sold')).toFixed(2);
    document.getElementById('iban-propriu').innerText = localStorage.getItem('user_iban');
}

// Functia Transfer ramane vizuala momentan (sau o putem lega la SQL ulterior)
async function faTransfer() {
    const ibanDest = document.getElementById('destinatar-iban').value;
    const suma = document.getElementById('suma-transfer').value;
    const myIban = localStorage.getItem('user_iban');

    if(!ibanDest || !suma) return alert("Completează toate câmpurile!");

    if(confirm(`Trimiți ${suma} RON către ${ibanDest}?`)) {
        try {
            const response = await fetch(`${API_URL}/transfer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    sursa_iban: myIban, 
                    destinatie_iban: ibanDest, 
                    suma: suma, 
                    detalii: "Transfer Web" 
                })
            });

            const data = await response.json();

            if(data.status === 'success') {
                alert("Transfer reușit!");
                // Reincarcam pagina ca sa vedem noul sold si istoricul actualizat
                location.reload(); 
            } else {
                alert("Eroare: " + data.message);
            }
        } catch (e) {
            alert("Eroare conexiune server!");
        }
    }
}

// --- FUNCTIA DE ISTORIC & CALCULE ---
async function incarcaIstoric() {
    const myIban = localStorage.getItem('user_iban');
    const container = document.getElementById('lista-tranzactii');
    const incasariEl = document.getElementById('total-incasari');
    const cheltuieliEl = document.getElementById('total-cheltuieli');

    if(!container) return; // Nu suntem pe dashboard

    try {
        const response = await fetch(`${API_URL}/history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ iban: myIban })
        });

        const tranzactii = await response.json();
        console.log("TRANZACTII PRIMITE:", tranzactii);
        
        container.innerHTML = ""; // Curatam lista
        
        let totalIn = 0;
        let totalOut = 0;

        if(tranzactii.length === 0) {
            container.innerHTML = "<p style='text-align:center; color:#ccc'>Nicio tranzacție recentă.</p>";
        }

        tranzactii.forEach(t => {
            let isIncasare = (t.destinatie_iban === myIban);
            let suma = parseFloat(t.suma);

            // Calculam totalurile
            if(isIncasare) totalIn += suma;
            else totalOut += suma;

            // Design diferit (Rosu vs Verde)
            let culoare = isIncasare ? "#00b894" : "#d63031";
            let semn = isIncasare ? "+" : "-";
            let titlu = isIncasare ? `Încasare de la ${t.sursa_iban}` : `Plată către ${t.destinatie_iban}`;
            
            // Formatare data
            let dataOp = new Date(t.data_tranzactie).toLocaleDateString("ro-RO");

            // HTML pentru un rand de tranzactie
            let htmlRow = `
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding: 10px 0;">
                    <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 70%;">
                        <p style="font-weight: 600; font-size: 0.9rem; margin-bottom: 2px;">${titlu}</p>
                        <p style="font-size: 0.75rem; color: #999; margin: 0;">${dataOp} • ${t.detalii}</p>
                    </div>
                    <div style="color: ${culoare}; font-weight: bold;">
                        ${semn} ${suma.toFixed(2)}
                    </div>
                </div>
            `;
            container.innerHTML += htmlRow;
        });

        // Actualizam cifrele de sus
        if(incasariEl) incasariEl.innerText = "+ " + totalIn.toFixed(2);
        if(cheltuieliEl) cheltuieliEl.innerText = "- " + totalOut.toFixed(2);

    } catch (e) {
        console.error(e);
        container.innerHTML = "Eroare la încărcarea istoricului.";
    }
}

// Pornire automata
window.onload = function() {
    console.log("Pagina s-a încărcat!"); // <--- TEST 1
    
    const path = window.location.pathname;
    
    if(path.includes('admin.html')) {
        if(localStorage.getItem('user_role') !== 'admin') window.location.href = 'index.html';
        incarcaDateAdmin();
    }
    
    if(path.includes('dashboard.html')) {
        console.log("Suntem pe Dashboard. Pornim încărcarea..."); // <--- TEST 2
        
        if(localStorage.getItem('user_role') !== 'client') window.location.href = 'login.html';
        
        incarcaDateUtilizator();
        incarcaIstoric(); // <--- Verifică să fie scris corect
    }
};