'use strict';
import pkg from 'pg';
const { Client } = pkg;

const getClient = () => new Client({
  host: process.env.DB_HOST,
  port: 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

export const handler = async (event) => {
  let responseBody = "";
  let statusCode = 0;

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "http://myimagegallery.s3-website.us-east-2.amazonaws.com/",
  };

  try {
    const image_id = event["pathParameters"].id;
    const { description, keywords } = JSON.parse(event.body);

    const client = getClient();
    await client.connect();

    try {
      await client.query('BEGIN');

      // 1. Update description
      await client.query(
        `UPDATE images SET description = $1 WHERE image_id = $2`,
        [description, image_id]
      );

      // 2. Insert any new keywords that don't exist yet
      for (const kw of keywords) {
        await client.query(
          `INSERT INTO keywords (keyword) VALUES ($1) ON CONFLICT (keyword) DO NOTHING`,
          [kw.trim().toLowerCase()]
        );
      }

      // 3. Replace junction table rows
      await client.query(
        `DELETE FROM image_keywords WHERE image_id = $1`,
        [image_id]
      );
      for (const kw of keywords) {
        await client.query(
          `INSERT INTO image_keywords (image_id, keyword_id)
           SELECT $1, keyword_id FROM keywords WHERE keyword = $2`,
          [image_id, kw.trim().toLowerCase()]
        );
      }

      await client.query('COMMIT');
      responseBody = JSON.stringify({ message: "Update successful" });
      statusCode = 201;

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      await client.end();
    }

  } catch (err) {
    responseBody = JSON.stringify({ error: err.message });
    statusCode = 500;
  }

  return { statusCode, headers, body: responseBody };
};