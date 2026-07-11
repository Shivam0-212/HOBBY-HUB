import express from 'express';
import { Hobby, toDoc } from '../lib/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = (category && category !== 'all') ? { category } : {};
    const hobbies = toDoc(await Hobby.find(filter).sort({ created_at: -1 }).lean());
    const catDocs  = await Hobby.distinct('category');
    const categories = catDocs.filter(Boolean).sort();

    res.render('explore', {
      title: 'Explore Hobbies - Hobby Hub',
      hobbies,
      categories,
      selectedCategory: category || 'all'
    });
  } catch (err) {
    console.error(err);
    res.render('explore', { title: 'Explore Hobbies', hobbies: [], categories: [], selectedCategory: 'all' });
  }
});

router.post('/delete/:id', async (req, res) => {
  const user = req.session?.user;
  if (!user) return res.redirect('/');
  try {
    if (user.isAdmin) {
      await Hobby.findByIdAndDelete(req.params.id);
    } else {
      await Hobby.findOneAndDelete({ _id: req.params.id, added_by_email: user.email });
    }
  } catch (err) { console.error(err); }
  res.redirect('/explore');
});

export default router;
