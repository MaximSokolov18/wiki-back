const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT a.id, a.a_name, t.name name_topic, t.id id_topic, content, link FROM article a JOIN topic t ON a.id_topic = t.id');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// http://localhost:3000/articles/topic/3
router.get('/topic/:id_topic', async (req, res) => {
    try {
      const { id_topic } = req.params;
      const { rows } = await pool.query('SELECT a.id, a.a_name, t.name name_topic, t.id id_topic, content, link FROM article a JOIN topic t ON a.id_topic = t.id WHERE a.id_topic = $1', [id_topic]);
      res.json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  });

  //Може приймати значення через кому http://localhost:3000/articles/keywords/8,9
  router.get('/keywords/:id_keyword', async (req, res) => {
    try {
        const { id_keyword } = req.params;
        const keywordIds = id_keyword.split(',').map(Number);
        const query = `
            SELECT a.id, a.a_name, t.name name_topic, t.id id_topic, content, link
            FROM article a
            JOIN topic t ON a.id_topic = t.id
            JOIN (
                SELECT id_article, array_agg(id_keyword) AS keyword_ids
                FROM article_keyword
                GROUP BY id_article
            ) ak ON a.id = ak.id_article
            WHERE ARRAY[${keywordIds}] <@ ak.keyword_ids
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
