'use client';

import { useTranslations, useLocale } from 'next-intl';
import { User, Search, Bell, Image as ImageIcon, FileText, Mail, LogOut } from 'lucide-react';
import { setAdminLocaleCookie } from '@/lib/adminLocaleCookie';
import { useState, useRef, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import Link from 'next/link';


// Simple fetcher for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Header() {
  const t = useTranslations('Admin.shell');
  const tInq = useTranslations('Admin.inquiries');
  const locale = useLocale();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Robust sign-out: fetch CSRF token then POST to next-auth signout endpoint
  const handleSignOut = useCallback(async () => {
    try {
      const csrfRes = await fetch('/api/auth/csrf');
      const { csrfToken } = await csrfRes.json();
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '/api/auth/signout';
      const tokenInput = document.createElement('input');
      tokenInput.type = 'hidden';
      tokenInput.name = 'csrfToken';
      tokenInput.value = csrfToken;
      const callbackInput = document.createElement('input');
      callbackInput.type = 'hidden';
      callbackInput.name = 'callbackUrl';
      callbackInput.value = '/login';
      form.appendChild(tokenInput);
      form.appendChild(callbackInput);
      document.body.appendChild(form);
      form.submit();
    } catch {
      // Fallback: navigate directly to login
      window.location.href = '/login';
    }
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length === 0) {
        setSearchResults([]);
        setIsSearchOpen(false);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`);
        const json = await res.json();
        if (json.success) {
          setSearchResults(json.data);
          setIsSearchOpen(true);
        }
      } catch (error) {
        console.error('Search failed', error);
      }
      setIsSearching(false);
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const switchLocale = (next: 'en' | 'ar') => {
    if (next === locale) return;
    setAdminLocaleCookie(next);
    window.location.reload();
  };

  // Fetch unread inquiries every 30 seconds
  const { data, mutate } = useSWR('/api/admin/inquiries?isRead=false', fetcher, { refreshInterval: 30000 });
  
  const [displayInquiries, setDisplayInquiries] = useState<any[]>([]);
  const newInquiries = data?.data || [];
  const hasNotifications = newInquiries.length > 0;

  useEffect(() => {
    // Only update the displayed list if the dropdown is closed, 
    // so it doesn't vanish while the user is reading it.
    if (!isDropdownOpen) {
      setDisplayInquiries(newInquiries);
    }
  }, [newInquiries, isDropdownOpen]);

  const handleOpenDropdown = async () => {
    const opening = !isDropdownOpen;
    setIsDropdownOpen(opening);
    if (opening && hasNotifications) {
      // Mark as read in the background when opening the dropdown
      fetch('/api/admin/inquiries/mark-read', { method: 'POST' }).then(() => mutate());
    }
  };

  return (
    <header className="h-24 border-b border-rose-900/30 bg-[#2A0813]/80 backdrop-blur-xl flex items-center justify-between px-10 sticky top-0 z-40">
      <div className="flex items-center gap-6">
        <h1 className="text-3xl font-light text-white tracking-wide">
          {t('welcomeBack')} <span className="font-bold">Mariam</span>
        </h1>
      </div>

      <div className="flex items-center gap-8">
        {/* Search */}
        <div className="relative" ref={searchRef}>
          <div className="hidden md:flex items-center gap-4 bg-black/20 border border-white/5 rounded-full px-4 py-2.5 w-64 focus-within:ring-1 focus-within:ring-rose-500/50 transition-all relative z-50">
            <Search size={18} className="text-rose-300" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim().length > 0) setIsSearchOpen(true);
              }}
              className="bg-transparent border-none outline-none text-sm text-rose-100 placeholder-rose-400/50 w-full"
            />
            {isSearching && (
              <span className="absolute right-4 w-3 h-3 rounded-full border-2 border-rose-500/30 border-t-rose-500 animate-spin" />
            )}
          </div>

          {/* Search Results Dropdown */}
          {isSearchOpen && (
            <div className="absolute left-0 top-full mt-2 w-full min-w-[320px] bg-[#1A050C] border border-rose-900/50 rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="px-5 py-3 border-b border-rose-900/30 bg-[#2A0813]/50">
                <h3 className="text-white font-bold text-xs uppercase tracking-wider">
                  {locale === 'ar' ? 'نتائج البحث' : 'Search Results'}
                </h3>
              </div>
              <div className="max-h-80 overflow-y-auto p-2">
                {searchResults.length > 0 ? (
                  searchResults.map((result, i) => (
                    <Link
                      key={i}
                      href={result.url}
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-rose-950 flex items-center justify-center border border-rose-900/50 flex-shrink-0">
                        {result.type === 'project' ? <ImageIcon size={14} className="text-rose-400" /> : 
                         result.type === 'blog' ? <FileText size={14} className="text-purple-400" /> : 
                         <Mail size={14} className="text-amber-400" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-rose-100 group-hover:text-white truncate">{result.title}</p>
                        <p className="text-xs text-rose-400/60 capitalize mt-0.5">{result.subtitle}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-6 text-center text-sm text-rose-300/50">
                    {locale === 'ar' ? 'لا توجد نتائج' : 'No results found'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={handleOpenDropdown}
            className={`relative transition-colors ${hasNotifications || isDropdownOpen ? 'text-white' : 'text-rose-300 hover:text-white'}`}
          >
            <Bell size={22} />
            {hasNotifications && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-[#2A0813] rtl:-right-auto rtl:-left-1 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 rtl:right-auto rtl:left-0 top-full mt-4 w-80 bg-[#1A050C] border border-rose-900/50 rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="px-5 py-4 border-b border-rose-900/30 flex justify-between items-center bg-[#2A0813]/50">
                <h3 className="text-white font-bold text-sm">
                  {locale === 'ar' ? 'الإشعارات' : 'Notifications'}
                </h3>
                {displayInquiries.length > 0 && (
                  <span className="bg-rose-500/20 text-rose-400 text-xs px-2 py-0.5 rounded-full font-bold">
                    {displayInquiries.length} {tInq('statusNew')}
                  </span>
                )}
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {displayInquiries.length > 0 ? (
                  <div className="flex flex-col">
                    {displayInquiries.map((inq: any, i: number) => (
                      <Link 
                        key={String(inq._id ?? inq.email ?? `inq-${i}`)} 
                        href="/admin/inquiries"
                        onClick={() => setIsDropdownOpen(false)}
                        className="px-5 py-4 border-b border-white/5 hover:bg-white/5 transition-colors group block"
                      >
                        <p className="text-sm font-semibold text-rose-100 group-hover:text-white transition-colors">{inq.name}</p>
                        <p className="text-xs text-rose-400 mt-1 line-clamp-1">{inq.service}</p>
                        <p className="text-[10px] text-rose-500/50 mt-2 uppercase tracking-wider">
                          {new Date(inq.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                        </p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="px-5 py-8 text-center">
                    <p className="text-sm text-rose-300/50">
                      {locale === 'ar' ? 'لا توجد إشعارات جديدة' : 'No new notifications'}
                    </p>
                  </div>
                )}
              </div>
              
              {displayInquiries.length > 0 && (
                <div className="p-3 bg-[#2A0813]/30 border-t border-rose-900/30">
                  <Link 
                    href="/admin/inquiries"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block w-full py-2 text-center text-xs font-bold text-rose-400 hover:text-white bg-rose-900/20 hover:bg-rose-600/40 rounded-xl transition-all"
                  >
                    {tInq('title')}
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-rose-900/50" />

        {/* Language Switcher */}
        <div className="flex items-center gap-1 rounded-full bg-black/25 border border-rose-900/40 p-1">
          {(['en', 'ar'] as const).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => switchLocale(code)}
              className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase transition-colors cursor-pointer ${
                locale === code
                  ? 'bg-rose-600 text-white'
                  : 'text-rose-300 hover:text-white'
              }`}
            >
              {code === 'en' ? 'EN' : 'AR'}
            </button>
          ))}
        </div>

        <div className="h-8 w-px bg-rose-900/50" />

        {/* User Avatar + Logout Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-4 group cursor-pointer focus:outline-none"
            aria-label="User menu"
          >
            <div className="text-right rtl:text-left hidden md:block">
              <p className="text-sm font-bold text-white group-hover:text-rose-200 transition-colors">Mariam</p>
              <p className="text-xs text-rose-400">{t('creativeDirector')}</p>
            </div>
            <div className={`w-12 h-12 rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 p-0.5 shadow-lg shadow-rose-900/40 transition-transform duration-200 ${isUserMenuOpen ? 'scale-95 ring-2 ring-rose-500/60' : 'group-hover:scale-105'}`}>
              <div className="w-full h-full rounded-full bg-[#3F0D1C] flex items-center justify-center border-2 border-[#2A0813]">
                <User size={20} className="text-rose-200" />
              </div>
            </div>
          </button>

          {/* Dropdown */}
          {isUserMenuOpen && (
            <div className="absolute right-0 rtl:right-auto rtl:left-0 top-full mt-3 w-52 bg-[#1A050C] border border-rose-900/50 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 border-b border-rose-900/30 bg-[#2A0813]/60">
                <p className="text-xs font-bold text-rose-200">Mariam Aljumaiah</p>
                <p className="text-[11px] text-rose-400/70 mt-0.5">{t('creativeDirector')}</p>
              </div>
              <div className="p-2">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-rose-300 hover:text-white hover:bg-rose-900/40 transition-colors text-sm font-medium"
                >
                  <LogOut size={15} />
                  {locale === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
