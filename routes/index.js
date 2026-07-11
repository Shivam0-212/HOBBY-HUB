import express from 'express';
import { Hobby, toDoc } from '../lib/db.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.render('welcome', { title: 'Welcome to Hobby Hub' });
});

router.get('/home', async (req, res) => {
  try {
    const hobbies = toDoc(await Hobby.find().sort({ created_at: -1 }).lean());
    const featured = hobbies.filter(h => h.featured);
    res.render('index', {
      title: 'Hobby Hub - Discover Your Passion',
      featuredHobbies: featured.length ? featured : hobbies.slice(0, 3),
      totalHobbies:    hobbies.length
    });
  } catch (err) {
    console.error(err);
    res.render('index', { title: 'Hobby Hub', featuredHobbies: [], totalHobbies: 0 });
  }
});

export default router;
