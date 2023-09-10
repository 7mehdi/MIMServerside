const mysql = require('mysql');
const nodemailer = require('nodemailer');
const ExcelJS = require('exceljs');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Slimane1921/',
  database: 'projet_stage',
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database.');

  
    console.log('Running');
    // Retrieve data and send email
    retrieveDataAndSendEmail();
});

function retrieveDataAndSendEmail() {
  // Query the database to retrieve the data
  const query = `
  SELECT a.bureau, GROUP_CONCAT(u.name) AS user_names, a.code_barre, a.description, c.confirmed_at
  FROM article a
  JOIN confirmation c ON a.id = c.article_id
  JOIN users u ON c.user_id = u.id
  GROUP BY a.bureau, a.code_barre, a.description, c.confirmed_at
  
  `;
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error retrieving data from the database:', error);
      return;
    }

    // Create an Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    // Add headers to the worksheet
    worksheet.columns = [  
        { header: 'Bureau', key: 'bureau', width: 15 },
     { header: 'Code', key: 'code_barre', width: 15 }, 
     { header: 'Description', key: 'description', width: 30 },
      { header: 'User', key: 'user_names', width: 15 },
      { header: 'Ajouté le', key: 'confirmed_at', width: 20 },
    ];

    // Add data rows to the worksheet
    results.forEach((row) => {
      worksheet.addRow(row);
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
        to: 'mehdi11bzd@gmail.com', // Recipient email address
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
