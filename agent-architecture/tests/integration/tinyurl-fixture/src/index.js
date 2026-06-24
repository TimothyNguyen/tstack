import express from 'express';
import { pool } from './db.js';
import { randomBytes } from 'node:crypto';

const app = express();
app.use(express.json());

app.post('/shorten', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'url required' });
  const code = randomBytes(4).toString('hex');
  await pool.query('INSERT INTO urls (code, url) VALUES ($1, $2)', [code, url]);
  res.json({ code, short: `http://localhost:3000/${code}` });
});

app.get('/:code', async (req, res) => {
  const { rows } = await pool.query('SELECT url FROM urls WHERE code=$1', [req.params.code]);
  if (!rows.length) return res.status(404).json({ error: 'not found' });
  await pool.query('UPDATE urls SET hits=hits+1 WHERE code=$1', [req.params.code]);
  res.redirect(301, rows[0].url);
});

app.listen(3000, () => console.log('tinyurl running on :3000'));
export default app;
