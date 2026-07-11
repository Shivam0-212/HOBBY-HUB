import express from 'express';
import { User, Hobby, Post, Event, EventSuggestion, toDoc } from '../lib/db.js';

const router = express.Router();

function requireAdmin(req, res, next) {
  if (!req.session?.user?.isAdmin) return res.redirect('/login');
  next();
}

router.get('/', requireAdmin, async (req, res) => {
  try {
    const [users, hobbies, posts, events, suggestions] = await Promise.all([
      User.find().sort({ created_at: -1 }).lean(),
      Hobby.find().sort({ created_at: -1 }).lean(),
      Post.find().sort({ created_at: -1 }).lean(),
      Event.find().sort({ created_at: -1 }).lean(),
      EventSuggestion.find().sort({ created_at: -1 }).lean()
    ]);
    const pendingCount = suggestions.filter(s => s.status === 'pending').length;
    res.render('admin', {
      title:       'Admin Panel - Hobby Hub',
      users:       toDoc(users),
      hobbies:     toDoc(hobbies),
      posts:       toDoc(posts),
      events:      toDoc(events),
      suggestions: toDoc(suggestions),
      pendingCount,
      editItem: null,
      editType: null
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Admin error: ' + err.message);
  }
});

router.post('/delete/user/:id',  requireAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/admin');
});
router.post('/delete/hobby/:id', requireAdmin, async (req, res) => {
  await Hobby.findByIdAndDelete(req.params.id);
  res.redirect('/admin');
});
router.post('/delete/post/:id',  requireAdmin, async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.redirect('/admin');
});
router.post('/delete/event/:id', requireAdmin, async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.redirect('/admin');
});

router.post('/edit/hobby/:id', requireAdmin, async (req, res) => {
  const { title, description, category, difficulty, time_required } = req.body;
  await Hobby.findByIdAndUpdate(req.params.id, { title, description, category, difficulty, time_required });
  res.redirect('/admin#tab-hobbies');
});

router.post('/edit/post/:id', requireAdmin, async (req, res) => {
  const { title, body } = req.body;
  await Post.findByIdAndUpdate(req.params.id, { title, body });
  res.redirect('/admin#tab-posts');
});

router.post('/edit/event/:id', requireAdmin, async (req, res) => {
  const { name, date, hobby, gender_restriction } = req.body;
  await Event.findByIdAndUpdate(req.params.id, { name, date, hobby, gender_restriction });
  res.redirect('/admin#tab-events');
});

router.post('/suggestions/approve/:id', requireAdmin, async (req, res) => {
  try {
    const s = await EventSuggestion.findById(req.params.id);
    if (!s) return res.redirect('/admin#tab-suggestions');
    await Event.create({
      name:               s.name,
      date:               s.date,
      hobby:              s.hobby,
      gender_restriction: s.gender_restriction,
      created_by_email:   req.session.user.email
    });
    await EventSuggestion.findByIdAndUpdate(req.params.id, { status: 'approved' });
  } catch (err) { console.error(err); }
  res.redirect('/admin#tab-suggestions');
});

router.post('/suggestions/reject/:id', requireAdmin, async (req, res) => {
  const { admin_note } = req.body;
  try {
    await EventSuggestion.findByIdAndUpdate(req.params.id, { status: 'rejected', admin_note: admin_note || null });
  } catch (err) { console.error(err); }
  res.redirect('/admin#tab-suggestions');
});

router.post('/suggestions/delete/:id', requireAdmin, async (req, res) => {
  await EventSuggestion.findByIdAndDelete(req.params.id);
  res.redirect('/admin#tab-suggestions');
});

export default router;
