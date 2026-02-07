"use client";

import { useState, useEffect } from "react";

interface TestSeries {
  _id: string;
  title: string;
  category: string;
  thumbnailUrl?: string;
  priceOriginal: number;
  priceSale: number;
  isFree: boolean;
  externalLink?: string;
}

const categories = [
  { id: "all", label: "All Tests", value: "all" },
  { id: "ssc", label: "SSC", value: "SSC" },
  { id: "upsc", label: "UPSC", value: "UPSC" },
  { id: "railway", label: "Railway", value: "Railway" },
  { id: "banking", label: "Banking", value: "Banking" },
  { id: "teacher", label: "Teacher", value: "Teacher" },
  { id: "defence", label: "Defence", value: "Defence" },
  { id: "state", label: "State Exams", value: "State" },
];

function TestSeriesCard({ testSeries }: { testSeries: TestSeries }) {
  const discount = testSeries.priceOriginal > 0 
    ? Math.round(((testSeries.priceOriginal - testSeries.priceSale) / testSeries.priceOriginal) * 100)
    : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
      {/* Card Header with Gradient or Thumbnail */}
      {testSeries.thumbnailUrl && testSeries.thumbnailUrl.trim() !== '' ? (
        <div className="relative aspect-[1050/600]">
          <img 
            src={testSeries.thumbnailUrl.startsWith('http') ? testSeries.thumbnailUrl : `http://localhost:4000${testSeries.thumbnailUrl}`}
            alt={testSeries.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center"><h3 class="text-white text-lg font-semibold px-4 text-center">${testSeries.category}</h3></div>`;
            }}
          />
          {discount > 0 && !testSeries.isFree && (
            <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {discount}% OFF
            </span>
          )}
        </div>
      ) : (
        <div className="relative h-36 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
          <h3 className="text-white text-lg font-semibold px-4 text-center">
            {testSeries.category}
          </h3>
          {discount > 0 && !testSeries.isFree && (
            <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {discount}% OFF
            </span>
          )}
        </div>
      )}

      {/* Card Content */}
      <div className="p-3">
        {/* Category Badge */}
        <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full mb-2">
          {testSeries.category}
        </span>

        {/* Test Title */}
        <h4 className="text-slate-900 font-semibold text-sm mb-2 line-clamp-2 min-h-[40px]">
          {testSeries.title}
        </h4>

        {/* Price and Button */}
        <div className="flex items-center justify-between mt-3">
          {testSeries.isFree ? (
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-green-600">FREE</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-slate-900">₹{testSeries.priceSale}</span>
              {testSeries.priceOriginal > testSeries.priceSale && (
                <span className="text-xs text-slate-500 line-through">₹{testSeries.priceOriginal}</span>
              )}
            </div>
          )}
          <a 
            href={testSeries.externalLink || "https://play.google.com/store/apps/details?id=com.yqkbnq.aofamv&hl=en"}
            target="_blank"
            rel="noopener noreferrer"
            className={`${
              testSeries.isFree 
                ? "bg-green-500 hover:bg-green-600" 
                : "bg-blue-600 hover:bg-blue-700"
            } text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors duration-200`}
          >
            View Details
          </a>
        </div>
      </div>
    </div>
  );
}

export default function TestSeriesPage() {
  const [testSeriesData, setTestSeriesData] = useState<TestSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchTestSeries();
  }, []);

  const fetchTestSeries = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/public/test-series`
      );
      const data = await response.json();
      setTestSeriesData(data);
    } catch (error) {
      console.error("Error fetching test series:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter test series based on search and category
  const filteredTestSeries = testSeriesData.filter((test) => {
    const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          test.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || test.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header with Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Test Series</h1>
          
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
              placeholder="Search test series..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-white border border-slate-300 rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
         loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-slate-600">Loading test series...</p>
          </div>
        ) :        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.value
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 border border-slate-200"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Test Series Cards Grid */}
        {filteredTestSeries.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredTestSeries.map((test) => (
              <TestSeriesCard key={test._id} testSeries={test} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-3">
              <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No test series found</h3>
            <p className="text-sm text-slate-600">Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        )}
      </div>
    </div>
  );
}
