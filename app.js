const bodyParser = require('body-parser');
const express = require('express');
const app = express();

const setCorsHeaders = (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://itwiki-4cb50.web.app'); // replace with the URL of your Angular app
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(setCorsHeaders);

const pool = require('./db');

const articlesRouter = require('./api/articles');

app.use('/articles', articlesRouter);

app.get('/allTopic', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT id, name FROM topic;');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.get('/allKeyword', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT id, name, weight FROM keyword;');
        const uniq = []
        rows.forEach((row) => {
            if (!uniq.find((u) => u.name === row.name)) uniq.push(row);
        })
        res.json(uniq);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Добавляє статтю
app.post('/articles', async (req, res) => {
    const { a_name, topic, keywords, content, link, img_url} = req.body;
    let topic_id, keyword_ids, article_id;

    try {
        const { rows: existingTopicRows } = await pool.query('SELECT id FROM topic WHERE name ILIKE $1', [topic]);

        if (existingTopicRows.length > 0) {
            topic_id = existingTopicRows[0].id;
        } else {
            const { rows: newTopicRows } = await pool.query('INSERT INTO topic(name) VALUES($1) RETURNING id', [topic]);
            topic_id = newTopicRows[0].id;
        }

        keyword_ids = [];
        const { rows: existingKeywordRows } = await pool.query('SELECT id FROM keyword WHERE name ILIKE $1', [a_name]);

        if (existingKeywordRows.length > 0) {
            keyword_ids.push(existingKeywordRows[0].id);
        } else {
            const { rows: newKeywordRows } = await pool.query('INSERT INTO keyword(name, weight) VALUES($1, 0) RETURNING id', [a_name]);
            keyword_ids.push(newKeywordRows[0].id);
        }

        for (const keyword of keywords) {
            const { rows: existingKeywordRows } = await pool.query('SELECT id FROM keyword WHERE name ILIKE  $1', [keyword]);

            if (existingKeywordRows.length > 0) {
                keyword_ids.push(existingKeywordRows[0].id);
            } else {
                const { rows: newKeywordRows } = await pool.query('INSERT INTO keyword(name, weight) VALUES($1, 0) RETURNING id', [keyword]);
                keyword_ids.push(newKeywordRows[0].id);
            }
        }

        const duplicateQuery = 'SELECT id FROM article WHERE a_name ILIKE $1';
        const { rows: duplicateRows } = await pool.query(duplicateQuery, [a_name]);

        if (duplicateRows.length > 0) {
            res.status(400).send('Article with the same a_name already exists');
            return;
        }

        const insertArticleQuery = 'INSERT INTO article(a_name, id_topic, content, link, img_url) VALUES($1, $2, $3, $4, $5) RETURNING id';
        const { rows: articleRows } = await pool.query(insertArticleQuery, [a_name, topic_id, content, link, img_url]);
        article_id = articleRows[0].id;

        for (const keyword_id of keyword_ids) {
            await pool.query('INSERT INTO article_keyword(id_article, id_keyword) VALUES($1, $2)', [article_id, keyword_id]);
        }
        await pool.query('DELETE FROM public.article_keyword WHERE id NOT IN ( SELECT MIN(id) FROM public.article_keyword GROUP BY id_keyword, id_article);');
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
