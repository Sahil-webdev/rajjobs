"use client";

import React from "react";
import Link from "next/link";

export default function TestSeriesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden flex flex-col justify-between">
      {/* Background Glow Orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-80 h-80 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Subtle Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" 
      />

      <div className="mx-auto max-w-5xl px-4 py-16 sm:py-24 relative z-10 my-auto text-center">
        
        {/* Launching Soon Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-8 shadow-lg shadow-blue-500/10 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
          </span>
          🚀 Launching Soon
        </div>

        {/* Main Headline with High-End Typography */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-none mb-6">
          <span className="block text-slate-100 mb-2">Test Series</span>
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
            Coming Soon
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-normal mb-12">
          We are crafting an advanced test-prep experience featuring real exam simulations, All-India rankings, subject-wise quizzes, and AI performance analysis.
        </p>

        {/* Feature Teasers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12 text-left">
          
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md shadow-xl hover:border-blue-500/40 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-xl mb-3">
              📝
            </div>
            <h3 className="text-slate-100 font-bold text-sm sm:text-base mb-1">Full Mock Tests</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Curated by exam experts matching latest syllabus & exam patterns.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md shadow-xl hover:border-indigo-500/40 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl mb-3">
              📊
            </div>
            <h3 className="text-slate-100 font-bold text-sm sm:text-base mb-1">Detailed Analytics</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              In-depth analysis of speed, accuracy, weak topics & rank insights.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md shadow-xl hover:border-purple-500/40 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-xl mb-3">
              ⚡
            </div>
            <h3 className="text-slate-100 font-bold text-sm sm:text-base mb-1">Instant Solutions</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Step-by-step detailed explanations for every single question.
            </p>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/exams"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <span>Explore Exam Notifications</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          <Link
            href="/courses"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-sm border border-slate-800 transition-all flex items-center justify-center gap-2"
          >
            <span>Browse Courses</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
