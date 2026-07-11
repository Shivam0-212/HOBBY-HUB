import mongoose from 'mongoose';

/* ── Connection ─────────────────────────────────────────── */
export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
  }
}

/* ── Helper: lean doc → plain obj with id string ─────────── */
export function toDoc(doc) {
  if (!doc) return null;
  if (Array.isArray(doc)) return doc.map(toDoc);
  const obj = { ...doc };
  if (obj._id) obj.id = obj._id.toString();
  return obj;
}

/* ══════════════════════════════════════════════════════════
   SCHEMAS & MODELS
══════════════════════════════════════════════════════════ */

/* User */
const userSchema = new mongoose.Schema({
  username:   { type: String, required: true, unique: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  password:   { type: String, required: true },
  gender:     { type: String, default: '' },
  name:       { type: String, default: '' },
  created_at: { type: Date,   default: Date.now }
});
export const User = mongoose.models.User || mongoose.model('User', userSchema);

/* Hobby */
const hobbySchema = new mongoose.Schema({
  title:              { type: String, required: true },
  description:        { type: String, default: '' },
  category:           { type: String, default: 'General' },
  difficulty:         { type: String, default: 'Beginner' },
  time_required:      { type: String, default: 'Flexible' },
  image:              { type: String, default: '' },
  featured:           { type: Boolean, default: false },
  added_by_email:     { type: String, default: null },
  added_by_username:  { type: String, default: null },
  created_at:         { type: Date,   default: Date.now }
});
export const Hobby = mongoose.models.Hobby || mongoose.model('Hobby', hobbySchema);

/* Post */
const postSchema = new mongoose.Schema({
  title:            { type: String, required: true },
  body:             { type: String, required: true },
  author_username:  { type: String, default: 'Anonymous' },
  author_email:     { type: String, default: null },
  created_at:       { type: Date,   default: Date.now }
});
export const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

/* Event */
const eventSchema = new mongoose.Schema({
  name:               { type: String, required: true },
  date:               { type: String, required: true },
  hobby:              { type: String, default: 'General' },
  gender_restriction: { type: String, default: 'all' },
  joined_by:          { type: [String], default: [] },
  created_by_email:   { type: String, default: null },
  created_at:         { type: Date,   default: Date.now }
});
export const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

/* EventSuggestion */
const suggestionSchema = new mongoose.Schema({
  name:                   { type: String, required: true },
  date:                   { type: String, required: true },
  hobby:                  { type: String, default: 'General' },
  gender_restriction:     { type: String, default: 'all' },
  suggested_by_email:     { type: String, default: null },
  suggested_by_username:  { type: String, default: null },
  status:                 { type: String, default: 'pending' },
  admin_note:             { type: String, default: null },
  created_at:             { type: Date,   default: Date.now }
});
export const EventSuggestion = mongoose.models.EventSuggestion ||
  mongoose.model('EventSuggestion', suggestionSchema);
