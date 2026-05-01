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
    const client = getClient();
    await client.connect();

    try {
      const query = `
        SELECT
          i.image_id,
          i.description,
          i.s3_key,
          MIN(k.keyword) AS keyword
        FROM images i
        LEFT JOIN image_keywords ik ON i.image_id = ik.image_id
        LEFT JOIN keywords k ON ik.keyword_id = k.keyword_id
        GROUP BY i.image_id, i.description, i.s3_key
      `;
      const result = await client.query(query);
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