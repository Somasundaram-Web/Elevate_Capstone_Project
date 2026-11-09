import { useEffect, useRef, useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:5000'

const suggestions = [
  { icon: '🌐', title: 'What is HTML?', description: 'Learn the structure of web pages' },
  { icon: '⚛️', title: 'What is React?', description: 'Understand the React library' },
  { icon: '💻', title: 'What is JavaScript?', description: 'Explore web programming' },
  { icon: '🤖', title: 'What is Machine Learning?', description: 'Discover the basics of ML' },
]

const welcomeMessage = {
  role: 'bot',
  text: "Hello! Welcome to AskMate. 👋 I'm your web development FAQ assistant. Ask me anything about web development, and I'll do my best to help!",
  matched: false,
}

function App() {
  const [messages, setMessages] = useState([welcomeMessage])
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedbackGiven, setFeedbackGiven] = useState({})
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(e) {
    e.preventDefault()

    if (!question.trim() || loading) return

    const userQuestion = question.trim()

    setMessages(prev => [
      ...prev,
      { role: 'user', text: userQuestion },
    ])

    setQuestion('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userQuestion }),
      })

      if (!response.ok) {
        throw new Error('Unable to get a response')
      }

      const data = await response.json()

      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          text: data.answer,
          faqId: data.faqId,
          matched: data.matched,
          question: userQuestion,
        },
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          text: 'Unable to connect to the server. Please make sure the backend is running and try again.',
          matched: false,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  async function sendFeedback(message, index, helpful) {
    if (feedbackGiven[index] !== undefined) return

    try {
      const response = await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          faqId: message.faqId,
          question: message.question,
          helpful,
        }),
      })

      if (!response.ok) throw new Error('Feedback failed')

      setFeedbackGiven(prev => ({
        ...prev,
        [index]: helpful,
      }))
    } catch {
      alert('Unable to submit feedback. Please try again.')
    }
  }

  function startNewChat() {
    setMessages([welcomeMessage])
    setQuestion('')
    setFeedbackGiven({})
  }

  function chooseSuggestion(value) {
    setQuestion(value)
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">A</div>
          <div>
            <h2>AskMate</h2>
            <span>FAQ ASSISTANT</span>
          </div>
        </div>

        <button className="new-chat-button" onClick={startNewChat}>
          <span>＋</span> New conversation
        </button>

        <div className="sidebar-section">
          <p className="sidebar-label">YOUR ASSISTANT</p>

          <div className="assistant-card">
            <div className="assistant-avatar">A</div>
            <div>
              <h3>AskMate AI</h3>
              <p><span className="status-dot"></span> Ready to help</p>
            </div>
          </div>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-help-icon">✦</div>
          <h3>Need a little help?</h3>
          <p>Ask questions about HTML, CSS, JavaScript, React and more.</p>
        </div>

        <div className="sidebar-footer">
          <span className="footer-avatar">S</span>
          <div>
            <strong>AskMate User</strong>
            <span>Welcome aboard!</span>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-arrow">/</span>
            <strong>Chat Assistant</strong>
          </div>

          <div className="topbar-status">
            <span className="status-dot"></span>
            Assistant online
          </div>
        </header>

        <section className="chat-container">
          <div className="chat-heading">
            <div className="heading-tag">
              <span>✦</span> YOUR WEB DEVELOPMENT GUIDE
            </div>
            <h1>What can I help you <span>learn?</span></h1>
            <p>Ask a question and get clear, instant answers.</p>
          </div>

          <div className="chat-box">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message-row ${message.role}`}
              >
                <div className={`avatar ${message.role}-avatar`}>
                  {message.role === 'bot' ? 'A' : 'U'}
                </div>

                <div className="message-content">
                  <div className="message-meta">
                    <strong>
                      {message.role === 'bot' ? 'AskMate' : 'You'}
                    </strong>
                    {message.role === 'bot' && (
                      <span className="ai-label">ASSISTANT</span>
                    )}
                  </div>

                  <div className="message-bubble">
                    {message.text}
                  </div>

                  {message.role === 'bot' && message.matched && (
                    <div className="feedback">
                      {feedbackGiven[index] !== undefined ? (
                        <span className="feedback-thanks">
                          ✓ Thanks for your feedback!
                        </span>
                      ) : (
                        <>
                          <span>Was this answer helpful?</span>
                          <button
                            aria-label="Helpful"
                            title="Helpful"
                            onClick={() => sendFeedback(message, index, true)}
                          >
                            👍
                          </button>
                          <button
                            aria-label="Not helpful"
                            title="Not helpful"
                            onClick={() => sendFeedback(message, index, false)}
                          >
                            👎
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {messages.length === 1 && !loading && (
              <div className="suggestions">
                <p className="suggestion-heading">TRY ASKING</p>

                <div className="suggestion-grid">
                  {suggestions.map((item, index) => (
                    <button
                      className="suggestion-card"
                      key={index}
                      onClick={() => chooseSuggestion(item.title)}
                    >
                      <span className="suggestion-icon">{item.icon}</span>
                      <span className="suggestion-title">{item.title}</span>
                      <span className="suggestion-description">
                        {item.description}
                      </span>
                      <span className="suggestion-arrow">↗</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="message-row bot">
                <div className="avatar bot-avatar">A</div>
                <div className="message-content">
                  <div className="message-meta">
                    <strong>AskMate</strong>
                    <span className="ai-label">ASSISTANT</span>
                  </div>
                  <div className="typing-bubble">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <form className="input-area" onSubmit={sendMessage}>
            <div className="input-icon">✦</div>

            <input
              type="text"
              placeholder="Ask anything about web development..."
              value={question}
              onChange={e => setQuestion(e.target.value)}
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading || !question.trim()}
              aria-label="Send message"
            >
              Send <span>➤</span>
            </button>
          </form>

          <p className="footer-text">
            AskMate uses keyword-based FAQ matching to find relevant answers.
          </p>
        </section>
      </main>
    </div>
  )
}

export default App