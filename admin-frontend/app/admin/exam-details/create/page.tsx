"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ImageUploader from "../../../../components/ImageUploader";

export default function ExamDetailFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = params?.id;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadingFile, setUploadingFile] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "SSC",
    metaDescription: "",
    posterImage: "",
    status: "published" as "draft" | "published",
    postedBy: "Admin",
    
    enabledSections: {
      quickHighlights: true,
      importantDates: true,
      vacancyDetails: true,
      eligibility: true,
      examPattern: true,
      salary: true,
      syllabus: false,
      howToApply: true,
      selectionProcess: false,
      previousCutoff: false,
      applicationFees: true,
      importantLinks: true,
      faqs: true,
    },
    
    quickHighlights: {} as Record<string, string>,
    importantDates: [] as Array<{event: string, date: string}>,
    vacancyDetails: { 
      description: "", 
      breakdown: [] as Array<{post: string, vacancies: string}>
    },
    eligibility: {
      qualification: "",
      ageLimit: { minimum: "", maximum: "", relaxation: "" },
      nationality: "",
      experience: ""
    },
    examPattern: [] as Array<{tier: string, mode: string, subjects: string, questions: string, marks: string, duration: string, negativeMarking: string}>,
    salary: { 
      payScale: "", 
      details: [] as Array<{post: string, payLevel: string, salary: string}>, 
      benefits: "" 
    },
    syllabus: { 
      tier1: [] as Array<{subject: string, topics: string}>
    },
    howToApply: [] as Array<{step: number, instruction: string}>,
    selectionProcess: [] as Array<{stage: string, description: string, status: string}>,
    previousCutoff: [] as Array<{category: string, tier1: string, tier2: string, tier3: string}>,
    applicationFees: {
      general: "",
      female: "",
      sc_st: "",
      ph: "",
      exServicemen: "",
      paymentMode: "",
      note: ""
    },
    importantLinks: [] as Array<{label: string, url: string, icon: string, type?: 'url' | 'pdf'}>,
    faqs: [] as Array<{question: string, answer: string}>,
    tags: [] as string[],
    relatedPosts: [] as Array<{title: string, slug: string, category: string}>
  });

  useEffect(() => {
    if (isEdit) {
      fetchExamDetail();
    }
  }, [isEdit]);

  const fetchExamDetail = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/admin/exam-details/${isEdit}`,
        { 
          credentials: "include",
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      if (data.success) {
        setFormData(data.data);
      }
    } catch (err) {
      setError("Failed to load exam details");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.slug || !formData.metaDescription) {
      setError("Please fill Title, Slug and Description");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError("Please login first. Redirecting...");
        setTimeout(() => router.push('/login'), 1500);
        return;
      }

      const url = isEdit
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/admin/exam-details/${isEdit}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/admin/exam-details`;
      
      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      // Handle token expiry/invalid token
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
      console.error("Error saving exam:", err);
      setError(err.message || "Error saving exam");
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: keyof typeof formData.enabledSections) => {
    setFormData({
      ...formData,
      enabledSections: {
        ...formData.enabledSections,
        [section]: !formData.enabledSections[section]
      }
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <button onClick={() => router.back()} style={{ color: '#3b82f6', marginBottom: 8, cursor: 'pointer', background: 'none', border: 'none', fontSize: 14 }}>
            ← Back to List
          </button>
          <h2>{isEdit ? "Edit Exam" : "Create New Exam"}</h2>
          <p>Fill in the exam notification details step by step</p>
        </div>
      </div>

      {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: 12, borderRadius: 8, marginBottom: 20 }}>❌ {error}</div>}
      {success && <div style={{ background: '#dcfce7', color: '#166534', padding: 12, borderRadius: 8, marginBottom: 20 }}>✅ {success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-2" style={{ marginBottom: 24 }}>
          
          {/* Basic Information */}
          <div className="card">
            <h3 style={{ marginBottom: 20, color: '#3b82f6' }}>📋 Basic Information</h3>
            
            <div className="form-group">
              <label>Exam Title *</label>
              <input
                className="input"
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., SSC CGL 2025 - Combined Graduate Level"
              />
            </div>

            <div className="form-group">
              <label>URL Slug *</label>
              <input
                className="input"
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') 
                })}
                placeholder="ssc-cgl-2025"
              />
              <small style={{ color: '#6b7280', fontSize: 12 }}>URL: /exams/{formData.slug || 'your-slug'}</small>
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                className="input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="SSC">SSC</option>
                <option value="UPSC">UPSC</option>
                <option value="Railway">Railway</option>
                <option value="Banking">Banking</option>
                <option value="Teacher">Teacher</option>
                <option value="Defence">Defence</option>
                <option value="State Govt">State Govt</option>
                <option value="Police">Police</option>
              </select>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                className="input"
                required
                rows={8}
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                placeholder="Write a detailed description about this exam..."
                maxLength={500}
              />
              <small style={{ color: '#6b7280', fontSize: 12 }}>{formData.metaDescription.length}/500 characters</small>
            </div>

            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Posted By</label>
                <input
                  className="input"
                  value={formData.postedBy}
                  onChange={(e) => setFormData({ ...formData, postedBy: e.target.value })}
                  placeholder="Admin"
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  className="input"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "draft" | "published" })}
                >
                  <option value="draft">📝 Draft</option>
                  <option value="published">✅ Published</option>
                </select>
                <small style={{ display: 'block', marginTop: '6px', color: '#6b7280', fontSize: '12px' }}>
                  ℹ️ Only <strong>Published</strong> exams will be visible on the website. Draft exams are hidden from public view.
                </small>
              </div>
            </div>
          </div>

          {/* Poster Image */}
          <div className="card">
            <h3 style={{ marginBottom: 20, color: '#3b82f6' }}>🖼️ Poster Image</h3>
            <ImageUploader
              currentImage={formData.posterImage}
              onUpload={(url) => setFormData({ ...formData, posterImage: url })}
              label="Click to upload exam poster"
            />
          </div>
        </div>

        {/* Enable Sections */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 8, color: '#8b5cf6' }}>🎛️ Enable/Disable Sections</h3>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>Select which sections to display on the exam page</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {Object.entries(formData.enabledSections).map(([key, value]) => (
              <label 
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: 12,
                  background: value ? '#eff6ff' : '#f9fafb',
                  border: `2px solid ${value ? '#3b82f6' : '#e5e7eb'}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => toggleSection(key as keyof typeof formData.enabledSections)}
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
                <span style={{ fontSize: 14, fontWeight: 500 }}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        <div className="grid grid-2" style={{ marginBottom: 24 }}>
          
          {/* Quick Highlights */}
          {formData.enabledSections.quickHighlights && (
            <div className="card">
              <h3 style={{ marginBottom: 16, color: '#10b981' }}>⚡ Quick Highlights</h3>
              <div style={{ marginBottom: 12 }}>
                {Object.entries(formData.quickHighlights).map(([key, value]) => (
                  <div key={key} style={{ display: 'flex', gap: 8, marginBottom: 8, padding: 8, background: '#f9fafb', borderRadius: 6 }}>
                    <input className="input" value={key} disabled style={{ flex: 1, fontSize: 13 }} />
                    <input className="input" value={value} disabled style={{ flex: 1, fontSize: 13 }} />
                    <button
                      type="button"
                      onClick={() => {
                        const newHighlights = { ...formData.quickHighlights };
                        delete newHighlights[key];
                        setFormData({ ...formData, quickHighlights: newHighlights });
                      }}
                      style={{ padding: '0 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="button secondary"
                onClick={() => {
                  const key = prompt("Enter key (e.g., Organization):");
                  const value = prompt("Enter value:");
                  if (key && value) {
                    setFormData({
                      ...formData,
                      quickHighlights: { ...formData.quickHighlights, [key]: value }
                    });
                  }
                }}
              >
                + Add Highlight
              </button>
            </div>
          )}

          {/* Important Dates */}
          {formData.enabledSections.importantDates && (
            <div className="card">
              <h3 style={{ marginBottom: 16, color: '#f59e0b' }}>📅 Important Dates</h3>
              <div style={{ marginBottom: 12 }}>
                {formData.importantDates.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                      className="input"
                      placeholder="Event name"
                      value={item.event}
                      onChange={(e) => {
                        const updated = [...formData.importantDates];
                        updated[idx].event = e.target.value;
                        setFormData({ ...formData, importantDates: updated });
                      }}
                      style={{ flex: 1, fontSize: 13 }}
                    />
                    <input
                      className="input"
                      placeholder="Date"
                      value={item.date}
                      onChange={(e) => {
                        const updated = [...formData.importantDates];
                        updated[idx].date = e.target.value;
                        setFormData({ ...formData, importantDates: updated });
                      }}
                      style={{ flex: 1, fontSize: 13 }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          importantDates: formData.importantDates.filter((_, i) => i !== idx)
                        });
                      }}
                      style={{ padding: '0 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="button secondary"
                onClick={() => {
                  setFormData({
                    ...formData,
                    importantDates: [...formData.importantDates, { event: "", date: "" }]
                  });
                }}
              >
                + Add Date
              </button>
            </div>
          )}

          {/* Vacancy Details */}
          {formData.enabledSections.vacancyDetails && (
            <div className="card">
              <h3 style={{ marginBottom: 16, color: '#6366f1' }}>👥 Vacancy Details</h3>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="input"
                  rows={2}
                  value={formData.vacancyDetails.description}
                  onChange={(e) => setFormData({
                    ...formData,
                    vacancyDetails: { ...formData.vacancyDetails, description: e.target.value }
                  })}
                  placeholder="Total vacancies announced..."
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                {formData.vacancyDetails.breakdown.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                      className="input"
                      placeholder="Post name"
                      value={item.post}
                      onChange={(e) => {
                        const updated = [...formData.vacancyDetails.breakdown];
                        updated[idx].post = e.target.value;
                        setFormData({
                          ...formData,
                          vacancyDetails: { ...formData.vacancyDetails, breakdown: updated }
                        });
                      }}
                      style={{ flex: 1, fontSize: 13 }}
                    />
                    <input
                      className="input"
                      placeholder="Count"
                      value={item.vacancies}
                      onChange={(e) => {
                        const updated = [...formData.vacancyDetails.breakdown];
                        updated[idx].vacancies = e.target.value;
                        setFormData({
                          ...formData,
                          vacancyDetails: { ...formData.vacancyDetails, breakdown: updated }
                        });
                      }}
                      style={{ width: 100, fontSize: 13 }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          vacancyDetails: {
                            ...formData.vacancyDetails,
                            breakdown: formData.vacancyDetails.breakdown.filter((_, i) => i !== idx)
                          }
                        });
                      }}
                      style={{ padding: '0 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="button secondary"
                onClick={() => {
                  setFormData({
                    ...formData,
                    vacancyDetails: {
                      ...formData.vacancyDetails,
                      breakdown: [...formData.vacancyDetails.breakdown, { post: "", vacancies: "" }]
                    }
                  });
                }}
              >
                + Add Post
              </button>
            </div>
          )}

          {/* Eligibility */}
          {formData.enabledSections.eligibility && (
            <div className="card">
              <h3 style={{ marginBottom: 16, color: '#14b8a6' }}>✓ Eligibility Criteria</h3>
              <div className="form-group">
                <label>Educational Qualification</label>
                <textarea
                  className="input"
                  rows={2}
                  value={formData.eligibility.qualification}
                  onChange={(e) => setFormData({
                    ...formData,
                    eligibility: { ...formData.eligibility, qualification: e.target.value }
                  })}
                  placeholder="Bachelor's Degree..."
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                <div className="form-group">
                  <label>Min Age</label>
                  <input
                    className="input"
                    value={formData.eligibility.ageLimit.minimum}
                    onChange={(e) => setFormData({
                      ...formData,
                      eligibility: {
                        ...formData.eligibility,
                        ageLimit: { ...formData.eligibility.ageLimit, minimum: e.target.value }
                      }
                    })}
                    placeholder="18"
                  />
                </div>
                <div className="form-group">
                  <label>Max Age</label>
                  <input
                    className="input"
                    value={formData.eligibility.ageLimit.maximum}
                    onChange={(e) => setFormData({
                      ...formData,
                      eligibility: {
                        ...formData.eligibility,
                        ageLimit: { ...formData.eligibility.ageLimit, maximum: e.target.value }
                      }
                    })}
                    placeholder="30"
                  />
                </div>
                <div className="form-group">
                  <label>Relaxation</label>
                  <input
                    className="input"
                    value={formData.eligibility.ageLimit.relaxation}
                    onChange={(e) => setFormData({
                      ...formData,
                      eligibility: {
                        ...formData.eligibility,
                        ageLimit: { ...formData.eligibility.ageLimit, relaxation: e.target.value }
                      }
                    })}
                    placeholder="As per rules"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Nationality</label>
                <input
                  className="input"
                  value={formData.eligibility.nationality}
                  onChange={(e) => setFormData({
                    ...formData,
                    eligibility: { ...formData.eligibility, nationality: e.target.value }
                  })}
                  placeholder="Indian Citizen"
                />
              </div>
              <div className="form-group">
                <label>Experience</label>
                <input
                  className="input"
                  value={formData.eligibility.experience}
                  onChange={(e) => setFormData({
                    ...formData,
                    eligibility: { ...formData.eligibility, experience: e.target.value }
                  })}
                  placeholder="No experience required"
                />
              </div>
            </div>
          )}

          {/* Exam Pattern */}
          {formData.enabledSections.examPattern && (
            <div className="card">
              <h3 style={{ marginBottom: 16, color: '#ec4899' }}>📝 Exam Pattern</h3>
              <div style={{ marginBottom: 12 }}>
                {formData.examPattern.map((item, idx) => (
                  <div key={idx} style={{ marginBottom: 16, padding: 12, background: '#fef3f2', borderRadius: 8, border: '1px solid #fecaca' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <strong>Tier {idx + 1}</strong>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            examPattern: formData.examPattern.filter((_, i) => i !== idx)
                          });
                        }}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Remove
                      </button>
                    </div>
                    <div style={{ display: 'grid', gap: 8 }}>
                      <input className="input" placeholder="Tier name" value={item.tier} onChange={(e) => {
                        const updated = [...formData.examPattern];
                        updated[idx].tier = e.target.value;
                        setFormData({ ...formData, examPattern: updated });
                      }} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <input className="input" placeholder="Mode" value={item.mode} onChange={(e) => {
                          const updated = [...formData.examPattern];
                          updated[idx].mode = e.target.value;
                          setFormData({ ...formData, examPattern: updated });
                        }} />
                        <input className="input" placeholder="Subjects" value={item.subjects} onChange={(e) => {
                          const updated = [...formData.examPattern];
                          updated[idx].subjects = e.target.value;
                          setFormData({ ...formData, examPattern: updated });
                        }} />
                        <input className="input" placeholder="Questions" value={item.questions} onChange={(e) => {
                          const updated = [...formData.examPattern];
                          updated[idx].questions = e.target.value;
                          setFormData({ ...formData, examPattern: updated });
                        }} />
                        <input className="input" placeholder="Marks" value={item.marks} onChange={(e) => {
                          const updated = [...formData.examPattern];
                          updated[idx].marks = e.target.value;
                          setFormData({ ...formData, examPattern: updated });
                        }} />
                        <input className="input" placeholder="Duration" value={item.duration} onChange={(e) => {
                          const updated = [...formData.examPattern];
                          updated[idx].duration = e.target.value;
                          setFormData({ ...formData, examPattern: updated });
                        }} />
                        <input className="input" placeholder="Negative Marking" value={item.negativeMarking} onChange={(e) => {
                          const updated = [...formData.examPattern];
                          updated[idx].negativeMarking = e.target.value;
                          setFormData({ ...formData, examPattern: updated });
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="button secondary"
                onClick={() => {
                  setFormData({
                    ...formData,
                    examPattern: [...formData.examPattern, {
                      tier: "", mode: "", subjects: "", questions: "", marks: "", duration: "", negativeMarking: ""
                    }]
                  });
                }}
              >
                + Add Tier
              </button>
            </div>
          )}

          {/* Application Fees */}
          {formData.enabledSections.applicationFees && (
            <div className="card">
              <h3 style={{ marginBottom: 16, color: '#eab308' }}>💰 Application Fees</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label>General/OBC</label>
                  <input
                    className="input"
                    value={formData.applicationFees.general}
                    onChange={(e) => setFormData({
                      ...formData,
                      applicationFees: { ...formData.applicationFees, general: e.target.value }
                    })}
                    placeholder="₹100"
                  />
                </div>
                <div className="form-group">
                  <label>SC/ST/Female</label>
                  <input
                    className="input"
                    value={formData.applicationFees.sc_st}
                    onChange={(e) => setFormData({
                      ...formData,
                      applicationFees: { ...formData.applicationFees, sc_st: e.target.value }
                    })}
                    placeholder="No Fee"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Payment Mode</label>
                <input
                  className="input"
                  value={formData.applicationFees.paymentMode}
                  onChange={(e) => setFormData({
                    ...formData,
                    applicationFees: { ...formData.applicationFees, paymentMode: e.target.value }
                  })}
                  placeholder="Card, Net Banking, UPI"
                />
              </div>
              <div className="form-group">
                <label>Note</label>
                <textarea
                  className="input"
                  rows={2}
                  value={formData.applicationFees.note}
                  onChange={(e) => setFormData({
                    ...formData,
                    applicationFees: { ...formData.applicationFees, note: e.target.value }
                  })}
                  placeholder="Fee once paid will not be refunded"
                />
              </div>
            </div>
          )}

          {/* How to Apply */}
          {formData.enabledSections.howToApply && (
            <div className="card">
              <h3 style={{ marginBottom: 16, color: '#06b6d4' }}>📝 How to Apply</h3>
              <div style={{ marginBottom: 12 }}>
                {formData.howToApply.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 28, height: 28, background: '#06b6d4', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                      {idx + 1}
                    </div>
                    <textarea
                      className="input"
                      rows={2}
                      placeholder="Step instruction..."
                      value={item.instruction}
                      onChange={(e) => {
                        const updated = [...formData.howToApply];
                        updated[idx].instruction = e.target.value;
                        setFormData({ ...formData, howToApply: updated });
                      }}
                      style={{ flex: 1, fontSize: 13 }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = formData.howToApply.filter((_, i) => i !== idx);
                        updated.forEach((item, i) => item.step = i + 1);
                        setFormData({ ...formData, howToApply: updated });
                      }}
                      style={{ padding: '0 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', alignSelf: 'flex-start' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="button secondary"
                onClick={() => {
                  setFormData({
                    ...formData,
                    howToApply: [...formData.howToApply, { 
                      step: formData.howToApply.length + 1, 
                      instruction: "" 
                    }]
                  });
                }}
              >
                + Add Step
              </button>
            </div>
          )}

          {/* Important Links */}
          {formData.enabledSections.importantLinks && (
            <div className="card">
              <h3 style={{ marginBottom: 16, color: '#ef4444' }}>🔗 Important Links</h3>
              <div style={{ marginBottom: 12 }}>
                {formData.importantLinks.map((item, idx) => (
                  <div key={idx} style={{ marginBottom: 16, padding: 12, background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca' }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input
                        className="input"
                        placeholder="📄"
                        value={item.icon}
                        onChange={(e) => {
                          const updated = [...formData.importantLinks];
                          updated[idx].icon = e.target.value;
                          setFormData({ ...formData, importantLinks: updated });
                        }}
                        style={{ width: 50, textAlign: 'center', fontSize: 16 }}
                      />
                      <input
                        className="input"
                        placeholder="Label"
                        value={item.label}
                        onChange={(e) => {
                          const updated = [...formData.importantLinks];
                          updated[idx].label = e.target.value;
                          setFormData({ ...formData, importantLinks: updated });
                        }}
                        style={{ flex: 1, fontSize: 13 }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            importantLinks: formData.importantLinks.filter((_, i) => i !== idx)
                          });
                        }}
                        style={{ padding: '0 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name={`linkType-${idx}`}
                          checked={item.type !== 'pdf'}
                          onChange={() => {
                            const updated = [...formData.importantLinks];
                            updated[idx].type = 'url';
                            setFormData({ ...formData, importantLinks: updated });
                          }}
                        />
                        <span style={{ fontSize: 13 }}>🔗 URL</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name={`linkType-${idx}`}
                          checked={item.type === 'pdf'}
                          onChange={() => {
                            const updated = [...formData.importantLinks];
                            updated[idx].type = 'pdf';
                            setFormData({ ...formData, importantLinks: updated });
                          }}
                        />
                        <span style={{ fontSize: 13 }}>📄 PDF</span>
                      </label>
                    </div>

                    {item.type === 'pdf' ? (
                      <div>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            
                            if (file.size > 10 * 1024 * 1024) {
                              alert('File size should be less than 10MB');
                              return;
                            }
                            
                            setUploadingFile(idx);
                            const formDataUpload = new FormData();
                            formDataUpload.append('pdf', file);
                            
                            try {
                              const token = localStorage.getItem('accessToken');
                              if (!token) {
                                alert('Please login again');
                                return;
                              }
                              
                              const response = await fetch('http://localhost:4000/api/admin/file/upload-pdf', {
                                method: 'POST',
                                headers: {
                                  'Authorization': `Bearer ${token}`
                                },
                                body: formDataUpload
                              });
                              
                              if (!response.ok) {
                                const errorData = await response.json().catch(() => ({}));
                                throw new Error(errorData.message || 'Upload failed');
                              }
                              
                              const data = await response.json();
                              const updated = [...formData.importantLinks];
                              updated[idx].url = data.data.url;
                              setFormData({ ...formData, importantLinks: updated });
                            } catch (err) {
                              console.error('Upload error:', err);
                              const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                              alert('Failed to upload file: ' + errorMessage);
                            } finally {
                              setUploadingFile(null);
                            }
                          }}
                          style={{ marginBottom: 8 }}
                          disabled={uploadingFile === idx}
                        />
                        {uploadingFile === idx && (
                          <div style={{ fontSize: 12, color: '#3b82f6' }}>📤 Uploading...</div>
                        )}
                        {item.url && uploadingFile !== idx && (
                          <div style={{ fontSize: 12, color: '#10b981', marginTop: 4 }}>
                            ✅ Uploaded: {item.url.split('/').pop()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <input
                        className="input"
                        placeholder="https://example.com"
                        value={item.url}
                        onChange={(e) => {
                          const updated = [...formData.importantLinks];
                          updated[idx].url = e.target.value;
                          setFormData({ ...formData, importantLinks: updated });
                        }}
                        style={{ fontSize: 13 }}
                      />
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="button secondary"
                onClick={() => {
                  setFormData({
                    ...formData,
                    importantLinks: [...formData.importantLinks, { label: "", url: "", icon: "📄", type: "url" }]
                  });
                }}
              >
                + Add Link
              </button>
            </div>
          )}

          {/* FAQs */}
          {formData.enabledSections.faqs && (
            <div className="card">
              <h3 style={{ marginBottom: 16, color: '#8b5cf6' }}>❓ FAQs</h3>
              <div style={{ marginBottom: 12 }}>
                {formData.faqs.map((item, idx) => (
                  <div key={idx} style={{ marginBottom: 12, padding: 12, background: '#faf5ff', borderRadius: 8, border: '1px solid #e9d5ff' }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input
                        className="input"
                        placeholder="Question"
                        value={item.question}
                        onChange={(e) => {
                          const updated = [...formData.faqs];
                          updated[idx].question = e.target.value;
                          setFormData({ ...formData, faqs: updated });
                        }}
                        style={{ flex: 1, fontSize: 13, fontWeight: 600 }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            faqs: formData.faqs.filter((_, i) => i !== idx)
                          });
                        }}
                        style={{ padding: '0 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                      >
                        ✕
                      </button>
                    </div>
                    <textarea
                      className="input"
                      rows={2}
                      placeholder="Answer"
                      value={item.answer}
                      onChange={(e) => {
                        const updated = [...formData.faqs];
                        updated[idx].answer = e.target.value;
                        setFormData({ ...formData, faqs: updated });
                      }}
                      style={{ fontSize: 13 }}
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="button secondary"
                onClick={() => {
                  setFormData({
                    ...formData,
                    faqs: [...formData.faqs, { question: "", answer: "" }]
                  });
                }}
              >
                + Add FAQ
              </button>
            </div>
          )}

        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="button success"
          disabled={loading}
          style={{ maxWidth: 300 }}
        >
          {loading ? "Saving..." : isEdit ? "✓ Update Exam" : "✓ Create Exam"}
        </button>
      </form>
    </div>
  );
}
