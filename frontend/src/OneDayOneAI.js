import React, { useEffect, useState } from 'react';

function OneDayOneAI() {
  const [data, setData] = useState({ topicName: '', simpleDescription: '', detailedDescription: '', didYouKnowFacts: [] });
  const [loading, setLoading] = useState(false); // Add loading state

  useEffect(() => {
    setLoading(true); // Set loading to true before fetching
    fetch('http://localhost:5000/one-day-one-ai')
      .then(response => response.json())
      .then(data => {
        setData(data.topic);
        setLoading(false); // Set loading to false after fetching
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false); // Set loading to false on error
      });
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f4f9' }}>
        <p style={{ color: '#007BFF', fontSize: '18px' }}>⏳ Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', backgroundColor: '#f4f4f9', flexWrap: 'wrap', gap: '20px', padding: '20px' }}>
      <div style={{ flex: '1 1 300px', maxWidth: '600px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 6px 10px rgba(0, 0, 0, 0.15)', padding: '20px', textAlign: 'left' }}>
        <h2 style={{ textAlign: 'center', color: '#333', fontSize: '24px' }}>🌟 One Day One AI 🌟</h2>
        <h3 style={{ color: '#555', marginBottom: '10px', fontSize: '20px' }}>📌 {data.topicName}</h3>
        <br />
        <p style={{ color: '#666', marginBottom: '10px', fontSize: '16px' }}><strong>📝 Simple Description:</strong> <br /> <br /> {data.simpleDescription}</p>
        <br />
        <p style={{ color: '#666', fontSize: '16px' }}><strong>📖 Detailed Description:</strong> <br /> <br /> <span dangerouslySetInnerHTML={{ __html: data.detailedDescription }} /></p>
      </div>
      {data.didYouKnowFacts.length > 0 && (
        <div style={{ flex: '1 1 300px', maxWidth: '400px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 6px 10px rgba(0, 0, 0, 0.15)', padding: '20px', textAlign: 'center' }}>
          <h4 style={{ textAlign: 'center', color: '#333', fontSize: '20px' }}>💡 Did You Know?</h4>
          <ul style={{ color: '#666', paddingLeft: '20px', fontSize: '16px', listStyleType: 'none', padding: 0, textAlign: 'left' }}>
            {data.didYouKnowFacts.map((fact, index) => (
              <li key={index} style={{ marginBottom: '10px' }}>✨ {fact}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default OneDayOneAI;
