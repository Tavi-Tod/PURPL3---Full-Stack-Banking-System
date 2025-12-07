# 💜 PURPL3 - Modern Banking System

Un sistem bancar complet funcțional (Full Stack), dezvoltat pentru a simula operațiunile financiare reale într-o interfață modernă și securizată. Proiectul demonstrează integrarea dintre un Frontend dinamic și un Backend robust conectat la o bază de date relațională.

![Banner Proiect](https://via.placeholder.com/1000x300/6c5ce7/ffffff?text=PURPL3+Banking+System)
*(Poți înlocui link-ul de mai sus cu un screenshot real al dashboard-ului tău)*

## 🚀 Funcționalități Principale

### 👤 Pentru Clienți:
* **Înregistrare Inteligentă:** Alegerea pachetului bancar (Standard, Silver, Gold) la creare.
* **Dashboard Interactiv:** Vizualizare sold în timp real și card bancar virtual animat.
* **Sistem de Transferuri:** Tranzacții simulate către alte IBAN-uri cu actualizare instantanee a soldului.
* **Istoric Tranzacții:** Lista colorată a încasărilor (Verde) și plăților (Roșu).
* **Securitate:** Sesiuni gestionate local și validări de formulare.

### 🛡️ Pentru Admini:
* **Panou de Control:** Vizualizare statistici globale (Total Clienți, Fonduri Totale).
* **Management Utilizatori:** Tabel detaliat cu toți clienții, pachetele alese și soldurile curente.
* **Monitorizare:** Status server în timp real.

## 🛠️ Tehnologii Folosite (Tech Stack)

* **Frontend:** HTML5, CSS3 (Design Modern, Glassmorphism, Animations), JavaScript (Vanilla).
* **Backend:** Node.js, Express.js (REST API).
* **Database:** MySQL (Stocare persistentă a datelor relaționale).
* **Tools:** MySQL Workbench, Postman (pentru testare API), VS Code.

## ⚙️ Instalare și Rulare

Urmează acești pași pentru a rula proiectul pe calculatorul tău:

### 1. Clonează proiectul
```bash
git clone [https://github.com/Tavi-Tod/PURPL3---Full-Stack-Banking-System.git]([https://github.com/userul-tau/nume-repo.git](https://github.com/Tavi-Tod/PURPL3---Full-Stack-Banking-System.git))
cd PURPL3---Full-Stack-Banking-System
```

### 2. 🗄️ Configurare Bază de Date (MySQL)
1. Deschide **MySQL Workbench**.
2. Importă și rulează scriptul `banca_sql` (găsit în folderul principal al proiectului).
3. Această acțiune va crea automat baza de date `sistem_bancar` și tabelele necesare (`users`, `accounts`, `transactions`).

### 3. ⚙️ Configurare Backend
Navighează în terminal către folderul serverului și instalează librăriile necesare:

```bash
cd ServerNode
npm install
```
Deschide fișierul `server.js` într-un editor de text și asigură-te că actualizezi configurarea bazei de date:

```javascript
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'PAROLA_TA_AICI', // <--- ⚠️ Înlocuiește cu parola ta reală de la MySQL
    database: 'sistem_bancar'
});
```
### 4. 🚀 Pornire Aplicație

1. **Pornește serverul Backend** deschizând un terminal în folderul `ServerNode` și rulând comanda:

```bash
node server.js
```
✅ Notă: Asigură-te că în consolă apare mesajul: "Conectat cu succes la serverul MySQL!"

2. **Pornește Frontend-ul:** Deschide fișierul index.html (din folderul site_bancar) direct în browser sau, pentru o experiență mai fluidă, folosește extensia Live Server din VS Code.

## 🔑 Credențiale de Test

Poți folosi următoarele conturi predefinite pentru a testa funcționalitățile aplicației imediat:

| Rol | Email | Parolă |
| :--- | :--- | :--- |
| **Admin** 🛡️ | `admin` | `admin123` |
| **Client Demo** 👤 | `ion@test.com` | `123456` |

<p align="center">Made with 💜 by Toderașc Octavian-Gabriel & Chiculiță Rareș-Andrei</p>
