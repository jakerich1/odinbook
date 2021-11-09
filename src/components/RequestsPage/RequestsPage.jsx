/* eslint-disable no-underscore-dangle */
import { React, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TopNav from '../TopNav/TopNav';
import SideNav from '../SideNav/SideNav';
import { fetchRequests, declineRequest, acceptRequest } from '../../api/api';
import './style.scss';
import { useAuth } from '../../useAuth';

function RequestsPage() {
  const auth = useAuth;

  const [issuedRequests, setIssuedRequests] = useState([]);
  const [recievedRequests, setRecievedRequests] = useState([]);
  const [fetchingRequests, setFetchingRequests] = useState(false);
  const [toggleRequests, setToggleRequests] = useState(true);

  const handleCancel = async (requestId) => {
    declineRequest(requestId).then(() => {
      setRecievedRequests([]);
      setFetchingRequests([]);
      setToggleRequests(!toggleRequests);
    }).catch((error) => {
      auth.setErrorMessage(error.message);
      auth.setErrorModal(true);
    });
  };

  const handleAccept = async (requestId) => {
    acceptRequest(requestId).then(() => {
      setRecievedRequests([]);
      setFetchingRequests([]);
      setToggleRequests(!toggleRequests);
    }).catch((error) => {
      auth.setErrorMessage(error.message);
      auth.setErrorModal(true);
    });
  };

  useEffect(() => {
    let isSubscribed = true;
    setFetchingRequests(true);
    fetchRequests().then((res) => {
      if (isSubscribed) {
        setIssuedRequests(res.data.issuer_requests);
        setRecievedRequests(res.data.recipient_requests);
        setFetchingRequests(false);
      }
    }).catch((error) => {
      if (isSubscribed) {
        auth.setErrorMessage(error.message);
        auth.setErrorModal(true);
        setFetchingRequests(false);
      }
    });
    return () => { isSubscribed = false; };
  }, [toggleRequests]);

  return (
    <div>
      <TopNav />
      <main>
        <SideNav />
        <div id="requests-wrap">
          <div className="sub-head">
            <h1>Recieved friend requests</h1>
          </div>
          <div className="grid-cont">
            {fetchingRequests ? 'Loading' : ''}
            {recievedRequests.map((request) => (
              <div key={request._id} className="friend-item">
                <Link to={`/u/${request.issuer._id}`}>
                  <div
                    className="mini-user-profile"
                    style={{
                      backgroundImage: `url(${request.issuer.profilePicture})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <div className="name">
                    {`${request.issuer.facebook.firstName} ${request.issuer.facebook.lastName}`}
                  </div>
                </Link>
                <div className="action-area">
                  <button
                    onClick={() => { handleAccept(request._id); }}
                    className="accept-request"
                    type="button"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => { handleCancel(request._id); }}
                    className="cancel-request"
                    type="button"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="sub-head">
            <h1>Sent requests</h1>
          </div>
          <div className="grid-cont">
            {fetchingRequests ? 'Loading' : ''}
            {issuedRequests.map((request) => (
              <div key={request._id} className="friend-item">
                <Link to={`/u/${request.recipient._id}`}>
                  <div
                    className="mini-user-profile"
                    style={{
                      backgroundImage: `url(${request.recipient.profilePicture})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <div className="name">
                    {`${request.recipient.facebook.firstName} ${request.recipient.facebook.lastName}`}
                  </div>
                </Link>
                <button onClick={() => { handleCancel(request._id); }} className="cancel-request" type="button">Cancel request</button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default RequestsPage;
