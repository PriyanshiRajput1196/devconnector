import React, { useState } from "react";
import PropTypes from "prop-types";
import { addPost } from "../../actions/post";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

const AddPost = ({ addPost, history }) => {
  const [text, setText] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    addPost({ text }, history);
    setText("");
  };

  return (
    <div className="post-form">
      <div className="bg-primary p">
        <h3>Say Something...</h3>
      </div>
      <form className="form my-1" onSubmit={(e) => onSubmit(e)}>
        <textarea
          name="text"
          value={text}
          cols="30"
          rows="5"
          placeholder="Create a post"
          onChange={(e) => {
            setText(e.target.value);
          }}
          required
        ></textarea>
        <input type="submit" className="btn btn-dark my-1" value="Submit" />
      </form>
    </div>
  );
};

AddPost.propTypes = {
  addPost: PropTypes.func.isRequired,
};

export default connect(null, { addPost })(withRouter(AddPost));
