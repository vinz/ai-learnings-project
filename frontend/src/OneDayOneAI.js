import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

function OneDayOneAI() {
  const [data, setData] = useState({ topicName: '', simpleDescription: '', detailedDescription: '', didYouKnowFacts: [] });
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [popupContent, setPopupContent] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:8000/one-day-one-ai')
      .then(response => response.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  const handleAskQuestion = () => {
    fetch('http://localhost:8000/ask-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        context: {
          topicName: data.topicName,
          simpleDescription: data.simpleDescription,
          detailedDescription: data.detailedDescription,
        },
      }),
    })
      .then(response => response.json())
      .then(answer => {
        console.log('Received answer:', answer.answer);
        const formattedAnswer = answer.answer.replace(/\n/g, '<br>');
        setPopupContent({ question: question, answer: formattedAnswer });
      })
      .catch(error => {
        console.error('Error asking question:', error);
      });
  };

  const closePopup = () => {
    setPopupContent(null);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f4f9' }}>
        <p style={{ color: '#007BFF', fontSize: '18px' }}>⏳ Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', backgroundColor: '#f4f4f9', flexWrap: 'wrap', gap: '20px', padding: '20px' }}>
      {/* First column */}
      <div style={{ flex: '1 1 300px', maxWidth: '600px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 6px 10px rgba(0, 0, 0, 0.15)', padding: '20px', textAlign: 'left' }}>
        <h2 style={{ textAlign: 'center', color: '#333', fontSize: '28px', position: 'relative' }}>
          🌟 One Day One AI 🌟
          <span
            style={{ cursor: 'pointer', marginLeft: '5px', color: '#007BFF', fontSize: '24px' }}
            title="Learn one new AI term a day"
          >
            ?
          </span>
        </h2>
        <h3 style={{ color: '#555', marginBottom: '10px', fontSize: '24px' }}>📌 {data.topicName}</h3>
        <br />
        <p style={{ color: '#666', marginBottom: '10px', fontSize: '18px' }}><strong>📝 Simple Description:</strong> <br /> <br /> {data.simpleDescription}</p>
        <br />
        <p style={{ color: '#666', fontSize: '18px' }}><strong>📖 Detailed Description:</strong> <br /> <br /> <span dangerouslySetInnerHTML={{ __html: data.detailedDescription }} /></p>
        <br />
        <p style={{ color: '#666', fontSize: '18px' }}><strong>🌍 Real World Example:</strong> <br /> <br /> <span dangerouslySetInnerHTML={{ __html: data.realworldExample }} /></p>
      </div>

      {/* Second column */}
      <div style={{ flex: '1 1 300px', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {data.didYouKnowFacts && data.didYouKnowFacts.length > 0 && (
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 6px 10px rgba(0, 0, 0, 0.15)', padding: '20px', textAlign: 'center' }}>
            <h4 style={{ textAlign: 'center', color: '#333', fontSize: '24px' }}>💡 Did You Know?</h4>
            <ul style={{ color: '#666', paddingLeft: '20px', fontSize: '20px', listStyleType: 'none', padding: 0, textAlign: 'left' }}>
              {data.didYouKnowFacts.map((fact, index) => (
                <li key={index} style={{ marginBottom: '10px' }}>✨ {fact}</li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 6px 10px rgba(0, 0, 0, 0.15)', padding: '20px', textAlign: 'center' }}>
          <h4 style={{ textAlign: 'center', color: '#333', fontSize: '20px' }}>❓ Ask a Question</h4>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAskQuestion();
              }
            }}
            placeholder="Type your question here..."
            style={{ width: '90%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem' }}
          />
          <button
            onClick={handleAskQuestion}
            style={{ padding: '10px 20px', backgroundColor: '#007BFF', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Ask
          </button>
        </div>
      </div>

      {/* Popup dialog */}
      {popupContent && (
        ReactDOM.createPortal(
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#fff', padding: '3rem', borderRadius: '12px', width: '800px', fontSize: '1.2rem' }}>
              <h3 style={{ color: '#333', marginBottom: '10px' }}>{popupContent.question}</h3>
              <p style={{ color: '#666', marginBottom: '20px' }} dangerouslySetInnerHTML={{ __html: popupContent.answer }} />
              <button
                onClick={closePopup}
                style={{ padding: '10px 20px', backgroundColor: '#007BFF', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>,
          document.body
        )
      )}
    </div>
  );
}

export default OneDayOneAI;
