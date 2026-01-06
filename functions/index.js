const { onRequest } = require('firebase-functions/v2/https');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Data about Soli
const resume = {
  "experience": [
    { "title": "Senior AI Product Engineer", "subtitle": "Knowunity", "url": "https://knowunity.com", "description": "Building AI-powered educational products for 30 million students", "start": "Sep 2025", "end": "Present" },
    { "title": "Founder", "subtitle": "toy2life", "url": "https://toy2life.com", "start": "Sep 2024", "end": "Aug 2025" },
    { "title": "Founding CTO", "subtitle": "goaudio.ai", "url": "https://goaudio.ai", "location": "Berlin, Germany", "start": "Sep 2021", "end": "Aug 2024" },
    { "title": "DACH Marketplace Operations Manager", "subtitle": "Uber", "url": "https://uber.com", "location": "Berlin, Germany", "start": "Sep 2019", "end": "Aug 2021" },
    { "title": "Student Research Assistant", "subtitle": "RWTH Aachen University", "url": "https://www.rwth-aachen.de/", "location": "Aachen, Germany", "start": "Sep 2015", "end": "Aug 2019" }
  ],
  "education": [
    { "title": "B.Sc. Computer Science", "subtitle": "RWTH Aachen University", "location": "Aachen, Germany", "start": "October 2014", "end": "August 2018" },
    { "title": "M.Sc. Computer Science", "subtitle": "RWTH Aachen University", "location": "Aachen, Germany", "start": "October 2018" }
  ],
  "languages": [
    { "name": "Arabic", "level": "Native" },
    { "name": "German", "level": "Fluent" },
    { "name": "English", "level": "Fluent" },
    { "name": "Spanish", "level": "B1" }
  ]
};

const projects = [
  { "title": "habibi", "subtitle": "couples & relationships", "year": "2024", "tags": ["Swift", "SwiftUI", "iCloud"], "description": "A couples app for sending handwritten notes and drawings to your partner.", "link": "https://testflight.apple.com/join/WU6nQu38", "status": "live" },
  { "title": "habibis", "subtitle": "friends contact reminder", "year": "2024", "tags": ["Swift", "SwiftUI", "iCloud"], "description": "A friendship maintenance app that helps you stay in touch with the people you care about.", "link": "https://testflight.apple.com/join/x1SpM3A7", "status": "live" },
  { "title": "goaudio", "subtitle": "ai audio production", "year": "2024", "tags": ["FastAPI", "React Native", "Cloud Run", "Docker", "AI"], "description": "An AI-powered audio production platform that transforms content into high-quality audiobooks, podcasts, and news formats.", "link": "https://goaudio.ai", "status": "live" },
  { "title": "songgpt", "subtitle": "ai music composer", "year": "2023", "tags": ["React Native", "FastAPI"], "description": "A web-app to explore if text-based LLMs can create original music compositions.", "link": "https://songgpt.soli.blue/", "status": "live" },
  { "title": "toy2life", "subtitle": "ai-powered talking toys", "year": "2021", "tags": ["C++", "ESP32", "Hardware", "3D Printing", "AI"], "description": "A device that brought toys to life through AI conversation. First hardware project - learned C++, ESP32, 3D printing, soldering.", "link": "https://toy2life.com", "status": "graveyard" },
  { "title": "memes ai", "subtitle": "ai meme generator", "year": "2024", "tags": ["Swift", "SwiftUI", "FastAPI"], "description": "An iOS app that let users create AI-generated memes.", "link": "https://memesai.app", "status": "graveyard" },
  { "title": "happy", "subtitle": "birthday reminder", "year": "2023", "tags": ["Swift", "SwiftUI"], "description": "An app using phone contacts as database for birthday reminders - no backend needed.", "link": "https://apple.co/3FJD3eX", "status": "graveyard" },
  { "title": "piasso", "subtitle": "ai assistant in arabic", "year": "2022", "tags": ["React Native", "FastAPI", "Google Cloud", "Docker"], "description": "AI image generation in any language, reached ~100k users.", "link": "https://apps.apple.com/de/app/piasso-ai-assistant/id6444704118", "status": "graveyard" }
];

const systemPrompt = `You are an AI assistant on Soli's personal website (soli.blue). Your job is to answer questions about Soli in a friendly, concise, and helpful way.

IMPORTANT GUIDELINES:
- ONLY answer questions about Soli. If someone asks about anything else (coding help, general knowledge, other topics), politely decline and redirect them to ask about Soli instead. Example: "I'm here to tell you about Soli! Ask me about his projects, background, or interests."
- Be concise and conversational - this is a terminal interface
- Use short paragraphs, avoid walls of text
- If asked something not in the data, say you don't have that info
- Be friendly and personable
- Soli goes by "Soli" (not his full name)
- ALWAYS use markdown links when mentioning websites, social profiles, or projects. Examples:
  - Twitter: [Twitter](https://twitter.com/_xSoli)
  - GitHub: [GitHub](https://github.com/soliblue)
  - Manifold: [Manifold](https://manifold.markets/Soli)
  - Website: [soli.blue](https://soli.blue)
  - For projects with links, always link them: [goaudio](https://goaudio.ai)

SOLI'S DATA:

=== RESUME ===
${JSON.stringify(resume, null, 2)}

=== PROJECTS ===
${JSON.stringify(projects, null, 2)}

=== ABOUT SOLI ===
- Egyptian, moved to Germany in 2014 to study CS at RWTH Aachen
- Passionate about AI, education, and building products
- Loves prediction markets (active on Manifold)
- Interested in art, architecture (Hundertwasser, Gaudi), audiovisual art (Christopher Bauder)
- Enjoys fonts, apps, travel, and connecting with people
- Website: soli.blue | Twitter: @_xSoli | GitHub: soliblue`;

// Store chat sessions in memory
const chatSessions = new Map();

exports.chat = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { message, sessionId } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'API key not configured' });
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
    });

    let chat;
    if (sessionId && chatSessions.has(sessionId)) {
      chat = chatSessions.get(sessionId);
    } else {
      chat = model.startChat({ history: [] });
      if (sessionId) {
        chatSessions.set(sessionId, chat);
      }
    }

    const result = await chat.sendMessage(message);
    const response = result.response.text();

    res.json({ response, sessionId: sessionId || Date.now().toString() });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});
