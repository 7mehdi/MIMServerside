const express = require('express');
const port = 8080;
const cors = require('cors');

const app = express();
const { createPool } = require('mysql');


// Middleware to parse JSON data
app.use(express.json());
app.use(cors());


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
const pool = createPool({
    host: 'localhost',
    user: 'root',
    password: 'Slimane1921/',
    database: 'projet_stage',
  });
  
app.get('/api/articles', (req, res) => {
    const bureau = req.query.Nbur;
  
    const query = `
      SELECT id, code_barre, description
      FROM article
      WHERE article.bureau = ?
    `;
  
    pool.query(query, [bureau], (err, rows) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred' });
        return;
      }
  
      // Extract the code_barre value
      const codeBarres = rows.map((row) => row.code_barre);
      const description =rows.map((row)=>row.description)
      const id = rows.map((row)=>row.id)
      const processedItems = codeBarres.map((item) => processData(item, description.map((item)=>item),id.map((item)=>item)));
  
      res.json(processedItems);
    });
  });
  const processData = (data, description,id) => {
    const [Article, articleNumber] = data.split('-');
    let descr= description.map((item)=>item)
    let ArticleId = id.map((item)=>item)
    const decodedArticle = {
      Article: officeItems[parseInt(Article)],
      articleNumber: parseInt(articleNumber),
    };
    return {decodedArticle,descr, ArticleId};
  };
  
  
  app.delete('/api/articles/:id', (req, res) => {
    const itemId = req.params.id;
  
    pool.query('SELECT * FROM article WHERE ID = ?', [itemId], (err, rows) => {
      if (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'An error occurred while deleting the confirmation' });
        return;
      }
  
      const codeBarres = rows[0].code_barre;
      const [Article, articleNumber] = codeBarres.split('-');
      const decodedArt = {
        Article: officeItems[parseInt(Article)],
        articleNumber: parseInt(articleNumber),
      };
  
      pool.query('ALTER TABLE confirmation DROP FOREIGN KEY confirmation_ibfk_1', (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).json({ success: false, message: 'An error occurred while deleting the confirmation' });
          return;
        }
  
        pool.query('UPDATE stock SET real_count = real_count - 1 WHERE item_category = ?', [decodedArt.Article], (err, result) => {
          if (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'An error occurred while updating the stock count' });
            return;
          }
  
          pool.query('DELETE FROM article WHERE id = ?', [itemId], (err, result) => {
            if (err) {
              console.error(err);
              res.status(500).json({ success: false, message: 'An error occurred while deleting the item' });
              return;
            }
  
            // After successful deletion of the article, add back the foreign key constraint
            pool.query('ALTER TABLE confirmation ADD CONSTRAINT article_id FOREIGN KEY (article_id) REFERENCES article (id)', (err, result) => {
              if (err) {
                console.error(err);
                res.status(500).json({ success: false, message: 'An error occurred while adding the foreign key constraint' });
                return;
              }
  
              res.json({ success: true, message: 'Item and corresponding confirmation deleted successfully', decodedArt });
            });
          });
        });
      });
    });
  });
  
  
  app.put('/api/articles/:id', (req, res) => {
    const itemId = req.params.id;
    const { description } = req.body;
  
    pool.query('UPDATE article SET description = ? WHERE id = ?', [description, itemId], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'An error occurred while updating the description' });
        return;
      }
  
      res.json({ success: true, message: 'Description updated successfully' });
    });
  });
  app.get('/api/articles/:id', (req, res) => {
    const itemId = req.params.id;
  
    pool.query(
      'SELECT article.*, confirmation.confirmed_at, users.name ' +
      'FROM article ' +
      'INNER JOIN confirmation ON article.id = confirmation.article_id ' +
      'INNER JOIN users ON confirmation.user_id = users.id ' +
      'WHERE article.id = ?',
      [itemId],
      (err, rows) => {
        if (err) {
          console.error(err);
          res.status(500).json({ success: false, message: 'An error occurred while retrieving the article' });
          return;
        }
  
        if (rows.length === 0) {
          res.status(404).json({ success: false, message: 'Article not found' });
          return;
        }
  
        const data = rows[0];
        const [Article, articleNumber] = data.code_barre.split('-');
        const decodedArt = {
          code_barre: data.code_barre,
          Article: officeItems[parseInt(Article)],
          articleNumber: parseInt(articleNumber),
          description: data.description,
          bureau: data.bureau,
          confirmed_at: data.confirmed_at,
          user_name: data.name
        };
 
        res.json(decodedArt);
      }
    );
  });
  
  

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);

  });
  