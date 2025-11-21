import React, { useState } from 'react';
import { Trash2, Plus, Bell, Settings, ChevronDown, ChevronRight, Mail, Server, Shield } from 'lucide-react';
import { Category, Vendor, Banner } from '../types';

interface AdminPanelProps {
  categories: Category[];
  vendors: Vendor[];
  banners: Banner[];
  onAddCategory: (name: string) => void;
  onRemoveCategory: (id: string) => void;
  onAddSubCategory: (parentId: string, name: string) => void;
  onRemoveSubCategory: (parentId: string, subId: string) => void;
  onRemoveVendor: (id: string) => void;
  onAddBanner: () => void;
  onRemoveBanner: (id: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  categories, vendors, banners, 
  onAddCategory, onRemoveCategory, onAddSubCategory, onRemoveSubCategory,
  onRemoveVendor, 
  onAddBanner, onRemoveBanner
}) => {
  const [activeTab, setActiveTab] = useState<'CATS' | 'VENDORS' | 'BANNERS' | 'CONFIG'>('CATS');
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [newCatName, setNewCatName] = useState('');
  const [newSubCatName, setNewSubCatName] = useState<{[key:string]: string}>({});

  // Config State
  const [emailConfig, setEmailConfig] = useState({
    smtpServer: 'smtp.gmail.com',
    port: '587',
    username: 'admin@dahanu.com',
    alertEmail: 'alerts@dahanu.com',
    enableAlerts: true
  });

  const toggleExpand = (id: string) => {
    const next = new Set(expandedCats);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedCats(next);
  };

  const handleAddCategory = () => {
    if (newCatName.trim()) {
      onAddCategory(newCatName);
      setNewCatName('');
    }
  };

  const handleAddSubCategory = (parentId: string) => {
    const name = newSubCatName[parentId];
    if (name?.trim()) {
      onAddSubCategory(parentId, name);
      setNewSubCatName({...newSubCatName, [parentId]: ''});
    }
  };

  return (
    <div className="bg-white shadow-sm min-h-screen">
      <div className="border-b flex overflow-x-auto">
        <button onClick={() => setActiveTab('CATS')} className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'CATS' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}>Categories</button>
        <button onClick={() => setActiveTab('VENDORS')} className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'VENDORS' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}>Vendors</button>
        <button onClick={() => setActiveTab('BANNERS')} className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'BANNERS' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}>Banners</button>
        <button onClick={() => setActiveTab('CONFIG')} className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'CONFIG' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}>Configuration & Email</button>
      </div>

      <div className="p-6">
        {activeTab === 'CATS' && (
          <div>
            <div className="flex justify-between mb-6 bg-gray-50 p-4 rounded">
              <h2 className="text-xl font-bold flex items-center">Manage Categories</h2>
              <div className="flex gap-2">
                <input 
                   className="border rounded px-2 py-1 text-sm"
                   placeholder="New Category Name"
                   value={newCatName}
                   onChange={e => setNewCatName(e.target.value)}
                />
                <button onClick={handleAddCategory} className="flex items-center gap-2 bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 text-sm">
                    <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>
            
            <ul className="space-y-3">
              {categories.map(c => (
                <li key={c.id} className="border rounded bg-white overflow-hidden">
                   <div className="flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer" onClick={() => toggleExpand(c.id)}>
                       <div className="flex items-center gap-2 font-semibold">
                           {expandedCats.has(c.id) ? <ChevronDown className="w-4 h-4"/> : <ChevronRight className="w-4 h-4"/>}
                           {c.name}
                       </div>
                       <button onClick={(e) => { e.stopPropagation(); onRemoveCategory(c.id); }} className="text-red-500 hover:bg-red-100 p-1.5 rounded"><Trash2 className="w-4 h-4" /></button>
                   </div>
                   
                   {/* Subcategories */}
                   {expandedCats.has(c.id) && (
                     <div className="p-4 pl-8 border-t bg-white">
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Sub-Categories</h4>
                        <ul className="space-y-2 mb-4">
                          {c.subCategories?.map(sub => (
                            <li key={sub.id} className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded">
                               <span>{sub.name}</span>
                               <button onClick={() => onRemoveSubCategory(c.id, sub.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                            </li>
                          ))}
                          {(!c.subCategories || c.subCategories.length === 0) && <li className="text-sm text-gray-400 italic">No subcategories</li>}
                        </ul>
                        <div className="flex gap-2">
                            <input 
                                className="border rounded px-2 py-1 text-xs w-full"
                                placeholder="Add sub-category..."
                                value={newSubCatName[c.id] || ''}
                                onChange={e => setNewSubCatName({...newSubCatName, [c.id]: e.target.value})}
                            />
                            <button onClick={() => handleAddSubCategory(c.id)} className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs font-bold hover:bg-blue-200">Add</button>
                        </div>
                     </div>
                   )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'VENDORS' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Registered Vendors</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 border-b">Name</th>
                    <th className="p-3 border-b">Category</th>
                    <th className="p-3 border-b">Contact</th>
                    <th className="p-3 border-b">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {vendors.map(v => (
                    <tr key={v.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium">{v.name}</td>
                      <td className="p-3 text-gray-500">{v.categoryIds.join(', ')}</td>
                      <td className="p-3 font-mono">{v.contact}</td>
                      <td className="p-3">
                         <button onClick={() => onRemoveVendor(v.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'BANNERS' && (
          <div>
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Ad Banners</h2>
              <button onClick={onAddBanner} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded shadow hover:bg-blue-600">
                <Plus className="w-4 h-4" /> Add New Banner
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {banners.map(b => (
                <div key={b.id} className="border rounded-lg overflow-hidden relative group shadow-sm hover:shadow-md transition">
                  <img src={b.imageUrl} className="h-40 w-full object-cover" alt="banner" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition"></div>
                  <div className="p-2 bg-white border-t">
                     <p className="text-xs text-gray-500 truncate">{b.altText}</p>
                  </div>
                  <button onClick={() => onRemoveBanner(b.id)} className="absolute top-2 right-2 bg-white text-red-600 p-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'CONFIG' && (
          <div className="grid lg:grid-cols-2 gap-8">
             <div>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Settings className="w-5 h-5"/> System Configuration
                </h2>
                <div className="space-y-4 bg-gray-50 p-6 rounded-lg border">
                    <div className="flex items-center justify-between border-b pb-4">
                        <div>
                            <div className="font-semibold flex items-center gap-2"><Bell className="w-4 h-4"/> Email Alerts</div>
                            <div className="text-xs text-gray-500">Receive notifications for new vendor registrations</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={emailConfig.enableAlerts} onChange={e => setEmailConfig({...emailConfig, enableAlerts: e.target.checked})} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between border-b pb-4">
                        <div>
                            <div className="font-semibold flex items-center gap-2"><Shield className="w-4 h-4"/> Maintenance Mode</div>
                            <div className="text-xs text-gray-500">Suspend all user activities</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                    </div>
                </div>
             </div>

             <div>
                 <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Mail className="w-5 h-5"/> Email Server Setup (SMTP)
                 </h2>
                 <div className="space-y-4 bg-gray-50 p-6 rounded-lg border">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold mb-1 text-gray-600">SMTP Server</label>
                            <div className="flex items-center border bg-white rounded px-2">
                                <Server className="w-4 h-4 text-gray-400 mr-2"/>
                                <input type="text" className="w-full py-2 text-sm outline-none" value={emailConfig.smtpServer} onChange={e => setEmailConfig({...emailConfig, smtpServer: e.target.value})} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1 text-gray-600">Port</label>
                            <input type="text" className="w-full border bg-white rounded px-2 py-2 text-sm outline-none" value={emailConfig.port} onChange={e => setEmailConfig({...emailConfig, port: e.target.value})} />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold mb-1 text-gray-600">Username / Email</label>
                        <input type="email" className="w-full border bg-white rounded px-3 py-2 text-sm outline-none" value={emailConfig.username} onChange={e => setEmailConfig({...emailConfig, username: e.target.value})} />
                    </div>

                    <div>
                         <label className="block text-xs font-bold mb-1 text-gray-600">Password</label>
                         <input type="password" value="**********" className="w-full border bg-white rounded px-3 py-2 text-sm outline-none" readOnly />
                    </div>

                    <div>
                         <label className="block text-xs font-bold mb-1 text-gray-600">Admin Alert Recipient</label>
                         <input type="email" className="w-full border bg-white rounded px-3 py-2 text-sm outline-none" value={emailConfig.alertEmail} onChange={e => setEmailConfig({...emailConfig, alertEmail: e.target.value})} />
                    </div>

                    <button className="w-full bg-primary text-white py-2 rounded text-sm font-bold shadow hover:bg-blue-600 transition">Save Configuration</button>
                 </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;