/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
import { DateTime } from 'luxon';
import Dropzone from 'react-dropzone';
import { useEffect, useState, React } from 'react';
import jwt_decode from 'jwt-decode';
import {
  fetchMyPosts, userInfo, updateRelationship, getS3Url, updateProfilePicture,
} from '../../api/api';
import Post from '../Post/Post';
import TopNav from '../TopNav/TopNav';
import SideNav from '../SideNav/SideNav';
import { useAuth } from '../../useAuth';
import './style.scss';

function Profile() {
  const auth = useAuth();

  // User image state
  const [preview, setPreview] = useState(false);
  const [formFile, setFormFile] = useState(false);
  const [imageForm, setImageForm] = useState(false);
  const [dropZoneBack, setDropzoneBack] = useState('#dddddd');
  const [submittingImage, setSubmittingImage] = useState(false);

  // User info state
  const [name, setName] = useState('');
  const [created, setCreated] = useState('');
  const [picture, setPicture] = useState('./images/placeholder.png');

  // User posts state
  const [posts, setPosts] = useState([]);
  const [fetchingPosts, setFetchingPosts] = useState(false);

  // Relationship edit state
  const [relationship, setRelationship] = useState('');
  const [newRelationship, setNewRelationship] = useState('');
  const [relationshipError, setRelationshipError] = useState('');
  const [editRelationship, setEditRelationship] = useState(false);

  const handleCloseModal = (e) => {
    const targetId = e.target.id;
    if (targetId === 'image-modal') {
      setImageForm(false);
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

    if (preview && formFile) {
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

        updateProfilePicture(imageUrl);

        setSubmittingImage(false);
        setPreview(false);
        setFormFile(false);
        setImageForm(false);
      } catch (error) {
        auth.setErrorMessage(error.message);
        auth.setErrorModal(true);
        setSubmittingImage(false);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('click', handleCloseModal);

    return () => { window.removeEventListener('click', handleCloseModal); };
  }, []);

  // Submit new relationship
  const handleRelationship = (e) => {
    e.preventDefault();
    if (newRelationship.length === 0) {
      setRelationshipError('please enter a new relationship status');
    } else if (newRelationship.length > 50) {
      setRelationshipError('new relationship status can\'t be longer then 50 characters');
    } else {
      setRelationshipError('');
      updateRelationship(newRelationship).then((res) => {
        setRelationship(res.data);
        setEditRelationship(false);
      }).catch((error) => {
        auth.setErrorMessage(error.message);
        auth.setErrorModal(true);
      });
    }
  };

  // Update state value of new relationship
  const handleRelationshipVal = (e) => {
    setRelationshipError('');
    setNewRelationship(e.target.value);
  };

  // Fetch users info on page load to populate navbar
  useEffect(() => {
    let isSubscribed = true;

    if (localStorage.getItem('jwt-fe')) {
      userInfo(jwt_decode(localStorage.getItem('jwt-fe'))._id).then((res) => {
        setCreated(DateTime.fromISO(res.data.created).toLocaleString(DateTime.DATE_MED));
        setName(`${res.data.facebook.firstName} ${res.data.facebook.lastName}`);
        setPicture(res.data.profilePicture);
        setRelationship(res.data.relationshipStatus);
      }).catch((error) => {
        if (isSubscribed) {
          auth.setErrorMessage(error.message);
          auth.setErrorModal(true);
        }
      });
    }

    return () => { isSubscribed = false; };
  }, []);

  // Fetch users posts
  useEffect(() => {
    let isSubscribed = true;
    fetchMyPosts().then((res) => {
      if (isSubscribed) {
        setFetchingPosts(false);
        setPosts(res.data);
      }
    }).catch((error) => {
      if (isSubscribed) {
        auth.setErrorMessage(error.message);
        auth.setErrorModal(true);
      }
    });

    return () => { isSubscribed = false; };
  }, []);

  return (
    <div>
      <TopNav />
      <main>
        <SideNav />
        <div className="profile-cont">
          <header>
            <div id="im-form-open" role="button" tabIndex="0" onClick={() => { setImageForm(true); }} className="pic-cont">
              <div
                id="im-form-img"
                style={{
                  backgroundImage: `url(${picture})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div id="im-form-hov" className="hover-overlay">
                Change image
              </div>
              <div id="image-modal" style={{ display: imageForm ? 'flex' : 'none' }}>
                <div className="im-mod-cont">
                  <form onSubmit={(e) => { handleProfileSubmit(e); }}>
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
                                <p style={{ margin: '2em' }}>Drag &apos;n&apos; drop a new profile image here, or click to select file</p>
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
                    <button id="profile-submit" type="submit">{submittingImage ? 'submitting' : 'Submit'}</button>
                  </form>
                </div>
              </div>
            </div>
            <div className="bio">
              <div>{name}</div>
              <div>{`Joined ${created}`}</div>
              <div style={{ display: editRelationship ? 'none' : 'flex' }} className="relationship">
                {`Relationship status: ${relationship}`}
                <svg onClick={() => { setEditRelationship(true); }} xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-edit" width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#9e9e9e" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M9 7h-3a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-3" />
                  <path d="M9 15h3l8.5 -8.5a1.5 1.5 0 0 0 -3 -3l-8.5 8.5v3" />
                  <line x1="16" y1="5" x2="19" y2="8" />
                </svg>
              </div>
              <div style={{ display: editRelationship ? 'flex' : 'none' }} className="edit-relationship">
                <div className="r-form">
                  <input type="text" onInput={handleRelationshipVal} value={newRelationship} placeholder="Enter relationship status" />
                  <svg onClick={handleRelationship} xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-send" width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#9e9e9e" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                    <path d="M21 3l-6.5 18a0.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a0.55 .55 0 0 1 0 -1l18 -6.5" />
                  </svg>
                  <svg onClick={() => { setEditRelationship(false); }} xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-circle-x" width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#ffffff" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <circle cx="12" cy="12" r="9" />
                    <path d="M10 10l4 4m0 -4l-4 4" />
                  </svg>
                </div>
                <div className="r-error">{relationshipError}</div>
              </div>
            </div>
          </header>
          <section>
            <svg style={{ display: fetchingPosts ? 'block' : 'none' }} xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-rotate-clockwise" width="80" height="80" viewBox="0 0 24 24" strokeWidth="1" stroke="#9e9e9e" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M4.05 11a8 8 0 1 1 .5 4m-.5 5v-5h5" />
            </svg>

            {posts.map((postVal) => (
              <Post
                key={postVal._id}
                _id={postVal._id}
                uid={postVal.user._id}
                profilePicture={postVal.user.profilePicture}
                content={postVal.content}
                firstName={postVal.user.facebook.firstName}
                lastName={postVal.user.facebook.lastName}
                createdFormat={postVal.createdFormat}
              />
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}

export default Profile;
