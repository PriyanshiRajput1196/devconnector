import axios from "axios";
import {
  CLEAR_PROFILE,
  GET_PROFILE,
  PROFILE_ERR,
  UPDATE_PROFILE,
  ACCOUNT_DELETED,
  GET_PROFILES,
  GET_REPOS,
} from "./types";
import { setAlert } from "./alert";

//fetch current user's profile
export const getCurrentProfile = () => async (dispatch) => {
  try {
    const res = await axios.get("http://localhost:5000/api/profile/me");
    console.log(res.data);
    dispatch({
      type: GET_PROFILE,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: PROFILE_ERR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

//Get all Profiles
export const getProfiles = () => async (dispatch) => {
  //Before loading profiles, we want to clear current profile so that there is no cached entry for safe side
  dispatch({ type: CLEAR_PROFILE });
  try {
    const res = await axios.get("http://localhost:5000/api/profile");

    dispatch({
      type: GET_PROFILES,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: PROFILE_ERR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

//Get Profile by user ID
export const getProfileById = (userId) => async (dispatch) => {
  try {
    const res = await axios.get(
      `http://localhost:5000/api/profile/user/${userId}`
    );

    dispatch({
      type: GET_PROFILE,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: PROFILE_ERR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

//Get github repos
export const getGithubRepos = (username) => async (dispatch) => {
  try {
    const res = await axios.get(
      `http://localhost:5000/api/profile/github/${username}`
    );

    dispatch({
      type: GET_REPOS,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: PROFILE_ERR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

//create profile
export const createProfile = (formData, history, edit = false) => async (
  dispatch
) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const res = await axios.post(
      "http://localhost:5000/api/profile",
      formData,
      config
    );
    dispatch({
      type: GET_PROFILE,
      payload: res.data,
    });

    dispatch(setAlert(edit ? "Profile Updated" : "Profile Created", "success"));

    history.push("/dashboard");
  } catch (err) {
    const errors = err.response.data.errors;
    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, "danger")));
    }
    dispatch({
      type: PROFILE_ERR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

//Add experience
export const addExperience = (formData, history) => async (dispatch) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const res = await axios.put(
      "http://localhost:5000/api/profile/experience",
      formData,
      config
    );
    dispatch({
      type: UPDATE_PROFILE,
      payload: res.data,
    });

    dispatch(setAlert("Experience added", "success"));

    history.push("/dashboard");
  } catch (err) {
    const errors = err.response.data.errors;
    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, "danger")));
    }
    dispatch({
      type: PROFILE_ERR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

//Add education
export const addEducation = (formData, history) => async (dispatch) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const res = await axios.put(
      "http://localhost:5000/api/profile/education",
      formData,
      config
    );
    dispatch({
      type: UPDATE_PROFILE,
      payload: res.data,
    });

    dispatch(setAlert("Education added", "success"));

    history.push("/dashboard");
  } catch (err) {
    const errors = err.response.data.errors;
    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, "danger")));
    }
    dispatch({
      type: PROFILE_ERR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

//Delete Experience
export const removeExperience = (id) => async (dispatch) => {
  try {
    const res = await axios.delete(
      `http://localhost:5000/api/profile/experience/${id}`
    );

    dispatch({
      type: UPDATE_PROFILE,
      payload: res.data,
    });

    dispatch(setAlert("Experience removed", "success"));
  } catch (err) {
    dispatch({
      type: PROFILE_ERR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

//Delete Education
export const deleteEducation = (id) => async (dispatch) => {
  try {
    const res = await axios.delete(
      `http://localhost:5000/api/profile/education/${id}`
    );
    dispatch({
      type: UPDATE_PROFILE,
      payload: res.data,
    });

    dispatch(setAlert("Education removed", "success"));
  } catch (err) {
    dispatch({
      type: PROFILE_ERR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

//Delete Account and profile
export const deleteAccount = () => async (dispatch) => {
  if (window.confirm("Are you sure?This can NOT be undone!")) {
    try {
      await axios.delete(`http://localhost:5000/api/profile`);
      dispatch({ type: CLEAR_PROFILE });
      dispatch({ type: ACCOUNT_DELETED });

      dispatch(setAlert("Your account has been permanently deleted"));
    } catch (err) {
      dispatch({
        type: PROFILE_ERR,
        payload: { msg: err },
      });
    }
  }
};
