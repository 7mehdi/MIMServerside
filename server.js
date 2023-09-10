const express = require('express');
const port = 8000;
const cors = require('cors');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken package
const app = express();
const { createPool } = require('mysql');
const bodyParser = require('body-parser');
const { body, validationResult } = require("express-validator");
const officeItems = {
  201: 'Ordinateur', // Computer
  101: 'Bureau', // Desk
  102: 'Chaise', // Chair
  202: 'Imprimante', // Printer
  103: 'Tableau blanc', // Whiteboard
  104: 'Armoire', // Cabinet
  203: 'Écran', // Monitor
  204: 'Ordinateur portable', // Laptop
  205: 'Téléphone' // Phone
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());
const generateToken = (user) => {
  const payload = {
    id: user.id, // Replace with the appropriate property of your user object
    email: user.email, // Replace with the appropriate property of your user object
    role: user.role// Add other relevant properties from your user object
  };

  return jwt.sign(payload, '212711', { expiresIn: '1h' }); // Set a secret key and token expiration time
};// Set a secret key and token expiration time


const pool = createPool({
  host: 'localhost',
  user: 'root',
  password: 'Slimane1921/',
  database: 'projet_stage',
});


const processData = (data, description) => {
  const [Article, articleNumber] = data.split('-');
  descr= description.map((item)=>item)
  const decodedArticle = {
    Article: officeItems[parseInt(Article)],
    articleNumber: parseInt(articleNumber),
  };
  console.log(decodedArticle, descr)
  return {decodedArticle,descr};
};



const confirmValidationRules = [
  body('scannedCode')
    .notEmpty()
    .withMessage('Scanned code is required')
    .isLength({ min: 5, max: 7 })
    .withMessage('Scanned code must be between 5 and 7 characters long'),
  body('Nbur')
    .notEmpty()
    .withMessage('Nbur is required')
    .isInt({ min: 1 })
    .withMessage('Nbur must be a positive integer'),
];

// Validation rules for the /api/login endpoint
const loginValidationRules = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

app.post('/api/confirm', confirmValidationRules, (req, res) => {
  const errors = validationResult(req);
  const token = req.headers.authorization;
  const decodedToken = jwt.verify(token, "212711");
  const userId = decodedToken.id;

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  console.log(req.body);
  const { scannedCode, Nbur, description } = req.body;

  // Check if the article already exists in the database
  const checkQuery = 'SELECT * FROM article WHERE code_barre = ?';
  pool.query(checkQuery, [scannedCode], (checkErr, checkRows) => {
    if (checkErr) {
      console.error(checkErr);
      res.status(500).json({ success: false, message: 'An error occurred during confirmation' });
      return;
    }

    if (checkRows.length > 0) {
      // Article already exists
      res.json({ success: false, message: "L'article existe déjà dans la base de données" });
      return;
    }

    // Article does not exist, insert it into the article table
    const articleData = {
      code_barre: scannedCode,
      bureau: Nbur,
      description: description,
    };
    const [Article, articleNumber] = scannedCode.split('-');
    const decodedArticle = {
      Article: officeItems[parseInt(Article)],
    };

    pool.query('INSERT INTO article SET ?', articleData, (articleErr, articleResult) => {
      if (articleErr) {
        console.error(articleErr);
        res.status(500).json({ success: false, message: 'An error occurred while adding the article' });
        return;
      }
      pool.query('UPDATE stock SET real_count = real_count + 1 WHERE item_category = ?', [decodedArticle.Article], (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).json({ success: false, message: 'An error occurred while adding the article' });
          return;
        }
        
      });
      
      // Get the ID of the inserted article
      const articleId = articleResult.insertId;

      // Insert confirmation data into the confirmation table
      const confirmationData = {
        article_id: articleId,
        user_id: userId,
      };

      pool.query('INSERT INTO confirmation SET ?', confirmationData, (confirmErr, confirmResult) => {
        if (confirmErr) {
          console.error(confirmErr);
          res.status(500).json({ success: false, message: 'An error occurred during confirmation' });
          return;
        }

        res.json({ success: true, message: 'Article confirmed and added to the database' });
      });
    });
  });
});

app.post('/api/login', loginValidationRules, (req, res) => {
  const errors = validationResult(req);
  console.log(validationResult(req))
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  // Check the email and password against the database
  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
  pool.query(query, [email, password], (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'An error occurred during login' });
      return;
    }

    if (rows.length > 0) {
      // Login successful, generate and send JWT token
      const user = rows[0];
      const token = generateToken({ id: user.id, email: user.email, role: user.role });      
      res.json({ success: true, message: 'Login successful', token });
    } else {
      // Invalid email or password
      res.json({ success: false, message: 'Invalid email or password' });
    }
  });
});



app.get('/api/check-session', (req, res) => {
  const token = req.headers.authorization; // Get the token from the request headers

  if (token) {
    jwt.verify(token, '212711', (err, decoded) => {
      if (err) {
        // Invalid or expired token
        res.json({ isLoggedIn: false });
      } else {
        // Valid token, user is logged in
        res.json({ isLoggedIn: true });
      }
    });
  } else {
    // No token provided
    res.json({ isLoggedIn: false });
  }
});

// Endpoint to retrieve user details
app.get("/api/user-details", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Authorization token not provided" });
  }

  try {
    const decodedToken = jwt.verify(token, "212711");
    const userId = decodedToken.id;
    const userDetails = await getUserDetails(userId);

    if (!userDetails) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      role: userDetails.role,
      name: userDetails.name,
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Invalid token" });
  }
});

// fetch user details based on user ID
async function getUserDetails(userId) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT name, role FROM users WHERE id = ?';
  
    pool.query(query, [userId], (err, rows) => {
      if (err) {
        console.error(err);
        reject(err);
        return;
      }

      if (rows.length > 0) {
        resolve(rows[0]);
      } else {
        console.log('User not found');
        resolve(null);
      }
    });
  });
}

app.get('/api/historique', (req, res) => {
  const token = req.headers.authorization;
  const decodedToken = jwt.verify(token, "212711");
    const userId = decodedToken.id;
    console.log(userId)
    const query = `
      SELECT a.id, a.code_barre, a.description, c.confirmed_at
      FROM article AS a
      LEFT JOIN confirmation AS c ON a.id = c.article_id AND c.user_id = ${userId}
      WHERE c.user_id = ${userId}
    `;

  try {
    
    // Execute the query
    pool.query(query, (err, results) => {
      if (err) {
        console.error('Error executing the query: ', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }
      const codeBarres = results.map((row) => row.code_barre);
      const description =results.map((row)=>row.description)
      const processedItems = codeBarres.map((item) => processData(item,description.map((item)=>item)));

      console.log(results);
      // Send the retrieved data as the API response
      res.status(200).json({ proccessedItems: processedItems, results: results });
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Invalid token" });
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
