import React, { useState } from 'react';
import PostSelectionDialog from './PostSelectionDialog';

function LinkedInAIGenerator() {
  const [post, setPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [allPosts, setAllPosts] = useState([]); // Store all posts
  const [showDialog, setShowDialog] = useState(false);

  const generatePost = async () => {
    console.log('generatePost function called');
    setLoading(true);
    try {
      console.log('Fetching data from API...');
      const response = await fetch('http://localhost:8000/generate-post');
      console.log('API response received:', response);
      const data = await response.json();
      console.log('Parsed JSON data:', data);

      if (data.response && Array.isArray(data.response)) {
        console.log('Valid response received, processing top 5 news items...');
        const top5News = data.response.slice(0, 5);
        const formattedPost = `🚨 Here are the Top 5 AI headlines you shouldn't miss this week:\n\n` +
          top5News.map((item, index) => (
            `${index + 1}. ${item.heading}\n   ${item.summary}\n   source: ${item.source}\n\n`
          )).join('') +
          `The AI space is moving fast ⚡—and it’s not always easy to keep up. I’ll keep sharing what stands out: key trends, bold moves, and stories worth knowing.

If you’re into AI 🤖 or just curious about where things are headed, follow along! Happy to connect and chat more anytime 

#ArtificialIntelligence #AI #MachineLearning #TechNews #TrendingNow
`;
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
    const formattedPost = `🚨 Here are the Top 5 AI headlines you shouldn't miss this week:\n\n` +
      selectedPosts.map((item, index) => (
        `${index + 1}. ${item.heading}\n   ${item.summary}\n   source: ${item.source}\n\n`
      )).join('') +
      `The AI space is moving fast ⚡—and it’s not always easy to keep up. I’ll keep sharing what stands out: key trends, bold moves, and stories worth knowing.

If you’re into AI 🤖 or just curious about where things are headed, follow along! Happy to connect and chat more anytime 

#ArtificialIntelligence #AI #MachineLearning #TechNews #TrendingNow
`;

    setPost(formattedPost);
    setShowDialog(false);
  };

  return (
    <div style={{
      backgroundColor: '#fff',
      padding: '30px',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      maxWidth: '600px',
      width: '100%',
      textAlign: 'center',
      marginTop: '50px',
    }}>
      <h1 style={{
        color: '#333',
        fontSize: '2rem',
        marginBottom: '20px'
      }}>🤖 AI News LinkedIn Post Generator</h1>
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
        ✨ Generate Latest AI News LinkedIn Post ✨
      </button>
      {loading && <p style={{ color: '#007BFF', fontSize: '18px' }}>⏳ Loading...</p>}
      <textarea
        value={post}
        style={{
          width: '100%',
          height: '500px',
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
          backgroundColor: '#6c757d',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px',
          marginLeft: '10px',
          transition: 'background-color 0.3s'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
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
  );
}

export default LinkedInAIGenerator;
