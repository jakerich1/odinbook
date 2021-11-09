/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
import { React, useEffect, useState } from 'react';
import Dropzone from 'react-dropzone';
import jwt_decode from 'jwt-decode';
import PropTypes from 'prop-types';
import { useAuth } from '../../useAuth';
import { submitPost, userInfo, getS3Url } from '../../api/api';
import './style.scss';

function SubmitPost(props) {
  const auth = useAuth();

  // User info state
  const [name, setName] = useState('');
  const [picture, setPicture] = useState('');

  // POst state
  const [post, setPost] = useState('');

  // Post image state
  const [imageModal, setImageModal] = useState(false);
  const [preview, setPreview] = useState(false);
  const [formFile, setFormFile] = useState(false);
  const [dropZoneBack, setDropzoneBack] = useState('#dddddd');
  const [submittingImage, setSubmittingImage] = useState(false);
  const [imgUrl, setImgUrl] = useState('');

  // Fetch users info on page load to populate navbar
  useEffect(() => {
    let isSubscribed = true;

    if (localStorage.getItem('jwt-fe')) {
      userInfo(jwt_decode(localStorage.getItem('jwt-fe'))._id).then((res) => {
        setName(res.data.facebook.firstName);
        setPicture(res.data.profilePicture);
      }).catch((error) => {
        if (isSubscribed) {
          auth.setErrorMessage(error.message);
          auth.setErrorModal(true);
        }
      });
    }

    return () => { isSubscribed = false; };
  }, []);

  const handleCloseModal = (e) => {
    const targetId = e.target.id;
    if (targetId === 'image-modal') {
      setImageModal(false);
    }
  };

  const displayImg = (file) => {
    if (file[0]) {
      setPreview(URL.createObjectURL(file[0]));
      setFormFile(file[0]);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (preview && formFile && submittingImage === false) {
      setSubmittingImage(true);
      try {
        const response = await getS3Url();
        const url = response.data;

        await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'mulitpart/form-data',
          },
          body: formFile,
        });

        const imageUrl = url.split('?')[0];

        setImgUrl(imageUrl);

        setSubmittingImage(false);
        setPreview(false);
        setFormFile(false);
        setImageModal(false);
      } catch (error) {
        auth.setErrorMessage(error.message);
        auth.setErrorModal(true);
        setSubmittingImage(false);
      }
    }
  };

  // Set onclick for modal view
  useEffect(() => {
    window.addEventListener('click', handleCloseModal);

    return () => { window.removeEventListener('click', handleCloseModal); };
  }, []);

  // Auto grow text area for new post
  function autoGrow(e) {
    e.target.style.height = '5px';
    e.target.style.height = `${e.target.scrollHeight}px`;
  }

  // Handle post submit
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (post.length === 0) { return; }

    submitPost(post, imgUrl).then(() => {
      setPost('');
      props.setPosts([]);
      props.setPage(1);
      props.setRefresh(!props.refresh);
      setImgUrl('');
    }).catch((error) => {
      auth.setErrorMessage(error.message);
      auth.setErrorModal(true);
    });
  };

  return (
    <div className="new-post">
      <form onSubmit={handleSubmit}>
        <div className="top">
          <div
            className="dash-profile"
            style={{
              backgroundImage: `url(${picture})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <textarea name="post" value={post} onInput={(e) => { setPost(e.target.value); autoGrow(e); }} placeholder={`Whats on your mind, ${name}?`} />
          <svg onClick={() => { setImageModal(!imageModal); }} xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-photo" width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#9e9e9e" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <line x1="15" y1="8" x2="15.01" y2="8" />
            <rect x="4" y="4" width="16" height="16" rx="3" />
            <path d="M4 15l4 -4a3 5 0 0 1 3 0l5 5" />
            <path d="M14 14l1 -1a3 5 0 0 1 3 0l2 2" />
          </svg>
          <div style={{ display: imageModal ? 'flex' : 'none' }} id="image-modal">
            <div className="im-mod-cont">
              {preview ? ''
                : (
                  <Dropzone
                    onDragEnter={() => { setDropzoneBack('#a7a7a7'); }}
                    onDragLeave={() => { setDropzoneBack('#dddddd'); }}
                    onDrop={(acceptedFiles) => { displayImg(acceptedFiles); }}
                    maxFiles={1}
                    maxSize={4000000}
                    accept="image/jpeg, image/png"
                  >
                    {({ getRootProps, getInputProps }) => (
                      <section
                        className="dropzone"
                        style={{ background: dropZoneBack }}
                      >
                        <div {...getRootProps()}>
                          <input {...getInputProps()} />
                          <p style={{ padding: '2em' }}>
                            Drag &apos;n&apos; drop a new profile image here,
                            or click to select file
                          </p>
                        </div>
                      </section>
                    )}
                  </Dropzone>
                )}
              {preview ? (
                <div className="preview-img">
                  <svg onClick={() => { setPreview(false); }} xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-circle-x" width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#ffffff" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <circle cx="12" cy="12" r="9" />
                    <path d="M10 10l4 4m0 -4l-4 4" />
                  </svg>
                  <img src={preview} alt="preview" />
                </div>
              ) : ''}
              <div className="info">
                Only png or jpeg allowed
                <br />
                Max file size 4Mb
              </div>
              <button onClick={handleProfileSubmit} id="profile-submit" style={{ background: submittingImage ? 'grey' : '#1877f2' }} type="button">{submittingImage ? 'uploading' : 'add'}</button>
            </div>
          </div>
        </div>
        <div className="divider" />
        {imgUrl ? <img id="post-image" alt="post content" src={imgUrl} /> : ''}
        <div className="submit">
          <div
            className="dash-profile-submit"
            style={{
              backgroundImage: `url(${picture})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <button type="submit">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

SubmitPost.propTypes = {
  setPosts: PropTypes.func.isRequired,
  setPage: PropTypes.func.isRequired,
  setRefresh: PropTypes.func.isRequired,
  refresh: PropTypes.bool.isRequired,
};

export default SubmitPost;
