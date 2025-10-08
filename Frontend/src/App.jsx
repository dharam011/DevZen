import { useEffect, useState, useRef } from 'react'
import "prismjs/themes/prism-tomorrow.css"
import prism from "prismjs"
import Markdown from "react-markdown"
import Editor from "react-simple-code-editor"
import axios from "axios"
import config from './config'
import './App.css'
import TypeWriter from './components/TypeWriter'

function App() {
  const [count, setCount] = useState(0)
  const [code, setCode] = useState(
    `// Write your code here`
  )
  const [review, setReview] = useState('')
  const [output, setOutput] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [isLoading, setIsLoading] = useState(false)

  // For the chat functionality
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: 'Hello! I\'m CODG, your coding assistant. I can help you with coding questions or review your code. What would you like to know?' }
  ])

  // For resizable panels
  const [leftWidth, setLeftWidth] = useState(37.5)
  const [rightWidth, setRightWidth] = useState(37.5)
  const [chatWidth, setChatWidth] = useState(25)

  // Add a state to track if we're on mobile
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Only enable resize handlers on desktop
  const startResizeLeft = (e) => {
    if (isMobile) return;
    e.preventDefault();
    document.addEventListener('mousemove', resizeLeft);
    document.addEventListener('mouseup', stopResize);
  };

  const startResizeRight = (e) => {
    if (isMobile) return;
    e.preventDefault();
    document.addEventListener('mousemove', resizeRight);
    document.addEventListener('mouseup', stopResize);
  };

  const resizeLeft = (e) => {
    const rect = document.querySelector('.content').getBoundingClientRect();
    const containerWidth = rect.width;
    const leftDivWidth = ((e.clientX - rect.left) / containerWidth) * 100;

    // Enforce minimum widths (10%)
    if (leftDivWidth < 10 || leftDivWidth > 90 - chatWidth) {
      return;
    }

    // Calculate remaining width for other panels
    const remainingWidth = 100 - leftDivWidth - chatWidth;

    setLeftWidth(leftDivWidth);
    setRightWidth(remainingWidth);
  };

  const resizeRight = (e) => {
    const contentRect = document.querySelector('.content').getBoundingClientRect();
    const rightRect = document.querySelector('.right').getBoundingClientRect();

    const containerWidth = contentRect.width;
    const posX = e.clientX - contentRect.left;
    const rightStart = rightRect.left - contentRect.left;

    const rightDivWidth = (posX - rightStart) / containerWidth * 100;
    const remainingWidth = 100 - leftWidth - rightDivWidth;

    // Enforce minimum widths
    if (rightDivWidth < 10 || remainingWidth < 10) {
      return;
    }

    setRightWidth(rightDivWidth);
    setChatWidth(remainingWidth);
  };

  const stopResize = () => {
    document.removeEventListener('mousemove', resizeLeft);
    document.removeEventListener('mousemove', resizeRight);
  };

  useEffect(() => {
    prism.highlightAll()
  })

  // Add this effect to forcibly enable scrolling
  useEffect(() => {
    // Force scroll capability on all editor elements
    const editorElements = document.querySelectorAll('.code, .code > div, .code textarea, .code pre');
    editorElements.forEach(el => {
      if (el) {
        el.style.overflow = 'auto';
        el.style.maxHeight = 'none';
        el.style.minHeight = '100%';
      }
    });
  }, []);

  // Add this effect to sync scrolling between textarea and pre
  useEffect(() => {
    const syncScroll = () => {
      const textarea = document.getElementById('codeEditor');
      if (textarea) {
        const pre = textarea.nextElementSibling;
        if (pre) {
          pre.scrollTop = textarea.scrollTop;
          pre.scrollLeft = textarea.scrollLeft;
        }
      }
    };

    // Add event listeners for scroll sync
    const textarea = document.getElementById('codeEditor');
    if (textarea) {
      textarea.addEventListener('scroll', syncScroll);
      return () => textarea.removeEventListener('scroll', syncScroll);
    }
  }, [code]); // Re-attach when code changes

  // Add a ref to the textarea
  const editorRef = useRef(null);

  // Keep the editor optimized for large files
  const handleCodeChange = (newCode) => {
    // Only re-render if content actually changed (performance optimization)
    if (newCode !== code) {
      setCode(newCode);

      // For large files, don't auto-scroll unless typing at bottom
      const textarea = document.querySelector('.code textarea');
      if (textarea) {
        const isAtBottom = Math.abs((textarea.scrollHeight - textarea.scrollTop) - textarea.clientHeight) < 50;

        // Only auto-scroll if already near bottom
        if (isAtBottom) {
          setTimeout(() => {
            textarea.scrollTop = textarea.scrollHeight;
          }, 10);
        }
      }
    }
  };

  // Update highlighting when code changes
  useEffect(() => {
    const highlightedCode = prism.highlight(
      code,
      prism.languages[language] || prism.languages.javascript,
      language
    );

    const highlightElement = document.getElementById('code-highlight');
    if (highlightElement) {
      highlightElement.innerHTML = highlightedCode;

      // Sync scroll position
      const textarea = editorRef.current;
      highlightElement.scrollTop = textarea ? textarea.scrollTop : 0;
    }
  }, [code, language]);

  // Sync scroll positions between textarea and highlighting
  const handleScroll = () => {
    const textarea = editorRef.current;
    const highlightElement = document.getElementById('code-highlight');

    if (textarea && highlightElement) {
      highlightElement.scrollTop = textarea.scrollTop;
      highlightElement.scrollLeft = textarea.scrollLeft;
    }
  };

  async function reviewCode() {
    setIsLoading(true);
    try {
      const response = await axios.post(`${config.API_BASE_URL}${config.endpoints.REVIEW}`, {
        code: code,
        language: language
      });
      setReview(response.data);
      setOutput('');
    } catch (error) {
      setReview('Error getting review: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function getOutput() {
    setIsLoading(true);
    try {
      const response = await axios.post(`${config.API_BASE_URL}${config.endpoints.OUTPUT}`, {
        code: code,
        language: language
      });
      setOutput(response.data);
      setReview('');
    } catch (error) {
      setOutput('Error executing code: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function sendChatMessage(e) {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    // Add user message to chat
    const userMessage = { role: 'user', content: chatMessage };
    setChatHistory(prev => [...prev, userMessage]);
    setChatMessage('');

    try {
      // Show thinking indicator
      setChatHistory(prev => [...prev, { role: 'assistant', content: '...', isLoading: true }]);

      // Call API
      const response = await axios.post(`${config.API_BASE_URL}${config.endpoints.CHAT}`, {
        message: userMessage.content
      });

      // Remove thinking indicator and add response
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory.pop(); // Remove loading indicator
        return [...newHistory, { role: 'assistant', content: response.data }];
      });
    } catch (error) {
      // Update with error message
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory.pop(); // Remove loading indicator
        return [...newHistory, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }];
      });
    }
  }

  // Content to display in the right panel
  const contentToDisplay = review || output;

  // Add detection for mobile keyboard
  useEffect(() => {
    // Check if we're on a mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // Handle virtual keyboard appearing/disappearing
      const handleFocus = () => {
        document.body.classList.add('keyboard-visible');
        // Scroll the textarea into view
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, 300);
      };

      const handleBlur = () => {
        document.body.classList.remove('keyboard-visible');
      };

      // Add listeners to textarea
      const textarea = editorRef.current;
      if (textarea) {
        textarea.addEventListener('focus', handleFocus);
        textarea.addEventListener('blur', handleBlur);

        return () => {
          textarea.removeEventListener('focus', handleFocus);
          textarea.removeEventListener('blur', handleBlur);
        };
      }
    }
  }, []);

  // Fix for iOS Safari issues with position:fixed elements
  useEffect(() => {
    const handleTouchMove = (e) => {
      if (e.target.closest('.code-textarea')) {
        // Allow scrolling within the textarea
        e.stopPropagation();
      }
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Apply syntax highlighting on load and code changes
  useEffect(() => {
    prism.highlightAll();
  }, [code]);

  return (
    <>
      <main>
        <div className="top">
          <div className="head">
            <img src="" alt="" />
            <h1>Code Review</h1>
          </div>
        </div>

        <div className="content">
          <div className="left" style={{ width: isMobile ? '100%' : `${leftWidth}%` }}>
            <div className="language-selector">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="ruby">Ruby</option>
                <option value="php">PHP</option>
              </select>
            </div>

            <div className="code">
              {isMobile ? (
                <textarea
                  className="mobile-code-textarea"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck="false"
                />
              ) : (
                <Editor
                  value={code}
                  onValueChange={isMobile ? setCode : handleCodeChange}
                  highlight={code => prism.highlight(code, prism.languages[language] || prism.languages.javascript, language)}
                  padding={isMobile ? 12 : 10}
                  tabSize={2}
                  insertSpaces={true}
                  style={{
                    fontFamily: '"Fira code", "Fira Mono", monospace',
                    fontSize: isMobile ? 14 : 16,
                    lineHeight: 1.5,
                    borderRadius: 10,
                    border: "1px solid #ddd",
                    minHeight: isMobile ? '400px' : 'auto',
                  }}
                />
              )}
            </div>

            <div className="buttons">
              <button onClick={reviewCode} disabled={isLoading}>
                {isLoading && (review !== '') ? 'Loading...' : 'Review'}
              </button>
              <button onClick={getOutput} disabled={isLoading}>
                {isLoading && (output !== '') ? 'Loading...' : 'Output'}
              </button>
            </div>
          </div>

          {!isMobile && <div className="resize-handle" onMouseDown={startResizeLeft}></div>}

          <div className="right" style={{ width: isMobile ? '100%' : `${rightWidth}%` }}>
            {isLoading ? (
              <div className="loading">Processing your request...</div>
            ) : contentToDisplay ? (
              <TypeWriter content={contentToDisplay} speed={5} />
            ) : (
              <div className="placeholder">Your code review or output will appear here</div>
            )}
          </div>

          {!isMobile && <div className="resize-handle" onMouseDown={startResizeRight}></div>}

          <div className="chat" style={{ width: isMobile ? '100%' : `${chatWidth}%` }}>
            <div className="chat-messages">
              {chatHistory.map((msg, index) => (
                <div key={index} className={`chat-message ${msg.role}`}>
                  {msg.isLoading ? (
                    <div className="typing-indicator">
                      <span></span><span></span><span></span>
                    </div>
                  ) : (
                    <div className="message-content"><Markdown>{msg.content}</Markdown></div>
                  )}
                </div>
              ))}
            </div>
            <form className="chat-input" onSubmit={sendChatMessage}>
              <input
                type="text"
                placeholder="Ask CODG a question..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
              />
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}

export default App
