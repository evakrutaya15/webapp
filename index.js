const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');  // Include bcrypt for hashing passwords

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Database connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'helpapp',
  password: 'Vityaz2002',
  port: 5432,
});

// Registration endpoint
app.post('/register', async (req, res) => {
    const { first_name, last_name, email, phone, password } = req.body;
  
    try {
      // Check if the email already exists
      const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      
      if (existingUser.rows.length > 0) {
        // Custom error message if email already exists
        return res.status(400).json({ error: 'Your account is already created. Please log in.' });
      }
  
      // Hash the password before storing it
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Insert the new user if email is unique
      const result = await pool.query(
        'INSERT INTO users (first_name, last_name, email, phone, password) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [first_name, last_name, email, phone, hashedPassword]
      );
  
      res.status(201).json(result.rows[0]);
    } catch (error) {
      // Catch PostgreSQL errors and handle them properly
      if (error.code === '23505') { // Unique constraint violation
        res.status(400).json({ error: 'Your account is already created. Please log in.' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });  