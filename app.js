const express = require('express');
const mysql = require('mysql2/promise');

// Replace the following placeholders with your actual RDS credentials
const databaseSettings = {
    host: 'gfskar.cbowhsxoglbj.ap-south-1.rds.amazonaws.com',
    user: 'admin',
    password: 'Veera1234',
    database: 'gfsk_ar',
    port: '3306'
};

const app = express();
app.use(express.json());


// Register routes

// Route to register a new user
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if the email is already registered
        const existingUser = await getUserByEmail(email);

        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Create a new user
        await registerUser(name, email, password);

        return res.json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Dummy route to simulate user login (replace with proper authentication)
app.post('/login', (req, res) => {
    const { token } = req.body; // Dummy token, replace with actual authentication logic
    return res.json({ token });
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

// Functions to interact with the database

async function connectDatabase() {
    return await mysql.createConnection(databaseSettings);
}

async function getUserByEmail(email) {
    const connection = await connectDatabase();
    const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
    connection.end();
    return rows[0];
}

async function registerUser(name, email, password) {
    const connection = await connectDatabase();
    await connection.execute('INSERT INTO users (name, email, pwd) VALUES (?, ?, ?)', [name, email, password]);
    connection.end();
}
