'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BlogCard from '@/components/ui/BlogCard';

export default function BlogSection() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch('/api/blogs');
        const json = await res.json();
        if (json.success) {
          setBlogs(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBlogs();
  }, []);

  return (
    <section className="py-24 bg-transparent relative z-10">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="max-w-4xl mx-auto mb-16 text-left">
          <div className="flex items-center gap-4 text-xs tracking-[0.2em] uppercase text-accent mb-4">
            <span className="w-12 h-[1px] bg-accent/50"></span>
            JOURNAL
          </div>
          <h2 className="text-5xl md:text-7xl font-serif font-normal text-foreground">
            Stories with <span className="italic text-[#d36a86]">substance.</span>
          </h2>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 mt-6 text-sm font-semibold tracking-wide uppercase text-[#d36a86] hover:text-[#e8a3b6] transition-colors"
          >
            Read all stories
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-pulse flex gap-2">
              <div className="w-3 h-3 bg-accent rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center text-slate-500 py-12 border border-dashed rounded-xl">
            No articles published yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.slice(0, 3).map((blog) => (
              <BlogCard key={blog._id} {...blog} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
