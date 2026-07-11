import express from 'express';
import bcrypt  from 'bcryptjs';
import { User, toDoc } from '../lib/db.js';

const router  = express.Router();
const ADMIN_EMAIL = 'agrawalshivam3431@gmail.com';
const ADMIN_PASS  = 'Shivam1*;';
const SALT_ROUNDS = 10;

function validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

router.get('/register', (req, res) => {
  res.render('register', { title: 'Register - Hobby Hub', error: null, success: null });
});

router.post('/register', async (req, res) => {
  const { username, email, password, confirmPassword, gender } = req.body;
  const render = (error, success = null) =>
    res.render('register', { title: 'Register - Hobby Hub', error, success });

  if (!username || username.trim().length < 3) return render('Username must be at least 3 characters.');
  if (!email || !validEmail(email))            return render('Please enter a valid email address.');
  if (!password || password.length < 6)        return render('Password must be at least 6 characters.');
  if (password !== confirmPassword)            return render('Passwords do not match.');
  if (!gender)                                 return render('Please select your gender.');

  try {
    const existing = await User.findOne({
      $or: [{ username: username.trim() }, { email: email.toLowerCase() }]
    });
    if (existing) return render('Username or email is already registered. Please use a different one.');

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    await User.create({
      username: username.trim(),
      email:    email.toLowerCase(),
      password: hashedPassword,
      gender
    });
    render(null, 'Account created successfully! You can now log in.');
  } catch (err) {
    console.error(err);
    render('Registration failed. Please try again.');
  }
});

router.get('/login', (req, res) => {
  res.render('login', { title: 'Login - Hobby Hub', error: null, success: null });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.render('login', { title: 'Login - Hobby Hub', error: 'Please fill in all fields.', success: null });

  if (username.trim() === ADMIN_EMAIL && password === ADMIN_PASS) {
    req.session.user = { id: '0', username: 'Admin', email: ADMIN_EMAIL, isAdmin: true, gender: null, name: 'Admin' };
    return res.redirect('/admin');
  }

  try {
    const user = await User.findOne({
      $or: [{ username: username.trim() }, { email: username.trim().toLowerCase() }]
    }).lean();

    if (!user) {
      return res.render('login', { title: 'Login - Hobby Hub', error: 'Invalid username/email or password.', success: null });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.render('login', { title: 'Login - Hobby Hub', error: 'Invalid username/email or password.', success: null });
    }

    req.session.user = {
      id:       user._id.toString(),
      username: user.username,
      name:     user.name || '',
      email:    user.email,
      gender:   user.gender,
      isAdmin:  false
    };
    res.redirect('/home');
  } catch (err) {
    console.error(err);
    res.render('login', { title: 'Login - Hobby Hub', error: 'Login failed. Please try again.', success: null });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

router.get('/profile', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('profile', {
    title: 'My Profile - Hobby Hub',
    user:  req.session.user,
    error: null,
    success: null
  });
});

router.post('/profile/name', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const { name } = req.body;
  const render = (error, success = null) =>
    res.render('profile', { title: 'My Profile - Hobby Hub', user: req.session.user, error, success });

  if (!name || name.trim().length < 2) return render('Name must be at least 2 characters.');

  try {
    await User.findByIdAndUpdate(req.session.user.id, { name: name.trim() });
    req.session.user.name = name.trim();
    render(null, 'Name updated successfully!');
  } catch (err) {
    console.error(err);
    render('Failed to update name. Please try again.');
  }
});

router.post('/profile/password', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const render = (error, success = null) =>
    res.render('profile', { title: 'My Profile - Hobby Hub', user: req.session.user, error, success });

  if (!oldPassword || !newPassword || !confirmPassword) return render('Please fill in all password fields.');
  if (newPassword.length < 6)          return render('New password must be at least 6 characters.');
  if (newPassword !== confirmPassword) return render('New password and confirm password do not match.');

  try {
    const user = await User.findById(req.session.user.id).lean();
    if (!user) return render('User not found.');

    const oldMatch = await bcrypt.compare(oldPassword, user.password);
    if (!oldMatch) return render('Old password is incorrect.');

    const hashedNew = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await User.findByIdAndUpdate(req.session.user.id, { password: hashedNew });
    render(null, 'Password changed successfully!');
  } catch (err) {
    console.error(err);
    render('Failed to change password. Please try again.');
  }
});

export default router;
