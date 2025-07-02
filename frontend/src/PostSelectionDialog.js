import React, { useState } from 'react';

function PostSelectionDialog({ posts, onClose, onSave }) {
  const [selectedPosts, setSelectedPosts] = useState([]);

  const toggleSelection = (post) => {
    setSelectedPosts((prev) => {
      if (prev.includes(post)) {
        return prev.filter((p) => p !== post);
      } else {
        return [...prev, post].slice(0, 3); // Limit to 3 selections
      }
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '10px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
      }}>
        <h2>Select 3 Posts</h2>
        <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left' }}>
          {posts.map((post, index) => (
            <li key={index} style={{ marginBottom: '10px' }}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedPosts.includes(post)}
                  onChange={() => toggleSelection(post)}
                  disabled={!selectedPosts.includes(post) && selectedPosts.length >= 3}
                />
                {post.heading}
              </label>
            </li>
          ))}
        </ul>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <button onClick={() => onSave(selectedPosts)} style={{ padding: '10px 20px', backgroundColor: '#007BFF', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>OK</button>
          <button onClick={onClose} style={{ padding: '10px 20px', backgroundColor: '#DC3545', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default PostSelectionDialog;
