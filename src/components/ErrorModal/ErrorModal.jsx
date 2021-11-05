import { React, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../useAuth';
import { submitError } from '../../api/api';
import './style.scss';

function Comment() {
  const auth = useAuth();
  const history = useHistory();

  const [success, setSuccess] = useState(false);

  const handleClick = (e) => {
    // Close modal if the user clicks on the overlay and not the modal itself
    if (e.target.id === 'modal-overlay') {
      auth.setErrorModal(false);
      history.push('/');
    }
  };

  useEffect(() => {
    window.addEventListener('click', handleClick);

    if (auth.errorMessage) {
      submitError(auth.errorMessage).then(() => {
        setSuccess(true);
      }).catch(() => {
        setSuccess(false);
      });
    }

    return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <div id="modal-overlay">
      <div id="error-modal">
        <div className="modal-head">
          <h1>Error</h1>
        </div>
        <div className="modal-body">
          {auth.errorMessage}
        </div>
        <div className="modal-foot">
          {success ? 'Error submitted to admin' : ''}
        </div>
      </div>
    </div>
  );
}

export default Comment;
