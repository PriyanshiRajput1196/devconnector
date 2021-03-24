import {
  ADD_POST,
  DELETE_POST,
  GET_POSTS,
  POST_ERR,
  UPDATE_LIKES,
  GET_POST,
  ADD_COMMENT,
  DELETE_COMMENT,
} from "./types";
import axios from "axios";
import { setAlert } from "./alert";

//Fetch all posts
export const getPosts = () => async (dispatch) => {
  try {
    console.log("Get posts called");
    const res = await axios.get("http://localhost:5000/api/posts");
    console.log(res.data);
    dispatch({
      type: GET_POSTS,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: POST_ERR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

//Add a like
export const addLike = (postId) => async (dispatch) => {
  try {
    const res = await axios.put(
      `http://localhost:5000/api/posts/like/${postId}`
    );

    dispatch({
      type: UPDATE_LIKES,
      payload: { postId, likes: res.data },
    });
  } catch (err) {
    dispatch({
      type: POST_ERR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

//Remove a like
export const removeLike = (postId) => async (dispatch) => {
  try {
    const res = await axios.put(
      `http://localhost:5000/api/posts/unlike/${postId}`
    );

    dispatch({
      type: UPDATE_LIKES,
      payload: { postId, likes: res.data },
    });
  } catch (err) {
    dispatch({
      type: POST_ERR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

//Delete post
export const deletePost = (postId) => async (dispatch) => {
  try {
    await axios.delete(`http://localhost:5000/api/posts/${postId}`);

    dispatch({
      type: DELETE_POST,
      payload: postId,
    });

    dispatch(setAlert("Post removed", "success"));
  } catch (err) {
    dispatch({
      type: POST_ERR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

//Add post
export const addPost = (text, history) => async (dispatch) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const res = await axios.post(
      "http://localhost:5000/api/posts",
      text,
      config
    );
    dispatch({
      type: ADD_POST,
      payload: res.data,
    });
    dispatch(setAlert("Post added", "success"));

    history.push("/posts");
  } catch (err) {
    const errors = err.response.data.errors;
    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, "danger")));
    }
    dispatch({
      type: POST_ERR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

//Get post
export const getPost = (id) => async (dispatch) => {
  try {
    const res = await axios.get(`http://localhost:5000/api/posts/${id}`);
    dispatch({
      type: GET_POST,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: POST_ERR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

//Add Comment
export const addComment = (postId, text) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    console.log(text, postId);
    const res = await axios.post(
      `http://localhost:5000/api/posts/comment/${postId}`,
      text,
      config
    );
    console.log(res.data);
    dispatch({
      type: ADD_COMMENT,
      payload: res.data,
    });

    dispatch(setAlert("Comment added", "success"));
  } catch (err) {
    console.log(err);
    const errors = err.response.data.errors;
    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, "danger")));
    }
    dispatch({
      type: POST_ERR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

//Delete Comment
export const removeComment = (postId, commentId) => async (dispatch) => {
  try {
    await axios.delete(
      `http://localhost:5000/api/posts/comment/${postId}/${commentId}`
    );
    dispatch({
      type: DELETE_COMMENT,
      payload: commentId,
    });

    dispatch(setAlert("Comment removed", "success"));
  } catch (err) {
    console.log(err);
    const errors = err.response.data.errors;
    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, "danger")));
    }
    dispatch({
      type: POST_ERR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};
