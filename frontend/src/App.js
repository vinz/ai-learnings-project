import React, { useState } from 'react';

function App() {
  const [post, setPost] = useState('');
  const [loading, setLoading] = useState(false); // New loading state

  const generatePost = async () => {
    setLoading(true); // Set loading to true when the request starts
    try {
      const response = await fetch('http://localhost:5000/generate-post');
      const data = await response.json();
      setPost(data.post);
    } catch (error) {
      console.error('Error generating post:', error);
    } finally {
      setLoading(false); // Set loading to false when the request ends
    }
  };

  const copyContent = () => {
    navigator.clipboard.writeText(post);
    alert('Post copied to clipboard!');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>AI News LinkedIn Post Generator</h1>
      <button onClick={generatePost} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Generate Latest AI News LinkedIn Post
      </button>
      {loading && <p>Loading...</p>} {/* Show loading indicator */}
      <br />
      <textarea
        readOnly
        value={post}
        style={{ width: '100%', height: '500px', marginTop: '20px', fontSize: '14px' }}
      />
      <br />
      <button onClick={copyContent} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Copy
      </button>
    </div>
  );
}

export default App;
