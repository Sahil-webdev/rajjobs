"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Exam {
  _id: string;
  title: string;
  slug: string;
  category: string;
  metaDescription: string;
  lastUpdated: string;
}

const categories = [
  { id: "ssc", label: "SSC", value: "SSC", icon: "📘" },
  { id: "upsc", label: "UPSC", value: "UPSC", icon: "🏛️" },
  { id: "railway", label: "Railway", value: "Railway", icon: "🚂" },
  { id: "defence", label: "Defence", value: "Defence", icon: "🎖️" },
  { id: "teacher", label: "Teacher", value: "Teacher", icon: "📚" },
  { id: "banking", label: "Banking", value: "Banking", icon: "🏦" },
  { id: "state-wise", label: "State Wise", value: "State Wise", icon: "🗺️" },
  { id: "police", label: "Police", value: "Police", icon: "👮" },
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
        
        if (result.success) {
          setExamsData(result.data || []);
        } else {
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
                          (exam.metaDescription && exam.metaDescription.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const activeCategoryObj = categories.find((c) => c.value === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-50/80 pb-16">
      {/* Header Banner Section */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white py-10 px-4 sm:px-6 mb-8 border-b border-slate-800 relative overflow-hidden shadow-lg">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-6xl relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                Exam Directory & Notifications
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                All Competitive Exams
              </h1>
              <p className="text-slate-400 text-sm md:text-base mt-2 max-w-2xl font-normal">
                Explore comprehensive exam updates, syllabi, official notifications, and test details categorized for easy preparation.
              </p>
            </div>

            {/* Search Input Box */}
            <div className="w-full md:w-80 flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" strokeWidth="2.2"/>
                    <path d="m21 21-4.35-4.35" strokeWidth="2.2" strokeLinecap="round"/>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search exams by title or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 text-sm text-slate-100 placeholder:text-slate-400 bg-slate-800/90 border border-slate-700/80 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-slate-800 transition-all outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout Container */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar - Exam Categories */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm shadow-slate-200/50 overflow-hidden sticky top-24 transition-all">
              <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-4 bg-blue-600 rounded-full" />
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">Exam Categories</h2>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full">
                  {categories.length}
                </span>
              </div>

              <div className="p-2.5 max-h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar">
                <div className="space-y-1">
                  {categories.map((category) => {
                    const isSelected = selectedCategory === category.value;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.value)}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-all duration-200 group ${
                          isSelected
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 font-semibold scale-[1.01]"
                            : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 font-medium"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 transition-transform group-hover:scale-110 ${
                            isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                          }`}>
                            {category.icon}
                          </span>
                          <span className="text-sm truncate">{category.label}</span>
                        </div>
                        <svg
                          className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${
                            isSelected ? "text-white translate-x-0.5" : "text-slate-400 group-hover:translate-x-1 group-hover:text-slate-600"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.2"
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

          {/* Right Content - Exam Cards List */}
          <main className="flex-1 min-w-0">
            
            {/* Category Subheader */}
            <div className="flex items-center justify-between mb-5 bg-white px-5 py-4 rounded-2xl border border-slate-200/90 shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl p-2 rounded-xl bg-blue-50 border border-blue-100/80 flex items-center justify-center flex-shrink-0">
                  {activeCategoryObj?.icon || "📋"}
                </span>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-slate-900 truncate">
                    {activeCategoryObj?.label || "Exams"} Notifications
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Showing latest competitive examinations under {activeCategoryObj?.label}
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200/60 rounded-full text-xs font-semibold flex-shrink-0">
                {filteredExams.length} {filteredExams.length === 1 ? 'Exam' : 'Exams'}
              </span>
            </div>

            {/* Content Area */}
            {loading ? (
              /* Shimmer Loading Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-5 h-40 animate-pulse flex flex-col justify-between">
                    <div>
                      <div className="h-4 bg-slate-200 rounded w-1/3 mb-3" />
                      <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
                      <div className="h-3.5 bg-slate-100 rounded w-full mb-1" />
                      <div className="h-3.5 bg-slate-100 rounded w-2/3" />
                    </div>
                    <div className="h-4 bg-slate-200 rounded w-1/4 mt-4" />
                  </div>
                ))}
              </div>
            ) : filteredExams.length > 0 ? (
              /* Exams Card Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredExams.map((exam) => (
                  <Link
                    key={exam._id}
                    href={`/exams/${exam.slug}`}
                    className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-blue-300 transition-all duration-300 relative group flex flex-col justify-between overflow-hidden"
                  >
                    {/* Top gradient highlight strip on hover */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                          {exam.category || selectedCategory}
                        </span>
                        {exam.lastUpdated && (
                          <span className="text-[11px] font-medium text-slate-400">
                            Updated {new Date(exam.lastUpdated).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                        {exam.title}
                      </h3>

                      {/* Meta Description */}
                      {exam.metaDescription && (
                        <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed font-normal">
                          {exam.metaDescription}
                        </p>
                      )}
                    </div>

                    {/* Bottom Link Bar */}
                    <div className="flex items-center justify-between pt-3.5 mt-4 border-t border-slate-100 text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                      <span className="inline-flex items-center gap-1">
                        View Complete Syllabus & Details
                      </span>
                      <div className="w-6 h-6 rounded-full bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-all duration-200">
                        <svg className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-10 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-500 border border-blue-100 flex items-center justify-center mb-4 shadow-inner">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" strokeWidth="1.8"/>
                    <path d="m21 21-4.35-4.35" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">No Exams Available</h3>
                <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
                  {searchQuery 
                    ? `No exam notifications match "${searchQuery}" under ${selectedCategory}. Try searching another keyword.`
                    : `Currently there are no exam notifications listed under the ${selectedCategory} category.`
                  }
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
                  >
                    Clear Search Filter
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
