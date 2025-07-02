import React, { useState } from 'react';
import PostSelectionDialog from './PostSelectionDialog';

function App() {
  const [post, setPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [allPosts, setAllPosts] = useState([]); // Store all posts
  const [showDialog, setShowDialog] = useState(false);

  const generatePost = async () => {
    console.log('generatePost function called');
    setLoading(true);
    try {
      console.log('Fetching data from API...');
      const response = await fetch('http://localhost:5000/generate-post');
      console.log('API response received:', response);
      const data = await response.json();
      console.log('Parsed JSON data:', data);

      if (data.response && Array.isArray(data.response)) {
        console.log('Valid response received, processing top 3 news items...');
        const top3News = data.response.slice(0, 3);
        const formattedPost = `Here are my picks for Today's Top 3 AI News:\n\n` +
          top3News.map((item, index) => (
            `${index + 1}. ${item.heading}\n   ${item.summary}\n   source: ${item.source}\n\n`
          )).join('') +
          `The AI landscape is evolving rapidly, and staying informed is key to understanding where the field is headed.\n\nFollow me for more updates on the latest AI breakthroughs, talent trends, and industry insights!`;

        console.log('Formatted post:', formattedPost);
        setPost(formattedPost);
        setAllPosts(data.response); // Store all posts for selection
      } else {
        console.warn('No valid news items found in response.');
        setPost('No valid news items found.');
      }
    } catch (error) {
      console.error('Error generating post:', error);
      setPost('Failed to generate post. Please try again later.');
    } finally {
      console.log('generatePost function execution completed.');
      setLoading(false);
    }
  };

  const copyContent = () => {
    navigator.clipboard.writeText(post);
    alert('Post copied to clipboard!');
  };

  const handleModifySelection = () => {
    setShowDialog(true);
  };

  const handleDialogClose = () => {
    setShowDialog(false);
  };

  const handleDialogSave = (selectedPosts) => {
    const formattedPost = `Here are my picks for Today's Top 3 AI News:\n\n` +
      selectedPosts.map((item, index) => (
        `${index + 1}. ${item.heading}\n   ${item.summary}\n   source: ${item.source}\n\n`
      )).join('') +
      `The AI landscape is evolving rapidly, and staying informed is key to understanding where the field is headed.\n\nFollow me for more updates on the latest AI breakthroughs, talent trends, and industry insights!`;

    setPost(formattedPost);
    setShowDialog(false);
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
        <button
          onClick={handleModifySelection}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#6c757d', // Changed to gray
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '20px',
            marginLeft: '10px',
            transition: 'background-color 0.3s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'} // Adjusted hover color to a darker gray
          onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'} // Adjusted back to gray
        >
          Modify Post Selection
        </button>
        {showDialog && (
          <PostSelectionDialog
            posts={allPosts}
            onClose={handleDialogClose}
            onSave={handleDialogSave}
          />
        )}
      </div>
    </div>
  );
}

export default App;
