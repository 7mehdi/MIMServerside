// const mysql = require('mysql');

// // Create a connection to the database
// const connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: 'Slimane1921/',
//   database: 'projet_stage',
// });

// // Define the item descriptions
// const itemDescriptions = {
//   201: 'Ordinateur', // Computer
//   101: 'Bureau', // Desk
//   102: 'Chaise', // Chair
//   202: 'Imprimante', // Printer
//   103: 'Tableau blanc', // Whiteboard
//   104: 'Armoire', // Cabinet
//   203: 'Écran', // Monitor
//   204: 'Ordinateur portable', // Laptop
//   205: 'Téléphone', // Phone
// };

// const items = [
//   '201-001', '201-002', '201-003', '201-004', '201-005',
//   '201-006', '201-007', '201-008', '201-009', '201-010',
//   '101-001', '101-002', '101-003', '101-004', '101-005',
//   '101-006', '101-007', '101-008', '101-009', '101-010',
//   '102-001', '102-002', '102-003', '102-004', '102-005',
//   '102-006', '102-007', '102-008', '102-009', '102-010',
//   '202-001', '202-002', '202-003', '202-004', '202-005',
//   '202-006', '202-007', '202-008', '202-009', '202-010',
//   '103-001', '103-002', '103-003', '103-004', '103-005',
//   '103-006', '103-007', '103-008', '103-009', '103-010',
//   '104-001', '104-002', '104-003', '104-004', '104-005',
//   '104-006', '104-007', '104-008', '104-009', '104-010',
//   '203-001', '203-002', '203-003', '203-004', '203-005',
//   '203-006', '203-007', '203-008', '203-009', '203-010',
//   '204-001', '204-002', '204-003', '204-004', '204-005',
//   '204-006', '204-007', '204-008', '204-009', '204-010',
//   '205-001', '205-002', '205-003', '205-004', '205-005',
//   '205-006', '205-007', '205-008', '205-009', '205-010'
// ];

// const bureau = [
//   '401', '204', '201', '103', '205',
//   '301', '406', '512', '307', '101'
// ];

// // Create an array to hold the updated item objects
// const updatedItems = [];

// // Iterate through the items array
// for (const item of items) {
//   // Extract the category and item number
//   const [category, itemNumber] = item.split('-');

//   // Generate a random index for the bureau array
//   const randomIndex = Math.floor(Math.random() * bureau.length);

//   // Create the updated item object with description and random bureau
//   const updatedItem = {
//     code_barre: item,
//     description: itemDescriptions[category],
//     bureau: bureau[randomIndex]
//   };

//   // Add the updated item object to the updatedItems array
//   updatedItems.push(updatedItem);
// }

// // Function to insert item descriptions into the database
// const insertItemDescriptions = () => {
//   // Prepare the data to be inserted
//   const values = updatedItems.map(item => [item.code_barre, item.description, item.bureau]);

//   // SQL query to insert item descriptions
//   const sql = 'INSERT INTO article (code_barre, description, bureau) VALUES ?';

//   // Execute the SQL query with the values as the parameter
//   connection.query(sql, [values], (error, results) => {
//     if (error) {
//       console.error('Error inserting item descriptions:', error);
//     } else {
//       console.log('Item descriptions inserted successfully.');
//     }

//     // Close the database connection
//     connection.end();
//   });
// };

// // Connect to the database
// connection.connect((error) => {
//   if (error) {
//     console.error('Error connecting to the database:', error);
//   } else {
//     console.log('Connected to the database.');

//     // Call the function to insert item descriptions
//     insertItemDescriptions();
//   }
// });

// // Function to generate a random user ID between 1 and 4
// const getRandomUserID = () => {
//   return Math.floor(Math.random() * 4) + 1;
// };

// // Array to hold the confirmation objects
// const confirmations = [];

// // Generate confirmation objects with item IDs and random user IDs
// for (let itemId = 132; itemId <= 221; itemId++) {
//   const confirmation = {
//     item_id: itemId,
//     user_id: getRandomUserID(),
//   };
//   confirmations.push(confirmation);
// }

// // Function to insert confirmations into the database
// const insertConfirmations = () => {
//   // Prepare the data to be inserted
//   const values = confirmations.map(confirmation => [confirmation.item_id, confirmation.user_id]);

//   // SQL query to insert confirmations
//   const sql = 'INSERT INTO confirmation (article_id, user_id) VALUES ?';

//   // Execute the SQL query with the values as the parameter
//   connection.query(sql, [values], (error, results) => {
//     if (error) {
//       console.error('Error inserting confirmations:', error);
//     } else {
//       console.log('Confirmations inserted successfully.');
//     }

//     // Close the database connection
//     connection.end();
//   });
// };

// // Connect to the database
// connection.connect((error) => {
//   if (error) {
//     console.error('Error connecting to the database:', error);
//   } else {
//     console.log('Connected to the database.');

//     // Call the function to insert confirmations
//     insertConfirmations();
//   }
// });
