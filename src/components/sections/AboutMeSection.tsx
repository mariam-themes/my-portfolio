'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Download } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Register ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface IExperience {
  role: string;
  company: string;
  duration: string;
  description: string;
}

interface IAboutMe {
  bio: string;
  photo: string;
  skills: string[];
  experience: IExperience[];
  cvLink: string;
}

export default function AboutMeSection() {
  const locale = useLocale();
  const t = useTranslations('AboutMe');
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [data, setData] = useState<IAboutMe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/about-me?locale=${locale}`);
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch About Me data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [locale]);

  useGSAP(() => {
    if (loading || !data) return;

    const ctx = gsap.context(() => {
      // Fade in the section
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Staggered reveal for experience items
      gsap.fromTo(
        '.exp-item',
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.exp-list',
            start: 'top 85%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [loading, data]);

  if (loading || !data) {
    return (
      <section className="py-24 bg-transparent min-h-[50vh] flex items-center justify-center relative z-10">
        <div className="animate-pulse flex gap-2">
          <div className="w-3 h-3 bg-[#951C30] rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-[#951C30] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-[#951C30] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="py-16 md:py-24 lg:py-32 bg-transparent relative z-10 overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 lg:px-20" ref={containerRef}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          
          {/* Left Column: Photo & Details */}
          <div className="lg:col-span-5 space-y-10">
{data.photo && (
               <div className="relative group mx-auto w-full max-w-md lg:mx-0 lg:max-w-none rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl border border-white/5 bg-rose-950/20">
                <Image 
                  src={data.photo} 
                  alt="Portrait"
                  fill 
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
              </div>
             )}
            
            {data.cvLink && (
              <div className="flex justify-start">
                <a 
                  href={data.cvLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-[#951C30] to-[#ad2240] hover:from-[#ad2240] hover:to-[#c6284a] text-white px-8 py-4 rounded-full font-semibold tracking-wide transition-all shadow-lg hover:shadow-[#951C30]/50 transform hover:-translate-y-1"
                >
                  <Download className="w-5 h-5" />
                  {t('downloadCv')}
                </a>
              </div>
            )}
          </div>

           {/* Right Column: Bio, Skills & Experience */}
           <div className="lg:col-span-7 lg:ps-10 space-y-10 lg:space-y-16">
            
            {/* Bio Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-xs tracking-[0.2em] uppercase text-[#951C30] mb-4">
                <span className="w-12 h-[1px] bg-[#951C30]/50"></span>
                {t('kicker')}
              </div>
<<<<<<< HEAD
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-normal text-white">
                {t('heading')}{' '}
                <span className="italic text-[#951C30]">{t('headingAccent')}</span>
                {t('headingSuffix') ? ` ${t('headingSuffix')}` : ''}
=======
               <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-normal text-white">
                {locale === 'ar' ? (
                  <>تصميم تجارب <span className="italic text-[#951C30]">ذات معنى</span></>
                ) : (
                  <>Designing <span className="italic text-[#951C30]">Meaningful</span> Experiences</>
                )}
>>>>>>> main
              </h2>
              <article
                className="prose prose-lg md:prose-xl prose-invert prose-p:text-white/70 prose-a:text-rose-400 max-w-none font-light leading-relaxed"
                dangerouslySetInnerHTML={{ __html: data.bio }}
              />
            </div>

            {/* Skills Section */}
            {data.skills && data.skills.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white tracking-wide">
                  {t('coreExpertise')}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {data.skills.map((skill, idx) => (
                    <span 
                      key={idx}
                      className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-rose-200/90 text-sm font-medium tracking-wide hover:bg-white/10 hover:border-rose-400/50 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience Section */}
            {data.experience && data.experience.length > 0 && (
              <div className="space-y-8 exp-list">
                <h3 className="text-xl font-semibold text-white tracking-wide">
                  {t('experience')}
                </h3>
                <div className="space-y-8 border-s border-white/10 ps-6 ms-2">
                  {data.experience.map((exp, idx) => (
                    <div key={idx} className="relative exp-item group">
                      <span className="absolute -start-[31px] top-1.5 w-3 h-3 rounded-full bg-black border-2 border-[#951C30] group-hover:bg-[#951C30] transition-colors shadow-[0_0_10px_rgba(149,28,48,0)] group-hover:shadow-[0_0_10px_rgba(149,28,48,0.8)]" />
                      
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-2">
                        <h4 className="text-xl font-bold text-white group-hover:text-rose-200 transition-colors">{exp.role}</h4>
                        <span className="text-sm font-medium text-[#951C30]/80 mt-1 sm:mt-0 tracking-wider uppercase">
                          {exp.duration}
                        </span>
                      </div>
                      
                      <div className="text-lg text-white/90 font-medium mb-3">{exp.company}</div>
                      
                      {exp.description && (
                        <p className="text-white/60 font-light leading-relaxed text-sm md:text-base">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}
