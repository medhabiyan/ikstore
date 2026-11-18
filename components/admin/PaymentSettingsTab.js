"use client";
import { useState, useEffect } from "react";
import { MFS_PROVIDERS, ACCOUNT_TYPES, getPaymentInstructions } from "../../lib/paymentConstants";

export default function PaymentSettingsTab({ settingsData, fetchSettings, isLoading }) {
  const [methods, setMethods] = useState([]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    id: '', provider: 'bkash', type: 'Personal', number: '', instructions: '', qrCodeUrl: '', isActive: true
  });

  // 🌟 পার্ট ১: ডেটা একত্রীকরণ (Unified Data Migration)
  useEffect(() => {
    if (settingsData) {
      let parsedMethods = [];
      try {
        if (settingsData.payment_methods) {
          parsedMethods = JSON.parse(settingsData.payment_methods);
        }
      } catch (e) {
        parsedMethods = [];
      }

      // যদি লিস্টে COD না থাকে, তবে অটোমেটিক তৈরি করে নেবে (Migration)
      const hasCod = parsedMethods.find(m => m.id === 'cod');
      if (!hasCod) {
        const isCodActive = settingsData.cod_enabled === 'false' ? false : true;
        parsedMethods.unshift({
          id: 'cod',
          provider: 'Cash on Delivery',
          type: 'System Default',
          number: 'Cash',
          instructions: 'পণ্য হাতে পেয়ে ডেলিভারি ম্যানের কাছে পেমেন্ট করুন।',
          isActive: isCodActive,
          isFixed: true // 🌟 COD ডিলিট করা যাবে না
        });
      }

      setMethods(parsedMethods);
    }
  }, [settingsData]);

  // ইনস্ট্রাকশন অটো-জেনারেট লজিক (শুধুমাত্র নতুন MFS অ্যাড করার সময়)
  useEffect(() => {
    if (isFormOpen && formData.provider && formData.type && !editingIndex && formData.id !== 'cod') {
      setFormData(prev => ({
        ...prev,
        instructions: getPaymentInstructions(formData.provider, formData.type)
      }));
    }
  }, [formData.provider, formData.type, isFormOpen, editingIndex]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("upload_preset", "ehlk35wj"); 
    
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/dw6tdjbzb/image/upload`, {
        method: "POST", body: uploadData,
      });
      const data = await res.json();
      if (data.secure_url) setFormData(prev => ({ ...prev, qrCodeUrl: data.secure_url }));
    } catch (error) {
      alert("ছবি আপলোড ফেইল করেছে!");
    } finally {
      setIsUploading(false);
    }
  };

  const openNewForm = () => {
    setFormData({ id: Date.now().toString(), provider: 'bkash', type: 'Personal', number: '', instructions: getPaymentInstructions('bkash', 'Personal'), qrCodeUrl: '', isActive: true });
    setEditingIndex(null);
    setIsFormOpen(true);
  };

  const openEditForm = (index) => {
    setFormData(methods[index]);
    setEditingIndex(index);
    setIsFormOpen(true);
  };

  const deleteMethod = (index) => {
    if (methods[index].isFixed) {
      return alert("Cash on Delivery (COD) ডিলিট করা যাবে না! আপনি চাইলে এটি Inactive করে রাখতে পারেন।");
    }
    if (window.confirm("আপনি কি নিশ্চিত যে এই পেমেন্ট মেথডটি মুছে ফেলতে চান?")) {
      const updatedMethods = methods.filter((_, i) => i !== index);
      setMethods(updatedMethods);
      saveToServer(updatedMethods);
    }
  };

  const toggleActiveStatus = (index) => {
    const updatedMethods = [...methods];
    updatedMethods[index].isActive = updatedMethods[index].isActive === false ? true : false;
    setMethods(updatedMethods);
    saveToServer(updatedMethods);
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const updatedMethods = [...methods];
    [updatedMethods[index - 1], updatedMethods[index]] = [updatedMethods[index], updatedMethods[index - 1]];
    setMethods(updatedMethods);
    saveToServer(updatedMethods);
  };

  const moveDown = (index) => {
    if (index === methods.length - 1) return;
    const updatedMethods = [...methods];
    [updatedMethods[index + 1], updatedMethods[index]] = [updatedMethods[index], updatedMethods[index + 1]];
    setMethods(updatedMethods);
    saveToServer(updatedMethods);
  };

  const saveMethod = (e) => {
    e.preventDefault();
    if (formData.id !== 'cod' && !formData.number) return alert("অ্যাকাউন্ট নাম্বার দেওয়া বাধ্যতামূলক!");

    let updatedMethods = [...methods];
    if (editingIndex !== null) {
      updatedMethods[editingIndex] = formData;
    } else {
      updatedMethods.push(formData);
    }

    setMethods(updatedMethods);
    setIsFormOpen(false);
    saveToServer(updatedMethods);
  };

  const saveToServer = async (currentMethods) => {
    setIsSubmitting(true);
    try {
      // 🌟 এখন শুধু একটাই ডেটা সেভ হবে
      const payload = { payment_methods: JSON.stringify(currentMethods) };
      const res = await fetch('/api/payment-settings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.success) {
        if (fetchSettings) fetchSettings();
      } else {
        alert("সেভ করতে সমস্যা হয়েছে!");
      }
    } catch (error) {
      alert("নেটওয়ার্ক এরর!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-10 text-center text-gray-500 font-bold animate-pulse">লোড হচ্ছে...</div>;

  return (
    <div className="w-full max-w-4xl font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-[#3B3433]">Payment Configuration</h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1 font-bold">Manage Sorting, Status & Gateways</p>
        </div>
        <button onClick={openNewForm} className="bg-[#8A1538] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:bg-[#6e112d] transition-all flex items-center gap-2 active:scale-95">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg> Add New Method
        </button>
      </div>

      {/* 🌟 পার্ট ২: ইউনিভার্সাল লিস্ট (Unified UI) */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 border-b pb-3">Active & Sorted Methods</h3>

        {methods.length === 0 ? (
           <p className="text-sm text-gray-400 text-center py-6">কোনো পেমেন্ট মেথড পাওয়া যায়নি।</p>
        ) : (
          <div className="space-y-4">
            {methods.map((method, idx) => (
              <div key={method.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${method.isActive !== false ? 'border-gray-200 bg-white hover:border-[#8A1538]' : 'border-red-100 bg-red-50/50 opacity-75'}`}>
                
                {/* Up/Down Sorting Buttons */}
                <div className="flex flex-col gap-1 pr-4 border-r border-gray-100">
                  <button onClick={() => moveUp(idx)} disabled={idx === 0} className="text-gray-400 hover:text-gray-800 disabled:opacity-20 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg></button>
                  <button onClick={() => moveDown(idx)} disabled={idx === methods.length - 1} className="text-gray-400 hover:text-gray-800 disabled:opacity-20 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg></button>
                </div>

                <div className="flex-1 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-black text-lg capitalize ${method.isActive !== false ? 'text-gray-800' : 'text-gray-500'}`}>{method.provider}</span>
                      <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded font-bold uppercase">{method.type}</span>
                    </div>
                    {method.id !== 'cod' && (
                      <div className={`text-sm font-bold tracking-widest ${method.isActive !== false ? 'text-[#8A1538]' : 'text-red-400 line-through'}`}>{method.number}</div>
                    )}
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button onClick={() => openEditForm(idx)} className="text-blue-600 hover:text-blue-800 text-xs font-bold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">Edit</button>
                      {!method.isFixed && (
                        <button onClick={() => deleteMethod(idx)} className="text-red-500 hover:text-red-700 text-xs font-bold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">Delete</button>
                      )}
                    </div>

                    {/* Toggle Button */}
                    <div className="flex flex-col items-center gap-1 w-16">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={method.isActive !== false} onChange={() => toggleActiveStatus(idx)} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                      <span className={`text-[9px] font-bold uppercase tracking-widest ${method.isActive !== false ? 'text-green-600' : 'text-gray-400'}`}>{method.isActive !== false ? 'Active' : 'Off'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8">
            <h3 className="text-xl font-bold mb-6 border-b pb-4 text-gray-800">
              {formData.id === 'cod' ? 'COD সেটিংস এডিট করুন' : (editingIndex !== null ? 'পেমেন্ট মেথড এডিট করুন' : 'নতুন মেথড')}
            </h3>
            
            <form onSubmit={saveMethod} className="space-y-5">
              
              {/* COD এর ক্ষেত্রে প্রোভাইডার, টাইপ এবং নাম্বার হাইড থাকবে */}
              {formData.id !== 'cod' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">MFS Provider</label>
                      <select name="provider" value={formData.provider} onChange={handleInputChange} className="w-full border border-gray-300 p-3 rounded-xl outline-none font-bold text-gray-900 bg-white">
                        {MFS_PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Account Type</label>
                      <select name="type" value={formData.type} onChange={handleInputChange} className="w-full border border-gray-300 p-3 rounded-xl outline-none font-bold text-gray-900 bg-white">
                        {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Account Number</label>
                    <input required type="text" name="number" value={formData.number} onChange={handleInputChange} placeholder="01XXXXXXXXX" className="w-full border border-gray-300 p-3 rounded-xl outline-none font-bold text-lg tracking-widest text-gray-900 bg-white placeholder:text-gray-400" />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Customer Instructions (Editable)</label>
                <textarea name="instructions" value={formData.instructions} onChange={handleInputChange} rows="6" className="w-full border border-gray-300 p-3 rounded-xl outline-none text-sm font-medium leading-relaxed bg-gray-50 text-gray-900"></textarea>
              </div>

              {formData.id !== 'cod' && (
                <div className="p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50">
                  <label className="block text-xs font-bold text-gray-500 mb-2">Upload QR Code Image (Optional)</label>
                  <div className="flex items-center gap-4">
                    {formData.qrCodeUrl && <img src={formData.qrCodeUrl} alt="QR" className="w-16 h-16 object-cover rounded-lg border border-gray-300" />}
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#8A1538]/10 file:text-[#8A1538] hover:file:bg-[#8A1538]/20" />
                    {isUploading && <span className="text-xs text-blue-500 font-bold animate-pulse">Uploading...</span>}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-all">Cancel</button>
                <button type="submit" disabled={isUploading || isSubmitting} className="px-8 py-3 rounded-xl bg-[#8A1538] text-white font-bold hover:bg-[#6e112d] transition-all disabled:opacity-50">
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}