const Groq = require("groq-sdk");

// Lazily create the client so dotenv in server.js always runs first
let _groq = null;
function getGroq() {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
}

/**
 * Send parsed sales data to Groq LLM and return a professional narrative summary.
 */
async function generateSummary(data) {
  const dataSnippet = JSON.stringify(data.slice(0, 100), null, 2);

  const prompt = `You are a senior business analyst at a large enterprise. 
Analyze the following sales data and produce a professional executive summary suitable for C-level leadership.

The summary should include:
1. **Overview** — total revenue, total units sold, and the reporting period.
2. **Top Performers** — best-selling product categories and regions.
3. **Trends & Insights** — notable patterns, growth areas, or concerns.
4. **Recommendations** — 2-3 actionable next steps based on the data.

Keep the tone crisp, data-driven, and suitable for an email report. Use bullet points and bold headers.

DATA (JSON):
${dataSnippet}
`;

  const chat = await getGroq().chat.completions.create({
    model: "llama-3.3-70b-versatile",
  
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
    max_tokens: 8000,
  });

  return chat.choices[0].message.content;
}

module.exports = { generateSummary };
