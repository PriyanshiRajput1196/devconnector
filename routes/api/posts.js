const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const Profile = require("../../models/Profile");
const Post = require("../../models/Post");

//@route: POST api/posts
//@Description: Create a Post
//@access: Private
router.post(
  "/",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();

      res.status(200).json(post);
    } catch (err) {
      console.log(err);
      res.status(500).json({ msg: "Server Error" });
    }
  }
);

//@route: Get api/posts
//@Description: Get all Post
//@access: Private
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.status(200).json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json("Server Error");
  }
});

//@route: Get api/posts/:id
//@Description: Get Post by id
//@access: Private
router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "No post found" });
    }
    res.status(200).json(post);
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "No post found" });
    }
    console.log(err);
    res.status(500).json("Server Error");
  }
});

//@route: Delete api/posts/:id
//@Description: delete Post by id
//@access: Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "No post found" });
    }
    //Check if logged in user is deleting their own post or not
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Unauthorized access" });
    }
    await post.remove();
    res.status(200).json("Post removed");
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "No post found" });
    }
    console.log(err);
    res.status(500).json("Server Error");
  }
});

//@route: PUT api/posts/like/:id
//@Description: Like a post
//@access: Private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json("Post not found!");
    }
    //check if post is not liked already by the logged in user
    if (
      post.likes.filter((likes) => likes.user.toString() === req.user.id)
        .length > 0
    ) {
      return res.json("Post already Liked!");
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.log(err);
    res.status(500).json("Server error");
  }
});

//@route: PUT api/posts/unlike/:id
//@Description: Unlike a post
//@access: Private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json("Post not found!");
    }
    //check if post is liked by the user or not
    if (
      post.likes.filter((likes) => likes.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.json("Post has not been liked yet!");
    }

    //Get remove index
    //refernce- https://stackoverflow.com/questions/10557486/in-an-array-of-objects-fastest-way-to-find-the-index-of-an-object-whose-attribu
    const removeIndex = post.likes
      .map((like) => like.user.toString)
      .indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.log(err);
    res.status(500).json("Server error");
  }
});

//@route: Post api/posts/comment/:id
//@Description: Comment on a post
//@access: Private
router.post(
  "/comment/:id",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        user: req.user.id,
        name: user.name,
        avatar: user.avatar,
      };

      post.comments.unshift(newComment);
      await post.save();
      res.json(post.comments);
    } catch (err) {
      console.log(err);
      res.status(500).json("Server Error");
    }
  }
);

//@route: Delete api/posts/comment/:id/:comment_id
//@Description: delete Comment on a post
//@access: Private
router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  const comment = await post.comments.find(
    (comment) => comment.id == req.params.comment_id
  );
  //check comment
  if (!comment) {
    return res.status(404).json("Comment does not exist");
  }
  //check user
  if (comment.user.toString() !== req.user.id) {
    return res.status(401).json("User not authorized");
  }

  const removeIndex = post.comments
    .map((comment) => comment.user.toString())
    .indexOf(req.user.id);
  post.comments.splice(removeIndex, 1);
  await post.save();
  res.json(post.comments);
});

module.exports = router;
