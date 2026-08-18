import mongoose from 'mongoose';
import { readFileSync } from 'node:fs';

const raw = readFileSync('.env.local', 'utf8');
const uri = raw.match(/^MONGODB_URI=(.*)$/m)[1].trim().replace(/^"|"$/g, '');
await mongoose.connect(uri, { bufferCommands: false });
const Project = mongoose.models.Project || mongoose.model('Project', new mongoose.Schema({}, { strict: false }), 'projects');
const ps = await Project.find({});
for (const p of ps) {
  console.log('═══', p.slug);
  console.log(' sourceLang:', p.sourceLang);
  console.log(' translations:', JSON.stringify(p.translations, null, 2));
}
await mongoose.disconnect();