
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Load FAQ data
const faqs = require("./faqs.json");

const unansweredFile = path.join(__dirname, "unanswered.json");
const feedbackFile = path.join(__dirname, "feedback.json");

// Create storage files if they don't exist
function createFileIfMissing(file) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, "[]");
  }
}

createFileIfMissing(unansweredFile);
createFileIfMissing(feedbackFile);

// Read JSON storage
function readData(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

// Save JSON storage
function saveData(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Normalize text
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .trim();
}

// Ignore common words
const stopWords = new Set([
  "what", "is", "the", "a", "an", "of", "in", "on",
  "to", "for", "and", "how", "why", "can", "you",
  "explain", "tell", "me", "about", "define"
]);

// Welcome / health route
app.get("/", (req, res) => {
  res.send("AskMate FAQ Chatbot Backend is running!");
});

// Chat endpoint
app.post("/api/chat", (req, res) => {
  const message = req.body.message;

  if (!message || !message.trim()) {
    return res.status(400).json({
      answer: "Please enter a question."
    });
  }

  const userMessage = normalize(message);

  // Remove common words
  const userWords = userMessage
    .split(/\s+/)
    .filter(word => word.length > 1 && !stopWords.has(word));

  let bestMatch = null;
  let highestScore = 0;

  // Find the best matching FAQ
  faqs.forEach((faq) => {
    const searchableText = normalize(
      faq.question + " " + faq.keywords.join(" ")
    );

    const searchableWords = new Set(searchableText.split(/\s+/));

    let score = 0;

    userWords.forEach((word) => {
      if (searchableWords.has(word)) {
        score++;
      }
    });

    if (score > highestScore) {
      highestScore = score;
      bestMatch = faq;
    }
  });

  // Return matching answer
  if (bestMatch && highestScore >= 1) {
    return res.json({
      answer: bestMatch.answer,
      faqId: bestMatch.id,
      matched: true
    });
  }

  // Store unanswered question
  const unanswered = readData(unansweredFile);

  unanswered.push({
    question: message,
    date: new Date().toISOString()
  });

  saveData(unansweredFile, unanswered);

  return res.json({
    answer: "Sorry, I couldn't find an answer. Your question has been saved for future improvement.",
    faqId: null,
    matched: false
  });
});

// Feedback endpoint
app.post("/api/feedback", (req, res) => {
  const { faqId, question, helpful } = req.body;

  if (typeof helpful !== "boolean") {
    return res.status(400).json({
      message: "Please provide valid feedback."
    });
  }

  const feedback = readData(feedbackFile);

  feedback.push({
    faqId: faqId || null,
    question: question || "",
    helpful,
    date: new Date().toISOString()
  });

  saveData(feedbackFile, feedback);

  res.json({
    message: "Thank you for your feedback!"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`AskMate backend running at http://localhost:${PORT}`);
});
