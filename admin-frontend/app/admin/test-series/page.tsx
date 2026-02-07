"use client";

import { useState, useEffect } from "react";
import ImageUploader from '../../../components/ImageUploader';
import api from '../../../lib/api';

type FormState = {
  title: string;
  thumbnailUrl: string;
  priceOriginal: number | string;
  priceSale: number | string;
  category: string;
  isFree: boolean;
  externalLink?: string;
};

const initialForm: FormState = {
  title: "",
  thumbnailUrl: "",
  priceOriginal: "",
  priceSale: "",
  category: "SSC",
  isFree: false,
  externalLink: ""
};

export default function TestSeriesPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [testSeries, setTestSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTestSeries();
  }, []);

  const fetchTestSeries = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log('No access token found');
        setTestSeries([]);
        return;
      }

      const response = await api.get("/api/admin/test-series");
      setTestSeries(response.data.testSeries || []);
    } catch (error: any) {
      console.error('Fetch error:', error);
      if (error.response?.status === 404) {
        console.log('Test series endpoint not found, setting empty array');
        setTestSeries([]);
      } else {
        alert(error.message || "Failed to fetch test series");
      }
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: form.title,
        thumbnailUrl: form.thumbnailUrl,
        priceOriginal: Number(form.priceOriginal) || 0,
        priceSale: Number(form.priceSale) || 0,
        category: form.category,
        isFree: form.isFree
      };

      if (editingId) {
        await api.put(`/api/admin/test-series/${editingId}`, payload);
        alert("Test series updated successfully!");
      } else {
        await api.post("/api/admin/test-series", payload);
        alert("Test series created successfully!");
      }

      setForm(initialForm);
      setEditingId(null);
      fetchTestSeries();
    } catch (error: any) {
      alert(error.message || "Failed to save test series");
    } finally {
      setLoading(false);
    }
  };

  const editTestSeries = (ts: any) => {
    setForm({
      title: ts.title,
      thumbnailUrl: ts.thumbnailUrl || "",
      priceOriginal: ts.priceOriginal,
      priceSale: ts.priceSale,
      category: ts.category || "SSC",
      isFree: ts.isFree || false
    });
    setEditingId(ts._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteTestSeries = async (id: string) => {
    if (!confirm("Are you sure you want to delete this test series?")) return;

    try {
      await api.delete(`/api/admin/test-series/${id}`);
      alert("Test series deleted successfully!");
      fetchTestSeries();
    } catch (error: any) {
      alert(error.message || "Failed to delete test series");
    }
  };

  const cancelEdit = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen w-full">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1.5">Test Series Management</h1>
          <p className="text-xs sm:text-sm text-slate-600">Create and manage test series for competitive exams</p>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-5 mb-4 sm:mb-5">
          <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-4">
            {editingId ? "Edit Test Series" : "Create New Test Series"}
          </h3>
          <form onSubmit={submit} className="space-y-4">
          {/* Title */}
          <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                Test Series Title *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="e.g., SSC CGL 2024 Mock Test Series"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
          </div>

          {/* Image Uploader */}
          <div>
            <ImageUploader
              label="Test Series Thumbnail (Recommended: 1050x600px)"
              currentImage={form.thumbnailUrl || ''}
              onUpload={(url: string) => setForm({ ...form, thumbnailUrl: url })}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Category *
            </label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="SSC">SSC Exam</option>
              <option value="Banking">Banking Exam</option>
              <option value="Railway">Railway Exam</option>
              <option value="UPSC">UPSC Exam</option>
              <option value="Defence">Defence Exam</option>
              <option value="Teacher">Teacher Exam</option>
              <option value="State">State Exams</option>
            </select>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                Original Price (₹) *
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="999"
                value={form.priceOriginal}
                onChange={(e) => setForm({ ...form, priceOriginal: e.target.value })}
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                Sale Price (₹) *
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="499"
                value={form.priceSale}
                onChange={(e) => setForm({ ...form, priceSale: e.target.value })}
                min="0"
                required
              />
            </div>
          </div>

          {/* Free Checkbox */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                checked={form.isFree}
                onChange={(e) => setForm({ ...form, isFree: e.target.checked })}
              />
              <span className="text-xs sm:text-sm font-medium text-slate-700">Mark as Free Test Series</span>
            </label>
          </div>

          {/* External Link */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              External Link (View Details URL)
            </label>
            <input
              type="url"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="e.g., https://example.com/test-series-details"
              value={form.externalLink || ''}
              onChange={(e) => setForm({ ...form, externalLink: e.target.value })}
            />
            <p className="mt-1 text-xs text-slate-500">When users click "View Details", they will be redirected to this URL</p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
              disabled={loading}
            >
              {loading ? "Saving..." : editingId ? "Update Test Series" : "Create Test Series"}
            </button>
            {editingId && (
              <button
                type="button"
                className="w-full sm:w-auto px-4 py-2 bg-slate-200 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-300 transition"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-5">
          <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3">
            All Test Series ({testSeries.length})
          </h3>

          {testSeries.length === 0 ? (
            <p className="text-center py-8 text-xs sm:text-sm text-slate-400">No test series found. Create your first test series above.</p>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:-mx-5 px-4 sm:px-5">
              <div className="inline-block min-w-full align-middle">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-2 sm:px-3 font-semibold text-slate-700 whitespace-nowrap">Thumbnail</th>
                    <th className="text-left py-2 px-2 sm:px-3 font-semibold text-slate-700 whitespace-nowrap">Title</th>
                    <th className="text-left py-2 px-2 sm:px-3 font-semibold text-slate-700 whitespace-nowrap hidden lg:table-cell">Category</th>
                    <th className="text-left py-2 px-2 sm:px-3 font-semibold text-slate-700 whitespace-nowrap hidden md:table-cell">Original</th>
                    <th className="text-left py-2 px-2 sm:px-3 font-semibold text-slate-700 whitespace-nowrap">Sale Price</th>
                    <th className="text-left py-2 px-2 sm:px-3 font-semibold text-slate-700 whitespace-nowrap hidden xl:table-cell">Discount</th>
                    <th className="text-left py-2 px-2 sm:px-3 font-semibold text-slate-700 whitespace-nowrap hidden lg:table-cell">Type</th>
                    <th className="text-left py-2 px-2 sm:px-3 font-semibold text-slate-700 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
              <tbody>
                {testSeries.map((ts) => {
                  const discount = ts.priceOriginal > 0 
                    ? Math.round(((ts.priceOriginal - ts.priceSale) / ts.priceOriginal) * 100)
                    : 0;
                  
                  return (
                    <tr key={ts._id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-2 px-2 sm:px-3">
                        {ts.thumbnailUrl ? (
                          <img 
                            src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${ts.thumbnailUrl}`}
                            alt={ts.title}
                            className="w-10 h-6 sm:w-14 sm:h-8 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-6 sm:w-14 sm:h-8 bg-slate-100 rounded flex items-center justify-center text-[9px] text-slate-400">
                            No Image
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-2 sm:px-3 font-medium text-slate-900 max-w-[100px] sm:max-w-[150px] truncate">{ts.title}</td>
                      <td className="py-2 px-2 sm:px-3 hidden lg:table-cell">
                        <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-semibold whitespace-nowrap">
                          {ts.category}
                        </span>
                      </td>
                      <td className="py-2 px-2 sm:px-3 text-slate-600 whitespace-nowrap hidden md:table-cell">₹{ts.priceOriginal}</td>
                      <td className="py-2 px-2 sm:px-3 font-semibold text-green-600 whitespace-nowrap">₹{ts.priceSale}</td>
                      <td className="py-2 px-2 sm:px-3 hidden xl:table-cell">
                        {discount > 0 && (
                          <span className="inline-block px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded text-[10px] font-bold whitespace-nowrap">
                            {discount}% OFF
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-2 sm:px-3 hidden lg:table-cell">
                        {ts.isFree ? (
                          <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-[10px] font-bold whitespace-nowrap">
                            FREE
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-[10px] font-bold whitespace-nowrap">
                            PAID
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-2 sm:px-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => editTestSeries(ts)}
                            className="px-2 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100 text-[10px] font-medium transition whitespace-nowrap"
                          >
                            <span className="sm:hidden">✏️</span>
                            <span className="hidden sm:inline">✏️ Edit</span>
                          </button>
                          <button
                            onClick={() => deleteTestSeries(ts._id)}
                            className="px-2 py-1 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 text-[10px] font-medium transition whitespace-nowrap"
                          >
                            <span className="sm:hidden">🗑️</span>
                            <span className="hidden sm:inline">🗑️ Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
