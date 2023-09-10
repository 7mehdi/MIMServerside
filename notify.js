const mysql = require('mysql');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const ExcelJS = require('exceljs');


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Slimane1921/',
  database: 'projet_stage',
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database.');

  // Schedule the task to run once a month
  cron.schedule('0 11 1 * *', () => {
    console.log('running');
    // Retrieve stock and send email
    retrieveStockAndSendEmail();
  });
});

function retrieveStockAndSendEmail() {
  // Query the stock table to retrieve the stock data
  const query = 'SELECT * FROM stock';
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error retrieving stock from the database:', error);
      return;
    }

    // Format the stock data into a table
    const stockTable = formatStockTable(results);

    // Send email with the stock table
    sendEmail(stockTable);
  });
}

function formatStockTable(stockData) {
  let table = '<table><tr><th>Product</th><th>Quantity</th><th>Stock theorique</th></tr>';
  for (const item of stockData) {
    table += `<tr><td>${item.item_category}</td><td>${item.real_count}</td><td>${item.theoretical_count}</td></tr>`;
  }
  table += '</table>';
  return table;
}

function sendEmail(stockTable) {
  // Create a transporter using the SMTP settings of Gmail
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'stock.mim00@gmail.com', // Your Gmail email address
      pass: 'jtcrawjlkvjdutya' // Your Gmail password or application-specific password
    }
  });

  // Define the email content
  const mailOptions = {
    from: 'stock.mim00@gmail.com', // Sender email address
    to: 'mehdi11bzd@gmail.com', // Recipient email address
    subject: 'Monthly Stock Report', // Email subject
    html: `<p>Dear recipient,</p><p>Here is the stock report for the month:</p>${stockTable}` // Email body (HTML)
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent successfully!');
    }
  });
}
