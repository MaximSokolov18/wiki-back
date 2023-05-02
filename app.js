const bodyParser = require('body-parser');
const express = require('express');
const app = express();

const setCorsHeaders = (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200'); // replace with the URL of your Angular app
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(setCorsHeaders);

const pool = require('./db');

app.get('/articles', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM article');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.post('/articles', async (req, res) => {
    const { a_name, topic, keywords, content, link } = req.body;
    let topic_id, keyword_ids, article_id;

    try {
        const { rows: existingTopicRows } = await pool.query('SELECT id FROM topic WHERE name = $1', [topic]);

        if (existingTopicRows.length > 0) {
            topic_id = existingTopicRows[0].id;
        } else {
            const { rows: newTopicRows } = await pool.query('INSERT INTO topic(name) VALUES($1) RETURNING id', [topic]);
            topic_id = newTopicRows[0].id;
        }

        keyword_ids = [];
        for (const keyword of keywords) {
            const { rows: existingKeywordRows } = await pool.query('SELECT id FROM keyword WHERE name = $1', [keyword]);

            if (existingKeywordRows.length > 0) {
                keyword_ids.push(existingKeywordRows[0].id);
            } else {
                const { rows: newKeywordRows } = await pool.query('INSERT INTO keyword(name, weight) VALUES($1, 0) RETURNING id', [keyword]);
                keyword_ids.push(newKeywordRows[0].id);
            }
        }

        const { rows: articleRows } = await pool.query('INSERT INTO article(a_name, id_topic, content, link) VALUES($1, $2, $3, $4) RETURNING id', [a_name, topic_id, content, link]);
        article_id = articleRows[0].id;

        for (const keyword_id of keyword_ids) {
            await pool.query('INSERT INTO article_keyword(id_article, id_keyword) VALUES($1, $2)', [article_id, keyword_id]);
        }

        res.status(200).send('Article added successfully');
    } catch (error) {
        console.error(error);
        if (topic_id) {
            await pool.query('DELETE FROM topic WHERE id=$1', [topic_id]);
        }
        if (keyword_ids && keyword_ids.length > 0) {
            await pool.query('DELETE FROM keyword WHERE id=ANY($1)', [keyword_ids]);
        }
        if (article_id) {
            await pool.query('DELETE FROM article WHERE id=$1', [article_id]);
        }
        res.status(500).send('Server Error');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
