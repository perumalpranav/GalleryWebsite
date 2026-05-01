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
    const { keyword } = JSON.parse(event.body);
    if (!keyword) throw new Error("Missing keyword");

    const client = getClient();
    await client.connect();

    try {
      const query = `
        SELECT i.image_id, i.description, i.s3_key, ARRAY_AGG(k.keyword) AS keywords
        FROM images i
        JOIN image_keywords ik ON i.image_id = ik.image_id
        JOIN keywords k ON ik.keyword_id = k.keyword_id
        WHERE i.image_id IN (
          SELECT ik2.image_id
          FROM image_keywords ik2
          JOIN keywords k2 ON ik2.keyword_id = k2.keyword_id
          WHERE LOWER(k2.keyword) = LOWER($1)
        )
        GROUP BY i.image_id, i.description, i.s3_key
      `;
      const result = await client.query(query, [keyword]);
      responseBody = JSON.stringify(result.rows);
      statusCode = 200;
    } finally {
      await client.end();
    }

  } catch (err) {
    responseBody = JSON.stringify({ error: err.message });
    statusCode = 500;
  }

  return { statusCode, headers, body: responseBody };
};