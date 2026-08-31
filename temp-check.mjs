import connectToDatabase from './src/lib/mongodb.js';
import Project from './src/models/Project.js';

await connectToDatabase();
const docs = await Project.find({}).lean().limit(5);
console.log(docs.map(d => ({ id: String(d._id), slug: d.slug, title: d.title, hasId: !!d._id })));
console.log('count', docs.length);
process.exit(0);
