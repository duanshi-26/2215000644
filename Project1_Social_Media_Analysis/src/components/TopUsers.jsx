// src/components/TopUsers.js
import React, { useState, useEffect } from 'react';
import { getPosts, getComments, getUsers } from '../api/socialMediaApi';
import '../styles/TopUsers.css';

function TopUsers() {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopUsers = async () => {
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
        
        // Map posts to their authors
        const postsByUser = postsData.reduce((acc, post) => {
          if (!acc[post.userId]) {
            acc[post.userId] = [];
          }
          acc[post.userId].push({
            ...post,
            commentCount: commentCountByPost[post.id] || 0
          });
          return acc;
        }, {});
        
        // Calculate total comments per user
        const userCommentStats = Object.keys(postsByUser).map(userId => {
          const userPosts = postsByUser[userId];
          const totalComments = userPosts.reduce((sum, post) => sum + post.commentCount, 0);
          const user = usersData.find(u => u.id.toString() === userId);
          
          return {
            userId,
            username: user ? user.username : `User ${userId}`,
            name: user ? user.name : `Unknown User`,
            totalComments,
            posts: userPosts
          };
        });
        
        // Sort by total comments and get top 5
        const top5Users = userCommentStats
          .sort((a, b) => b.totalComments - a.totalComments)
          .slice(0, 5);
          
        setTopUsers(top5Users);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching top users:', err);
        setError('Failed to load top users. Please try again later.');
        setLoading(false);
      }
    };

    fetchTopUsers();
    
    // Refresh data every 60 seconds
    const intervalId = setInterval(fetchTopUsers, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  if (loading) return <div className="loading">Loading top users...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="top-users-container">
      <h2>Top 5 Users with Most Commented Posts</h2>
      
      <div className="users-list">
        {topUsers.map((user, index) => (
          <div key={user.userId} className="user-card">
            <div className="rank">#{index + 1}</div>
            <div className="user-info">
              <h3>{user.name} (@{user.username})</h3>
              <p>Total Comments: <strong>{user.totalComments}</strong></p>
              <div className="posts-summary">
                <p>Most Commented Posts:</p>
                <ul>
                  {user.posts
                    .sort((a, b) => b.commentCount - a.commentCount)
                    .slice(0, 3)
                    .map(post => (
                      <li key={post.id}>
                        "{post.title.substring(0, 30)}..." - {post.commentCount} comments
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopUsers;
