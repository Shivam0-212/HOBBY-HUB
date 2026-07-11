import express from 'express';
import { Post, Event, EventSuggestion, toDoc } from '../lib/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const user = req.session?.user;
  try {
    const [posts, events] = await Promise.all([
      Post.find().sort({ created_at: -1 }).lean(),
      Event.find().sort({ created_at: -1 }).lean()
    ]);

    let mySuggestions = [];
    if (user) {
      mySuggestions = toDoc(await EventSuggestion.find({ suggested_by_email: user.email }).sort({ created_at: -1 }).lean());
    }

    res.render('community', {
      title: 'Community - Hobby Hub',
      posts:   toDoc(posts),
      events:  toDoc(events),
      mySuggestions,
      success: req.query.success || null,
      error:   req.query.error   || null
    });
  } catch (err) {
    console.error(err);
    res.render('community', { title: 'Community', posts: [], events: [], mySuggestions: [], success: null, error: null });
  }
});

router.post('/post', async (req, res) => {
  const { postTitle, postBody } = req.body;
  const user = req.session?.user;
  if (!postTitle || !postBody) return res.redirect('/community');
  try {
    await Post.create({
      title:           postTitle.trim(),
      body:            postBody.trim(),
      author_username: user?.username || 'Anonymous',
      author_email:    user?.email || null
    });
  } catch (err) { console.error(err); }
  res.redirect('/community?success=post');
});

router.post('/suggest', async (req, res) => {
  const user = req.session?.user;
  if (!user) return res.redirect('/login');
  const { eventName, eventDate, eventHobby, genderRestriction } = req.body;
  if (!eventName || !eventDate) return res.redirect('/community');
  try {
    await EventSuggestion.create({
      name:                  eventName.trim(),
      date:                  eventDate,
      hobby:                 eventHobby || 'General',
      gender_restriction:    genderRestriction || 'all',
      suggested_by_email:    user.email,
      suggested_by_username: user.username
    });
  } catch (err) { console.error(err); }
  res.redirect('/community?success=suggested');
});

router.post('/event', async (req, res) => {
  const user = req.session?.user;
  if (!user?.isAdmin) return res.redirect('/community');
  const { eventName, eventDate, eventHobby, genderRestriction } = req.body;
  if (!eventName || !eventDate) return res.redirect('/community');
  try {
    await Event.create({
      name:               eventName.trim(),
      date:               eventDate,
      hobby:              eventHobby || 'General',
      gender_restriction: genderRestriction || 'all',
      created_by_email:   user.email
    });
  } catch (err) { console.error(err); }
  res.redirect('/community?success=event');
});

router.post('/join/:id', async (req, res) => {
  const user = req.session?.user;
  if (!user) return res.redirect('/login');
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.redirect('/community');

    if (ev.joined_by.includes(user.email)) return res.redirect('/community?error=already_joined');
    if (ev.gender_restriction !== 'all' && user.gender !== ev.gender_restriction)
      return res.redirect('/community?error=gender_restricted');

    await Event.findByIdAndUpdate(req.params.id, { $push: { joined_by: user.email } });
    res.redirect('/community?success=joined');
  } catch (err) {
    console.error(err);
    res.redirect('/community');
  }
});

router.post('/delete/post/:id', async (req, res) => {
  const user = req.session?.user;
  if (!user) return res.redirect('/login');
  try {
    if (user.isAdmin) {
      await Post.findByIdAndDelete(req.params.id);
    } else {
      await Post.findOneAndDelete({ _id: req.params.id, author_email: user.email });
    }
  } catch (err) { console.error(err); }
  res.redirect('/community');
});

router.post('/delete/event/:id', async (req, res) => {
  const user = req.session?.user;
  if (!user) return res.redirect('/login');
  try {
    if (user.isAdmin) {
      await Event.findByIdAndDelete(req.params.id);
    } else {
      await Event.findOneAndDelete({ _id: req.params.id, created_by_email: user.email });
    }
  } catch (err) { console.error(err); }
  res.redirect('/community');
});

export default router;
