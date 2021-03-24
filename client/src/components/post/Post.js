import React, { Fragment, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { getPost } from "../../actions/post";
import Spinner from "../layout/Spinner";
import Comments from "./Comments";
import AddComment from "./AddComment";

const Post = ({ getPost, post: { post, loading }, match }) => {
  useEffect(() => {
    getPost(match.params.id);
  }, [getPost]);

  return (
    <Fragment>
      {loading || post === null ? (
        <Spinner />
      ) : (
        <Fragment>
          <Link to="/posts" className="btn">
            Back To Posts
          </Link>
          <div className="post bg-white p-1 my-1">
            <div>
              <Link to={`/profile/${post.user}`}>
                <img className="round-img" src={post.avatar} alt="" />
                <h4>{post.name}</h4>
              </Link>
            </div>
            <div>
              <p className="my-1">{post.text}</p>
            </div>
          </div>

          {/*Leave a comment */}
          <div class="post-form">
            <AddComment postId={post._id} />
          </div>

          {post.comments !== null &&
            post.comments.map((comment) => (
              <Comments comment={comment} key={comment._id} postId={post._id} />
            ))}
        </Fragment>
      )}
    </Fragment>
  );
};

Post.propTypes = {
  post: PropTypes.object.isRequired,
  getPost: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  post: state.post,
});
export default connect(mapStateToProps, { getPost })(Post);
