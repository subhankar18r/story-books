const express = require("express");
const { ensureAuth } = require("../middleware/auth");
const router = express.Router();
const Story = require("../models/Story");

// @desc   Show add page
// @route  GET /stories/add

router.get("/add", ensureAuth, (req, res) => {
  res.render("stories/add");
});

// @desc   create new story
// @route   POST /stories

router.post("/", async (req, res) => {
  try {
    req.body.user = req.user.id;
    await Story.create(req.body);
    res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
  }
});

// @desc   Show single story
// @route  GET /stories/:id

router.get("/:id", ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).populate("user").lean();

    if (!story) {
      res.render("errors/404");
    }

    res.render("stories/show", {
      story,
    });
  } catch (err) {
    console.log(err);
    res.render("errors/404");
  }
});

// @desc   Show public stories page
// @route   GET /stories

router.get("/", async (req, res) => {
  try {
    const stories = await Story.find({ status: "public" })
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean();
    res.render("stories/index", {
      stories,
    });
  } catch (err) {
    console.log(err);
    res.render("errors/500");
  }
});

// @desc   Show edit page
// @route   GET /stories/edit/:id

router.get("/edit/:id", ensureAuth, async (req, res) => {
  const story = await Story.findOne({
    _id: req.params.id,
  }).lean();

  if (!story) {
    res.render("errors/404");
  }

  if (story.user != req.user.id) {
    res.redirect("/stories");
  } else {
    res.render("stories/edit", {
      story,
    });
  }
});

// @desc   edit story
// @route  PUT /stories/:id

router.put("/:id", ensureAuth, async (req, res) => {
  let story = await Story.findById(req.params.id).lean();

  if (!story) {
    return render("errors/404");
  }

  if (story.user != req.user.id) {
    res.redirect("/stories");
  } else {
    story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
      runValidators: true,
    });
    res.redirect("/dashboard");
  }
});

// @desc   delete story
// @route  DELETE /stories/:id

router.delete("/:id", ensureAuth, async (req, res) => {
  await Story.findOneAndDelete({ _id: req.params.id });
  res.redirect("/dashboard");
});

// @desc   Show user stories
// @route  GET /stories/user/:userId

router.get("/user/:userId", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({
      user: req.params.userId,
      status: "public",
    })
      .populate("user")
      .lean();
    res.render("stories/index", {
      stories,
    });
  } catch (err) {}
});

module.exports = router;
