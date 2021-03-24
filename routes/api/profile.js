const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { check, validationResult, body } = require("express-validator");
const request = require("request");
const config = require("config");
const https = require("http");

//@route: GET api/profile/me
//@Description: Get current users Profile
//@access: Private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }

    res.json(profile);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

//@route: POST api/profile
//@Description: Create or Update user's Profile
//@access: Private
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills are required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      twitter,
      facebook,
      linkedin,
      instagram,
    } = req.body;
    //Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      //converting comma separated value to array, and trimming the spaces before and after comma
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }
    //Build Social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        //if profile is found then update it
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }

      //if profile not found then create it
      profile = new Profile(profileFields);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err.message);
      res.status(500).json("server error");
    }
  }
);

//@route: GET api/profile
//@Description: Get all Profiles
//@access: Public
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.status(200).json(profiles);
  } catch (err) {
    console.log(err);
    res.status(500).json("Server Error");
  }
});

//@route: GET api/profile/user/:user_id
//@Description: Get Profile by user id
//@access: Public
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) return res.status(400).json({ msg: "Profile not found" });

    res.status(200).json(profile);
  } catch (err) {
    console.log(err);
    //if an incorrect id is sent below is a kind of error we wanna check
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile not found" });
    }
    res.status(500).json("Server Error");
  }
});

//@route: Delete api/profile
//@Description: Delete profile, user and posts
//@access: Private
/* router.delete("/", auth, async (req, res) => {
  try {
    //@todo : remove user posts

    //remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    //remove user
    await Profile.findOneAndRemove({ _id: req.user.id });
    res.json({ msg: `User deleted` });
  } catch (err) {
    console.log(err);
    //if an incorrect id is sent below is a kind of error we wanna check
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile not found" });
    }
    res.status(500).json("Server Error");
  }
}); */

//@route: Delete api/profile
//@Description: Delete profile, user and posts
//@access: Private
router.delete("/", auth, async (req, res) => {
  try {
    //Remove profile
    await Profile.findOneAndDelete({ user: req.user.id });

    //Remove user
    await User.findOneAndDelete({ _id: req.user.id });

    res.json({ msg: "User deleted" });
  } catch (err) {
    console.log(err.message);
    res.status(500).send("server error");
  }
});

//@route: Put api/profile/experience
//@Description: Add profile experience
//@access: Private
router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company is required").not().isEmpty(),
      check("from", "From Date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      //When providing date from postman, provide it in mm-dd-yyyy format
      profile.experience.unshift(newExp);

      await profile.save();

      res.status(200).json(profile);
    } catch (err) {
      console.log(err);
      res.status(500).json("Server Error");
    }
  }
);

//@route: Delete api/profile/experience/:exp_id
//@Description: Delete experience
//@access: Private
router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    //get remove index
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);
    console.log(`removeIndex value is: ${removeIndex}`);
    profile.experience.splice(removeIndex, 1);

    await profile.save();
    res.json(profile);
  } catch (error) {
    console.log(err);
    res.status(500).json("Server Error");
  }
});

//@route: Put api/profile/education
//@Description: Add profile education
//@access: Private
router.put(
  "/education",
  [
    auth,
    [
      check("school", "School is required").not().isEmpty(),
      check("degree", "Degree is required").not().isEmpty(),
      check("fieldofstudy", "Field Of Study is required").not().isEmpty(),
      check("from", "From Date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      //When providing date from postman, provide it in mm-dd-yyyy format
      profile.education.unshift(newEdu);

      await profile.save();

      res.status(200).json(profile);
    } catch (err) {
      console.log(err);
      res.status(500).json("Server Error");
    }
  }
);

//@route: Delete api/profile/education/:edu_id
//@Description: Delete education
//@access: Private
router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    //get remove index
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.exp_id);
    console.log(`removeIndex value is: ${removeIndex}`);
    profile.education.splice(removeIndex, 1);

    await profile.save();
    res.json(profile);
  } catch (error) {
    console.log(error);
    res.status(500).json("Server Error");
  }
});

//@route: Get api/profile/github/:username
//@Description: Get github repository
//@access: Public
router.get("/github/:username", (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        "githubClientId"
      )}&client_secret=${config.get("githubSecret")}`,
      method: "GET",
      headers: { "user-agent": "node.js" },
    };

    request(options, (error, response, body) => {
      if (error) console.log(error);

      if (response.statusCode !== 200) {
        res.status(404).json({ msg: "No Github profile found" });
      }

      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
