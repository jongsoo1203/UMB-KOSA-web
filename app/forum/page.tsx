/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import Footer from '@/components/ui/Footer';
import MyNavbar from '@/components/ui/MyNavbar';
import { Dropdown, TextInput, Button, Card } from 'flowbite-react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase/firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { useTranslations } from 'next-intl';

export default function ForumPage() {
  const router = useRouter();
  const [category, setCategory] = useState<string>('All Categories');
  const [language, setLanguage] = useState<string>('All');
  const [sortOption, setSortOption] = useState<string>('Newest');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [threads, setThreads] = useState<any[]>([]);
  const [currentPage] = useState<number>(1);
  const threadsPerPage = 10;
  const t = useTranslations('forum');

  const categories = [
    'All Categories',
    'Announcements',
    'General',
    'Academics',
    'Events',
    'Jobs',
    'Sell&Buy',
    'Sports',
  ];
  const languages = ['All', 'Korean', 'English', 'Mixed'];
  const sortOptions = ['Newest', 'Popular'];

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const fetchThreads = async () => {
      try {
        const forumsRef = collection(db, 'forums');

        let threadsQuery = query(forumsRef);
        const filters = [];

        if (category !== 'All Categories') {
          filters.push(where('category', '==', category));
        }

        if (language !== 'All') {
          filters.push(where('language', '==', language));
        }

        if (filters.length > 0) {
          threadsQuery = query(forumsRef, ...filters);
        }

        if (sortOption === 'Newest') {
          threadsQuery = query(threadsQuery, orderBy('createdAt', 'desc'));
        } else {
          threadsQuery = query(threadsQuery, orderBy('view', 'desc'));
        }

        const snapshot = await getDocs(threadsQuery);
        const threadsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          view: doc.data()?.view ?? 0,
          createdAt: doc.data()?.createdAt?.seconds
            ? new Date(doc.data().createdAt.seconds * 1000)
            : new Date(),
          ...doc.data(),
        }));

        setThreads(threadsData);
      } catch (error) {
        console.error('❌ Error fetching threads:', error);
      }
    };

    fetchThreads();
  }, [category, language, sortOption]);

  const truncate = (str: string, length: number) => {
    return str.length > length ? str.substring(0, length) + '...' : str;
  };

  const filteredThreads = threads.filter((thread) => {
    if (searchQuery.startsWith('@')) {
      const emailSearch = searchQuery.slice(1).toLowerCase();
      return thread.author?.toLowerCase().includes(emailSearch);
    }
    return thread.title?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const currentThreads = filteredThreads.slice(
    (currentPage - 1) * threadsPerPage,
    currentPage * threadsPerPage
  );

  return (
    <>
      <MyNavbar />
      <div className="bg-gray-100 pt-24 sm:pt-32">
        <div className="mx-auto grid max-w-7xl gap-20 px-6 lg:px-8 xl:grid-cols-3">
          <div className="max-w-xl">
            <h2 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl font-Shilla">
              {t('title')}
            </h2>
            <p className="text-lg text-black">{t('description')}</p>
          </div>
        </div>
      </div>
      <div className="pt-0 min-h-screen flex flex-col bg-gray-100">
        <div className="container mx-auto px-4 py-6 flex-grow">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <TextInput
              className="w-full md:w-1/3"
              placeholder="Search threads (@your.email to search your threads)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="flex gap-2 flex-wrap">
              <Dropdown label={category}>
                {categories.map((item) => (
                  <Dropdown.Item key={item} onClick={() => setCategory(item)}>
                    {item}
                  </Dropdown.Item>
                ))}
              </Dropdown>
              <Dropdown label={language}>
                {languages.map((item) => (
                  <Dropdown.Item key={item} onClick={() => setLanguage(item)}>
                    {item}
                  </Dropdown.Item>
                ))}
              </Dropdown>
              <Dropdown label={sortOption}>
                {sortOptions.map((item) => (
                  <Dropdown.Item key={item} onClick={() => setSortOption(item)}>
                    {item}
                  </Dropdown.Item>
                ))}
              </Dropdown>
            </div>
            <Button
              className="bg-korean-red hover:bg-red-900"
              onClick={() => router.push('/forum/create')}
            >
              Create Thread
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {currentThreads.length > 0 ? (
              currentThreads.map((thread) => (
                <Card
                  key={thread.id}
                  className="p-3 rounded-md shadow bg-white min-h-32 max-h-auto flex flex-col justify-between"
                  onClick={() => router.push(`/forum/${thread.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <h5 className="text-md font-semibold leading-tight break-words">
                    {truncate(thread.title, 50)}
                  </h5>
                  <p className="text-gray-600 text-sm leading-tight break-words whitespace-pre-line">
                    {truncate(thread.content, 200) || 'No content available.'}
                  </p>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>
                      {thread.author} | {thread.category} | {thread.language} |{' '}
                      {new Date(
                        thread.createdAt?.seconds * 1000
                      ).toLocaleDateString('en-US')}
                    </span>
                    <span>Views {thread.view || 0}</span>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-center text-gray-500">No Threads found.</p>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
