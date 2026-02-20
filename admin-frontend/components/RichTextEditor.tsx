"use client";

import { useState, useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter description...",
  label = "Description"
}: RichTextEditorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [textContent, setTextContent] = useState("");
  const [bulletPoints, setBulletPoints] = useState<string[]>([]);

  // Extract bullet points from HTML on mount
  useEffect(() => {
    if (value) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = value;
      const listItems = tempDiv.querySelectorAll('li');
      
      if (listItems.length > 0) {
        const points = Array.from(listItems).map(li => li.textContent || '');
        const text = points.join('\n');
        setTextContent(text);
        setBulletPoints(points);
      }
    }
  }, []);

  // Update bullet points when text changes
  useEffect(() => {
    const lines = textContent.split('\n').filter(line => line.trim() !== '');
    setBulletPoints(lines);
  }, [textContent]);

  const handleSave = () => {
    if (bulletPoints.length > 0) {
      const html = `<ul>${bulletPoints.map(point => `<li>${point.trim()}</li>`).join('')}</ul>`;
      onChange(html);
      setIsModalOpen(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // Get current bullet count from saved HTML
  const getCurrentBulletCount = () => {
    if (!value) return 0;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = value;
    return tempDiv.querySelectorAll('li').length;
  };

  return (
    <div className="form-group">
      <label>{label}</label>
      
      {/* Main Display Box */}
      <div
        style={{
          border: '2px solid #e5e7eb',
          borderRadius: '12px',
          padding: '20px',
          background: '#f9fafb',
          minHeight: '120px',
          cursor: 'pointer',
          transition: 'all 0.3s',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = '#3b82f6';
          e.currentTarget.style.background = '#eff6ff';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = '#e5e7eb';
          e.currentTarget.style.background = '#f9fafb';
        }}
      >
        {/* Current Bullet Points Display or Placeholder */}
        {getCurrentBulletCount() > 0 ? (
          <div>
            <div style={{ 
              fontSize: '13px', 
              fontWeight: '600', 
              color: '#10b981',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>✅ {getCurrentBulletCount()} Bullet Points Added</span>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                style={{
                  padding: '6px 14px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                ✏️ Edit
              </button>
            </div>
            <div 
              dangerouslySetInnerHTML={{ __html: value }}
              style={{
                fontSize: '14px',
                color: '#374151',
                lineHeight: '1.8'
              }}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            style={{
              width: '100%',
              padding: '30px',
              border: '3px dashed #3b82f6',
              borderRadius: '10px',
              background: 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📝</div>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: '700', 
                color: '#1e40af',
                marginBottom: '8px'
              }}>
                Click to Add Bullet Points
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                Paste your content and it will automatically convert to bullet points!
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Modal Popup */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCancel();
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '1200px',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              animation: 'modalFadeIn 0.3s ease-out'
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '24px',
              borderBottom: '2px solid #e5e7eb',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '16px 16px 0 0'
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '20px', 
                fontWeight: '700',
                color: 'white'
              }}>
                ✨ Bullet Points Editor
              </h3>
              <p style={{ 
                margin: '8px 0 0 0', 
                fontSize: '14px',
                color: '#e0e7ff'
              }}>
                Paste your content below - Each line will become a bullet point!
              </p>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              {/* Instructions */}
              <div style={{
                background: '#fef3c7',
                border: '2px solid #f59e0b',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ fontWeight: '700', color: '#92400e', marginBottom: '8px', fontSize: '15px' }}>
                  💡 How to use:
                </div>
                <div style={{ color: '#78350f', fontSize: '13px', lineHeight: '1.7' }}>
                  1️⃣ Copy your content from anywhere (Word, Excel, PDF, etc.)<br/>
                  2️⃣ Paste it in the text area below<br/>
                  3️⃣ Each line will automatically become a bullet point<br/>
                  4️⃣ See live preview on the right side<br/>
                  5️⃣ Click "Save Bullet Points" when done!
                </div>
              </div>

              {/* Editor Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                
                {/* LEFT SIDE - Textarea */}
                <div>
                  <div style={{ 
                    fontWeight: '700', 
                    marginBottom: '12px', 
                    color: '#1f2937',
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>📝 Paste Your Content Here</span>
                    <span style={{
                      background: '#dbeafe',
                      color: '#1e40af',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {bulletPoints.length} lines
                    </span>
                  </div>
                  
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="Paste your content here... Each line will be a bullet point.&#10;&#10;Example:&#10;Minimum Age: 18 years&#10;Maximum Age: 33 years&#10;Age calculated as on 01 January 2026&#10;OBC: 3 years relaxation&#10;SC/ST: 5 years relaxation"
                    style={{
                      width: '100%',
                      minHeight: '400px',
                      padding: '16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      lineHeight: '1.8',
                      resize: 'vertical',
                      background: '#fafafa'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />

                  <div style={{ 
                    marginTop: '12px',
                    padding: '12px',
                    background: '#f3f4f6',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#6b7280',
                    fontWeight: '600'
                  }}>
                    📊 Total: <strong style={{color: '#10b981'}}>{bulletPoints.length}</strong> bullet points will be created
                  </div>
                </div>

                {/* RIGHT SIDE - Live Preview */}
                <div>
                  <div style={{ 
                    fontWeight: '700', 
                    marginBottom: '12px', 
                    color: '#1f2937',
                    fontSize: '15px'
                  }}>
                    👁️ Live Preview (How it will look)
                  </div>

                  <div
                    style={{
                      minHeight: '400px',
                      padding: '20px',
                      border: '3px solid #10b981',
                      borderRadius: '10px',
                      background: 'white',
                      fontSize: '14px',
                      lineHeight: '1.8',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
                    }}
                  >
                    {bulletPoints.length > 0 ? (
                      <ul style={{
                        paddingLeft: '1.5em',
                        margin: 0,
                        listStyleType: 'disc',
                        color: '#374151'
                      }}>
                        {bulletPoints.map((point, index) => (
                          <li key={index} style={{ 
                            margin: '0.6em 0',
                            paddingLeft: '0.4em'
                          }}>
                            {point}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ color: '#9ca3af', textAlign: 'center', paddingTop: '50px' }}>
                        Preview will appear here as you type...
                      </p>
                    )}
                  </div>

                  <div style={{ 
                    marginTop: '12px',
                    padding: '12px',
                    background: '#f0fdf4',
                    border: '1px solid #10b981',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#065f46',
                    fontWeight: '600',
                    textAlign: 'center'
                  }}>
                    ✨ This is exactly how it will appear on your website!
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '20px 24px',
              borderTop: '2px solid #e5e7eb',
              background: '#f9fafb',
              borderRadius: '0 0 16px 16px',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '12px 24px',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  background: 'white',
                  color: '#374151',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f3f4f6'}
                onMouseOut={(e) => e.currentTarget.style.background = 'white'}
              >
                ✕ Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={bulletPoints.length === 0}
                style={{
                  padding: '12px 32px',
                  border: 'none',
                  borderRadius: '8px',
                  background: bulletPoints.length > 0 ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#d1d5db',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '15px',
                  cursor: bulletPoints.length > 0 ? 'pointer' : 'not-allowed',
                  boxShadow: bulletPoints.length > 0 ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  if (bulletPoints.length > 0) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
                  }
                }}
                onMouseOut={(e) => {
                  if (bulletPoints.length > 0) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                  }
                }}
              >
                ✓ Save Bullet Points ({bulletPoints.length})
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .form-group ul {
          padding-left: 1.5em;
          margin: 0.75em 0;
          list-style-type: disc;
        }
        
        .form-group ul li {
          margin: 0.6em 0;
          padding-left: 0.4em;
          line-height: 1.6;
        }

        .form-group p {
          margin: 0.5em 0;
        }
      `}</style>
    </div>
  );
}
