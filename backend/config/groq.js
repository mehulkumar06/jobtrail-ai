const Groq = require('groq-sdk');

let client = null;

const getGroqClient = () => {
  if (!client) {
    client = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }
  return client;
};

module.exports = getGroqClient;