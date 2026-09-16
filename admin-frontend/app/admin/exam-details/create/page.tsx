"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RichEditor from "@/components/RichEditor";
import SEOEditor from "@/components/SEOEditor";
import ExamPreview from "@/components/ExamPreview";
import api from "@/lib/api";

interface CreateExamPageProps {
  examId?: string;
}

export default function CreateExamPage({ examId }: CreateExamPageProps = {}) {
  const router = useRouter();
  const isEdit = !!examId;
  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "SSC",
    metaDescription: "", // Hidden from UI - kept for type compatibility
    formattedNote: "", // Main content
    status: "published" as "draft" | "published", // Changed default to published
    postedBy: "J. Kaushik",
    jobDetails: {
      isJobPosting: false,
      organizationName: "",
      postName: "",
      startDate: "",
      lastDateToApply: "",
      totalPosts: "",
      qualification: "",
      ageLimit: "",
      salary: "",
      employmentType: "FULL_TIME",
    },
    faqs: [] as Array<{ question: string; answer: string }>,
    seoData: {
      seoDescription: "",
      metaKeywords: [] as string[],
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Generate the initial slug from the title. Once an admin customises the
  // slug, preserve that custom URL while the title continues to be edited.
  useEffect(() => {
    if (formData.title && !isEdit && !isSlugManuallyEdited) {
      const slug = slugify(formData.title);
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, isEdit, isSlugManuallyEdited]);

  // Load exam data for editing
  useEffect(() => {
    if (examId) {
      fetchExamDetail(examId);
    }
  }, [examId]);

  const fetchExamDetail = async (id: string) => {
    try {
      console.log('📥 Loading exam data for edit, ID:', id);
      // Use the api axios instance (has auto token-refresh interceptor)
      const res = await api.get(`/api/admin/exam-details/${id}`);
      const data = res.data;
      console.log('📦 Loaded exam data successfully');

      if (data.success) {
        setFormData(prev => ({
          ...prev,
          title: data.data.title || "",
          slug: data.data.slug || "",
          category: data.data.category || "SSC",
          metaDescription: data.data.metaDescription || "",
          formattedNote: data.data.formattedNote || "",
          status: data.data.status || "draft",
          postedBy: data.data.postedBy || "J. Kaushik",
          jobDetails: {
            isJobPosting: Boolean(data.data.jobDetails?.isJobPosting),
            organizationName: data.data.jobDetails?.organizationName || "",
            postName: data.data.jobDetails?.postName || "",
            startDate: data.data.jobDetails?.startDate
              ? new Date(data.data.jobDetails.startDate).toISOString().slice(0, 10)
              : "",
            lastDateToApply: data.data.jobDetails?.lastDateToApply
              ? new Date(data.data.jobDetails.lastDateToApply).toISOString().slice(0, 10)
              : "",
            totalPosts: data.data.jobDetails?.totalPosts != null ? String(data.data.jobDetails.totalPosts) : "",
            qualification: data.data.jobDetails?.qualification || "",
            ageLimit: data.data.jobDetails?.ageLimit || "",
            salary: data.data.jobDetails?.salary != null
              ? String(data.data.jobDetails.salary)
              : data.data.jobDetails?.minSalary != null ? String(data.data.jobDetails.minSalary) : "",
            employmentType: data.data.jobDetails?.employmentType || "FULL_TIME",
          },
          faqs: Array.isArray(data.data.faqs)
            ? data.data.faqs.map((faq: { question?: string; answer?: string }) => ({
                question: faq.question || "",
                answer: faq.answer || "",
              }))
            : [],
          seoData: {
            seoDescription: data.data.seoData?.seoDescription || "",
            metaKeywords: Array.isArray(data.data.seoData?.metaKeywords)
              ? data.data.seoData.metaKeywords
              : [],
          }
        }));
      } else {
        setError(data.message || "Failed to load exam details");
      }
    } catch (err: any) {
      console.error('❌ Error loading exam:', err);
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setError("Session expired. Please log in again.");
        setTimeout(() => router.push('/login'), 2000);
      } else if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
        setError("Cannot connect to server. Please check if backend is running.");
      } else {
        setError("Failed to load exam details. Please refresh and try again.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError("Please login first. Redirecting...");
        setTimeout(() => router.push('/login'), 1500);
        setLoading(false);
        return;
      }

      console.log('🚀 Starting form submission...');
      console.log('========================================');
      console.log('📦 FULL Form Data Being Sent:');
      console.log('========================================');
      console.log('📄 Title:', formData.title);
      console.log('🔗 Slug:', formData.slug);
      console.log('📂 Category:', formData.category);
      console.log('✅ Status:', formData.status);
      console.log('📝 formattedNote EXISTS:', !!formData.formattedNote);
      console.log('📝 formattedNote TYPE:', typeof formData.formattedNote);
      console.log('📝 formattedNote LENGTH:', formData.formattedNote?.length || 0);
      console.log('📝 formattedNote IS EMPTY STRING:', formData.formattedNote === '');
      console.log('📝 formattedNote FIRST 500 CHARS:');
      console.log(formData.formattedNote?.substring(0, 500) || '⚠️ EMPTY!!!');
      console.log('========================================');
      console.log('📝 FULL formattedNote VALUE (complete):');
      console.log(formData.formattedNote);
      console.log('========================================');
      console.log('🔍 Complete formData object:');
      console.log(JSON.stringify(formData, null, 2));
      console.log('========================================');

      const payload = { ...formData };

      const res = examId
        ? await api.put(`/api/admin/exam-details/${examId}`, payload)
        : await api.post(`/api/admin/exam-details`, payload);

      const data = res.data;
      
      if (data.success) {
        setSuccess(isEdit ? "Exam updated!" : "Exam created!");
        setTimeout(() => router.push("/admin/exam-details"), 1500);
      } else {
        setError(data.message || "Failed to save");
      }
    } catch (err: any) {
      console.error("❌ Error saving exam:", err);
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setError("Session expired. Please login again.");
        setTimeout(() => router.push('/login'), 1500);
      } else if (err.message?.includes('Network Error') || err.code === 'ECONNREFUSED') {
        setError("Cannot connect to server. Please check if backend is running.");
      } else {
        setError(err?.response?.data?.message || err.message || "Network error - Please check your connection");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', color: '#1f2937' }}>
        {isEdit ? '✏️ Edit Exam' : '➕ Create New Exam'}
      </h1>

      {error && (
        <div style={{ padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ padding: '12px', background: '#d1fae5', color: '#065f46', borderRadius: '8px', marginBottom: '16px' }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#3b82f6' }}>
            📝 Basic Information
          </h3>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: '600', fontSize: '14px', color: '#374151', display: 'block', marginBottom: '8px' }}>
              Title *
            </label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., SSC CGL 2024 Notification"
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: '600', fontSize: '14px', color: '#374151', display: 'block', marginBottom: '8px' }}>
              Slug (URL) *
            </label>
            <input
              required
              type="text"
              value={formData.slug}
              onChange={(e) => {
                setIsSlugManuallyEdited(true);
                setFormData(prev => ({ ...prev, slug: slugify(e.target.value) }));
              }}
              placeholder="Slug will be generated from the title"
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                background: '#f9fafb'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ fontWeight: '600', fontSize: '14px', color: '#374151', display: 'block', marginBottom: '8px' }}>
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                <option value="SSC">SSC</option>
                <option value="UPSC">UPSC</option>
                <option value="Railway">Railway</option>
                <option value="Banking">Banking</option>
                <option value="Defence">Defence</option>
                <option value="State Wise">State Wise</option>
                <option value="Teaching">Teaching</option>
                <option value="Police">Police</option>
              </select>
            </div>

            <div>
              <label style={{ fontWeight: '600', fontSize: '14px', color: '#374151', display: 'block', marginBottom: '8px' }}>
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "draft" | "published" })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                <option value="draft">📝 Draft</option>
                <option value="published">✅ Published</option>
              </select>
            </div>

            <div>
              <label style={{ fontWeight: '600', fontSize: '14px', color: '#374151', display: 'block', marginBottom: '8px' }}>
                Posted By
              </label>
              <input
                type="text"
                value={formData.postedBy}
                onChange={(e) => setFormData({ ...formData, postedBy: e.target.value })}
                placeholder="Admin"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700', color: '#1e40af', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.jobDetails.isJobPosting}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  jobDetails: { ...prev.jobDetails, isJobPosting: e.target.checked },
                }))}
                style={{ width: '18px', height: '18px' }}
              />
              This is a real job vacancy (enable Google for Jobs schema)
            </label>
            <p style={{ margin: '8px 0 0 28px', fontSize: '13px', color: '#6b7280' }}>
              Select only for actual recruitment/vacancy notifications—not syllabus, result, admit card, or exam updates.
            </p>

            {formData.jobDetails.isJobPosting && (
              <div style={{ marginTop: '18px', padding: '18px', borderRadius: '10px', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                <h4 style={{ margin: '0 0 16px', color: '#1e3a8a', fontSize: '16px' }}>Job Details for Google for Jobs</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
                  <label style={{ fontWeight: '600', fontSize: '14px', color: '#374151' }}>
                    Organization Name *
                    <input required type="text" value={formData.jobDetails.organizationName} onChange={(e) => setFormData(prev => ({ ...prev, jobDetails: { ...prev.jobDetails, organizationName: e.target.value } }))} placeholder="e.g., Railway Recruitment Board" style={{ ...inputStyle, marginTop: '8px' }} />
                  </label>
                  <label style={{ fontWeight: '600', fontSize: '14px', color: '#374151' }}>
                    Post Name (optional)
                    <input type="text" value={formData.jobDetails.postName} onChange={(e) => setFormData(prev => ({ ...prev, jobDetails: { ...prev.jobDetails, postName: e.target.value } }))} placeholder="e.g., Staff Nurse" style={{ ...inputStyle, marginTop: '8px' }} />
                  </label>
                  <label style={{ fontWeight: '600', fontSize: '14px', color: '#374151' }}>
                    Application Start Date (optional)
                    <input type="date" value={formData.jobDetails.startDate} onChange={(e) => setFormData(prev => ({ ...prev, jobDetails: { ...prev.jobDetails, startDate: e.target.value } }))} style={{ ...inputStyle, marginTop: '8px' }} />
                  </label>
                  <label style={{ fontWeight: '600', fontSize: '14px', color: '#374151' }}>
                    Last Date to Apply *
                    <input required type="date" value={formData.jobDetails.lastDateToApply} onChange={(e) => setFormData(prev => ({ ...prev, jobDetails: { ...prev.jobDetails, lastDateToApply: e.target.value } }))} style={{ ...inputStyle, marginTop: '8px' }} />
                  </label>
                  <label style={{ fontWeight: '600', fontSize: '14px', color: '#374151' }}>
                    Total Posts *
                    <input required type="number" min="1" step="1" value={formData.jobDetails.totalPosts} onChange={(e) => setFormData(prev => ({ ...prev, jobDetails: { ...prev.jobDetails, totalPosts: e.target.value } }))} placeholder="e.g., 22195" style={{ ...inputStyle, marginTop: '8px' }} />
                  </label>
                  <label style={{ fontWeight: '600', fontSize: '14px', color: '#374151' }}>
                    Employment Type
                    <select value={formData.jobDetails.employmentType} onChange={(e) => setFormData(prev => ({ ...prev, jobDetails: { ...prev.jobDetails, employmentType: e.target.value } }))} style={{ ...inputStyle, marginTop: '8px' }}>
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="CONTRACTOR">Contract</option>
                      <option value="TEMPORARY">Temporary</option>
                      <option value="INTERN">Internship</option>
                    </select>
                  </label>
                  <label style={{ fontWeight: '600', fontSize: '14px', color: '#374151' }}>
                    Qualification (optional)
                    <input type="text" value={formData.jobDetails.qualification} onChange={(e) => setFormData(prev => ({ ...prev, jobDetails: { ...prev.jobDetails, qualification: e.target.value } }))} placeholder="e.g., B.Sc. Nursing" style={{ ...inputStyle, marginTop: '8px' }} />
                  </label>
                  <label style={{ fontWeight: '600', fontSize: '14px', color: '#374151' }}>
                    Age Limit (optional)
                    <input type="text" value={formData.jobDetails.ageLimit} onChange={(e) => setFormData(prev => ({ ...prev, jobDetails: { ...prev.jobDetails, ageLimit: e.target.value } }))} placeholder="e.g., 18 to 30 years" style={{ ...inputStyle, marginTop: '8px' }} />
                  </label>
                  <label style={{ fontWeight: '600', fontSize: '14px', color: '#374151', gridColumn: '1 / -1' }}>
                    Salary (optional)
                    <input type="text" value={formData.jobDetails.salary} onChange={(e) => setFormData(prev => ({ ...prev, jobDetails: { ...prev.jobDetails, salary: e.target.value } }))} placeholder="e.g., ₹18,000 – ₹56,900, Level 6 Pay Matrix, or As per rules" style={{ ...inputStyle, marginTop: '8px' }} />
                  </label>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Visible FAQs + FAQPage structured data */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', margin: 0, color: '#3b82f6' }}>❓ Frequently Asked Questions</h3>
              <p style={{ margin: '7px 0 0', fontSize: '13px', color: '#6b7280' }}>These questions and answers will be visible on the exam page and automatically receive FAQ schema.</p>
            </div>
            <button type="button" onClick={() => setFormData(prev => ({ ...prev, faqs: [...prev.faqs, { question: '', answer: '' }] }))} style={{ padding: '9px 14px', border: 'none', borderRadius: '7px', background: '#2563eb', color: '#fff', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>+ Add FAQ</button>
          </div>

          {formData.faqs.length === 0 ? (
            <p style={{ margin: 0, padding: '16px', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#64748b', fontSize: '14px', textAlign: 'center' }}>No FAQs added. Add only FAQs that readers can genuinely find helpful.</p>
          ) : (
            <div style={{ display: 'grid', gap: '14px' }}>
              {formData.faqs.map((faq, index) => (
                <div key={index} style={{ padding: '16px', border: '1px solid #dbeafe', background: '#f8fbff', borderRadius: '9px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
                    <strong style={{ color: '#1e3a8a', fontSize: '14px' }}>FAQ {index + 1}</strong>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, faqs: prev.faqs.filter((_, faqIndex) => faqIndex !== index) }))} style={{ padding: '5px 9px', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626', background: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Remove</button>
                  </div>
                  <input required type="text" value={faq.question} onChange={(e) => setFormData(prev => ({ ...prev, faqs: prev.faqs.map((item, faqIndex) => faqIndex === index ? { ...item, question: e.target.value } : item) }))} placeholder="Question, e.g., What is the last date to apply?" style={{ ...inputStyle, marginBottom: '10px' }} />
                  <textarea required value={faq.answer} onChange={(e) => setFormData(prev => ({ ...prev, faqs: prev.faqs.map((item, faqIndex) => faqIndex === index ? { ...item, answer: e.target.value } : item) }))} placeholder="Write a clear, factual answer" rows={3} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEO Tool */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#3b82f6' }}>
            🎯 SEO Tool
          </h3>
          <SEOEditor
            seoData={formData.seoData}
            examTitle={formData.title}
            slug={formData.slug}
            onChange={(seoData) => setFormData({ ...formData, seoData })}
          />
        </div>

        {/* Main Content Editor */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#3b82f6' }}>
            📄 Main Content
          </h3>
          <RichEditor
            key={examId || 'new'}
            editorData={formData.formattedNote || ""}
            setEditorData={(data) => {
              setFormData(prev => ({ ...prev, formattedNote: data }));
            }}
            handleOnUpdate={(html: string, _field: string) => {
              setFormData(prev => ({ ...prev, formattedNote: html }));
            }}
            uploadFolder="exam-details"
            allowJobHighlights
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 6px rgba(102, 126, 234, 0.25)'
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview
          </button>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={() => router.push('/admin/exam-details')}
              style={{
                padding: '12px 24px',
                background: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: loading ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Saving...' : (isEdit ? 'Update Exam' : 'Create Exam')}
            </button>
          </div>
        </div>
      </form>

      {/* Preview Modal */}
      <ExamPreview 
        formData={formData}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '14px',
  outline: 'none',
  background: '#fff',
};

