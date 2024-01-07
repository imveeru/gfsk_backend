const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

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

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user with the hashed password
        await registerUser(name, email, password);

        return res.json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Dummy route to simulate user login (replace with proper authentication)
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Get user by email
        const user = await getUserByEmail(email);

        if (!user) {
            return res.status(401).json({ error: 'User does not exist!' });
        }

        // Verify the hashed password
        const passwordMatch = await bcrypt.compare(password, user.pwd);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Return user details on successful login
        return res.json({
            userId: user.id,
            name: user.name,
            email: user.email
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

app.post('/add-points', async (req, res) => {
    const { userId, gameId, points } = req.body;

    try {
        // Check if the user and game exist (you may want to add additional validations)
        const user = await getUserById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Insert points into the 'points' table
        await addPoints(userId, gameId, points);

        return res.json({ message: 'Points added successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});



async function connectDatabase() {
    return await mysql.createConnection(databaseSettings);
}

async function addPoints(userId, gameId, points) {
    const connection = await connectDatabase();
    await connection.execute('INSERT INTO points (user_id, game_id, points) VALUES (?, ?, ?)', [userId, gameId, points]);
    connection.end();
}

async function getUserById(userId) {
    const connection = await connectDatabase();
    const [rows] = await connection.execute('SELECT * FROM users WHERE id = ?', [userId]);
    connection.end();
    return rows[0];
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
