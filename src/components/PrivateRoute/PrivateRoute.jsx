/* eslint-disable react/jsx-props-no-spreading */
import { React } from 'react';
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../useAuth';

function PrivateRoute({ children, ...rest }) {
  const auth = useAuth();

  const redirectCondition = ({ location }) => {
    if (auth.loading) {
      return (<>Loading</>);
    } if (auth.user) {
      return (children);
    }
    return (
      <Redirect
        to={{
          pathname: '/',
          state: { from: location },
        }}
      />
    );
  };

  return (
    <Route
      {...rest}
      render={({ location }) => redirectCondition(location)}
    />
  );
}

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PrivateRoute;
