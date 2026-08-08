import TestimonialsSection from '@/components/sections/TestimonialsSection';

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col">
      {/* 
        This is a temporary page structure to showcase the Testimonials Section. 
        Later on, we will build a dynamic layout manager to handle all sections.
      */}
      
      <div className="flex-1 flex flex-col justify-center items-center py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-6">
          Luxury Designer Portfolio
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl px-6">
          Scroll down to see the custom Testimonials Section featuring the custom Audio Player UI we just built for Task 2.B.5.
        </p>
      </div>

      <TestimonialsSection />
      
    </main>
  );
}
