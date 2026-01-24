"use client";

import { useState, useEffect } from "react";

interface Download {
  id: string;
  title: string;
  category: string;
  type: string;
  pages: number;
  price?: number;
  originalPrice?: number;
  discount?: string;
  isFree: boolean;
  tags: string[];
}

// Sample downloads data
const downloadsData: Download[] = [
  // Free Downloads (First 3)
  {
    id: "1",
    title: "SSC GD Current Affairs - December 2024",
    category: "Current Affairs",
    type: "PDF",
    pages: 45,
    isFree: true,
    tags: ["SSC GD", "Current Affairs"],
  },
  {
    id: "2",
    title: "UPSC Prelims Complete Notes 2025",
    category: "Notes",
    type: "PDF",
    pages: 120,
    isFree: true,
    tags: ["UPSC", "Notes"],
  },
  {
    id: "3",
    title: "Railway RRB General Knowledge Notes",
    category: "Notes",
    type: "PDF",
    pages: 85,
    isFree: true,
    tags: ["Railway", "Notes"],
  },
  // Paid Downloads
  {
    id: "4",
    title: "SSC GD Previous Year Papers (2018-2024)",
    category: "Previous Year Questions",
    type: "PDF",
    pages: 250,
    price: 99,
    originalPrice: 299,
    discount: "67% OFF",
    isFree: false,
    tags: ["SSC GD", "Pyq"],
  },
  {
    id: "5",
    title: "Banking IBPS PO Complete Syllabus 2025",
    category: "Syllabus",
    type: "PDF",
    pages: 35,
    price: 49,
    originalPrice: 149,
    discount: "67% OFF",
    isFree: false,
    tags: ["Banking", "Syllabus"],
  },
  {
    id: "6",
    title: "SSC CGL Previous Year Papers (2015-2024)",
    category: "Previous Year Questions",
    type: "PDF",
    pages: 320,
    price: 149,
    originalPrice: 399,
    discount: "62% OFF",
    isFree: false,
    tags: ["SSC", "Pyq"],
  },
  {
    id: "7",
    title: "UPSC Current Affairs - Complete 2024",
    category: "Current Affairs",
    type: "PDF",
    pages: 280,
    price: 199,
    originalPrice: 499,
    discount: "60% OFF",
    isFree: false,
    tags: ["UPSC", "Current Affairs"],
  },
  {
    id: "8",
    title: "Railway Group D Complete Notes",
    category: "Notes",
    type: "PDF",
    pages: 180,
    price: 129,
    originalPrice: 349,
    discount: "63% OFF",
    isFree: false,
    tags: ["Railway", "Notes"],
  },
  {
    id: "9",
    title: "CTET Previous Year Papers (2018-2024)",
    category: "Previous Year Questions",
    type: "PDF",
    pages: 220,
    price: 119,
    originalPrice: 299,
    discount: "60% OFF",
    isFree: false,
    tags: ["Teacher", "Pyq"],
  },
  {
    id: "10",
    title: "Defence Complete Syllabus 2025",
    category: "Syllabus",
    type: "PDF",
    pages: 42,
    price: 59,
    originalPrice: 149,
    discount: "60% OFF",
    isFree: false,
    tags: ["Defence", "Syllabus"],
  },
  {
    id: "11",
    title: "SSC CHSL Complete Study Notes",
    category: "Notes",
    type: "PDF",
    pages: 195,
    price: 139,
    originalPrice: 379,
    discount: "63% OFF",
    isFree: false,
    tags: ["SSC", "Notes"],
  },
  {
    id: "12",
    title: "Banking Current Affairs 2024",
    category: "Current Affairs",
    type: "PDF",
    pages: 165,
    price: 99,
    originalPrice: 249,
    discount: "60% OFF",
    isFree: false,
    tags: ["Banking", "Current Affairs"],
  },
  {
    id: "13",
    title: "State PSC Previous Year Papers",
    category: "Previous Year Questions",
    type: "PDF",
    pages: 280,
    price: 169,
    originalPrice: 449,
    discount: "62% OFF",
    isFree: false,
    tags: ["State Level", "Pyq"],
  },
  {
    id: "14",
    title: "UPSC Complete Syllabus 2025",
    category: "Syllabus",
    type: "PDF",
    pages: 55,
    price: 79,
    originalPrice: 199,
    discount: "60% OFF",
    isFree: false,
    tags: ["UPSC", "Syllabus"],
  },
  {
    id: "15",
    title: "Railway NTPC Complete Notes",
    category: "Notes",
    type: "PDF",
    pages: 210,
    price: 149,
    originalPrice: 399,
    discount: "62% OFF",
    isFree: false,
    tags: ["Railway", "Notes"],
  },
  {
    id: "16",
    title: "TET Current Affairs December 2024",
    category: "Current Affairs",
    type: "PDF",
    pages: 95,
    price: 79,
    originalPrice: 199,
    discount: "60% OFF",
    isFree: false,
    tags: ["Teacher", "Current Affairs"],
  },
];

