/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
import { React, useEffect, useState } from 'react';
import jwt_decode from 'jwt-decode';
import { Link } from 'react-router-dom';
import { userInfo } from '../../api/api';
import { useAuth } from '../../useAuth';
import './style.scss';

function TopNav() {
  const auth = useAuth();

  const [name, setName] = useState('');
  const [picture, setPicture] = useState('./images/placeholder.png');

  // Fetch users info on page load to populate navbar
  useEffect(() => {
    let isSubscribed = true;

    if (localStorage.getItem('jwt-fe')) {
      userInfo(jwt_decode(localStorage.getItem('jwt-fe'))._id).then((res) => {
        if (isSubscribed) {
          setName(res.data.facebook.firstName);
          setPicture(res.data.profilePicture);
        }
      }).catch((error) => {
        if (isSubscribed) {
          auth.setErrorMessage(error.message);
          auth.setErrorModal(true);
        }
      });
    }

    return () => { isSubscribed = false; };
  }, []);

  return (
    <nav>
      <Link to="/"><h1>OdinBook</h1></Link>
      <div className="nav-control">
        <Link to="/profile">
          <div className="profile">
            <div
              className="nav-image"
              style={{
                backgroundImage: `url(${picture})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div>{name}</div>
          </div>
        </Link>
        <button type="button" onClick={auth.signout}>
          <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-logout" width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" stroke="white" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
            <path d="M7 12h14l-3 -3m0 6l3 -3" />
          </svg>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default TopNav;
