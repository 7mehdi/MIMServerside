const express = require('express');
const port = 7000;
const cors = require('cors');

const app = express();
const { createPool } = require('mysql');

const { check, validationResult } = require("express-validator");

// Middleware to parse JSON data
app.use(express.json());
app.use(cors());

const pool = createPool({
    host: 'localhost',
    user: 'root',
    password: 'Slimane1921/',
    database: 'projet_stage',
  });
  
// Validation middleware for user creation
const createUserValidationRules = [
    check("email").isEmail().withMessage("Invalid email"),
    check("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  ];
  
  // Validation middleware for role modification
  const modifyRoleValidationRules = [
    check("role").notEmpty().withMessage("Role is required"),
  ];
  
  // Get all users
  app.get("/api1/users", (req, res) => {
    pool.query("SELECT * FROM users WHERE id != 4", (err, rows) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred" });
        return;
      }
      res.json(rows);
    });
  });
  
  // Create a new user
  app.post("/api1/users", createUserValidationRules, (req, res) => {
   console.log(req.body)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const {name, email, password, role } = req.body;
  
    pool.query("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?,?)", [name,email, password, role], (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred during user creation" });
        return;
      }
      res.json({ message: "User created successfully" });
    });
  });
  
  app.delete("/api1/users/:userId", (req, res) => {
    const userId = req.params.userId;
    const newUserId = 4;
  
    pool.query("UPDATE confirmation SET user_id = ? WHERE user_id = ?", [newUserId, userId], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred during confirmation table update" });
        return;
      }

      res.json({ message: "User deleted successfully" });
    });
    pool.query("DELETE FROM users WHERE id != ? AND id != 4", [userId], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred during user deletion" });
        return;
      }
    
      if (result.affectedRows === 0) {
        res.status(404).json({ error: "User not found" });
        return;
      }
    
      // Successfully deleted users except the user with id 4
      res.status(200).json({ message: "Users deleted successfully" });
    });
    
  });
  
  
  // Modify the role of a user
  app.put("/api1/users/:userId", modifyRoleValidationRules, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const userId = req.params.userId;
    const { role } = req.body;
  
    pool.query("UPDATE users SET role = ? WHERE id = ?", [role, userId], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred during role modification" });
        return;
      }
  
      if (result.affectedRows === 0) {
        res.status(404).json({ error: "User not found" });
        return;
      }
  
      res.json({ message: "User role modified successfully" });
    });
  });
  
    // Get stock
    app.get("/api/stock", (req, res) => {
      pool.query("SELECT * FROM stock", (err, rows) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: "An error occurred" });
          return;
        }
        res.json(rows);
        console.log(rows)
      });
    });
    


    //generate and send excel file 
    
const nodemailer = require('nodemailer');
const ExcelJS = require('exceljs');



app.get("/api/excel/:email", async (req, res) => {
  try {
      const email = req.params.email;

      console.log('Connected to the database.');
      console.log('Running');
      
      // Retrieve data from the database
      const results = await retrieveDataAndSendEmail(email);
    

      res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'An error occurred' });
  }
});



async function retrieveDataAndSendEmail(email) {
  // Query the database to retrieve the data
  const query = `
  SELECT a.bureau, GROUP_CONCAT(u.name) AS user_names, a.code_barre, a.description, c.confirmed_at
  FROM article a
  JOIN confirmation c ON a.id = c.article_id
  JOIN users u ON c.user_id = u.id
  GROUP BY a.bureau, a.code_barre, a.description, c.confirmed_at
  
  `;
  pool.query(query, (error, results) => {
    if (error) {
      console.error('Error retrieving data from the database:', error);
      return;
    }
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
   
    // Create an Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    // Add headers to the worksheet
    worksheet.columns = [  
      { header: 'Bureau', key: 'bureau', width: 15 },
      { header: 'Code', key: 'code_barre', width: 15 }, 
      { header: 'Article', key: 'article', width: 20 }, // New column
      { header: 'Numéro d\'article', key: 'articleNumber', width: 20 }, // New column
      { header: 'Description', key: 'description', width: 30 },
      { header: 'User', key: 'user_names', width: 15 },
      { header: 'Ajouté le', key: 'confirmed_at', width: 20 },
    ];
  
    // Add data rows to the worksheet
    results.forEach((row) => {
      const [Article, articleNumber] = row.code_barre.split('-');
      const decodedArticle = {
        Article: officeItems[parseInt(Article)] || 'N/A',
        articleNumber: parseInt(articleNumber) || 0,
      };
  
      // Add the decodedArticle values to the row
      worksheet.addRow({
        ...row,
        article: decodedArticle.Article,
        articleNumber: decodedArticle.articleNumber,
      });
    });
   
    // Generate a buffer from the workbook
    workbook.xlsx.writeBuffer().then((buffer) => {
      // Create a transporter using the SMTP settings of Gmail
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'stock.mim00@gmail.com', // Your Gmail email address
          pass: 'jtcrawjlkvjdutya', // Your Gmail password or application-specific password
        },
      });

      // Define the email content
      const mailOptions = {
        from: 'stock.mim00@gmail.com', // Sender email address
        to: `${email}`, // Recipient email address
        subject: 'Monthly Data Report', // Email subject
        html: `<p>Dear recipient,</p><p>Please find attached the monthly data report.</p>`, // Email body (HTML)
        attachments: [
          {
            filename: 'data_report.xlsx',
            content: buffer,
          },
        ],
      };

      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent successfully!');
        }
      });
    });
  });
}
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
  