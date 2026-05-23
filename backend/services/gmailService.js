const { google } = require('googleapis');

const createOAuthClient = (user) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );

  oauth2Client.setCredentials({
    access_token: user.accessToken,
    refresh_token: user.refreshToken
  });

  return oauth2Client;
};

const decodeBody = (payload) => {
  // Handle simple (non-multipart) emails
  if (payload.body && payload.body.data) {
    return Buffer.from(payload.body.data, 'base64').toString('utf-8');
  }

  // Handle multipart emails — find the text/plain part
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body && part.body.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
    }

    // If no text/plain, try text/html
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body && part.body.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
    }

    // Handle nested multipart
    for (const part of payload.parts) {
      if (part.parts) {
        const nested = decodeBody(part);
        if (nested) return nested;
      }
    }
  }

  return '';
};

const fetchJobEmails = async (user, maxResults = 50) => {
  try {
    const oauth2Client = createOAuthClient(user);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Search for job application confirmation emails
    // READONLY — this never modifies or marks emails as read
    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
      q: '(subject:"thank you for applying" OR subject:"thanks for applying" OR subject:"application received" OR subject:"application submitted" OR subject:"application confirmation" OR subject:"we received your application" OR subject:"your application was sent" OR subject:"you applied" OR subject:"next steps for your application" OR subject:"application for" OR from:greenhouse-mail.io OR from:lever.co OR from:workday.com) newer_than:30d -from:jobalerts-noreply@linkedin.com -from:jobalerts-noreply@linkedin.com -from:talent@linkedin.com -from:donotreply@jobalert.indeed.com -from:alert@glassdoor.com -from:jobs-noreply@linkedin.com -from:noreply@naukri.com -from:noreply@unstop.com'
    });

    const messages = listResponse.data.messages || [];

    if (messages.length === 0) {
      console.log('No job emails found for user:', user.email);
      return [];
    }

    console.log(`Found ${messages.length} potential job emails for ${user.email}`);

    const emailData = [];

    for (const message of messages) {
      try {
        // Fetch full email — does NOT mark as read
        const msgResponse = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full'
        });

        const msg = msgResponse.data;
        const headers = msg.payload.headers;

        // Extract headers
        const getHeader = (name) => {
          const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
          return header ? header.value : '';
        };

        const subject = getHeader('Subject');
        const from = getHeader('From');
        const date = getHeader('Date');
        const body = decodeBody(msg.payload);

        emailData.push({
          id: msg.id,
          subject,
          from,
          date,
          snippet: msg.snippet || '',
          body
        });

      } catch (msgErr) {
        console.error(`Error fetching message ${message.id}:`, msgErr.message);
        // Skip this message and continue
        continue;
      }
    }

    return emailData;

  } catch (err) {
    console.error('Gmail fetch error for user', user.email, ':', err.message);
    return [];
  }
};

const fetchSentJobEmails = async (user, maxResults = 50) => {
  try {
    const oauth2Client = createOAuthClient(user);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
      labelIds: ['SENT'],
      q: 'to:(@careers OR @jobs OR @recruiting OR @hr OR @talent OR @hiring OR @recruitment OR noreply) newer_than:60d'
    });

    const messages = listResponse.data.messages || [];

    if (messages.length === 0) {
      console.log('No sent job emails found for:', user.email);
      return [];
    }

    console.log(`Found ${messages.length} potential sent job emails for ${user.email}`);

    const emailData = [];

    for (const message of messages) {
      try {
        const msgResponse = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full'
        });

        const msg = msgResponse.data;
        const headers = msg.payload.headers;

        const getHeader = (name) => {
          const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
          return header ? header.value : '';
        };

        const subject = getHeader('Subject');
        const to = getHeader('To');
        const date = getHeader('Date');
        const body = decodeBody(msg.payload);

        emailData.push({
          id: msg.id,
          subject,
          from: user.email,
          to,
          date,
          snippet: msg.snippet || '',
          body,
          source: 'sent'
        });

      } catch (msgErr) {
        console.error(`Error fetching sent message ${message.id}:`, msgErr.message);
        continue;
      }
    }

    return emailData;

  } catch (err) {
    console.error('Sent Gmail fetch error:', err.message);
    return [];
  }
};

module.exports = { fetchJobEmails, fetchSentJobEmails };
