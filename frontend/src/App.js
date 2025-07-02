import React, { useState } from 'react';

function App() {
  const [post, setPost] = useState('');
  const [loading, setLoading] = useState(false);

  const generatePost = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/generate-post');
      const data = await response.json();
      setPost(data.post);
    } catch (error) {
      console.error('Error generating post:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyContent = () => {
    navigator.clipboard.writeText(post);
    alert('Post copied to clipboard!');
  };

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f4f4f9',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h1 style={{
          color: '#333',
          fontSize: '2rem',
          marginBottom: '20px'
        }}>AI News LinkedIn Post Generator</h1>
        <button
          onClick={generatePost}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#007BFF',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '20px',
            transition: 'background-color 0.3s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#007BFF'}
        >
          Generate Latest AI News LinkedIn Post
        </button>
        {loading && <p style={{ color: '#007BFF', fontSize: '18px' }}>Loading...</p>}
        <textarea
          readOnly
          value={post}
          style={{
            width: '100%',
            height: '200px',
            marginTop: '20px',
            fontSize: '14px',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            backgroundColor: '#f9f9f9',
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
        />
        <button
          onClick={copyContent}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#28A745',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '20px',
            transition: 'background-color 0.3s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#1e7e34'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#28A745'}
        >
          Copy
        </button>
      </div>
    </div>
  );
}

export default App;
