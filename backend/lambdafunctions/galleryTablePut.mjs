'use strict';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

export const handler = async (event) => {
  const ddbClient = new DynamoDBClient({ region: 'us-east-2' });

  let responseBody = "";
  let statusCode = 0;

  const id = event["pathParameters"].id;
  const { tablename, description, ...otherFields } = JSON.parse(event.body);
  
  const params = {
    TableName: tablename,
    Item: {
      id: { S: id },
      description: { S: description },
    },
  };
  
  // Add other fields dynamically
  for (const [key, value] of Object.entries(otherFields)) {
    params.Item[key] = { S: value }; 
  }
  
  try {
    const data = await ddbClient.send(new PutItemCommand(params));
    responseBody = JSON.stringify(data);
    statusCode = 201;
  } catch (err) {
    responseBody = `Unable to put product: ${err}`
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