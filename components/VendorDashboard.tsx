
import React from 'react';
import { User, Vendor, Order } from '../types';
import { Calendar, Phone, MapPin, Clock, CheckCircle, XCircle } from 'lucide-react';

interface VendorDashboardProps {
  vendor: Vendor; // The logged in vendor profile
  orders: Order[];
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
}

const VendorDashboard: React.FC<VendorDashboardProps> = ({ vendor, orders, onUpdateStatus }) => {
  const pendingOrders = orders.filter(o => o.status === 'PENDING');
  const activeOrders = orders.filter(o => o.status === 'ACCEPTED');
  const pastOrders = orders.filter(o => o.status === 'COMPLETED' || o.status === 'REJECTED');

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-6 rounded-lg shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Vendor Dashboard</h1>
          <p className="text-gray-600">Welcome back, <span className="font-semibold text-primary">{vendor.name}</span></p>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0 text-center">
           <div className="bg-lime-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-primary">{pendingOrders.length}</div>
              <div className="text-xs text-gray-500 uppercase font-semibold">New Requests</div>
           </div>
           <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{activeOrders.length}</div>
              <div className="text-xs text-gray-500 uppercase font-semibold">Active Jobs</div>
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* New Requests */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-bold text-xl text-gray-800 border-b pb-2">Recent Service Requests</h2>
          
          {pendingOrders.length === 0 && (
            <div className="bg-white p-8 rounded text-center text-gray-400">No new requests at the moment.</div>
          )}

          {pendingOrders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-l-4 border-l-yellow-400 p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-2">
                 <div>
                    <h3 className="font-bold text-lg">{order.serviceRequested}</h3>
                    <p className="text-sm text-gray-500">Req ID: #{order.id}</p>
                 </div>
                 <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">PENDING</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 text-sm">
                 <div className="flex items-center gap-2 text-gray-700">
                    <User className="w-4 h-4 text-gray-400" /> {order.customerName}
                 </div>
                 <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4 text-gray-400" /> {order.customerPhone}
                 </div>
                 <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4 text-gray-400" /> {order.date}
                 </div>
                 <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-4 h-4 text-gray-400" /> {order.address}
                 </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t">
                 <button 
                   onClick={() => onUpdateStatus(order.id, 'REJECTED')}
                   className="px-4 py-2 border border-red-200 text-red-600 rounded hover:bg-red-50 text-sm font-medium"
                 >
                   Reject
                 </button>
                 <button 
                   onClick={() => onUpdateStatus(order.id, 'ACCEPTED')}
                   className="px-4 py-2 bg-primary text-white rounded hover:bg-[#7aa818] text-sm font-bold shadow"
                 >
                   Accept Request
                 </button>
              </div>
            </div>
          ))}

          <h2 className="font-bold text-xl text-gray-800 border-b pb-2 pt-8">Active Jobs</h2>
          {activeOrders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-l-4 border-l-green-500 p-4">
              <div className="flex justify-between items-start mb-2">
                 <div>
                    <h3 className="font-bold text-lg">{order.serviceRequested}</h3>
                    <p className="text-sm text-gray-500">For: {order.customerName}</p>
                 </div>
                 <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">IN PROGRESS</span>
              </div>
              <div className="flex justify-between items-center mt-4">
                 <div className="text-sm text-gray-600 flex items-center gap-2"><Clock className="w-4 h-4"/> Scheduled: {order.date}</div>
                 <button onClick={() => onUpdateStatus(order.id, 'COMPLETED')} className="bg-green-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-green-700">Mark Completed</button>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar - History */}
        <div className="bg-white p-4 rounded-lg shadow-sm h-fit">
           <h3 className="font-bold text-gray-700 mb-4">Order History</h3>
           <div className="space-y-4">
             {pastOrders.map(order => (
               <div key={order.id} className="border-b pb-3 last:border-0">
                  <div className="flex justify-between mb-1">
                     <span className="font-medium text-sm">{order.serviceRequested}</span>
                     {order.status === 'COMPLETED' ? 
                        <CheckCircle className="w-4 h-4 text-green-500"/> : 
                        <XCircle className="w-4 h-4 text-red-500"/>
                     }
                  </div>
                  <div className="text-xs text-gray-500 flex justify-between">
                     <span>{order.date}</span>
                     <span className={order.status === 'COMPLETED' ? 'text-green-600' : 'text-red-500'}>{order.status}</span>
                  </div>
               </div>
             ))}
             {pastOrders.length === 0 && <div className="text-sm text-gray-400 italic">No history yet.</div>}
           </div>
        </div>
      </div>
    </div>
  );
};

const User = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

export default VendorDashboard;