const categories = [
  { id: "all", label: "All", value: "all" },
  { id: "notes", label: "Notes", value: "Notes" },
  { id: "current", label: "Current Affairs", value: "Current Affairs" },
  { id: "pyq", label: "Previous Year Questions", value: "Previous Year Questions" },
  { id: "syllabus", label: "Syllabus", value: "Syllabus" },
];

function DetailsModal({ download, onClose }: { download: Download; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-1 transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          {/* Icon and Tags */}
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0">
              <svg className="w-9 h-9 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
              </svg>
            </div>
            <div className="flex-1 pt-2">
              <div className="flex flex-wrap gap-2">
                {download.tags.map((tag, idx) => (
                  <span 
                    key={idx}
                    className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-lg"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-slate-900 mb-4 leading-snug">
            {download.title}
          </h2>

          {/* Price */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-3xl font-bold text-slate-900">₹{download.price}</span>
            <span className="text-base text-slate-500 line-through">₹{download.originalPrice}</span>
            {download.discount && (
              <span className="bg-green-100 text-green-700 text-sm font-semibold px-2.5 py-1 rounded-lg">
                {download.discount}
              </span>
            )}
          </div>

          {/* What's Included */}
          <div className="mb-5">
            <h3 className="text-base font-semibold text-slate-900 mb-3">What's Included</h3>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                </svg>
                <span className="text-sm text-slate-600">{download.pages} pages of comprehensive content</span>
              </div>
              <div className="flex items-start gap-2.5">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="text-sm text-slate-600">Instant PDF download access</span>
              </div>
              <div className="flex items-start gap-2.5">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-sm text-slate-600">Latest updated content</span>
              </div>
            </div>
          </div>

          {/* Continue in App Section */}
          <div className="bg-blue-50 rounded-xl p-4 mb-5">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 rounded-lg p-2 flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 text-sm mb-1">Continue in App</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Complete your purchase and access this PDF in the Raj Jobs app.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 rounded-xl transition-all duration-200"
            >
              Back
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Buy in App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DownloadCard({ download, onDetailsClick, onDownloadClick }: { 
  download: Download; 
  onDetailsClick: (download: Download) => void;
  onDownloadClick: (download: Download) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
      {/* Icon Header */}
      <div className="p-4">
        <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-3">
          <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
          </svg>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {download.tags.map((tag, idx) => (
            <span 
              key={idx}
              className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3 className="text-slate-900 font-semibold text-base mb-2 line-clamp-2 min-h-[48px]">
          {download.title}
        </h3>

        {/* Pages Info */}
        <p className="text-sm text-slate-500 mb-3">
          {download.pages} Pages
        </p>

        {/* Price Section */}
        {download.isFree ? (
          <div className="mb-3">
            <span className="inline-block bg-green-50 text-green-600 text-sm font-bold px-3 py-1 rounded-lg">
              FREE
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl font-bold text-slate-900">₹{download.price}</span>
            <span className="text-sm text-slate-500 line-through">₹{download.originalPrice}</span>
            {download.discount && (
              <span className="bg-green-50 text-green-600 text-xs font-semibold px-2 py-1 rounded-md">
                {download.discount}
              </span>
            )}
          </div>
        )}

        {/* Buttons */}
        {download.isFree ? (
          <button 
            onClick={() => onDownloadClick(download)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => onDetailsClick(download)}
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2.5 rounded-xl transition-colors duration-200"
            >
              Details
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors duration-200">
              Buy Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DownloadsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDownload, setSelectedDownload] = useState<Download | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  const handleDetailsClick = (download: Download) => {
    setSelectedDownload(download);
  };

  const handleCloseModal = () => {
    setSelectedDownload(null);
  };

  const handleDownloadClick = (download: Download) => {
    setNotificationMessage(`Download started: ${download.title}`);
    setShowNotification(true);
    
    // Auto hide notification after 3 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  // Filter downloads based on search and category
  const filteredDownloads = downloadsData.filter((download) => {
    const matchesSearch = download.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          download.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          download.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || download.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in">
          <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 max-w-md">
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <div className="flex-1">
              <p className="font-semibold text-sm">Download Started!</p>
              <p className="text-xs opacity-90 line-clamp-1">{notificationMessage}</p>
            </div>
            <button 
              onClick={() => setShowNotification(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedDownload && (
        <DetailsModal download={selectedDownload} onClose={handleCloseModal} />
      )}

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header with Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Downloads</h1>
          
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
              placeholder="Search downloads..."
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

        {/* Downloads Grid */}
        {filteredDownloads.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredDownloads.map((download) => (
              <DownloadCard 
                key={download.id} 
                download={download}
                onDetailsClick={handleDetailsClick}
                onDownloadClick={handleDownloadClick}
              />
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
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No downloads found</h3>
            <p className="text-sm text-slate-600">Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        )}
      </div>
    </div>
  );
}
