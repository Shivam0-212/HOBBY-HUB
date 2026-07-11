import express from 'express';

const router = express.Router();

const teamMembers = [
  { name: 'Shivam Agrawal', role: 'Founder & Developer', initials: 'SA', bio: 'VIT student passionate about technology and connecting people with their hobbies.' }
];

router.get('/', (req, res) => {
  res.render('about', { title: 'About & Contact - Hobby Hub', teamMembers, success: null });
});

router.post('/contact', (req, res) => {
  res.render('about', {
    title: 'About & Contact - Hobby Hub',
    teamMembers,
    success: 'Message sent! We will get back to you at shivam.agrawal2024@vitstudent.ac.in'
  });
});

export default router;
