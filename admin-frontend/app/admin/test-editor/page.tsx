"use client";

import { useState } from "react";
import TextFormattingEditor from "../../../components/TextFormattingEditor";

export default function TestEditorPage() {
  const [editorValue, setEditorValue] = useState("");
  const [saveResult, setSaveResult] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    console.log(msg);
  };

  const handleSave = async () => {
    addLog("===============================");
    addLog("🚀 STEP 1: Starting save process");
    addLog(`📝 Editor value length: ${editorValue?.length || 0} chars`);
    addLog(`📝 Editor content: ${editorValue?.substring(0, 100)}...`);
    
    const token = localStorage.getItem('accessToken');
    if (!token) {
      addLog("❌ No access token found!");
      return;
    }
    
    const testData = {
      title: `Test Exam ${Date.now()}`,
      slug: `test-exam-${Date.now()}`,
      category: "SSC",
      metaDescription: "This is a test exam to debug formattedNote saving",
      formattedNote: editorValue,
      status: "draft"
    };
    
    addLog("🚀 STEP 2: Preparing data for backend");
    addLog(`📦 formattedNote being sent: ${testData.formattedNote?.substring(0, 100)}...`);
    addLog(`📦 formattedNote length: ${testData.formattedNote?.length || 0}`);
    
    try {
      addLog("🚀 STEP 3: Sending POST request to backend");
      const response = await fetch("http://localhost:4000/api/admin/exam-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: "include",
        body: JSON.stringify(testData)
      });
      
      addLog(`✅ STEP 4: Got response from backend (Status: ${response.status})`);
      
      const result = await response.json();
      addLog("✅ STEP 5: Parsed JSON response");
      addLog(`📥 Success: ${result.success}`);
      addLog(`📥 Saved ID: ${result.data?._id}`);
      addLog(`📥 Saved formattedNote length: ${result.data?.formattedNote?.length || 0}`);
      addLog(`📥 Saved formattedNote content: ${result.data?.formattedNote?.substring(0, 100) || 'EMPTY'}`);
      
      if (result.data?.formattedNote?.length === 0 || !result.data?.formattedNote) {
        addLog("❌ ❌ ❌ PROBLEM: formattedNote is EMPTY in database!");
      } else if (result.data.formattedNote === editorValue) {
        addLog("✅ ✅ ✅ SUCCESS: Content matches exactly!");
      } else {
        addLog("⚠️ WARNING: Content saved but doesn't match exactly");
      }
      
      setSaveResult(result);
      
      // Now fetch it back to double-check
      if (result.data?._id) {
        addLog("🚀 STEP 6: Fetching back from database to verify");
        const fetchResponse = await fetch(
          `http://localhost:4000/api/admin/exam-details/${result.data._id}`,
          {
            headers: { "Authorization": `Bearer ${token}` },
            credentials: "include"
          }
        );
        const fetchedData = await fetchResponse.json();
        addLog(`🔄 Re-fetched formattedNote length: ${fetchedData.data?.formattedNote?.length || 0}`);
        addLog(`🔄 Re-fetched content: ${fetchedData.data?.formattedNote?.substring(0, 100) || 'EMPTY'}`);
      }
      
      addLog("===============================");
    } catch (err: any) {
      addLog(`❌ ERROR: ${err.message}`);
      console.error(err);
    }
  };

  return (
    <div style={{ padding: 40, maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 24, color: '#1f2937' }}>
        🧪 Text Editor Debug Tool
      </h1>
      
      <div style={{
        background: '#fef3c7',
        border: '3px solid #f59e0b',
        borderRadius: 12,
        padding: 24,
        marginBottom: 32
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#92400e' }}>
          Instructions:
        </h2>
        <ol style={{ paddingLeft: 24, lineHeight: 2, color: '#78350f' }}>
          <li>Type some text in the editor below</li>
          <li>Select text and apply Bold/Italic/Link formatting</li>
          <li>Click "Test Save to Database"</li>
          <li>Check the logs below to see exact step-by-step what happens</li>
          <li>Check browser console (F12) for additional logs</li>
        </ol>
      </div>

      {/* Editor */}
      <div style={{
        background: 'white',
        border: '2px solid #e5e7eb',
        borderRadius: 12,
        padding: 24,
        marginBottom: 24
      }}>
        <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
          Text Formatting Editor:
        </h3>
        <TextFormattingEditor
          label="Test Content"
          value={editorValue}
          onChange={(val) => {
            console.log("📝 Editor onChange triggered, length:", val?.length);
            setEditorValue(val);
            addLog(`✏️ Editor updated: ${val?.length || 0} chars`);
          }}
          placeholder="Type your test content here..."
        />
        
        {/* Current State Display */}
        <div style={{
          marginTop: 16,
          padding: 12,
          background: '#eff6ff',
          borderRadius: 8,
          border: '1px solid #3b82f6'
        }}>
          <p style={{ fontSize: 14, fontWeight: 'bold', color: '#1e40af', marginBottom: 8 }}>
            Current Editor State:
          </p>
          <p style={{ fontSize: 13, fontFamily: 'monospace', color: '#1e40af' }}>
            Length: {editorValue?.length || 0} characters
            <br />
            {editorValue && (
              <>
                Preview: {editorValue.substring(0, 150)}...
                <br />
                HTML: <code style={{ background: '#dbeafe', padding: '2px 6px', borderRadius: 4 }}>
                  {editorValue.substring(0, 100)}
                </code>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={!editorValue || editorValue.length === 0}
        style={{
          background: editorValue ? '#10b981' : '#9ca3af',
          color: 'white',
          padding: '16px 32px',
          fontSize: 18,
          fontWeight: 'bold',
          borderRadius: 12,
          border: 'none',
          cursor: editorValue ? 'pointer' : 'not-allowed',
          boxShadow: editorValue ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
          marginBottom: 32
        }}
      >
        🧪 Test Save to Database
      </button>

      {/* Logs */}
      <div style={{
        background: '#1f2937',
        color: '#f9fafb',
        padding: 24,
        borderRadius: 12,
        fontFamily: 'monospace',
        fontSize: 13,
        lineHeight: 1.8,
        maxHeight: 600,
        overflowY: 'auto'
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16, color: '#10b981' }}>
          📋 Debug Logs:
        </h3>
        {logs.length === 0 ? (
          <p style={{ color: '#9ca3af' }}>No logs yet. Type in editor and click save.</p>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} style={{
              marginBottom: 4,
              color: log.includes('❌') ? '#ef4444' :
                     log.includes('✅') ? '#10b981' :
                     log.includes('⚠️') ? '#f59e0b' :
                     log.includes('🚀') ? '#3b82f6' : '#f9fafb'
            }}>
              {log}
            </div>
          ))
        )}
      </div>

     {/* Save Result */}
      {saveResult && (
        <div style={{
          background: saveResult.success ? '#f0fdf4' : '#fee2e2',
          border: `2px solid ${saveResult.success ? '#10b981' : '#ef4444'}`,
          borderRadius: 12,
          padding: 24,
          marginTop: 24
        }}>
          <h3 style={{
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 16,
            color: saveResult.success ? '#166534' : '#991b1b'
          }}>
            {saveResult.success ? '✅ Save Response:' : '❌ Error Response:'}
          </h3>
          <pre style={{
            background: 'white',
            padding: 16,
            borderRadius: 8,
            overflow: 'auto',
            fontSize: 12
          }}>
            {JSON.stringify(saveResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
