import mongoose from 'mongoose';
import { readFileSync } from 'node:fs';

const raw = readFileSync('.env.local', 'utf8');
const uri = raw.match(/^MONGODB_URI=(.*)$/m)[1].trim().replace(/^"|"$/g, '');
await mongoose.connect(uri, { bufferCommands: false });

const Project = mongoose.models.Project || mongoose.model('Project', new mongoose.Schema({}, { strict: false }), 'projects');

// distinct category values
const cats = await Project.distinct('category');
console.log('=== DISTINCT category values ===');
console.log(cats);

const sectors = await Project.distinct('sector');
console.log('=== DISTINCT sector values ===');
console.log(sectors);

// search any field for the string
const found = await Project.find({ $or: [
  { category: /E\.eg|website AI/i },
  { sector: /E\.eg|website AI/i },
] }).select('title slug category sector');
console.log('=== MATCHES ===');
for (const p of found) console.log(p.slug, '|', p.title, '| cat:', p.category, '| sector:', p.sector);

await mongoose.disconnect();