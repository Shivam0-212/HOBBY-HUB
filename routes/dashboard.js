import express from 'express';
import { Hobby, toDoc } from '../lib/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const hobbies = toDoc(await Hobby.find().sort({ created_at: -1 }).lean());

    const categoryMap = {};
    const difficultyCounts = {};
    hobbies.forEach(h => {
      if (h.category) categoryMap[h.category] = (categoryMap[h.category] || 0) + 1;
      if (h.difficulty) difficultyCounts[h.difficulty] = (difficultyCounts[h.difficulty] || 0) + 1;
    });

    const categoryStats = Object.entries(categoryMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    res.render('dashboard', {
      title: 'Dashboard - Hobby Hub',
      hobbies,
      totalHobbies: hobbies.length,
      categoryStats,
      popularCategory: categoryStats[0] || null,
      difficultyCounts
    });
  } catch (err) {
    console.error(err);
    res.render('dashboard', {
      title: 'Dashboard',
      hobbies: [],
      totalHobbies: 0,
      categoryStats: [],
      popularCategory: null,
      difficultyCounts: {}
    });
  }
});

export default router;
