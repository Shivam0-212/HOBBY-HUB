import express from 'express';
import { Hobby } from '../lib/db.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.render('add', { title: 'Add Hobby - Hobby Hub', success: null, error: null });
});

router.post('/', async (req, res) => {
  const { title, description, category, difficulty, timeRequired, image } = req.body;
  const user = req.session?.user;
  if (!title || !description || !category) {
    return res.render('add', { title: 'Add Hobby - Hobby Hub', success: null, error: 'Please fill all required fields.' });
  }
  try {
    await Hobby.create({
      title:             title.trim(),
      description:       description.trim(),
      category:          category.trim(),
      difficulty:        difficulty || 'Beginner',
      time_required:     timeRequired || 'Flexible',
      image:             image || 'https://images.unsplash.com/photo-1495548054858-0e78bb72869f?w=400&h=200&fit=crop',
      featured:          false,
      added_by_email:    user?.email || null,
      added_by_username: user?.username || null
    });
    res.render('add', { title: 'Add Hobby - Hobby Hub', success: 'Hobby added successfully!', error: null });
  } catch (err) {
    console.error(err);
    res.render('add', { title: 'Add Hobby - Hobby Hub', success: null, error: 'Failed to add hobby. Please try again.' });
  }
});

export default router;
