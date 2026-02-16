"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Exam {
  _id: string;
  title: string;
  slug: string;
  category: string;
  metaDescription: string;
  posterImage?: string;
  lastUpdated: string;
}

const categories = [
  { id: "ssc", label: "SSC", value: "SSC", icon: "📘" },
  { id: "upsc", label: "UPSC", value: "UPSC", icon: "🏛️" },
  { id: "railway", label: "Railway", value: "Railway", icon: "🚂" },
  { id: "defence", label: "Defence", value: "Defence", icon: "🎖️" },
  { id: "teacher", label: "Teacher", value: "Teacher", icon: "📚" },
  { id: "banking", label: "Banking", value: "Banking", icon: "🏦" },
];

export default function ExamsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("SSC");
  const [examsData, setExamsData] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch exams from backend
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/public/exam-details?category=${selectedCategory}`;
        console.log('🔍 Fetching exams from:', apiUrl);
        console.log('📂 Selected category:', selectedCategory);
        
        const response = await fetch(apiUrl);
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ API Response:', result);
        console.log('📊 Total exams received:', result.data?.length || 0);
        
        if (result.success) {
          console.log('✨ Setting exams data:', result.data);
          setExamsData(result.data || []);
        } else {
          console.log('❌ API returned success:false');
          setExamsData([]);
        }
      } catch (error) {
        console.error('❌ Error fetching exams:', error);
        setExamsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [selectedCategory]);

  // Filter exams based on search
  const filteredExams = examsData.filter((exam) => {
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          exam.metaDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header with Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">All Exams</h1>
          
          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-white border border-slate-300 rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Main Layout: Sidebar + Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Categories */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
              <div className="p-5 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-900">Exam Categories</h2>
              </div>
              <div className="p-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="space-y-1">
                  {categories.map((category) => {
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.value)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                          selectedCategory === category.value
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{category.icon}</span>
                          <span className="font-medium text-sm">{category.label}</span>
                        </div>
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Right Content - Exams */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-slate-600">Loading exams...</p>
              </div>
            ) : filteredExams.length > 0 ? (
              <div>
                {/* Category Header */}
                <div className="mb-5">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">
                      {categories.find((c) => c.value === selectedCategory)?.icon || "📋"}
                    </span>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {categories.find((c) => c.value === selectedCategory)?.label || "All Exams"}
                    </h2>
                  </div>
                  <p className="text-sm text-slate-600">
                    {filteredExams.length} exam{filteredExams.length !== 1 ? 's' : ''} available
                  </p>
                </div>

                {/* Exams Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredExams.map((exam) => (
                    <Link
                      key={exam._id}
                      href={`/exams/${exam.slug}`}
                      className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group h-28"
                    >
                      <div className="px-5 py-4 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors flex-1 line-clamp-1 overflow-hidden text-ellipsis whitespace-nowrap">
                            {exam.title}
                          </h3>
                          <svg
                            className="h-5 w-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-1 overflow-hidden text-ellipsis whitespace-nowrap">{exam.metaDescription}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                <div className="text-slate-400 mb-3">
                  <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                    <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">No exams found</h3>
                <p className="text-sm text-slate-600">Try adjusting your search or filter to find what you're looking for.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
