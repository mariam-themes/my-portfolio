const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: String,
  slug: String,
  excerpt: String,
  content: String,
  sourceLang: String,
  translations: mongoose.Schema.Types.Mixed,
}, { strict: false });

const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

async function run() {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mariam-portfolio";
    console.log("Connecting to:", mongoUri);
    await mongoose.connect(mongoUri);
    console.log("Connected.");
    
    const blogs = await Blog.find({});
    console.log("Total blogs found:", blogs.length);
    for (const b of blogs) {
      console.log("-------------------");
      console.log("ID:", b._id);
      console.log("Title:", b.title);
      console.log("Slug:", b.slug);
      console.log("SourceLang:", b.sourceLang);
      console.log("Translations:", JSON.stringify(b.translations, null, 2));
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
