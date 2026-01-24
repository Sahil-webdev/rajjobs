import Image from "next/image";

export default function Home() {
  const exams = [
    { title: "SSC", count: "15+ Exams", color: "bg-blue-50", icon: "🛡️" },
    { title: "UPSC", count: "8+ Exams", color: "bg-indigo-50", icon: "🏛️" },
    { title: "Railway", count: "12+ Exams", color: "bg-sky-50", icon: "🚆" },
    { title: "Defence", count: "10+ Exams", color: "bg-teal-50", icon: "🎖️" },
    { title: "Teacher", count: "6+ Exams", color: "bg-amber-50", icon: "📚" },
    { title: "Banking", count: "18+ Exams", color: "bg-cyan-50", icon: "🏦" },
  ];

  const notifications = [
    { tag: "Army", title: "Indian Army Agniveer Rally Schedule", date: "Dec 11, 2024" },
    { tag: "Teacher", title: "CTET December 2024 Answer Key Released", date: "Dec 10, 2024" },
    { tag: "SSC", title: "SSC CGL Tier-2 Result Expected Soon", date: "Dec 9, 2024" },
    { tag: "Railway", title: "RRB Group D PET Schedule Released", date: "Dec 8, 2024" },
  ];

  return (
    <main className="bg-white">
      <section className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-8 md:flex-row md:items-center md:gap-12 md:py-10">
        {/* Left text */}
        <div className="w-full md:w-1/2 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight text-slate-900">
            Welcome to <span className="text-blue-600">Raj Jobs</span>
          </h1>
          <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-xl">
            Your trusted platform for government job alerts, exam prep, and curated resources to help you stay ahead.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
              href="#"
            >
              Get Started For Free
            </a>
            <a
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-black/90 transition"
              href="#"
            >
              <svg className="h-5 w-5" viewBox="0 0 512 512" fill="currentColor" aria-hidden>
                <path d="M325.3 234.3 104 121.8c-7.6-3.9-16.4-3.7-23.7.7-7.3 4.4-11.7 11.9-11.7 20.3v226.4c0 8.4 4.4 15.9 11.7 20.3 4 2.4 8.4 3.7 12.9 3.7 3.7 0 7.5-.9 10.8-2.6l221.3-112.5c8.2-4.1 13.2-12 13.2-21.4.1-9.3-4.9-17.2-13.2-21.4z" />
                <path d="M372.5 150.9 246.8 216l125.7 65.1c6.9 3.6 15.2 3.5 22-.3l82.9-44.7c7.4-4 11.8-11.4 11.8-19.8s-4.4-15.8-11.8-19.8l-82.9-44.7c-6.9-3.8-15.2-3.9-22-.9zM246.8 296l125.7 65.1c3.3 1.7 7.1 2.6 10.8 2.6 4.5 0 8.9-1.2 12.9-3.7l82.9-44.7c7.4-4 11.8-11.4 11.8-19.8 0-8.4-4.4-15.8-11.8-19.8l-82.9-44.7c-6.8-3.6-15.1-3.7-22-.1L246.8 256l-125.7 65.1c-8.2 4.3-13.2 12.2-13.2 21.5s5 17.2 13.2 21.5L246.8 429c3.4 1.8 7.2 2.6 10.8 2.6 4.6 0 9-1.2 13-3.6L326 384.5c7.6-4.2 12.3-11.9 12.3-20.3s-4.7-16.1-12.3-20.3l-79.2-43.9z" />
              </svg>
              Play Store
            </a>
            <a
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-black/90 transition"
              href="#"
            >
              <svg className="h-5 w-5" viewBox="0 0 384 512" fill="currentColor" aria-hidden>
                <path d="M318.7 268.7c-.3-35.2 15.8-61.8 48.2-81.4-18-26.2-45.2-40.6-82-43.1-34.4-2.5-72 20.1-85.5 20.1-14 0-47.7-19.2-73.8-19.2C76.6 146 27 187.6 27 266.4c0 25.6 4.7 52 14.1 79.2C52 372 90 448 130.2 447.7c25.6-.2 43.7-18.2 76.9-18.2 32.6 0 49.4 18.2 73.8 18.2 40.6-.6 75.8-70.4 89.3-102.5-56.6-24.5-51.5-71.6-51.5-76.5zM252.4 96.6c26.3-31.9 23.8-61 23-71.6-22.5 1.3-48.5 15.3-63.8 33.8-16.8 19.5-25 43.5-23 68 24.3 1.9 46.6-10.7 63.8-30.2z" />
              </svg>
              App Store
            </a>
          </div>
        </div>

        {/* Right image */}
        <div className="w-full md:w-1/2 flex justify-center">
          <Image
            src="/bg.png"
            alt="Students preparing for exams"
            width={520}
            height={380}
            className="w-full max-w-md rounded-2xl shadow-lg"
            priority
          />
        </div>
      </section>

      {/* Trending Exams + Notifications */}
      <section className="bg-slate-50 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 lg:flex-row">
          {/* Exams grid */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">Trending Exams</h2>
              <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                Explore More Exams <span aria-hidden>→</span>
              </a>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {exams.map((exam) => (
                <div
                  key={exam.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl ${exam.color} text-blue-600`}>{exam.icon}</div>
                    <div>
                      <div className="text-lg font-semibold text-slate-900">{exam.title}</div>
                      <div className="text-sm text-slate-500">{exam.count}</div>
                    </div>
                  </div>
                </div>
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
                <div className="scroll-vertical space-y-3 px-4 py-4">
                  {[...notifications, ...notifications].map((item, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-100 bg-white/70 p-3 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                      <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">{item.tag}</span>
                        <span className="text-slate-400">{item.date}</span>
                      </div>
                      <div className="mt-1 text-sm font-medium text-slate-900">{item.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
