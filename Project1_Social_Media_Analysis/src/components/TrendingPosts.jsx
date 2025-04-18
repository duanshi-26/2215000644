import React, { useState, useEffect } from 'react';
import { getPosts, getComments, getUsers } from '../api/socialMediaApi';
import '../styles/TrendingPosts.css';

function TrendingPosts() {
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrendingPosts = async () => {
      try {
        setLoading(true);
        
        // Fetch all required data
        const [postsData, commentsData, usersData] = await Promise.all([
          getPosts(),
          getComments(),
          getUsers()
        ]);
        
        // Count comments per post
        const commentCountByPost = commentsData.reduce((acc, comment) => {
          acc[comment.postId] = (acc[comment.postId] || 0) + 1;
          return acc;
        }, {});
        
        // Enhance posts with comment count and author info
        const enhancedPosts = postsData.map(post => {
          const commentCount = commentCountByPost[post.id] || 0;
          const author = usersData.find(user => user.id === post.userId) || { username: 'Unknown', name: 'Unknown User' };
          
          return {
            ...post,
            commentCount,
            author
          };
        });
        
        // Find maximum comment count
        const maxComments = Math.max(...enhancedPosts.map(post => post.commentCount), 0);
        
        // Get all posts with the maximum comment count
        const trending = enhancedPosts
          .filter(post => post.commentCount === maxComments)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          
        setTrendingPosts(trending);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching trending posts:', err);
        setError('Failed to load trending posts. Please try again later.');
        setLoading(false);
      }
    };

    fetchTrendingPosts();
    
    // Refresh data every 30 seconds
    const intervalId = setInterval(fetchTrendingPosts, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  if (loading) return <div className="loading">Loading trending posts...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="trending-posts-container">
      <h2>Trending Posts</h2>
      
      {trendingPosts.length === 0 ? (
        <p>No trending posts found.</p>
      ) : (
        <div className="trending-posts-list">
          {trendingPosts.map(post => (
            <div key={post.id} className="trending-post-card">
              <div className="post-header">
                <h3>{post.title}</h3>
                <div className="post-meta">
                  <p className="author">By: {post.author.name} (@{post.author.username})</p>
                  <p className="date">{new Date(post.createdAt).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="post-body">
                <p>{post.body}</p>
              </div>
              
              <div className="post-stats">
                <span className="comment-count">{post.commentCount} comments</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TrendingPosts;
