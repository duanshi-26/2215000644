import React, { useState, useEffect, useRef } from 'react';
import { getPosts, getComments, getUsers } from '../api/socialMediaApi';
import '../styles/Feed.css';

function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userMap, setUserMap] = useState({});
  const [commentMap, setCommentMap] = useState({});
  
  // For handling real-time updates
  const lastFetchTimeRef = useRef(null);
  
  const fetchData = async (initialLoad = false) => {
    try {
      if (initialLoad) {
        setLoading(true);
      }

      if (initialLoad || Object.keys(userMap).length === 0) {
        const usersData = await getUsers();
        const mappedUsers = usersData.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {});
        setUserMap(mappedUsers);
      }

      const [postsData, commentsData] = await Promise.all([
        getPosts(),
        getComments()
      ]);

      const newCommentMap = commentsData.reduce((acc, comment) => {
        if (!acc[comment.postId]) {
          acc[comment.postId] = [];
        }
        acc[comment.postId].push(comment);
        return acc;
      }, {});
      setCommentMap(newCommentMap);

      const sortedPosts = postsData
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setPosts(sortedPosts);
      setLoading(false);
      lastFetchTimeRef.current = new Date();
    } catch (err) {
      console.error('Error fetching feed data:', err);
      setError(`Failed to load feed: ${err.message}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial data load
    fetchData(true);
    
    // Set up polling for real-time updates
    const intervalId = setInterval(() => fetchData(false), 10000);
    
    return () => clearInterval(intervalId);
  }, []);

  if (loading) return <div className="loading">Loading feed...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="feed-container">
      <h2>Latest Posts</h2>
      
      <div className="feed-list">
        {posts.length === 0 ? (
          <p>No posts found.</p>
        ) : (
          posts.map(post => {
            const author = userMap[post.userId] || { username: 'Unknown', name: 'Unknown User' };
            const comments = commentMap[post.id] || [];
            
            return (
              <div key={post.id} className="feed-post">
                <div className="post-header">
                  <h3>{post.title}</h3>
                  <div className="post-meta">
                    <p className="author">By: {author.name} (@{author.username})</p>
                    <p className="date">{new Date(post.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="post-body">
                  <p>{post.body}</p>
                </div>
                
                <div className="post-footer">
                  <span className="comment-count">{comments.length} comments</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Feed;