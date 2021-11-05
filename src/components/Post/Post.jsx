/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-return-assign */
/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable no-underscore-dangle */
// eslint-disable-next-line camelcase
import jwt_decode from 'jwt-decode';
import { useState, useEffect, React } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../useAuth';
import {
  likePost, fetchPostInfo, fetchComments, submitComment, deletePost,
} from '../../api/api';
import Comment from './Comment/Comment';
import './style.scss';

function Post(props) {
  const auth = useAuth();

  const {
    _id,
    uid,
    profilePicture,
    content,
    firstName,
    lastName,
    createdFormat,
    image,
  } = props;

  // Post state
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [refreshInfo, setRefreshInfo] = useState(true);
  const [fetchingInfo, setFetchingInfo] = useState(false);

  // Post deletion state
  const [isUsersPost, setIsUsersPost] = useState(false);
  const [delVisible, setDelvisible] = useState(false);
  const [postDeleted, setPostDeleted] = useState(false);

  // Comment state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [viewComment, setViewComment] = useState(false);
  const [refreshContent, setRefreshContent] = useState(true);
  const [fetchingComments, setFetchingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const checkDelClick = (e) => {
    if (e.target.className !== 'del-btn' && e.target.tagName !== 'svg') {
      setDelvisible(false);
    }
  };

  const handleDeletePost = () => {
    deletePost(_id).then(() => {
      setPostDeleted(true);
    }).catch((error) => {
      auth.setErrorMessage(error.message);
      auth.setErrorModal(true);
    });
  };

  // Lifecycle method to get info of post
  useEffect(() => {
    if (localStorage.getItem('jwt-fe')) {
      if (jwt_decode(localStorage.getItem('jwt-fe'))._id === uid) {
        setIsUsersPost(true);
      }
    }

    window.addEventListener('click', checkDelClick);

    let isSubscribed = true;
    setFetchingInfo(true);
    fetchPostInfo(_id).then((res) => {
      if (isSubscribed) {
        setCommentCount(res.data.comment_count);
        setLikeCount(res.data.like_count);
        setLiked(res.data.is_liked);
        setFetchingInfo(false);
      }
    }).catch((error) => {
      if (isSubscribed) {
        auth.setErrorMessage(error.message);
        auth.setErrorModal(true);
        setFetchingInfo(false);
      }
    });
    return () => {
      isSubscribed = false;
      window.removeEventListener('click', checkDelClick);
    };
  }, [_id, refreshInfo]);

  // Method to fetch comments of a post
  useEffect(() => {
    let isSubscribed = true;
    if (viewComment && commentCount > 0) {
      setFetchingComments(true);
      fetchComments(_id).then((res) => {
        if (isSubscribed) {
          setComments(res.data);
          setFetchingComments(false);
        }
      }).catch((error) => {
        if (isSubscribed) {
          auth.setErrorMessage(error.message);
          auth.setErrorModal(true);
          setFetchingComments(false);
        }
      });
    }
    return () => isSubscribed = false;
  }, [_id, viewComment, refreshContent, commentCount]);

  // Toggle liking of a post
  const toggleLike = async () => {
    likePost(_id).then(() => {
      setRefreshInfo(!refreshInfo);
    }).catch((error) => {
      auth.setErrorMessage(error.message);
      auth.setErrorModal(true);
    });
  };

  // Auto grow text area for new post
  function autoGrow(e) {
    e.target.style.height = '5px';
    e.target.style.height = `${e.target.scrollHeight}px`;
  }

  // Handle submit of new comment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newComment.length === 0) { return; }
    setSubmittingComment(true);

    submitComment(newComment, _id).then(() => {
      setSubmittingComment(false);
      setNewComment('');
      setRefreshInfo(!refreshInfo);
      setRefreshContent(!refreshContent);
    }).catch((error) => {
      auth.setErrorMessage(error.message);
      auth.setErrorModal(true);
      setNewComment('');
      setSubmittingComment(false);
    });
  };

  return (
    <article style={{ display: postDeleted ? 'none' : 'block' }}>
      <div className="article-head">
        <div
          className="post-pic"
          style={{
            backgroundImage: `url(${profilePicture})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="post-detail">
          <div className="detail-left">
            <div className="post-profile">
              <Link to={`/u/${uid}`}>{`${firstName} ${lastName}`}</Link>
            </div>
            <div className="post-date">
              {createdFormat}
            </div>
          </div>
          <div style={{ display: isUsersPost ? 'block' : 'none' }} className="post-action">
            <svg onClick={() => { setDelvisible(!delVisible); }} xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-dots" width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#9e9e9e" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <circle cx="5" cy="12" r="1" />
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
            </svg>
            <div style={{ display: delVisible ? 'block' : 'none' }} className="action-box">
              <button onClick={handleDeletePost} className="del-btn" type="button">Delete post</button>
            </div>
          </div>
        </div>
      </div>
      <div className="article-body">
        <div className="post-content">
          {content}
        </div>
        {image ? <img className="post-image" alt="post content" src={image} /> : ''}
        <div className="engagement">
          <div className="likes">
            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-thumb-up" width="16" height="16" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#ffffff" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M7 11v8a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-7a1 1 0 0 1 1 -1h3a4 4 0 0 0 4 -4v-1a2 2 0 0 1 4 0v5h3a2 2 0 0 1 2 2l-1 5a2 3 0 0 1 -2 2h-7a3 3 0 0 1 -3 -3" />
            </svg>
            <span style={{ display: fetchingInfo ? 'none' : 'block' }} className="like-number">
              {likeCount}
              {' '}
              {likeCount === 1 ? 'Like' : 'Likes'}
            </span>
            <svg style={{ display: fetchingInfo ? 'block' : 'none', background: 'none' }} xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-rotate-clockwise" width="16" height="16" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#9e9e9e" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M4.05 11a8 8 0 1 1 .5 4m-.5 5v-5h5" />
            </svg>
          </div>

          <div role="button" onClick={() => { setViewComment(!viewComment); }} style={{ display: fetchingInfo ? 'none' : 'flex' }} className="comments">
            {commentCount}
            {' '}
            {commentCount === 1 ? 'comment' : 'comments' }
          </div>

          <div style={{ display: fetchingInfo ? 'flex' : 'none' }} className="comments">
            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-rotate-clockwise" width="16" height="16" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#9e9e9e" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M4.05 11a8 8 0 1 1 .5 4m-.5 5v-5h5" />
            </svg>
          </div>
        </div>
      </div>
      <div className="article-control">
        <div role="button" onClick={toggleLike}>
          <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-thumb-up" width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#1877f2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M7 11v8a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-7a1 1 0 0 1 1 -1h3a4 4 0 0 0 4 -4v-1a2 2 0 0 1 4 0v5h3a2 2 0 0 1 2 2l-1 5a2 3 0 0 1 -2 2h-7a3 3 0 0 1 -3 -3" />
          </svg>
          { liked ? 'unlike' : 'Like' }
        </div>
        <div role="button" onClick={() => { setViewComment(!viewComment); }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-message-dots" width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#1877f2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M4 21v-13a3 3 0 0 1 3 -3h10a3 3 0 0 1 3 3v6a3 3 0 0 1 -3 3h-9l-4 4" />
            <line x1="12" y1="11" x2="12" y2="11.01" />
            <line x1="8" y1="11" x2="8" y2="11.01" />
            <line x1="16" y1="11" x2="16" y2="11.01" />
          </svg>
          Comment
        </div>
      </div>
      <div style={{ display: viewComment ? 'block' : 'none' }} className="article-comments">

        <svg style={{ display: fetchingComments ? 'block' : 'none', margin: 'auto' }} xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-rotate-clockwise" width="42" height="80" viewBox="0 0 24 24" strokeWidth="1" stroke="grey" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M4.05 11a8 8 0 1 1 .5 4m-.5 5v-5h5" />
        </svg>

        <div style={{ display: fetchingComments ? 'none' : 'block' }}>
          {comments.map((comment) => (
            <Comment
              key={comment._id}
              _id={comment._id}
              uid={comment.user._id}
              content={comment.content}
              profilePicture={comment.user.profilePicture}
              firstName={comment.user.facebook.firstName}
              lastName={comment.user.facebook.lastName}
            />
          ))}
        </div>

        <div className="write-comment">
          <form onSubmit={handleSubmit}>
            <textarea
              placeholder="write comment here"
              value={newComment}
              onInput={(e) => { setNewComment(e.target.value); autoGrow(e); }}
            />
            <button type="submit">
              <svg style={{ display: submittingComment ? 'block' : 'none' }} xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-rotate-clockwise" width="28" height="28" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#ffffff" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M4.05 11a8 8 0 1 1 .5 4m-.5 5v-5h5" />
              </svg>
              <span style={{ display: submittingComment ? 'none' : 'block' }}>
                submit
              </span>
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}

Post.propTypes = {
  _id: PropTypes.string.isRequired,
  uid: PropTypes.string.isRequired,
  profilePicture: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
  createdFormat: PropTypes.string.isRequired,
  image: PropTypes.string,
};

Post.defaultProps = {
  image: '',
};

export default Post;
