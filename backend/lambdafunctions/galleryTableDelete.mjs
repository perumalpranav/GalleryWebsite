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

    const client = getClient();
    await client.connect();

    try {
      await client.query('BEGIN');

      // 1. Delete junction table rows first (foreign key constraint)
      await client.query(
        `DELETE FROM image_keywords WHERE image_id = $1`,
        [image_id]
      );

      // 2. Delete the image
      await client.query(
        `DELETE FROM images WHERE image_id = $1`,
        [image_id]
      );

      await client.query('COMMIT');
      responseBody = JSON.stringify({ message: "Delete successful" });
      statusCode = 204;

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