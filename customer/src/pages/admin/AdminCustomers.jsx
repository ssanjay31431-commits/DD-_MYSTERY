import React, { useEffect, useState } from 'react';
import { Users, Search, ShoppingBag } from 'lucide-react';
import API from '../../services/api';
import { AdminSidebar } from '../../components/admin/AdminSidebar';

export const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data } = await API.get('/admin/customers');
        setCustomers(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.includes(searchTerm)
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0f0c1b] w-full max-w-full overflow-x-clip">
      <AdminSidebar />

      <main className="flex-1 w-full max-w-full min-w-0 p-4 sm:p-8 space-y-6 overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-purple-500/20">
          <div>
            <h1 className="text-2xl font-black text-white font-display">Customer Directory</h1>
            <p className="text-xs text-slate-400">View customer spending, total orders, and contact details securely (passwords hidden).</p>
          </div>
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Name/Email/Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
            />
          </div>
        </div>

        <div className="glass-panel rounded-3xl border border-purple-500/20 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300 min-w-[600px]">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Mobile</th>
                <th className="p-4">Total Orders</th>
                <th className="p-4">Total Spent</th>
                <th className="p-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((cust) => (
                <tr key={cust._id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-4 font-bold text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold">
                      {cust.name?.charAt(0)}
                    </div>
                    <span>{cust.name}</span>
                  </td>
                  <td className="p-4 text-slate-300">{cust.email}</td>
                  <td className="p-4 font-mono text-slate-400">{cust.phone}</td>
                  <td className="p-4 font-bold text-amber-300">{cust.totalOrders} Orders</td>
                  <td className="p-4 font-bold text-pink-400">₹{cust.totalSpent}</td>
                  <td className="p-4 text-slate-400">{new Date(cust.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};
