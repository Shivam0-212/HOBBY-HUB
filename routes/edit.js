import express from 'express';
import { Hobby, toDoc } from '../lib/db.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
  try {
    const hobby = toDoc(await Hobby.findById(req.params.id).lean());
    if (!hobby) return res.redirect('/explore');
    res.render('edit', { title: 'Edit Hobby - Hobby Hub', hobby });
  } catch { res.redirect('/explore'); }
});

router.post('/:id', async (req, res) => {
  const { title, description, category, difficulty, timeRequired, image } = req.body;
  try {
    await Hobby.findByIdAndUpdate(req.params.id, {
      title, description, category, difficulty,
      time_required: timeRequired,
      image
    });
  } catch (err) { console.error(err); }
  res.redirect('/explore');
});

export default router;
