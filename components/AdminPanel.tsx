
import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Bell, Settings, ChevronDown, ChevronRight, Mail, Server, Shield, Save, Minus, Upload, CheckCircle, XCircle, AlertCircle, FileText, Pin, PinOff } from 'lucide-react';
import { Category, Vendor, Banner, Product, SystemConfig } from '../types';

interface AdminPanelProps {
  categories: Category[];
  vendors: Vendor[];
  banners: Banner[];
  config: SystemConfig;
  onAddCategory: (name: string) => void;
  onRemoveCategory: (id: string) => void;
  onAddSubCategory: (parentId: string, name: string) => void;
  onRemoveSubCategory: (parentId: string, subId: string) => void;
  onRemoveVendor: (id: string) => void;
  onAddVendor: (vendor: Vendor) => void;
  onApproveVendor: (id: string) => void;
  onAddBanner: (imageUrl: string, link: string, altText: string) => void;
  onRemoveBanner: (id: string) => void;
  onSaveConfig: (config: SystemConfig) => void;
  onPinVendor: (id: string | undefined) => void; // New Prop
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  categories, vendors, banners, config,
  onAddCategory, onRemoveCategory, onAddSubCategory, onRemoveSubCategory,
  onRemoveVendor, onAddVendor, onApproveVendor,
  onAddBanner, onRemoveBanner,
  onSaveConfig, onPinVendor
}) => {
  const [activeTab, setActiveTab] = useState<'CATS' | 'APPROVALS' | 'VENDORS' | 'BANNERS' | 'CONFIG'>('CATS');
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [newCatName, setNewCatName] = useState('');
  const [newSubCatName, setNewSubCatName] = useState<{[key:string]: string}>({});

  // Banner State
  const [showAddBanner, setShowAddBanner] = useState(false);
  const [newBanner, setNewBanner] = useState({ imageUrl: '', link: '', altText: '' });

  // New Service/Vendor State
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [newVendor, setNewVendor] = useState<Partial<Vendor> & { category: string, subCategory: string }>({
    name: '',
    contact: '',
    email: '',
    category: '',
    subCategory: '',
    location: { lat: 0, lng: 0, address: '' },
    products: []
  });
  const [newProduct, setNewProduct] = useState<Product>({ name: '', price: 0, image: '' });

  // Config State - Initialized from props
  const [emailConfig, setEmailConfig] = useState<SystemConfig>(config);

  const pendingVendors = vendors.filter(v => !v.isApproved);
  const approvedVendors = vendors.filter(v => v.isApproved);

  // Sync local state if prop updates (e.g. on reload)
  useEffect(() => {
    setEmailConfig(config);
  }, [config]);

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

  const handleAddProduct = () => {
     if (newProduct.name && newProduct.price > 0) {
         setNewVendor({
             ...newVendor,
             products: [...(newVendor.products || []), newProduct]
         });
         setNewProduct({ name: '', price: 0, image: '' });
     }
  };

  const handleRemoveProduct = (idx: number) => {
      const updated = [...(newVendor.products || [])];
      updated.splice(idx, 1);
      setNewVendor({ ...newVendor, products: updated });
  };

  const handleSubmitVendor = () => {
      if (!newVendor.name || !newVendor.category || !newVendor.subCategory) {
          alert('Please fill Name and Select Category/Subcategory');
          return;
      }

      const finalVendor: Vendor = {
          id: 'v' + Math.random().toString(36).substr(2, 9),
          name: newVendor.name || 'Unknown',
          categoryIds: [newVendor.subCategory, newVendor.category],
          description: 'Service Provider',
          rating: 4.0,
          isVerified: true,
          isApproved: true, // Admin added vendors are auto-approved
          contact: newVendor.contact || '',
          maskedContact: newVendor.contact || '',
          email: newVendor.email,
          location: newVendor.location || { lat: 0, lng: 0, address: '' },
          imageUrl: 'https://picsum.photos/300/200',
          priceStart: newVendor.products && newVendor.products.length > 0 ? Math.min(...newVendor.products.map(p => p.price)) : 0,
          products: newVendor.products
      };

      onAddVendor(finalVendor);
      setShowAddVendor(false);
      setNewVendor({ name: '', contact: '', email: '', category: '', subCategory: '', location: { lat: 0, lng: 0, address: '' }, products: [] });
  };

  const handleSubmitBanner = () => {
    if (newBanner.imageUrl && newBanner.altText) {
      onAddBanner(newBanner.imageUrl, newBanner.link || '#', newBanner.altText);
      setNewBanner({ imageUrl: '', link: '', altText: '' });
      setShowAddBanner(false);
    } else {
      alert("Please provide an Image URL and Alt Text");
    }
  };

  const handleSaveConfig = () => {
    if (!emailConfig.smtpServer || !emailConfig.username) {
      alert("Please fill at least the Server and Username fields.");
      return;
    }
    onSaveConfig(emailConfig);
  };

  // Helpers for Dropdowns
  const getAvailableSubCategories = (catId: string) => {
      const cat = categories.find(c => c.id === catId);
      if (!cat) return [];

      const flatten = (c: Category, prefix: string = ''): {id: string, name: string}[] => {
          let list: {id: string, name: string}[] = [];
          if (c.subCategories) {
              c.subCategories.forEach(sub => {
                  const displayName = prefix ? `${prefix} › ${sub.name}` : sub.name;
                  list.push({ id: sub.id, name: displayName });
                  list = [...list, ...flatten(sub, displayName)];
              });
          }
          return list;
      }
      return flatten(cat);
  };

  const subCategoriesList = getAvailableSubCategories(newVendor.category);

  return (
    <div className="bg-white shadow-sm min-h-screen">
      <div className="border-b flex overflow-x-auto">
        <button onClick={() => setActiveTab('CATS')} className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'CATS' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}>Categories</button>
        
        <button onClick={() => setActiveTab('APPROVALS')} className={`px-6 py-4 font-medium whitespace-nowrap flex items-center gap-2 ${activeTab === 'APPROVALS' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}>
            Approvals
            {pendingVendors.length > 0 ? (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">{pendingVendors.length}</span>
            ) : (
                <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">0</span>
            )}
        </button>

        <button onClick={() => setActiveTab('VENDORS')} className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'VENDORS' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}>
            Services & Vendors
        </button>
        <button onClick={() => setActiveTab('BANNERS')} className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'BANNERS' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}>Banners</button>
        <button onClick={() => setActiveTab('CONFIG')} className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'CONFIG' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}>Configuration</button>
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
                            <button onClick={() => handleAddSubCategory(c.id)} className="bg-[#9C81A4]/10 text-[#7E6885] px-3 py-1 rounded text-xs font-bold hover:bg-[#9C81A4]/20">Add</button>
                        </div>
                     </div>
                   )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* APPROVALS TAB CONTENT */}
        {activeTab === 'APPROVALS' && (
             <div className="animate-fade-in">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <FileText className="w-6 h-6"/> Pending Registrations
                </h2>

                {pendingVendors.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <CheckCircle className="w-12 h-12 text-green-400 mb-2"/>
                        <p className="text-gray-500 font-medium">All caught up! No pending approvals.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {pendingVendors.map(v => (
                            <div key={v.id} className="bg-white p-5 rounded-lg shadow-sm border border-l-4 border-l-orange-400 hover:shadow-md transition">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                                    <div className="mb-4 md:mb-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-lg text-gray-800">{v.name}</h4>
                                            <span className="bg-orange-100 text-orange-800 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Pending</span>
                                        </div>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p className="flex items-center gap-2"><span className="font-medium w-16">Contact:</span> {v.contact}</p>
                                            <p className="flex items-center gap-2"><span className="font-medium w-16">Category:</span> {v.categoryIds.join(', ')}</p>
                                            <p className="flex items-center gap-2"><span className="font-medium w-16">Location:</span> {v.location.address}</p>
                                            <p className="flex items-center gap-2"><span className="font-medium w-16">Desc:</span> <span className="italic">{v.description || 'N/A'}</span></p>
                                        </div>
                                    </div>
                                    <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                                        <button onClick={() => onApproveVendor(v.id)} className="flex-1 flex items-center justify-center gap-1 bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 font-bold transition">
                                            <CheckCircle className="w-4 h-4"/> Approve
                                        </button>
                                        <button onClick={() => onRemoveVendor(v.id)} className="flex-1 flex items-center justify-center gap-1 bg-white border border-red-200 text-red-600 px-4 py-2 rounded shadow-sm hover:bg-red-50 text-sm font-medium transition">
                                            <XCircle className="w-4 h-4"/> Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
             </div>
        )}

        {activeTab === 'VENDORS' && (
          <div>
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold">Active Service Providers</h2>
               <button 
                 onClick={() => setShowAddVendor(!showAddVendor)} 
                 className="bg-primary text-white px-4 py-2 rounded shadow flex items-center gap-2 hover:bg-[#7E6885]"
               >
                  {showAddVendor ? <Minus className="w-4 h-4"/> : <Plus className="w-4 h-4"/>} 
                  {showAddVendor ? 'Cancel' : 'Add Service'}
               </button>
            </div>

            {/* ADD VENDOR FORM */}
            {showAddVendor && (
                <div className="bg-gray-50 border rounded p-6 mb-6 animate-fade-in">
                    <h3 className="font-bold text-lg mb-4 text-gray-700 border-b pb-2">Add New Service</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        {/* Basic Details */}
                        <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Service Name</label>
                                <input className="w-full border p-2 rounded" value={newVendor.name} onChange={e => setNewVendor({...newVendor, name: e.target.value})} />
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                                <input className="w-full border p-2 rounded" value={newVendor.contact} onChange={e => setNewVendor({...newVendor, contact: e.target.value})} />
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Email ID</label>
                                <input className="w-full border p-2 rounded" value={newVendor.email} onChange={e => setNewVendor({...newVendor, email: e.target.value})} />
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                 <div>
                                     <label className="block text-sm font-medium text-gray-700">Category</label>
                                     <select 
                                        className="w-full border p-2 rounded" 
                                        value={newVendor.category} 
                                        onChange={e => setNewVendor({...newVendor, category: e.target.value, subCategory: ''})}
                                     >
                                         <option value="">Select...</option>
                                         {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                     </select>
                                 </div>
                                 <div>
                                     <label className="block text-sm font-medium text-gray-700">Sub-Category</label>
                                     <select 
                                        className="w-full border p-2 rounded"
                                        value={newVendor.subCategory}
                                        onChange={e => setNewVendor({...newVendor, subCategory: e.target.value})}
                                        disabled={!newVendor.category}
                                     >
                                         <option value="">Select...</option>
                                         {subCategoriesList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                     </select>
                                 </div>
                             </div>
                        </div>
                        
                        {/* Location & Products */}
                        <div className="space-y-4">
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Latitude</label>
                                    <input 
                                        type="number" 
                                        className="w-full border p-2 rounded" 
                                        value={newVendor.location?.lat} 
                                        onChange={e => setNewVendor({...newVendor, location: { ...newVendor.location!, lat: parseFloat(e.target.value) }})} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Longitude</label>
                                    <input 
                                        type="number" 
                                        className="w-full border p-2 rounded" 
                                        value={newVendor.location?.lng} 
                                        onChange={e => setNewVendor({...newVendor, location: { ...newVendor.location!, lng: parseFloat(e.target.value) }})} 
                                    />
                                </div>
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Address</label>
                                <textarea className="w-full border p-2 rounded" rows={2} value={newVendor.location?.address} onChange={e => setNewVendor({...newVendor, location: { ...newVendor.location!, address: e.target.value }})} />
                             </div>

                             <div className="bg-white p-3 rounded border">
                                 <label className="block text-sm font-bold text-gray-700 mb-2">Product Price List</label>
                                 <div className="flex gap-2 mb-2">
                                     <input placeholder="Product Name" className="flex-1 border p-1 rounded text-sm" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                                     <input placeholder="Price" type="number" className="w-20 border p-1 rounded text-sm" value={newProduct.price || ''} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} />
                                     <input placeholder="Img URL" className="w-24 border p-1 rounded text-sm" value={newProduct.image || ''} onChange={e => setNewProduct({...newProduct, image: e.target.value})} />
                                     <button onClick={handleAddProduct} className="bg-green-500 text-white px-3 rounded text-sm font-bold">+</button>
                                 </div>
                                 <ul className="max-h-24 overflow-y-auto space-y-1">
                                     {newVendor.products?.map((p, i) => (
                                         <li key={i} className="flex justify-between text-sm bg-gray-50 p-1 rounded">
                                             <span>{p.name}</span>
                                             <div className="flex items-center gap-2">
                                                <span className="font-mono">₹{p.price}</span>
                                                <button onClick={() => handleRemoveProduct(i)} className="text-red-500 hover:text-red-700"><Trash2 className="w-3 h-3"/></button>
                                             </div>
                                         </li>
                                     ))}
                                 </ul>
                             </div>
                        </div>
                    </div>
                    <button onClick={handleSubmitVendor} className="w-full bg-primary text-white py-3 rounded font-bold shadow hover:bg-[#7E6885] flex items-center justify-center gap-2">
                        <Save className="w-5 h-5" /> Save Service
                    </button>
                </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 border-b">Name</th>
                    <th className="p-3 border-b">Category</th>
                    <th className="p-3 border-b">Contact</th>
                    <th className="p-3 border-b">Featured</th>
                    <th className="p-3 border-b">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {approvedVendors.map(v => (
                    <tr key={v.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium">
                          {v.name}
                          <div className="text-xs text-gray-400 flex items-center gap-1">
                              <Settings className="w-3 h-3" /> {v.location.lat.toFixed(2)}, {v.location.lng.toFixed(2)}
                          </div>
                      </td>
                      <td className="p-3 text-gray-500">{v.categoryIds.join(', ')}</td>
                      <td className="p-3 font-mono">{v.contact}</td>
                      <td className="p-3">
                         {config.pinnedVendorId === v.id ? (
                             <button onClick={() => onPinVendor(undefined)} className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-yellow-200">
                                 <Pin className="w-3 h-3 fill-current" /> Pinned
                             </button>
                         ) : (
                             <button onClick={() => onPinVendor(v.id)} className="text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 p-1.5 rounded transition">
                                 <Pin className="w-4 h-4" />
                             </button>
                         )}
                      </td>
                      <td className="p-3">
                         <button onClick={() => onRemoveVendor(v.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {approvedVendors.length === 0 && (
                      <tr><td colSpan={6} className="p-4 text-center text-gray-500 italic">No active vendors found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'BANNERS' && (
          <div>
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Ad Banners</h2>
              <button onClick={() => setShowAddBanner(!showAddBanner)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded shadow hover:bg-[#7E6885]">
                 {showAddBanner ? <Minus className="w-4 h-4"/> : <Plus className="w-4 h-4"/>}
                 {showAddBanner ? 'Cancel' : 'Add New Banner'}
              </button>
            </div>

            {showAddBanner && (
                <div className="bg-gray-50 border rounded p-6 mb-6 animate-fade-in">
                    <h3 className="font-bold text-lg mb-4 text-gray-700">Add New Banner</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Image URL (Unsplash, etc.)</label>
                            <div className="flex gap-2">
                                <input 
                                    className="w-full border p-2 rounded" 
                                    placeholder="https://..."
                                    value={newBanner.imageUrl} 
                                    onChange={e => setNewBanner({...newBanner, imageUrl: e.target.value})} 
                                />
                                <button className="bg-gray-200 px-3 rounded"><Upload className="w-4 h-4"/></button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Click Link (Optional)</label>
                            <input 
                                className="w-full border p-2 rounded" 
                                placeholder="#"
                                value={newBanner.link} 
                                onChange={e => setNewBanner({...newBanner, link: e.target.value})} 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Alt Text / Title</label>
                            <input 
                                className="w-full border p-2 rounded" 
                                placeholder="Big Sale..."
                                value={newBanner.altText} 
                                onChange={e => setNewBanner({...newBanner, altText: e.target.value})} 
                            />
                        </div>
                        <button onClick={handleSubmitBanner} className="bg-primary text-white px-6 py-2 rounded font-bold shadow hover:bg-[#7E6885]">
                            Add Banner
                        </button>
                    </div>
                </div>
            )}

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
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#9C81A4]/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between border-b pb-4">
                        <div>
                            <div className="font-semibold flex items-center gap-2"><Shield className="w-4 h-4"/> Maintenance Mode</div>
                            <div className="text-xs text-gray-500">Suspend all user activities</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#9C81A4]/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
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
                         <input 
                           type="password" 
                           className="w-full border bg-white rounded px-3 py-2 text-sm outline-none" 
                           value={emailConfig.password}
                           onChange={e => setEmailConfig({...emailConfig, password: e.target.value})}
                           placeholder="Enter SMTP Password"
                        />
                    </div>

                    <div>
                         <label className="block text-xs font-bold mb-1 text-gray-600">Admin Alert Recipient</label>
                         <input type="email" className="w-full border bg-white rounded px-3 py-2 text-sm outline-none" value={emailConfig.alertEmail} onChange={e => setEmailConfig({...emailConfig, alertEmail: e.target.value})} />
                    </div>

                    <button onClick={handleSaveConfig} className="w-full bg-primary text-white py-2 rounded text-sm font-bold shadow hover:bg-[#7E6885] transition">Save Configuration</button>
                 </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
