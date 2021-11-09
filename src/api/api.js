/* eslint-disable no-param-reassign */
const axios = require('axios');

const apiInstance = axios.create({
  baseURL: 'https://odinbook-back.herokuapp.com/',
  timeout: 10000,
  headers: {
    Accepted: 'appication/json',
    'Content-Type': 'application/json',
  },
});

apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt-fe');
    if (token) {
      config.headers.authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Post handling

export const fetchPosts = async (page) => apiInstance.get(`post/?page=${page}`);

export const fetchMyPosts = async () => apiInstance.get('user/myposts');

export const submitPost = async (postContent, imgUrl) => apiInstance.post('post/', { content: postContent, image: imgUrl });

export const likePost = async (postId) => apiInstance.post(`post/${postId}/like`, {});

export const fetchPostInfo = async (postId) => apiInstance.get(`post/${postId}/info`);

export const fetchUserPosts = async (userId) => apiInstance.get(`user/${userId}/posts`);

export const deletePost = async (postId) => apiInstance.delete(`post/${postId}`);

// Comment handling

export const fetchComments = async (postId) => apiInstance.get(`comment/?postId=${postId}`);

export const submitComment = async (content, postId) => apiInstance.post('comment/', { content, postId });

export const likeComment = async (commentId) => apiInstance.post(`comment/${commentId}/like`, {});

export const fetchCommentInfo = async (commentId) => apiInstance.get(`comment/${commentId}/info`);

export const deleteComment = async (commentId) => apiInstance.delete(`comment/${commentId}`);

// Friend request handling

export const fetchRequests = async () => apiInstance.get('user/request');

export const acceptRequest = async (requestId) => apiInstance.put(`user/request/${requestId}`, {});

export const declineRequest = async (requestId) => apiInstance.delete(`user/request/${requestId}`);

export const sendFriendRequest = async (userId) => apiInstance.post(`user/${userId}/request`, {});

export const fetchUserRequests = async (userId) => apiInstance.get(`user/${userId}/request`);

export const fetchUsers = async () => apiInstance.get('user/users');

export const fetchFriendsId = async () => apiInstance.get('user/friendsId');

// Authentication / User handling

export const userInfo = async (userId) => apiInstance.get(`user/${userId}`);

export const updateRelationship = async (statusVal) => apiInstance.put('user/relationship', { status: statusVal });

export const updateProfilePicture = async (url) => apiInstance.put('user/picture', { path: url });

export const callSignIn = async (token) => apiInstance.post(`auth/facebook?access_token=${token}`);

export const callCheckAuth = async () => apiInstance.get('user/');

export const deleteUser = async () => apiInstance.delete('user');

// Error handling

export const submitError = async (errorMessage) => apiInstance.post('error/', { content: errorMessage });

// Image upload handling

export const getS3Url = async () => apiInstance.get('s3/');
