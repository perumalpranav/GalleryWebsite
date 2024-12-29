'use strict';
import { DynamoDBClient, DeleteItemCommand } from '@aws-sdk/client-dynamodb';

export const handler = async (event) => {
  const ddbClient = new DynamoDBClient({ region: 'us-east-2' });

  let responseBody = "";
  let statusCode = 0;

  const id = event["pathParameters"].id;
  const { tablename } = JSON.parse(event.body);

  const params = {
    TableName: tablename,
    Key: {
      id: { S: id },
    },
  };
  
  try {
    const data = await ddbClient.send(new DeleteItemCommand(params));
    responseBody = JSON.stringify(data);
    statusCode = 204;
  } catch (err) {
    responseBody = `Unable to delete product: ${err}`
    statusCode = 403;
  }

  const response = {
    statusCode: statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "http://myimagegallery.s3-website.us-east-2.amazonaws.com/",
    },
    body: responseBody
  }  

  return response;
};