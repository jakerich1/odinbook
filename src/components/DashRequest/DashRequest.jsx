/* eslint-disable no-underscore-dangle */
/* eslint-disable no-return-assign */
import { useEffect, useState, React } from 'react';
import { useAuth } from '../../useAuth';
import { fetchRequests, acceptRequest, declineRequest } from '../../api/api';
import './style.scss';

function DashRequest() {
  const auth = useAuth();

  const [request, setRequest] = useState(0);
  const [declining, setDeclining] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [toggleFetch, setToggleFetch] = useState(true);

  useEffect(() => {
    let isSubscribed = true;
    fetchRequests().then((res) => {
      if (isSubscribed) {
        setRequest(res.data.recipient_requests ? res.data.recipient_requests[0] : 0);
      }
    }).catch((error) => {
      auth.setErrorMessage(error.message);
      auth.setErrorModal(true);
    });
    return () => isSubscribed = false;
  }, [toggleFetch]);

  const acceptRequestClient = async () => {
    if (request) {
      setRequesting(true);
      acceptRequest(request._id).then(() => {
        setRequesting(false);
        setRequest(0);
        setToggleFetch(!toggleFetch);
      }).catch((error) => {
        setRequesting(false);
        auth.setErrorMessage(error.message);
        auth.setErrorModal(true);
      });
    }
  };

  const declineRequestClient = async () => {
    if (request) {
      setDeclining(true);
      declineRequest(request._id).then(() => {
        setDeclining(false);
        setRequest(0);
        setToggleFetch(!toggleFetch);
      }).catch((error) => {
        setDeclining(false);
        auth.setErrorMessage(error.message);
        auth.setErrorModal(true);
      });
    }
  };

  return (
    <div style={{ display: request ? 'block' : 'none' }} className="friend-request">
      <div className="fr-header">
        <div className="fr-head-title">
          Friend Requests
        </div>
      </div>
      <div className="fr-body">
        <div className="request-detail">
          <img src={request ? request.issuer.profilePicture : ''} alt="mini profile" />
          <div className="detail-name">
            {request ? request.issuer.facebook.firstName : ''}
            {' '}
            {request ? request.issuer.facebook.lastName : ''}
          </div>
        </div>
        <div className="fr-action">
          <button type="button" onClick={acceptRequestClient}>
            <svg style={{ display: requesting ? 'block' : 'none', marginLeft: '10px', marginRight: '10px' }} xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-rotate-clockwise" width="20" height="20" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#ffffff" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M4.05 11a8 8 0 1 1 .5 4m-.5 5v-5h5" />
            </svg>
            <span style={{ display: requesting ? 'none' : 'block' }}>accept</span>
          </button>
          <button type="button" onClick={declineRequestClient}>
            <svg style={{ display: declining ? 'block' : 'none', marginLeft: '10px', marginRight: '10px' }} xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-rotate-clockwise" width="20" height="20" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#ffffff" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M4.05 11a8 8 0 1 1 .5 4m-.5 5v-5h5" />
            </svg>
            <span style={{ display: declining ? 'none' : 'block' }}>decline</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashRequest;
