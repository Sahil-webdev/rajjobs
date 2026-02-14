"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import EnquiryForm from "@/components/enquiry-form";

type Course = {
  _id: string;
  title: string;
  slug: string;
  thumbnailUrl?: string;
  description?: string;
  priceOriginal: number;
  priceSale: number;
  categories?: string[];
  createdAt: string;
  externalLink?: string;
};

type Notification = {
  _id: string;
  title: string;
  category: string;
  link: string;
  date: string;
};

type TestSeries = {
  _id: string;
  title: string;
  thumbnailUrl?: string;
  priceOriginal: number;
  priceSale: number;
  category: string;
  isFree: boolean;
  externalLink?: string;
  createdAt: string;
};

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [testSeries, setTestSeries] = useState<TestSeries[]>([]);
  const [heroImageIdx, setHeroImageIdx] = useState(0);
  const [showAppStoreModal, setShowAppStoreModal] = useState(false);
  const [examCounts, setExamCounts] = useState({
    SSC: 0,
    UPSC: 0,
    Railway: 0,
    Defence: 0,
    Teacher: 0,
    Banking: 0
  });

  // Hero section right-side carousel images
    const heroImages = [
      { src: "/g1.png", alt: "RajJobs Hero Graphic 1" },
      { src: "/g3.png", alt: "RajJobs Hero Graphic 2" },
    ];

  // Fade carousel for hero graphic
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroImageIdx((prev) => (prev + 1) % heroImages.length);
    }, 4000); // 4 seconds per image
    return () => clearInterval(timer);
  }, [heroImages.length]);

  useEffect(() => {
    fetchExamCounts();
    fetchCourses();
    fetchTestSeries();
  }, []);

    // Removed old banners carousel effect, not needed

  const fetchCourses = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/public/courses?limit=4`
      );
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchTestSeries = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/public/test-series?limit=4`
      );
      const data = await response.json();
      setTestSeries(data);
    } catch (error) {
      console.error("Error fetching test series:", error);
    }
  };

  const fetchExamCounts = async () => {
    try {
      const categories = ["SSC", "UPSC", "Railway", "Defence", "Teacher", "Banking"];
      const counts: any = {};
      
      await Promise.all(
        categories.map(async (category) => {
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/public/exam-details?category=${category}&status=published`
            );
            const data = await response.json();
            counts[category] = data.count || 0;
          } catch {
            counts[category] = 0;
          }
        })
      );
      
      setExamCounts(counts);
    } catch (error) {
      console.error("Error fetching exam counts:", error);
    }
  };

  const exams = [
    { title: "SSC", count: `${examCounts.SSC}+ Exams`, color: "bg-blue-50", img: "/ssc2.png", icon: "", link: "/exams?category=SSC" },
    { title: "UPSC", count: `${examCounts.UPSC}+ Exams`, color: "bg-indigo-50", img: "/upsc.png", icon: "", link: "/exams?category=UPSC" },
    { title: "Railway", count: `${examCounts.Railway}+ Exams`, color: "bg-sky-50", img: "/railway.png", icon: "", link: "/exams?category=Railway" },
    { title: "Defence", count: `${examCounts.Defence}+ Exams`, color: "bg-teal-50", img: "/defence.png", icon: "", link: "/exams?category=Defence" },
    { title: "Teacher", count: `${examCounts.Teacher}+ Exams`, color: "bg-amber-50", img: "/teacher.png", icon: "", link: "/exams?category=Teacher" },
    { title: "Banking", count: `${examCounts.Banking}+ Exams`, color: "bg-cyan-50", img: "/bank.png", icon: "", link: "/exams?category=Banking" },
  ];

  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Fetch notifications from API
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/public/notifications?limit=4`)
      .then(res => res.json())
      .then(data => setNotifications(data))
      .catch(err => console.error('Error fetching notifications:', err));
  }, []);


  return (
    <main className="bg-white">
      {/* Hero Section (Classic) */}
      <section className="w-full bg-white py-10 md:pb-10 md:pt-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center px-4 gap-10 md:gap-0 min-h-[420px] md:min-h-[500px]">
          {/* Left: Text */}
          <div className="flex-1 flex flex-col justify-center text-center md:text-left h-full pt-20">
            <h1 className="text-4xl md:text-5xl font-extrabold text-black mb-4 leading-tight">
              Welcome to <span className="text-blue-800">RajJobs</span>
            </h1>
            <p className="text-lg md:text-[16px] text-gray-500 mb-3 max-w-xl">
              India’s Trusted Platform For <span className="">Competitive Exams</span>,
              <span className=""> Government Jobs</span> &
              <span className=""> Study Material</span>.
              Get Latest Updates, Courses, Test Series, and More — All in One Place!
            </p>
            {/* Play Store & App Store Buttons (side by side, left aligned) */}
            <div className="flex flex-row items-center gap-3 justify-center md:justify-start w-full">
              <a
                href="https://play.google.com/store/apps/details?id=com.yqkbnq.aofamv"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Get it on Google Play"
                className="inline-block hover:opacity-90 transition-opacity"
              >
                <img
                  src="/playstore-badge.png"
                  alt="Get it on Google Play"
                  style={{ height: 110 }}
                />
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setShowAppStoreModal(true);
                }}
                aria-label="Download on the App Store"
                className="inline-block hover:opacity-90 transition-opacity cursor-pointer"
              >
                <img
                  src="/appstore-badge.png"
                  alt="Download on the App Store"
                  style={{ height: 55 }}
                />
              </a>
            </div>
          </div>
          {/* Right: Fade Carousel Graphic (positioned as before) */}
          <div className="flex-1 flex justify-center md:justify-end mt-10 md:mt-0">
            <div className="relative w-[320px] h-[320px] md:w-[420px] md:h-[420px] lg:w-[500px] lg:h-[500px]">
              {heroImages.map((img, idx) => (
                <Image
                  key={img.src}
                  src={img.src}
                  alt={img.alt}
                  fill
                  className={`object-contain drop-shadow-xl transition-opacity duration-1000 ${heroImageIdx === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                  priority={idx === 0}
                  style={{transitionProperty:'opacity'}}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trending Exams + Notifications */}
      <section className="bg-slate-50 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 lg:flex-row">
          {/* Exams grid */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">Trending Exams</h2>
              <Link href="/exams" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                Explore More Exams <span aria-hidden>→</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
              {exams.map((exam) => (
                <Link 
                  key={exam.title}
                  href={exam.link}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-full ${exam.color} text-blue-600`}>
                      {exam.img ? (
                        <Image src={exam.img} alt={exam.title + " Logo"} width={44} height={44} />
                      ) : (
                        <span className="text-2xl">{exam.icon}</span>
                      )}
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-slate-900">{exam.title}</div>
                      <div className="text-sm text-slate-500">{exam.count}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="w-full lg:w-80">
            <div className="rounded-2xl border border-blue-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 bg-blue-600 px-4 py-3 text-white text-sm font-semibold">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 10V3L4 14h7v7l9-11h-7Z" />
                </svg>
                Latest Notifications
              </div>
              <div className="relative h-[360px] overflow-hidden">
                <div className="absolute inset-0 fade-mask" aria-hidden></div>
                <div className="scroll-vertical space-y-3 px-4 py-4 cursor-pointer">
                  {notifications.map((item, idx) => (
                    <a
                      key={item._id || idx}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-xl border border-slate-100 bg-white/70 p-3 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-blue-200 transition-all"
                    >
                      <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">{item.category}</span>
                        <span className="text-slate-400">{new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="mt-1 text-sm font-medium text-slate-900">{item.title}</div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Video Courses */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">Latest Video Courses</h2>
            <Link href="/courses" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Explore More Courses <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-500">
                No courses available yet. Check back soon!
              </div>
            ) : (
              courses.slice(0, 3).map((course) => {
                const discount = course.priceOriginal > 0 
                  ? Math.round(((course.priceOriginal - course.priceSale) / course.priceOriginal) * 100)
                  : 0;
                const category = course.categories?.[0] || 'Course';
                
                return (
                  <div key={course._id} className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg">
                    {course.thumbnailUrl ? (
                      <div className="relative h-48">
                        <img 
                          src={course.thumbnailUrl} 
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="relative h-48 bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                        <h3 className="text-xl font-bold text-white text-center">{category}</h3>
                      </div>
                    )}
                    <div className="flex flex-col flex-1 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          {category}
                        </span>
                        {discount > 0 && (
                          <span className="inline-block rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">
                            {discount}% OFF
                          </span>
                        )}
                      </div>
                      <h4 className="mb-2 text-lg font-semibold text-slate-900 line-clamp-1">
                        {course.title}
                      </h4>
                      {course.description && (
                        <p className="mb-4 text-sm text-slate-600 line-clamp-2">
                          {course.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-bold text-slate-900">₹{course.priceSale}</span>
                          {course.priceOriginal > course.priceSale && (
                            <span className="text-sm text-slate-400 line-through">₹{course.priceOriginal}</span>
                          )}
                        </div>
                        <a 
                          href={course.externalLink || "https://play.google.com/store/apps/details?id=com.yqkbnq.aofamv&hl=en"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition inline-block text-center"
                        >
                          View Details
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Test Series */}
      <section className="bg-slate-50 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">Test Series</h2>
            <Link href="/testseries" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Explore More Test Series <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {testSeries.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-500">
                No test series available yet. Check back soon!
              </div>
            ) : (
              testSeries.map((ts) => {
                const discount = ts.priceOriginal > 0 
                  ? Math.round(((ts.priceOriginal - ts.priceSale) / ts.priceOriginal) * 100)
                  : 0;
                
                return (
                  <div key={ts._id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg">
                    {ts.thumbnailUrl && ts.thumbnailUrl.trim() !== '' ? (
                      <div className="relative aspect-[1050/600]">
                        <img 
                          src={ts.thumbnailUrl.startsWith('http') ? ts.thumbnailUrl : `http://localhost:4000${ts.thumbnailUrl}`}
                          alt={ts.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center"><h3 class="text-xl font-bold text-white text-center">${ts.category}</h3></div>`;
                          }}
                        />
                        {discount > 0 && (
                          <div className="absolute right-3 top-3 rounded-full bg-blue-200 bg-opacity-80 px-3 py-1 text-xs font-bold text-blue-900">
                            {discount}% OFF
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative h-36 bg-gradient-to-br from-blue-600 to-blue-700 p-6 flex items-center justify-center">
                        <h3 className="text-xl font-bold text-white text-center">{ts.category}</h3>
                        {discount > 0 && (
                          <div className="absolute right-3 top-3 rounded-full bg-blue-200 bg-opacity-80 px-3 py-1 text-xs font-bold text-blue-900">
                            {discount}% OFF
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-4">
                      <h4 className="mb-4 text-base font-semibold text-slate-900 line-clamp-2">{ts.title}</h4>
                      <div className="flex items-center justify-between">
                        {ts.isFree ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-green-600">FREE</span>
                          </div>
                        ) : (
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-slate-900">₹{ts.priceSale}</span>
                            {ts.priceOriginal > ts.priceSale && (
                              <span className="text-sm text-slate-400 line-through">₹{ts.priceOriginal}</span>
                            )}
                          </div>
                        )}
                        <a 
                          href={ts.externalLink || "https://play.google.com/store/apps/details?id=com.yqkbnq.aofamv&hl=en"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition inline-block text-center"
                        >
                          View Details
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Mobile App Banner */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-10 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-24 h-24 border-4 border-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-28 h-28 border-4 border-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-20 h-20 border-4 border-white rounded-full"></div>
        </div>

        <div className="mx-auto max-w-6xl px-4 relative z-10">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:justify-between">
            {/* Left Content */}
            <div className="flex-1 text-center md:text-left">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-white">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
                </svg>
                Download Our Mobile App
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
                Learn Anytime, Anywhere with <span className="text-yellow-300">Raj Jobs App</span>
              </h2>
              <p className="text-sm md:text-base text-blue-100 mb-4 max-w-xl">
                Get access to 10,000+ video lectures, mock tests, current affairs, and study materials. Download now and start your preparation journey!
              </p>
              
              <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-white shadow-lg hover:bg-black/90 transition group"
                >
                  <svg className="h-6 w-6" viewBox="0 0 512 512" fill="currentColor">
                    <path d="M325.3 234.3 104 121.8c-7.6-3.9-16.4-3.7-23.7.7-7.3 4.4-11.7 11.9-11.7 20.3v226.4c0 8.4 4.4 15.9 11.7 20.3 4 2.4 8.4 3.7 12.9 3.7 3.7 0 7.5-.9 10.8-2.6l221.3-112.5c8.2-4.1 13.2-12 13.2-21.4.1-9.3-4.9-17.2-13.2-21.4z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-[9px] font-medium opacity-90">GET IT ON</div>
                    <div className="text-sm font-bold">Google Play</div>
                  </div>
                </a>
                
                <a
                  href="#"
                  className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-white shadow-lg hover:bg-black/90 transition group"
                >
                  <svg className="h-6 w-6" viewBox="0 0 384 512" fill="currentColor">
                    <path d="M318.7 268.7c-.3-35.2 15.8-61.8 48.2-81.4-18-26.2-45.2-40.6-82-43.1-34.4-2.5-72 20.1-85.5 20.1-14 0-47.7-19.2-73.8-19.2C76.6 146 27 187.6 27 266.4c0 25.6 4.7 52 14.1 79.2C52 372 90 448 130.2 447.7c25.6-.2 43.7-18.2 76.9-18.2 32.6 0 49.4 18.2 73.8 18.2 40.6-.6 75.8-70.4 89.3-102.5-56.6-24.5-51.5-71.6-51.5-76.5zM252.4 96.6c26.3-31.9 23.8-61 23-71.6-22.5 1.3-48.5 15.3-63.8 33.8-16.8 19.5-25 43.5-23 68 24.3 1.9 46.6-10.7 63.8-30.2z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-[9px] font-medium opacity-90">Download on the</div>
                    <div className="text-sm font-bold">App Store</div>
                  </div>
                </a>
              </div>

              <div className="mt-4 flex items-center gap-4 justify-center md:justify-start text-white">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="h-7 w-7 rounded-full bg-yellow-400 border-2 border-white"></div>
                    <div className="h-7 w-7 rounded-full bg-green-400 border-2 border-white"></div>
                    <div className="h-7 w-7 rounded-full bg-pink-400 border-2 border-white"></div>
                  </div>
                  <div className="text-sm">
                    <div className="font-bold">50K+</div>
                    <div className="text-xs text-blue-200">Active Users</div>
                  </div>
                </div>
                <div className="h-8 w-px bg-white/30"></div>
                <div className="text-sm">
                  <div className="flex items-center gap-1">
                    <svg className="h-5 w-5 text-yellow-300" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                    </svg>
                    <span className="font-bold">4.8</span>
                  </div>
                  <div className="text-xs text-blue-200">App Rating</div>
                </div>
              </div>
            </div>

            {/* Right Image - Phone Mockup */}
            <div className="flex-shrink-0 relative">
              <div className="relative w-48 h-[340px] md:w-56 md:h-[400px]">
                {/* Phone Frame */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] shadow-2xl border-[6px] border-slate-700 overflow-hidden">
                  {/* Screen */}
                  <div className="absolute inset-2 bg-white rounded-[1.5rem] overflow-hidden">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-900 rounded-b-2xl z-10"></div>
                    
                    {/* App Screenshot Content */}
                    <div className="w-full h-full bg-gradient-to-b from-blue-50 to-white">
                      <div className="p-4 pt-7">
                        <div className="flex items-center justify-between mb-4">
                          <div className="h-6 w-6 rounded-lg bg-blue-600"></div>
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-slate-200"></div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="h-20 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg"></div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="h-16 rounded-lg bg-slate-100"></div>
                            <div className="h-16 rounded-lg bg-slate-100"></div>
                          </div>
                          <div className="space-y-1.5">
                            <div className="h-10 rounded-lg bg-white shadow-sm border border-slate-100"></div>
                            <div className="h-10 rounded-lg bg-white shadow-sm border border-slate-100"></div>
                            <div className="h-10 rounded-lg bg-white shadow-sm border border-slate-100"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Side Buttons */}
                  <div className="absolute right-0 top-24 w-1 h-12 bg-slate-700 rounded-l"></div>
                  <div className="absolute right-0 top-40 w-1 h-16 bg-slate-700 rounded-l"></div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-2 -left-2 bg-green-500 text-white rounded-lg px-3 py-1.5 shadow-lg text-[10px] font-bold animate-bounce">
                  FREE
                </div>
                <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white rounded-full h-12 w-12 flex items-center justify-center shadow-lg font-bold text-xs">
                  NEW
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us + Enquiry Form */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Left: Why Choose Raj Jobs */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                Why Choose <span className="text-blue-600">Raj Jobs?</span>
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4 group">
                  <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Expert Faculty</h3>
                    <p className="text-sm text-slate-600">Learn from India's top educators with years of experience in competitive exam preparation.</p>
                  </div>
                </div>

                <div className="flex gap-4 group">
                  <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Comprehensive Study Material</h3>
                    <p className="text-sm text-slate-600">Access video lectures, PDFs, notes, and previous year question papers.</p>
                  </div>
                </div>

                <div className="flex gap-4 group">
                  <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Regular Mock Tests</h3>
                    <p className="text-sm text-slate-600">Practice with exam-like mock tests and get detailed performance analysis.</p>
                  </div>
                </div>

                <div className="flex gap-4 group">
                  <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">24/7 Doubt Support</h3>
                    <p className="text-sm text-slate-600">Get your doubts cleared instantly by our dedicated support team anytime.</p>
                  </div>
                </div>

                <div className="flex gap-4 group">
                  <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Success Community</h3>
                    <p className="text-sm text-slate-600">Join thousands of successful aspirants and learn from their experiences.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Enquiry Form */}
            <div>
              <EnquiryForm />
            </div>
          </div>
        </div>
      </section>

      {/* App Store Download Modal */}
      {showAppStoreModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowAppStoreModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowAppStoreModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Download from App Store</h3>
                <p className="text-sm text-gray-500">Follow these steps</p>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-5">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  1
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 font-medium mb-2">Click the link below to download the app:</p>
                  <a
                    href="https://apps.apple.com/in/app/my-coaching-by-appx/id1662307591"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download App
                  </a>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  2
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 font-medium mb-2">Enter the Organization ID:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 font-mono text-base font-semibold">
                      7710238
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('7710238');
                        alert('Organization ID copied to clipboard!');
                      }}
                      className="px-3 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Note:</span> You'll be asked to enter the Organization ID during the app setup process.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
