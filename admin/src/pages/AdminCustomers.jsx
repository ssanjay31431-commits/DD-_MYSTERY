import React, { useEffect, useState } from 'react';
import { Users, Search, Mail, ShieldCheck, ShoppingBag } from 'lucide-react';
import API from '../services/api';
import { AdminSidebar } from '../components/AdminSidebar';

export const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMethod, setFilterMethod] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const getCustomersFromLocal = () => {
    const orders = JSON.parse(localStorage.getItem('dd_orders') || '[]');
    if (!Array.isArray(orders) || orders.length === 0) {
      return [];
    }
    const map = {};
    orders.forEach((ord) => {
      const email = ord.user?.email || ord.deliveryAddressSnapshot?.email || 'customer@example.com';
      if (!map[email]) {
        map[email] = {
          _id: `cust_${email}`,
          name: ord.user?.name || ord.deliveryAddressSnapshot?.fullName || 'Customer',
          email,
          phone: ord.user?.phone || ord.deliveryAddressSnapshot?.mobileNumber || 'N/A',
          googleId: email.includes('gmail.com'),
          totalOrders: 0,
          totalSpent: 0,
          createdAt: ord.createdAt
        };
      }
      map[email].totalOrders += 1;
      map[email].totalSpent += (ord.totalAmount || 0);
    });
    return Object.values(map);
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/customers');
      if (Array.isArray(data) && data.length > 0) {
        setCustomers(data);
      } else {
        setCustomers(getCustomersFromLocal());
      }
    } catch (err) {
      setCustomers(getCustomersFromLocal());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const safeCustomers = Array.isArray(customers) ? customers : getCustomersFromLocal();

  const filteredCustomers = safeCustomers.filter((cust) => {
    const isGoogle = cust.authProviders?.some((p) => p.provider === 'google') || Boolean(cust.googleId);
    const matchesMethod =
      filterMethod === 'All' ||
      (filterMethod === 'Google' && isGoogle) ||
      (filterMethod === 'Email' && !isGoogle);

    const matchesSearch =
      cust.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.phone?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesMethod && matchesSearch;
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0c0a17] w-full max-w-full overflow-x-clip">
      <AdminSidebar />

      <main className="flex-1 w-full max-w-full min-w-0 p-4 sm:p-8 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-purple-500/20">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-display">Customer Directory</h1>
            <p className="text-xs text-slate-400">View registered customers, login methods (Google vs Email), order counts, and total spending.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Name, Email, Phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
              />
            </div>

            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-bold"
            >
              <option value="All">All Auth Methods</option>
              <option value="Google">Google OAuth Users</option>
              <option value="Email">Email/Password Users</option>
            </select>
          </div>
        </div>

        {/* Customers Table */}
        <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-purple-500/20 overflow-x-auto w-full">
          <table className="w-full text-left text-xs text-slate-300 min-w-[600px]">
            <thead className="bg-slate-900/90 text-slate-400 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="p-3">Customer</th>
                <th className="p-3">Login Method</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Joined Date</th>
                <th className="p-3">Total Orders</th>
                <th className="p-3">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    No registered customers yet. Real customers who place orders on the website will appear here!
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const isGoogle = cust.authProviders?.some((p) => p.provider === 'google') || Boolean(cust.googleId);

                  return (
                    <tr key={cust._id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={cust.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(cust.name)}`}
                            alt={cust.name}
                            className="w-9 h-9 rounded-full object-cover border border-purple-500/30"
                          />
                          <div>
                            <span className="font-bold text-white block">{cust.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{cust.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        {isGoogle ? (
                          <span className="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 font-bold text-[10px] inline-flex items-center gap-1">
                            🔵 Google OAuth
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-bold text-[10px]">
                            ✉️ Email / Password
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono">{cust.phone || 'N/A'}</td>
                      <td className="p-3 text-slate-400">{new Date(cust.createdAt).toLocaleDateString()}</td>
                      <td className="p-3 font-bold text-white">{cust.totalOrders || 0}</td>
                      <td className="p-3 font-bold text-emerald-400">₹{cust.totalSpent?.toLocaleString() || 0}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
};
