"use client";

import { useEffect, useState } from "react";

interface TestSeries {
  _id: string;
  title: string;
  thumbnailUrl?: string;
  priceOriginal: number;
  priceSale: number;
  isFree: boolean;
  externalLink?: string;
}

function TestSeriesCard({ testSeries }: { testSeries: TestSeries }) {
  const discount =
    testSeries.priceOriginal > 0
      ? Math.round(((testSeries.priceOriginal - testSeries.priceSale) / testSeries.priceOriginal) * 100)
      : 0;

  const thumbnailSrc =
    testSeries.thumbnailUrl && testSeries.thumbnailUrl.trim() !== ""
      ? testSeries.thumbnailUrl.startsWith("http")
        ? testSeries.thumbnailUrl
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}${testSeries.thumbnailUrl}`
      : "";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
      {thumbnailSrc ? (
        <div className="relative aspect-[1050/600]">
          <img
            src={thumbnailSrc}
            alt={testSeries.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          {discount > 0 && !testSeries.isFree && (
            <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {discount}% OFF
            </span>
          )}
        </div>
      ) : (
        <div className="relative h-36 bg-gradient-to-br from-blue-500 to-blue-700" />
      )}

      <div className="p-3">
        <h4 className="text-slate-900 font-semibold text-sm mb-2 line-clamp-2 min-h-[40px]">{testSeries.title}</h4>

        <div className="flex items-center justify-between mt-3">
          {testSeries.isFree ? (
            <span className="text-xl font-bold text-green-600">FREE</span>
          ) : (
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-slate-900">Rs {testSeries.priceSale}</span>
              {testSeries.priceOriginal > testSeries.priceSale && (
                <span className="text-xs text-slate-500 line-through">Rs {testSeries.priceOriginal}</span>
              )}
            </div>
          )}

          <a
            href={testSeries.externalLink || "https://play.google.com/store/apps/details?id=com.yqkbnq.aofamv&hl=en"}
            target="_blank"
            rel="noopener noreferrer"
            className={`${
              testSeries.isFree ? "bg-green-500 hover:bg-green-600" : "bg-blue-600 hover:bg-blue-700"
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

  useEffect(() => {
    const fetchTestSeries = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/public/test-series`
        );
        const data = await response.json();
        setTestSeriesData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching test series:", error);
        setTestSeriesData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestSeries();
  }, []);

  const filteredTestSeries = testSeriesData.filter((test) =>
    test.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Test Series</h1>

          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" strokeWidth="2" />
                <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search test series..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-white border border-slate-300 rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="mb-6">
          <button className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white shadow-sm" type="button">
            All
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
            <p className="mt-4 text-slate-600">Loading test series...</p>
          </div>
        ) : filteredTestSeries.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredTestSeries.map((test) => (
              <TestSeriesCard key={test._id} testSeries={test} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-3">
              <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" strokeWidth="2" />
                <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No test series found</h3>
            <p className="text-sm text-slate-600">Try different keywords.</p>
          </div>
        )}
      </div>
    </div>
  );
}
