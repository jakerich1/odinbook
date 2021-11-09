/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-return-assign */
import { useEffect, useState, React } from 'react';
import { useAuth } from '../../useAuth';
import {
  fetchPosts,
} from '../../api/api';
import Post from '../Post/Post';
import TopNav from '../TopNav/TopNav';
import SideNav from '../SideNav/SideNav';
import DashRequest from '../DashRequest/DashRequest';
import './style.scss';
import SubmitPost from '../SubmitPost/SubmitPost';

function Dashboard() {
  const auth = useAuth();

  const compJwt = localStorage.getItem('jwt-fe');

  // Post state
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState([]);
  const [refresh, setRefresh] = useState(true);
  const [fetchingPosts, setFetchingPosts] = useState(false);

  // Fetch posts whenever the page changes or the refresh state changes
  useEffect(() => {
    setFetchingPosts(true);
    let isSubscribed = true;

    if (auth.user && compJwt) {
      fetchPosts(page).then((res) => {
        if (isSubscribed) {
          const updatedPosts = [...posts];
          res.data.forEach((element) => {
            updatedPosts.push(element);
          });
          setFetchingPosts(false);
          setPosts(updatedPosts);
        }
      }).catch((error) => {
        if (isSubscribed) {
          setPage(1);
          setFetchingPosts(false);
          auth.setErrorMessage(error.message);
          auth.setErrorModal(true);
        }
      });
    }

    return () => isSubscribed = false;
  }, [auth.user, page, refresh, compJwt]);

  return (
    <div className="dashboard-wrap">
      <TopNav />
      <main>
        <SideNav />

        <div className="timeline">

          <SubmitPost
            setPosts={setPosts}
            setRefresh={setRefresh}
            refresh={refresh}
            setPage={setPage}
          />

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
              image={postVal.image}
            />
          ))}

          <svg style={{ display: fetchingPosts ? 'block' : 'none', margin: 'auto', marginTop: '1em' }} xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-rotate-clockwise" width="80" height="80" viewBox="0 0 24 24" strokeWidth="1" stroke="#9e9e9e" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M4.05 11a8 8 0 1 1 .5 4m-.5 5v-5h5" />
          </svg>

          <button type="button" style={{ display: fetchingPosts ? 'none' : 'block' }} className="more-posts" onClick={() => setPage(page + 1)}>
            More posts
          </button>
          `
        </div>

        <div className="nav-right">
          <DashRequest />
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
