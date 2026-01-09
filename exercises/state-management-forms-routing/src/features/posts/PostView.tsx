import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../../app/store';
import { fetchPosts } from './postSlice';

const PostView = () => {
  const {loading,posts,error} = useSelector((state: RootState) => state.posts);
    const dispatch = useDispatch<AppDispatch>();
    useEffect(() => {
      dispatch(fetchPosts());
  },[])
    return (
      <div>
          {loading && <p>Loading posts...</p>}
          {error && <p>Error: {error}</p>}
          {!loading && !error && posts.map(post => (
              <div key={post.id}>
                  <h3>{post.title}</h3>
                  <p>{post.body}</p>
              </div>
          ))}
    </div>
  )
}

export default PostView