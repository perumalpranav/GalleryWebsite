'use strict';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';

export const handler = async (event) => {
  const ddbClient = new DynamoDBClient({ region: 'us-east-2' });

  let responseBody = "";
  let statusCode = 0;

  const { tablename } = JSON.parse(event.body);

  const params = {
    TableName: tablename,
    Select: 'ALL_ATTRIBUTES',
  };

  try {
    const data = await ddbClient.send(new ScanCommand(params));
    responseBody = JSON.stringify(data.Items);
    statusCode = 200;
  } catch (err) {
    console.error("Error:", err);
    responseBody = JSON.stringify({ error: err.message });
    statusCode = 500;
  }

  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "http://myimagegallery.s3-website.us-east-2.amazonaws.com/",
    },
    body: responseBody,
  };
};
