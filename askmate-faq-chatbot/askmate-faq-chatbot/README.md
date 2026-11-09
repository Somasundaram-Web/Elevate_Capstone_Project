# AskMate – AI-Powered FAQ Chatbot

AskMate is an interactive FAQ chatbot built to answer frequently asked web development questions. It uses keyword-based matching to identify user queries and provide relevant answers through a simple, modern chat interface.

## Features

- Interactive chatbot messaging interface.
- Keyword-based FAQ matching.
- Predefined FAQ dataset.
- Automatic fallback response for unanswered questions.
- Stores unanswered queries for future improvement.
- Helpful and not-helpful feedback buttons.
- Stores user feedback.
- Responsive frontend design.

## Technologies Used

**Frontend**
- React.js
- HTML
- CSS
- JavaScript
- Vite

**Backend**
- Node.js
- Express.js
- REST API

**Data Storage**
- JSON files

## Project Structure

```text
askmate-faq-chatbot/
├── backend/
│   ├── server.js
│   ├── faqs.json
│   ├── unanswered.json
│   ├── feedback.json
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── index.html
│
├── README.md
└── AskMate_Project_Report.pdf
```

## How to Run the Project

### 1. Start the Backend

Open a terminal:

```bash
cd backend
npm install
node server.js
```

The backend runs at:

`http://localhost:5000`

### 2. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed in the terminal, usually:

`http://localhost:5173`

## How It Works

1. The user enters a question in the chatbot.
2. The frontend sends the question to the backend through an API request.
3. The backend normalizes the text and compares keywords with the FAQ dataset.
4. The best matching FAQ answer is returned to the frontend.
5. If no matching answer is found, a fallback response is displayed and the unanswered query is stored.
6. Users can provide feedback using the helpful or not-helpful buttons.

## Future Improvements

- Expand the FAQ dataset.
- Improve natural language understanding.
- Integrate a machine learning or AI-based response system.
- Add an admin dashboard to manage FAQs and feedback.

## Author

Developed as a Web Development Internship Project.