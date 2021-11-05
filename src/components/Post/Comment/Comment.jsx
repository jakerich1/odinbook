/* eslint-disable camelcase */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-return-assign */
/* eslint-disable no-underscore-dangle */
import jwt_decode from 'jwt-decode';
import { useEffect, useState, React } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../../useAuth';
import { likeComment, fetchCommentInfo, deleteComment } from '../../../api/api';
import './style.scss';

function Comment(props) {
  const auth = useAuth();

  const {
    _id,
    uid,
    profilePicture,
    content,
    firstName,
    lastName,
  } = props;

  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [liking, setLiking] = useState(false);
  const [infoRefresh, setInfoRefresh] = useState(true);

  // Post deletion state
  const [isUsersComment, setIsUsersComment] = useState(false);
  const [delVisible, setDelvisible] = useState(false);
  const [commentDeleted, setCommentDeleted] = useState(false);

  const checkDelClick = (e) => {
    if (e.target.className !== 'del-btn' && e.target.tagName !== 'svg') {
      setDelvisible(false);
    }
  };

  const handleDelete = () => {
    deleteComment(_id).then(() => {
    }).catch((error) => {
      auth.setErrorMessage(error.message);
      auth.setErrorModal(true);
    });
    setCommentDeleted(true);
  };

  const handleLike = async () => {
    setLiking(true);
    likeComment(_id).then(() => {
      setInfoRefresh(!infoRefresh);
      setLiking(false);
    }).catch((error) => {
      auth.setErrorMessage(error.message);
      auth.setErrorModal(true);
      setLiking(false);
    });
  };

  useEffect(() => {
    if (localStorage.getItem('jwt-fe')) {
      if (jwt_decode(localStorage.getItem('jwt-fe'))._id === uid) {
        setIsUsersComment(true);
      }
    }

    window.addEventListener('click', checkDelClick);

    let isSubscribed = true;
    fetchCommentInfo(_id).then((res) => {
      if (isSubscribed) {
        setLikes(res.data.like_count);
        setLiked(!!res.data.is_liked);
      }
    }).catch((error) => {
      if (isSubscribed) {
        auth.setErrorMessage(error.message);
        auth.setErrorModal(true);
      }
    });
    return () => {
      isSubscribed = false;
      window.removeEventListener('click', checkDelClick);
    };
  }, [infoRefresh, _id]);

  return (
    <div style={{ display: commentDeleted ? 'none' : 'flex' }} className="comment">
      <div
        className="mini-profile"
        style={{
          backgroundImage: `url(${profilePicture})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="comment-body">
        <div className="comment-content">
          <div style={{ display: likes ? 'flex' : 'none' }} className="like-overlay">
            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-thumb-up" width="16" height="16" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#ffffff" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M7 11v8a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-7a1 1 0 0 1 1 -1h3a4 4 0 0 0 4 -4v-1a2 2 0 0 1 4 0v5h3a2 2 0 0 1 2 2l-1 5a2 3 0 0 1 -2 2h-7a3 3 0 0 1 -3 -3" />
            </svg>
            {likes}
          </div>
          <div className="comment-head">
            <Link to={`/u/${uid}`}>
              {`${firstName} ${lastName}`}
            </Link>
            <svg style={{ display: isUsersComment ? 'block' : 'none' }} onClick={() => { setDelvisible(!delVisible); }} xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-dots" width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#9e9e9e" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <circle cx="5" cy="12" r="1" />
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
            </svg>
            <div style={{ display: delVisible ? 'block' : 'none' }} className="com-del-box">
              <button onClick={handleDelete} type="button">Delete comment</button>
            </div>
          </div>
          <div className="comment-message">
            {content}
          </div>
        </div>
        <div role="button" tabIndex="0" onClick={handleLike} className="comment-control">
          <svg style={{ marginTop: '8px', display: liking ? 'block' : 'none' }} xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-rotate-clockwise" width="18" height="18" viewBox="0 0 24 24" strokeWidth="1" stroke="#9e9e9e" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M4.05 11a8 8 0 1 1 .5 4m-.5 5v-5h5" />
          </svg>
          <span style={{ display: liking ? 'none' : 'block' }}>{liked ? 'unlike' : 'like'}</span>
        </div>
      </div>
    </div>
  );
}

Comment.propTypes = {
  _id: PropTypes.string.isRequired,
  uid: PropTypes.string.isRequired,
  profilePicture: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
};

export default Comment;
