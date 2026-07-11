import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Auto-load .env file
const envPath = path.join(__dirname, '.env');
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eq = trimmed.indexOf('=');
      if (eq > -1) {
        const key = trimmed.slice(0, eq).trim();
        const val = trimmed.slice(eq + 1).trim();
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

import express from 'express';
import session from 'express-session';
import { connectDB } from './lib/db.js';

const app  = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'hobbyhub-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

app.use((req, res, next) => {
  res.locals.user = req.session?.user || null;
  next();
});

import indexRouter     from './routes/index.js';
import exploreRouter   from './routes/explore.js';
import addRouter       from './routes/add.js';
import dashboardRouter from './routes/dashboard.js';
import aboutRouter     from './routes/about.js';
import communityRouter from './routes/community.js';
import editRouter      from './routes/edit.js';
import authRouter      from './routes/auth.js';
import adminRouter     from './routes/admin.js';

app.use('/',          indexRouter);
app.use('/explore',   exploreRouter);
app.use('/add',       addRouter);
app.use('/dashboard', dashboardRouter);
app.use('/about',     aboutRouter);
app.use('/community', communityRouter);
app.use('/edit',      editRouter);
app.use('/admin',     adminRouter);
app.use('/',          authRouter);

app.use((req, res) => {
  res.status(404).send('<h1 style="font-family:sans-serif;text-align:center;margin-top:15vh">404 — Page Not Found</h1><p style="text-align:center"><a href="/">Go Home</a></p>');
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log('\n✅ Hobby Hub is running!');
    console.log('👉 Open browser: http://localhost:' + PORT + '\n');
  });
});
