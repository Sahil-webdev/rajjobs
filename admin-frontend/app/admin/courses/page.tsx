"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Course {
  _id: string;
  title: string;
  slug: string;
  thumbnailUrl?: string;
  description?: string;
  category?: string;
  priceOriginal: number;
  priceSale: number;
  categories?: string[];
  instructor?: string;
  externalLink?: string;
  createdAt: string;
}

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ category: "", search: "" });

  useEffect(() => {
    fetchCourses();
  }, [filter]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams();
      if (filter.search) queryParams.append("search", filter.search);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/courses?${queryParams}`,
        {
          credentials: "include",
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/courses/${id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      if (response.ok) {
        fetchCourses();
      }
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  // Filter courses by category
  const filteredCourses = courses.filter((course) => {
    if (filter.category && course.categories && course.categories.length > 0) {
      return course.categories.includes(filter.category);
    }
    return true;
  });

  return (
    <div className="container">
      {/* Page Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2>Course Management</h2>
            <p style={{ marginTop: '4px' }}>Create and manage courses</p>
          </div>
          <button
            onClick={() => router.push("/admin/courses/create")}
            className="button"
            style={{ width: 'auto', padding: '10px 20px' }}
          >
            + Create New Course
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-3" style={{ marginBottom: '24px' }}>
        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>Total Courses</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>{courses.length}</div>
          </div>
        </div>
        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>Categories</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
              {new Set(courses.flatMap(c => c.categories || [])).size}
            </div>
          </div>
        </div>
        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>Avg Price</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>
              ₹{courses.length > 0 ? Math.round(courses.reduce((sum, c) => sum + c.priceSale, 0) / courses.length) : 0}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: '600' }}>🔍 Filter Courses</h3>
        <div className="grid grid-2">
          <div className="form-group" style={{ marginBottom: '0' }}>
            <label>Category</label>
            <select
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
              className="input"
            >
              <option value="">All Categories</option>
              <option value="SSC Exam">SSC Exam</option>
              <option value="Banking Exam">Banking Exam</option>
              <option value="Teaching Exam">Teaching Exam</option>
              <option value="Railway Exam">Railway Exam</option>
              <option value="Civil Service Exam">Civil Service Exam</option>
              <option value="Defence Exam">Defence Exam</option>
              <option value="State Exams">State Exams</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: '0' }}>
            <label>Search</label>
            <input
              type="text"
              placeholder="Search course titles..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Course List */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '16px', color: '#6b7280', fontWeight: '500' }}>Loading courses...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }}`}</style>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📚</div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>No Courses Found</h3>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Start creating courses to manage your content
          </p>
          <button
            onClick={() => router.push("/admin/courses/create")}
            className="button"
            style={{ width: 'auto', padding: '12px 24px', margin: '0 auto' }}
          >
            + Create First Course
          </button>
        </div>
      ) : (
        <div className="grid grid-3">
          {filteredCourses.map((course) => (
            <div
              key={course._id}
              className="card"
              style={{ padding: '0', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
              }}
            >
              {/* Image */}
              <div style={{ height: '160px', background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {course.thumbnailUrl ? (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ fontSize: '48px', color: '#93c5fd' }}>📚</div>
                )}
                {course.categories && course.categories.length > 0 && (
                  <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    <span className="badge-primary">{course.categories[0]}</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '8px', minHeight: '40px', lineHeight: '1.4' }}>
                  {course.title}
                </h3>
                
                {course.description && (
                  <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px', minHeight: '36px', lineHeight: '1.4' }}>
                    {course.description.substring(0, 80)}{course.description.length > 80 ? '...' : ''}
                  </p>
                )}

                {/* Price */}
                <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>₹{course.priceSale}</span>
                  {course.priceOriginal > course.priceSale && (
                    <>
                      <span style={{ fontSize: '14px', color: '#9ca3af', textDecoration: 'line-through' }}>₹{course.priceOriginal}</span>
                      <span className="badge-success" style={{ fontSize: '11px' }}>
                        {Math.round((1 - course.priceSale / course.priceOriginal) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => router.push(`/admin/courses/edit/${course._id}`)}
                    className="button"
                    style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(course._id)}
                    className="button danger"
                    style={{ padding: '8px 12px', fontSize: '13px', width: 'auto' }}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
