"use client";

import { useEffect, useState } from 'react';
import api from '../../../lib/api';

type Order = {
  _id: string;
  user: { name: string; email: string };
  course: { title: string };
  amount: number;
  status: 'pending' | 'paid' | 'refunded' | 'failed';
  createdAt: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'refunded' | 'failed'>('all');

  const load = () => {
    const url = filter === 'all' ? '/api/admin/orders' : `/api/admin/orders?status=${filter}`;
    api.get(url).then((res) => setOrders(res.data)).catch(() => {});
  };

  useEffect(() => {
    load();
  }, [filter]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/api/admin/orders/${id}/status`, { status: newStatus });
      load();
    } catch (err) {
      alert('Error updating order');
    }
  };

  const totalRevenue = orders.filter((o) => o.status === 'paid').reduce((sum, o) => sum + o.amount, 0);

  return (
    <div>
      <div className="page-header">
        <h2>Orders & Payments</h2>
        <p>Track all course purchases and payments</p>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 28 }}>💰</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#6b7280', fontSize: 12, textTransform: 'uppercase', fontWeight: 600 }}>Total Revenue</div>
              <h3 style={{ fontSize: 24, marginTop: 4 }}>₹{totalRevenue.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 28 }}>✅</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#6b7280', fontSize: 12, textTransform: 'uppercase', fontWeight: 600 }}>Paid Orders</div>
              <h3 style={{ fontSize: 24, marginTop: 4 }}>{orders.filter((o) => o.status === 'paid').length}</h3>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 28 }}>⏳</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#6b7280', fontSize: 12, textTransform: 'uppercase', fontWeight: 600 }}>Pending</div>
              <h3 style={{ fontSize: 24, marginTop: 4 }}>{orders.filter((o) => o.status === 'pending').length}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {(['all', 'pending', 'paid', 'refunded', 'failed'] as const).map((s) => (
            <button
              key={s}
              className="button"
              style={{
                width: 'auto',
                padding: '8px 16px',
                background: filter === s ? '#3b82f6' : '#e5e7eb',
                color: filter === s ? '#fff' : '#1f2937',
              }}
              onClick={() => setFilter(s)}
            >
              {s === 'all'
                ? 'All'
                : s === 'pending'
                  ? '⏳ Pending'
                  : s === 'paid'
                    ? '✅ Paid'
                    : s === 'refunded'
                      ? '↩️ Refunded'
                      : '❌ Failed'}
            </button>
          ))}
        </div>

        <h3 style={{ marginBottom: 16 }}>Orders ({orders.length})</h3>
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
            <p>No orders found</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Course</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{o.user.name}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{o.user.email}</div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{o.course.title}</td>
                  <td style={{ color: '#059669', fontWeight: 600 }}>₹{o.amount}</td>
                  <td style={{ fontSize: 12, color: '#6b7280' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span
                      className={
                        o.status === 'paid'
                          ? 'badge-success'
                          : o.status === 'pending'
                            ? 'badge-warning'
                            : o.status === 'refunded'
                              ? 'badge-primary'
                              : 'badge-danger'
                      }
                    >
                      {o.status === 'paid'
                        ? '✅ Paid'
                        : o.status === 'pending'
                          ? '⏳ Pending'
                          : o.status === 'refunded'
                            ? '↩️ Refunded'
                            : '❌ Failed'}
                    </span>
                  </td>
                  <td>
                    <select
                      className="input"
                      value={o.status}
                      onChange={(ev) => updateStatus(o._id, ev.target.value)}
                      style={{ padding: '6px 8px', fontSize: 12 }}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="refunded">Refund</option>
                      <option value="failed">Failed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
