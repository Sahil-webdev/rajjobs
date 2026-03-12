"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RichCKEditor from "@/components/RichCKEditor";
import ImageUploader from "@/components/ImageUploader";
import SEOEditor from "@/components/SEOEditor";
import ExamPreview from "@/components/ExamPreview";

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
    description: "", // NEW: Short description below title
    metaDescription: "", // Hidden from UI - kept for type compatibility
    formattedNote: "", // Main content
    posterImage: "",
    status: "published" as "draft" | "published", // Changed default to published
    postedBy: "J. Kaushik",
    seoData: {
      focusKeyword: "",
      lsiKeywords: [] as string[],
      metaTitle: "",
      seoDescription: "",
      metaKeywords: [] as string[],
      imageAltTexts: {
        posterImage: ""
      },
      seoScore: 0,
      readabilityScore: 0
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !isSlugManuallyEdited) {
      const slug = slugify(formData.title);
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, isSlugManuallyEdited]);

  // Load exam data for editing
  useEffect(() => {
    if (examId) {
      fetchExamDetail(examId);
    }
  }, [examId]);

  const fetchExamDetail = async (id: string) => {
    try {
      console.log('📥 Loading exam data for edit, ID:', id);
      const token = localStorage.getItem('accessToken');
      
      // Use AbortController to handle timeout (30 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/admin/exam-details/${id}`,
        { 
          credentials: "include",
          signal: controller.signal,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      clearTimeout(timeoutId);
      const data = await response.json();
      console.log('📦 Loaded exam data:', data);
      console.log('🔍 Backend returned formattedNote:', !!data.data?.formattedNote);
      console.log('🔍 Backend formattedNote length:', data.data?.formattedNote?.length || 0);
      
      if (data.success) {
        // ✅ SAFE: Explicitly map each field instead of direct overwrite
        setFormData(prev => ({
          ...prev,
          title: data.data.title || "",
          slug: data.data.slug || "",
          category: data.data.category || "SSC",
          description: data.data.description || "", // Load description
          metaDescription: data.data.metaDescription || "",
          formattedNote: data.data.formattedNote || "", // This is the critical one!
          posterImage: data.data.posterImage || "",
          status: data.data.status || "draft",
          postedBy: data.data.postedBy || "J. Kaushik",
          seoData: data.data.seoData || prev.seoData
        }));
        setIsSlugManuallyEdited(true);

        console.log('✅ Form data set with:');
        console.log('   title:', data.data.title);
        console.log('   formattedNote length:', data.data.formattedNote?.length || 0);
        console.log('   formattedNote preview:', data.data.formattedNote?.substring(0, 100) || 'EMPTY');
      } else {
        setError(data.message || "Failed to load exam details");
      }
    } catch (err: any) {
      console.error('❌ Error loading exam:', err);
      if (err.name === 'AbortError') {
        setError("Request timeout - Server took too long to respond. Please try again.");
      } else {
        setError("Failed to load exam details");
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

      const url = examId
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/admin/exam-details/${examId}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/admin/exam-details`;
      
      console.log('🌐 API URL:', url);
      console.log('🔐 Has Token:', !!token);
      console.log('✏️ Is Edit Mode:', isEdit);

      // Add timeout to fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(url, {
        method: examId ? "PUT" : "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: "include",
        body: JSON.stringify(formData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('📡 Response Status:', response.status);
      const data = await response.json();
      console.log('📥 Response Data:', data);
      
      if (response.status === 401) {
        setError("Session expired. Please login again.");
        localStorage.removeItem('accessToken');
        setTimeout(() => router.push('/login'), 1500);
        return;
      }
      
      if (data.success) {
        setSuccess(isEdit ? "Exam updated!" : "Exam created!");
        setTimeout(() => router.push("/admin/exam-details"), 1500);
      } else {
        setError(data.message || "Failed to save");
      }
    } catch (err: any) {
      console.error("❌ Error saving exam:", err);
      if (err.name === 'AbortError') {
        setError("Request timeout - Server took too long to respond. Please try again.");
      } else if (err.message.includes('Failed to fetch')) {
        setError("Cannot connect to server. Please check if backend is running on port 4000.");
      } else {
        setError(err.message || "Network error - Please check your connection");
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
              placeholder="ssc-cgl-2024-notification"
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


        </div>

        {/* Description - below title on detail page */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#3b82f6' }}>
            📝 Description (shown below title)
          </h3>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description that appears below the title on the detail page (2-3 sentences)..."
            rows={3}
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
            💡 Keep it short (1-3 sentences). This is displayed directly below the title on the detailed page.
          </p>
        </div>

        {/* Poster Image */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#3b82f6' }}>
            🖼️ Poster Image
          </h3>
          <ImageUploader
            currentImage={formData.posterImage}
            onUpload={(url) => setFormData({ ...formData, posterImage: url })}
            label="Click to upload exam poster"
          />
        </div>

        {/* Main Content Editor */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#3b82f6' }}>
            📄 Main Content (CKEditor)
          </h3>
          <RichCKEditor
            key={examId || 'new'}
            editorData={formData.formattedNote || ""}
            setEditorData={(data) => {
              setFormData(prev => ({ ...prev, formattedNote: data }));
            }}
            handleOnUpdate={(editor: string, _field: string) => {
              setFormData(prev => ({ ...prev, formattedNote: editor }));
            }}
          />
          
        </div>

        {/* SEO Optimization */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#8b5cf6' }}>
            🎯 SEO Optimization
          </h3>
          <SEOEditor
            seoData={formData.seoData}
            examTitle={formData.title}
            slug={formData.slug}
            metaDescription={formData.metaDescription}
            onChange={(seoData) => setFormData({ ...formData, seoData })}
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
