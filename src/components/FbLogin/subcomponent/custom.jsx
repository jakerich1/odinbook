import { React } from 'react';
import PropTypes from 'prop-types';

function Custom(props) {
  const { onClick } = props;
  return (
    <button type="button" onClick={onClick}>Login</button>
  );
}

Custom.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default Custom;
