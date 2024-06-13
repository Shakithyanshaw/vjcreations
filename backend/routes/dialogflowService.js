// dialogflowService.js

import dialogflow from 'dialogflow'; // Importing as default

const { SessionsClient } = dialogflow; // Destructuring SessionsClient from the default import
import { v4 as uuid } from 'uuid';

const projectId = 'madapp-b9139'; // Replace with your project ID
const sessionId = uuid();
const sessionClient = new SessionsClient();

const textQuery = async (text, sessionId) => {
  try {
    const sessionPath = sessionClient.sessionPath(projectId, sessionId);
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: text,
          languageCode: 'en-US',
        },
      },
    };
    const responses = await sessionClient.detectIntent(request);
    if (responses.length > 0) {
      return responses[0].queryResult;
    } else {
      throw new Error('No response from Dialogflow');
    }
  } catch (error) {
    console.error('Error in textQuery:', error);
    throw new Error('Failed to query Dialogflow');
  }
};

export { textQuery };
