'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import Event from '@/lib/entity/Event';

interface PastEventsProps {
  allEvents: Event[];
}

interface UserData {
  email: string; // "test4@umb.edu"
  username?: string; // "test4"
  introduction?: string;
  role?: string;
  createdAt?: string;
}

export default function PastEvents({ allEvents }: PastEventsProps) {
  const now = new Date();

  // 이미 지나간 이벤트만 필터링, end_date 최신순 정렬
  const past = allEvents
    .filter((event) => event.end_date.toDate() < now)
    .sort(
      (a, b) => b.end_date.toDate().getTime() - a.end_date.toDate().getTime()
    );

  // 날짜 포맷 함수
  const formatDateTime = (timestamp: Event['end_date']) => {
    const date = timestamp.toDate();
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // 긴 텍스트를 100자로 축약
  function truncateText(text: string, maxLength: number) {
    if (text.length <= maxLength) {
      return text;
    }
    return text.slice(0, maxLength) + '...';
  }

  // email -> username 매핑 상태
  const [emailToUsername, setEmailToUsername] = useState<
    Record<string, string>
  >({});

  // 과거 이벤트의 작성자 이메일을 한 번에 가져와 username 조회
  useEffect(() => {
    const fetchUsernames = async () => {
      const uniqueEmails = Array.from(
        new Set(past.map((ev) => ev.author).filter(Boolean))
      );

      // 최대 10명까지 가능
      if (uniqueEmails.length > 0 && uniqueEmails.length <= 10) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', 'in', uniqueEmails));
        const snap = await getDocs(q);

        const map: Record<string, string> = {};
        snap.forEach((doc) => {
          const data = doc.data() as UserData;
          if (data.email && data.username) {
            map[data.email] = data.username;
          }
        });
        setEmailToUsername(map);
      }
    };

    fetchUsernames();
  }, [past]);

  if (past.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-16">
        <p className="text-2xl font-bold text-gray-500 text-center">
          There is no <span className="text-korean-blue">past</span> event yet!
          Follow{' '}
          <Link
            href="https://www.instagram.com/umb_kosa/"
            className="text-red-700 underline hover:text-red-900"
          >
            KOSA Instagram
          </Link>{' '}
          for up-to-date information
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-8 p-16">
      {past.map((event) => {
        // email -> username 매핑이 있으면 username, 없으면 이메일 그대로
        const displayedName = emailToUsername[event.author] || event.author;

        return (
          <Link key={event.id} href={`/event/${event.id}`}>
            <div
              className="
                flex
                flex-col
                md:flex-row
                md:items-start
                items-center
                rounded-3xl
                p-4
                shadow-lg
                space-y-4
                md:space-y-0
                md:space-x-6
                bg-korean-white
              "
            >
              {/* 이미지 영역 */}
              <Image
                src={event.thumbnails?.[0] || '/images/no-image.jpg'}
                alt={event.title}
                width={400}
                height={200}
                className="
                  w-48
                  h-48
                  object-cover
                  rounded-2xl
                "
              />
              {/* 텍스트 영역 */}
              <div className="p-4">
                <h2 className="text-xl text-gray-700 font-bold">
                  {event.title}
                </h2>
                <p className="text-gray-700 text-sm font-bold">
                  📍 {event.location}
                </p>
                <p className="text-gray-700 text-sm">
                  🗓 {formatDateTime(event.start_date)} -{' '}
                  {formatDateTime(event.end_date)}
                </p>
                <p className="text-sm text-gray-700 mt-2">By {displayedName}</p>
                <div className="text-gray-700 mt-2">
                  {truncateText(event.description, 100)}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
