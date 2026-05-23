const getGroqClient = require('../config/groq');

const extractApplicationData = async (emailData) => {
  const { subject, from, date, snippet, body } = emailData;

  // Pre-filter: block known job alert senders before even calling AI
  const blockedSenders = [
    'jobalerts-noreply@linkedin.com',
    'jobs-noreply@linkedin.com',
    'talent@linkedin.com',
    'donotreply@jobalert.indeed.com',
    'jobalert.indeed.com',
    'alert@glassdoor.com',
    'noreply@naukri.com',
    'noreply@unstop.com',
    'jobalerts-noreply',
    'job-alert',
    'jobalert',
  ];

  const fromLower = from.toLowerCase();
  const isBlockedSender = blockedSenders.some(blocked => fromLower.includes(blocked));

  if (isBlockedSender) {
    console.log(`Blocked job alert sender: ${from}`);
    return null;
  }

  // Pre-filter: block known job suggestion subject patterns
  const subjectLower = subject.toLowerCase();
  const blockedSubjectPatterns = [
    'job alert',
    'jobs for you',
    'new jobs',
    'jobs you might like',
    'recommended jobs',
    'job recommendations',
    'your job alert',
    'saved job',
    'jobs matching',
    'apply now to',
    'new opportunities',
    'jobs in your area',
    'vacancies for you',
  ];

  const isBlockedSubject = blockedSubjectPatterns.some(pattern => subjectLower.includes(pattern));

  if (isBlockedSubject) {
    console.log(`Blocked job suggestion subject: ${subject}`);
    return null;
  }
  try {
    const prompt = `
You are a job application tracker AI. Your ONLY job is to identify emails where the USER has ALREADY APPLIED to a job and received a confirmation.

Email Subject: ${subject}
Email From: ${from}
Email Date: ${date}
Email Body (first 500 chars): ${body.slice(0, 500)}

INCLUDE these emails (isJobApplication = true):
- "Thank you for applying to [Company]"
- "We received your application for [Role]"
- "Your application was sent to [Company]" (LinkedIn apply confirmation)
- "Application submitted" / "Application received"
- "Thanks for applying" / "Application confirmation"
- Emails confirming the user HAS applied to a specific role

EXCLUDE these emails (isJobApplication = false):
- Job recommendation/suggestion emails ("Jobs you might like", "New jobs for you")
- Job alert emails ("Your job alert for [keyword]")
- "Apply now" emails suggesting jobs the user hasn't applied to yet
- Saved job reminder emails ("Your saved job is still available")
- Newsletter emails from job platforms
- Recruiter outreach emails ("We found your profile")
- Any email where the user has NOT yet applied

KEY TEST: Did the user already submit an application? If NO → isJobApplication = false.

Extract if confirmed application:
- company: the company name (string)
- role: the job title applied for (string, or null if not found)
- dateApplied: ISO format YYYY-MM-DD
- status: one of: "Applied", "Under Review", "Rejected", "Interview", "Offer", "Unknown"
- isJobApplication: true or false
- confidence: 0.0 to 1.0

Respond ONLY with valid JSON. No markdown, no backticks.
Example: {"company":"Google","role":"Software Engineer","dateApplied":"2024-01-15","status":"Applied","isJobApplication":true,"confidence":0.95}
`.trim();

    const groq = getGroqClient();
const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 200
    });

    // Get the raw text response
    let content = response.choices[0].message.content;

    // Strip markdown backticks just in case the model adds them
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();

    // Parse the JSON
    const parsed = JSON.parse(content);

    // If the AI says this is not a job application email, skip it
    if (!parsed.isJobApplication) {
      console.log(`Skipping non-job email: "${subject}"`);
      return null;
    }

    console.log(`Extracted: ${parsed.company} — ${parsed.role} (confidence: ${parsed.confidence})`);
    return parsed;

  } catch (err) {
    console.error(`Groq extraction failed for subject "${subject}":`, err.message);
    // Always return null on failure — never throw
    return null;
  }
};

const extractSentApplicationData = async (emailData) => {
  const { subject, to, date, body } = emailData;

  try {
    const prompt = `
You are a job application tracker AI. Analyze this SENT email and determine if it is a job application email sent by a candidate to a company.

Email Subject: ${subject}
Email To: ${to}
Email Date: ${date}
Email Body (first 500 chars): ${body.slice(0, 500)}

A sent job application email typically:
- Has subject like "Application for [Role]", "Regarding [Role] position", "Job Application - [Name]"
- Is sent to a company HR/careers/jobs/recruiting email
- Contains a cover letter or resume mention
- Mentions applying for a specific role

If this is a job application email sent by the user, extract:
- company: the company name (from email domain or body)
- role: the job title applied for (string, or null if not found)
- dateApplied: the date in ISO format YYYY-MM-DD
- status: always "Applied" for sent emails
- isJobApplication: true or false
- confidence: 0.0 to 1.0

Respond ONLY with valid JSON. No markdown, no backticks.
Example: {"company":"Google","role":"Software Engineer","dateApplied":"2024-01-15","status":"Applied","isJobApplication":true,"confidence":0.9}
    `.trim();

    const groq = getGroqClient();
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 200
    });

    let content = response.choices[0].message.content;
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsed = JSON.parse(content);

    if (!parsed.isJobApplication) return null;

    console.log(`Sent: ${parsed.company} — ${parsed.role} (confidence: ${parsed.confidence})`);
    return parsed;

  } catch (err) {
    console.error(`Groq sent extraction failed for "${subject}":`, err.message);
    return null;
  }
};

module.exports = { extractApplicationData, extractSentApplicationData };
