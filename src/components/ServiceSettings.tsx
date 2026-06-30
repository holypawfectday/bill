/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ServiceItem, MemberType, MemberAssetAccount } from '../types';
import { Plus, Trash2, RotateCcw, Save, Sparkles, DollarSign, Tag, Info, Users, Search, Filter, Award, Calendar, Ticket, Gift, Edit, Check, X, Download, RotateCcw as ResetIcon } from 'lucide-react';

const getDaysUntilBirthday = (birthdayStr?: string) => {
  if (!birthdayStr) return null;
  const birthDate = new Date(birthdayStr);
  if (isNaN(birthDate.getTime())) return null;

  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Set birthDate's year to current year to calculate this year's birthday
  const nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
  
  // Set time to midnight for comparison
  now.setHours(0, 0, 0, 0);
  nextBirthday.setHours(0, 0, 0, 0);
  
  // If this year's birthday has already passed, next birthday is next year
  if (nextBirthday.getTime() < now.getTime()) {
    nextBirthday.setFullYear(currentYear + 1);
  }
  
  const diffTime = nextBirthday.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

interface ServiceSettingsProps {
  services: ServiceItem[];
  setServices: React.Dispatch<React.SetStateAction<ServiceItem[]>>;
  memberships: MemberType[];
  setMemberships: React.Dispatch<React.SetStateAction<MemberType[]>>;
  onRestoreDefaults: () => void;
  memberAssets: MemberAssetAccount[];
  setMemberAssets: React.Dispatch<React.SetStateAction<MemberAssetAccount[]>>;
  customAlert?: (message: string, title?: string) => Promise<void>;
  customConfirm?: (message: string, title?: string) => Promise<boolean>;
}

export default function ServiceSettings({
  services,
  setServices,
  memberships,
  setMemberships,
  onRestoreDefaults,
  memberAssets,
  setMemberAssets,
  customAlert,
  customConfirm,
}: ServiceSettingsProps) {
  const triggerAlert = (message: string) => {
    if (customAlert) {
      customAlert(message);
    } else {
      alert(message);
    }
  };
  const [activeTab, setActiveTab] = useState<'services' | 'annual_cards'>('services');

  // --- Annual membership database states ---
  const [searchAssetQuery, setSearchAssetQuery] = useState('');
  const [selectedAssetTier, setSelectedAssetTier] = useState<'all' | 'platinums' | 'diamonds' | 'golds'>('all');
  const [editingAssetAccount, setEditingAssetAccount] = useState<MemberAssetAccount | null>(null);

  // Form states for adding new member asset
  const [newAssetMemberId, setNewAssetMemberId] = useState('');
  const [newAssetTier, setNewAssetTier] = useState<'铂金年卡👑' | '钻石年卡💎' | '黄金年卡🌼'>('黄金年卡🌼');
  const [newAssetPets, setNewAssetPets] = useState<{ name: string; birthday: string }[]>([{ name: '', birthday: '' }]);
  const [newAssetMemberDay, setNewAssetMemberDay] = useState('');

  // Toast / notification state
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);


  // Form states for adding new service
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState<number | ''>('');
  const [newServiceUnit, setNewServiceUnit] = useState('次');
  const [newServiceCategory, setNewServiceCategory] = useState('日托');

  const categories = ['日托', '寄养', '洗护', '美容', '专项服务', '训练', '接送'];

  const [saving, setSaving] = useState(false);

  const handleSaveAsDefaults = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/save-defaults', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          services,
          memberships,
        }),
      });
      if (response.ok) {
        triggerAlert('成功将当前价目表及会员折扣配置保存为系统默认数据！');
      } else {
        const errData = await response.json();
        triggerAlert('保存失败: ' + (errData.error || '未知错误'));
      }
    } catch (err: any) {
      triggerAlert('保存错误: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Add a new service
  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName || newServicePrice === '') return;

    const newService: ServiceItem = {
      id: `srv_custom_${Date.now()}`,
      category: newServiceCategory,
      name: newServiceName,
      price: Number(newServicePrice),
      unit: newServiceUnit,
    };

    setServices((prev) => [...prev, newService]);
    setNewServiceName('');
    setNewServicePrice('');
  };

  // Add a new member asset account
  const handleAddMemberAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetMemberId.trim()) {
      showToast('请填写会员卡号！', 'error');
      return;
    }

    const validPets = newAssetPets
      .map(p => ({ name: p.name.trim(), birthday: p.birthday || undefined }))
      .filter(p => p.name.length > 0);

    if (validPets.length === 0) {
      showToast('请至少填写一个宠物名字！', 'error');
      return;
    }

    const rawId = newAssetMemberId.trim();
    const formattedId = /^\d+$/.test(rawId) ? rawId.padStart(12, '0') : rawId;

    if (memberAssets.some(acc => acc.memberId === formattedId)) {
      showToast('该会员卡号已存在！', 'error');
      return;
    }

    // Default coupons based on tier
    let daycareCoupons = { total: 1, unused: 1, used: 0 };
    let holidayCoupons = { total: 1, unused: 1, used: 0 };
    let washCoupons = { total: 2, unused: 2, used: 0 };
    let specialCareCoupons = undefined;
    let transferCoupons = undefined;

    if (newAssetTier === '铂金年卡👑') {
      daycareCoupons = { total: 1, unused: 1, used: 0 };
      holidayCoupons = { total: 0, unused: 0, used: 0 };
      washCoupons = { total: 1, unused: 1, used: 0 };
      transferCoupons = { total: 3, unused: 3, used: 0 };
    } else if (newAssetTier === '钻石年卡💎') {
      daycareCoupons = { total: 2, unused: 2, used: 0 };
      holidayCoupons = { total: 2, unused: 2, used: 0 };
      specialCareCoupons = { total: 1, unused: 1, used: 0 };
      washCoupons = { total: 2, unused: 2, used: 0 };
      transferCoupons = { total: 2, unused: 2, used: 0 };
    }

    const today = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(today.getFullYear() + 1);

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    const newAccount: MemberAssetAccount = {
      memberId: formattedId,
      pets: validPets,
      tier: newAssetTier,
      validityStart: formatDate(today),
      validityEnd: formatDate(nextYear),
      daycareCoupons,
      holidayCoupons,
      washCoupons,
      specialCareCoupons,
      transferCoupons,
      memberDay: newAssetMemberDay.trim() || undefined
    };

    setMemberAssets(prev => [newAccount, ...prev]);

    // Clear form
    setNewAssetMemberId('');
    setNewAssetPets([{ name: '', birthday: '' }]);
    setNewAssetMemberDay('');
    showToast('成功添加会员家庭账户及卡包权益资产！', 'success');
  };

  // Delete a service
  const handleDeleteService = (id: string) => {
    setServices((prev) => prev.filter((srv) => srv.id !== id));
  };

  // Edit service price inline
  const handlePriceChange = (id: string, priceStr: string) => {
    const newPrice = priceStr === '' ? 0 : parseFloat(priceStr);
    if (!isNaN(newPrice)) {
      setServices((prev) =>
        prev.map((srv) => (srv.id === id ? { ...srv, price: Math.max(0, newPrice) } : srv))
      );
    }
  };

  // Edit service unit inline
  const handleUnitChange = (id: string, newUnit: string) => {
    setServices((prev) =>
      prev.map((srv) => (srv.id === id ? { ...srv, unit: newUnit } : srv))
    );
  };

  // Edit service name inline
  const handleNameChange = (id: string, newName: string) => {
    setServices((prev) =>
      prev.map((srv) => (srv.id === id ? { ...srv, name: newName } : srv))
    );
  };

  // Edit membership discount inline
  const handleDiscountChange = (id: string, discountStr: string) => {
    let discount = discountStr === '' ? 1 : parseFloat(discountStr);
    if (isNaN(discount)) discount = 1;
    // Cap discount between 0 and 1
    discount = Math.min(1, Math.max(0, discount));
    setMemberships((prev) =>
      prev.map((mem) => (mem.id === id ? { ...mem, discount } : mem))
    );
  };

  // Export Service Items to Excel (CSV format with UTF-8 BOM)
  const exportServicesToExcel = () => {
    const headers = ['分类/Category', '服务项目名称/Service Name', '单价(元)/Price(RMB)', '计费单位/Unit'];
    const rows = services.map(srv => [
      srv.category,
      srv.name,
      srv.price,
      srv.unit
    ]);
    
    const csvContent = [headers, ...rows]
      .map(e => e.map(val => {
        let cell = String(val === undefined || val === null ? '' : val);
        if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
          cell = `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(','))
      .join('\n');
      
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `好厉害宠物乐园_服务项目表_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('服务项目表导出成功！', 'success');
  };

  // Export Annual Cards Database to Excel (CSV format with UTF-8 BOM)
  const exportAnnualCardsToExcel = () => {
    const headers = [
      '会员卡号/Member ID',
      '会员等级/Tier',
      '旗下宠物及生日/Pets & Birthdays',
      '专属会员日/Member Day',
      '日托升级券(未使用/已使用/总计)',
      '寄养升级券(未使用/已使用/总计)',
      '洗护升级券(未使用/已使用/总计)',
      '特护SPA券(未使用/已使用/总计)',
      '接送券(未使用/已使用/总计)',
      '有效期起始/Validity Start',
      '有效期截止/Validity End'
    ];
    
    const rows = memberAssets.map(acc => {
      const petsStr = acc.pets.map(p => `${p.name}${p.birthday ? `(${p.birthday})` : ''}`).join('; ');
      const getCouponStatus = (couponObj?: { unused: number; used: number; total: number }) => {
        if (!couponObj) return '不适用/Not Applicable';
        return `${couponObj.unused}/${couponObj.used}/${couponObj.total}`;
      };
      
      return [
        acc.memberId,
        acc.tier,
        petsStr,
        acc.memberDay || '无',
        getCouponStatus(acc.daycareCoupons),
        getCouponStatus(acc.holidayCoupons),
        getCouponStatus(acc.washCoupons),
        getCouponStatus(acc.specialCareCoupons),
        getCouponStatus(acc.transferCoupons),
        acc.validityStart || '无',
        acc.validityEnd || '无'
      ];
    });
    
    const csvContent = [headers, ...rows]
      .map(e => e.map(val => {
        let cell = String(val === undefined || val === null ? '' : val);
        if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
          cell = `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(','))
      .join('\n');
      
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `好厉害宠物乐园_年卡会员权益表_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('年卡会员权益表导出成功！', 'success');
  };

  return (
    <div className="bg-white rounded-3xl border-4 border-slate-800 shadow-[4px_4px_0px_0px_#1A202C] p-6 overflow-hidden" id="service-settings-section">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b-2 border-slate-100 pb-5">
        <div>
          <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2 font-hand">
            <span className="w-2 h-6 bg-[#B9E3F8] border-2 border-slate-800 rounded-full"></span>
            价格与会员配置 / Settings
          </h2>
          <p className="text-slate-400 text-xs mt-1 font-bold">
            配置乐园服务项目及对应单价，并自定义会员折扣卡的结账系数。
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSaveAsDefaults}
            disabled={saving}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1A202C] active:translate-y-0.5 transition-all font-black cursor-pointer"
            id="btn-save-as-defaults"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? '保存中...' : '保存为系统默认'}
          </button>
          
          <button
            onClick={onRestoreDefaults}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-slate-700 bg-white hover:bg-slate-50 rounded-xl border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1A202C] active:translate-y-0.5 transition-all font-black cursor-pointer"
            id="btn-restore-defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            重置默认数据
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-slate-50 border-2 border-slate-300 rounded-2xl max-w-sm">
        <button
          onClick={() => setActiveTab('services')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black tracking-wide transition-all duration-150 cursor-pointer ${
            activeTab === 'services'
              ? 'bg-[#B9E3F8] text-slate-900 border-2 border-slate-800 shadow-[1.5px_1.5px_0px_0px_#1A202C]'
              : 'text-slate-400 hover:text-slate-700'
          }`}
          id="tab-btn-services"
        >
          服务项目表
        </button>
        <button
          onClick={() => setActiveTab('annual_cards')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black tracking-wide transition-all duration-150 cursor-pointer ${
            activeTab === 'annual_cards'
              ? 'bg-[#B9E3F8] text-slate-900 border-2 border-slate-800 shadow-[1.5px_1.5px_0px_0px_#1A202C]'
              : 'text-slate-400 hover:text-slate-700'
          }`}
          id="tab-btn-annual-cards"
        >
          年卡会员权益表
        </button>
      </div>

      {/* Content for TAB 1: Services */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          {/* Quick add form */}
          <form onSubmit={handleAddService} className="bg-[#FFFEEB] rounded-2xl p-4 border-2 border-slate-800 shadow-[3px_3px_0px_0px_#1A202C] flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1 space-y-1.5 w-full">
              <label className="text-slate-600 text-[11px] font-black uppercase block">服务类别</label>
              <select
                value={newServiceCategory}
                onChange={(e) => setNewServiceCategory(e.target.value)}
                className="w-full bg-white border-2 border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-4 focus:ring-[#B9E3F8]/50 outline-none font-bold text-slate-800 cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-[2] space-y-1.5 w-full">
              <label className="text-slate-600 text-[11px] font-black uppercase block">服务项目名称</label>
              <input
                type="text"
                placeholder="例如: 基础洗护 (超大型犬)"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                className="w-full bg-white border-2 border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-4 focus:ring-[#B9E3F8]/50 outline-none font-bold text-slate-800"
                required
              />
            </div>

            <div className="flex-1 space-y-1.5 w-full">
              <label className="text-slate-600 text-[11px] font-black uppercase block">基本单价 (元)</label>
              <input
                type="number"
                placeholder="价格"
                value={newServicePrice}
                onChange={(e) => setNewServicePrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white border-2 border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-4 focus:ring-[#B9E3F8]/50 outline-none font-bold text-slate-800"
                min="0"
                required
              />
            </div>

            <div className="flex-1 space-y-1.5 w-full">
              <label className="text-slate-600 text-[11px] font-black uppercase block">计费单位</label>
              <input
                type="text"
                placeholder="次/天/杯"
                value={newServiceUnit}
                onChange={(e) => setNewServiceUnit(e.target.value)}
                className="w-full bg-white border-2 border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-4 focus:ring-[#B9E3F8]/50 outline-none font-bold text-slate-800"
                required
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-[#B9E3F8] hover:bg-[#a3d5ef] text-slate-900 text-xs font-black rounded-xl border-2 border-slate-800 transition-all duration-150 flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#1A202C] active:translate-y-0.5 cursor-pointer w-full md:w-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>添加项目</span>
            </button>
          </form>

          {/* Action Bar with Export Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#FFFEEB]/40 border-2 border-slate-800 p-3.5 rounded-2xl shadow-[2px_2px_0px_0px_#1A202C]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-4 bg-slate-800 rounded-full"></span>
              <span className="text-xs font-black text-slate-800">服务项目总计: {services.length} 项</span>
            </div>
            <button
              type="button"
              onClick={exportServicesToExcel}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-1.5 bg-[#B9E3F8] hover:bg-[#a3d5ef] text-slate-900 border-2 border-slate-800 text-xs font-black rounded-xl shadow-[2px_2px_0px_0px_#1A202C] transition-all cursor-pointer active:translate-y-0.5"
            >
              <Download className="w-3.5 h-3.5" />
              导出 Excel
            </button>
          </div>

          {/* Categories Groups */}
          <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
            {categories.map((cat) => {
              const catServices = services.filter((srv) => srv.category === cat);
              return (
                <div key={cat} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-4 rounded-full bg-slate-800"></span>
                    <h3 className="text-xs font-black text-slate-800 tracking-wider uppercase font-hand">{cat}</h3>
                    <span className="text-[10px] text-slate-400 font-mono font-bold">({catServices.length}项)</span>
                  </div>

                  {catServices.length === 0 ? (
                    <div className="text-slate-400 text-xs py-3 px-4 bg-[#FFFEEB]/10 rounded-2xl border-2 border-dashed border-slate-300 font-bold italic">
                      该分类下暂无服务项目，请在上方添加。
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {catServices.map((srv) => (
                        <div
                          key={srv.id}
                          className="flex items-center gap-3 bg-white hover:bg-[#FFFEEB]/30 border-2 border-slate-800 p-2.5 rounded-2xl shadow-[1.5px_1.5px_0px_0px_#1A202C] hover:shadow-[2.5px_2.5px_0px_0px_#1A202C] transition-all group"
                        >
                          <div className="flex-1 min-w-0">
                            <input
                              type="text"
                              value={srv.name}
                              onChange={(e) => handleNameChange(srv.id, e.target.value)}
                              className="w-full bg-transparent border-b-2 border-transparent focus:border-slate-300 font-black text-slate-800 text-xs py-0.5 px-1 focus:outline-none transition-all duration-150"
                            />
                          </div>

                          {/* Unit price input */}
                          <div className="flex items-center gap-1 w-24">
                            <span className="text-slate-400 text-[10px] font-black">¥</span>
                            <input
                              type="number"
                              value={srv.price}
                              onChange={(e) => handlePriceChange(srv.id, e.target.value)}
                              className="w-full bg-transparent border-b-2 border-transparent focus:border-slate-300 text-slate-800 text-xs py-0.5 text-right font-mono font-black focus:outline-none transition-all"
                              min="0"
                            />
                            <span className="text-slate-400 text-xs">/</span>
                            <input
                              type="text"
                              value={srv.unit}
                              onChange={(e) => handleUnitChange(srv.id, e.target.value)}
                              className="w-8 bg-transparent border-b-2 border-transparent focus:border-slate-300 text-slate-650 text-xs py-0.5 text-center focus:outline-none transition-all"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteService(srv.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:scale-110 rounded-lg transition-all cursor-pointer"
                            title="删除此项目"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Content for TAB 3: Annual Cards Database */}
      {activeTab === 'annual_cards' && (
        <div className="space-y-6 animate-fade-in" id="annual-cards-tab-content">
          {/* 📙 Cute Hand-drawn Policy Callout Card */}
          <div className="bg-amber-50 border-4 border-slate-800 rounded-2xl p-4 space-y-3 shadow-[3px_3px_0px_0px_#1A202C]">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5 font-hand">
              <Info className="w-4 h-4 text-[#EBA53B]" />
              一家多宠与年卡权益共享规则 (Grooming & Boarding Policy)
            </h3>
            <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-5 font-bold leading-relaxed">
              <li><strong className="text-slate-900">【核心判定】</strong>一个“会员编号”代表一个家庭账户，旗下可绑定多只宠物（共享同一个权益资产账户）。</li>
              <li><strong className="text-slate-900">【权益唯一性】</strong>所有年卡有效期、各类升级券、接送券，其所有权属于<span className="text-rose-600 bg-rose-50 px-1 py-0.5 rounded">【家庭账户（会员卡号）】</span>，而不属于单独某只宠物。</li>
              <li><strong className="text-slate-900">【禁止翻倍】</strong>若一个会员号下有两只或多只宠物，该会员享有的优惠券总数【不会】翻倍，全家共用同一个限额。</li>
              <li><strong className="text-slate-900">【共享核销】</strong>只要该会员号下的某一种券被其中一只宠物使用，整个账户对应的券额度同步扣减！若某券额度降为 0，则旗下所有宠物均判定为“全家皆不可再用”。</li>
              <li><strong className="text-slate-900">【规范话术】</strong>在向客户核对剩余权益时，切勿按宠物分别输出券，应按 <span className="text-teal-700 bg-teal-50 px-1 py-0.5 rounded">“该会员账号共计剩余 XX 券，可供旗下宠物 [宠物A]、[宠物B] 共同使用”</span> 的口径进行回复。</li>
            </ul>
          </div>

          {/* Quick add member asset form - Super Compact & Optimized */}
          <form 
            onSubmit={handleAddMemberAsset} 
            className="bg-[#FFFEEB] rounded-3xl p-4 border-4 border-slate-800 shadow-[4px_4px_0px_0px_#1A202C] relative"
          >
            {/* Header/Badge for style */}
            <div className="absolute -top-3.5 left-6 bg-amber-300 text-slate-900 border-2 border-slate-800 px-3 py-0.5 rounded-full text-[10px] font-black shadow-[1px_1px_0px_0px_#1A202C] select-none">
              ✨ 快速新建会员卡包及共享权益
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-1.5">
              {/* Left Group: Membership Basic Info (col-span-5) */}
              <div className="lg:col-span-5 space-y-3 border-r-0 lg:border-r-2 border-dashed border-slate-300 lg:pr-4">
                <div className="text-slate-500 text-[10px] font-black uppercase tracking-wider">第一步：会员基本配置</div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="col-span-2 sm:col-span-1 space-y-1">
                    <label className="text-slate-700 text-[11px] font-black block">会员卡号 <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      placeholder="数字/英文卡号"
                      value={newAssetMemberId}
                      onChange={(e) => setNewAssetMemberId(e.target.value)}
                      className="w-full bg-white border-2 border-slate-800 rounded-xl px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-[#B9E3F8]/50 outline-none font-bold text-slate-800"
                      required
                    />
                  </div>
                  
                  <div className="col-span-2 sm:col-span-1 space-y-1">
                    <label className="text-slate-700 text-[11px] font-black block">会员等级</label>
                    <select
                      value={newAssetTier}
                      onChange={(e) => setNewAssetTier(e.target.value as any)}
                      className="w-full bg-white border-2 border-slate-800 rounded-xl px-2 py-1.5 text-xs focus:ring-2 focus:ring-[#B9E3F8]/50 outline-none font-bold text-slate-800 cursor-pointer"
                    >
                      <option value="黄金年卡🌼">🌼 黄金年卡</option>
                      <option value="钻石年卡💎">💎 钻石年卡</option>
                      <option value="铂金年卡👑">👑 铂金年卡</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 text-[11px] font-black block">专属会员日 <span className="text-slate-400 font-normal">(选填)</span></label>
                  <input
                    type="text"
                    placeholder="例如: 18号、周三 等"
                    value={newAssetMemberDay}
                    onChange={(e) => setNewAssetMemberDay(e.target.value)}
                    className="w-full bg-white border-2 border-slate-800 rounded-xl px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-[#B9E3F8]/50 outline-none font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Right Group: Multi-Pets Configuration (col-span-7) */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
                <div className="flex justify-between items-center">
                  <div className="text-slate-500 text-[10px] font-black uppercase tracking-wider">第二步：添加旗下宠物（可多只）</div>
                  <button
                    type="button"
                    onClick={() => setNewAssetPets([...newAssetPets, { name: '', birthday: '' }])}
                    className="inline-flex items-center gap-1 text-[10px] font-black text-teal-700 bg-teal-50 hover:bg-teal-100 border-2 border-slate-800 shadow-[1px_1px_0px_0px_#1A202C] rounded-lg px-2 py-1 transition-all active:translate-y-0.5 cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-teal-600" />
                    添加宠物
                  </button>
                </div>

                {/* Pets Inputs Row */}
                <div className="space-y-2 max-h-[110px] overflow-y-auto pr-1">
                  {newAssetPets.map((pet, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-white/60 p-1.5 rounded-xl border-2 border-slate-300">
                      <span className="text-xs font-black text-slate-500 w-5 text-center shrink-0">#{idx + 1}</span>
                      
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="宠物名字 (如 奥利奥)"
                          value={pet.name}
                          onChange={(e) => {
                            const updated = [...newAssetPets];
                            updated[idx].name = e.target.value;
                            setNewAssetPets(updated);
                          }}
                          className="w-full bg-white border-2 border-slate-300 rounded-lg px-2 py-1 text-xs outline-none focus:border-slate-800 font-bold text-slate-800"
                          required
                        />
                      </div>

                      <div className="flex-1">
                        <input
                          type="date"
                          value={pet.birthday}
                          onChange={(e) => {
                            const updated = [...newAssetPets];
                            updated[idx].birthday = e.target.value;
                            setNewAssetPets(updated);
                          }}
                          className="w-full bg-white border-2 border-slate-300 rounded-lg px-2 py-1 text-xs outline-none focus:border-slate-800 font-bold text-slate-800 font-mono"
                        />
                      </div>

                      {newAssetPets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = newAssetPets.filter((_, i) => i !== idx);
                            setNewAssetPets(updated);
                          }}
                          className="p-1 hover:bg-rose-50 text-rose-500 hover:text-rose-700 border-2 border-transparent hover:border-rose-200 rounded-lg cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Submit button bar */}
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#B9E3F8] hover:bg-[#a3d5ef] text-slate-900 text-xs font-black rounded-xl border-2 border-slate-800 transition-all duration-150 flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#1A202C] active:translate-y-0.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>确认创建会员账户</span>
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Search, Filter & Restorer Row */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white border-2 border-slate-800 p-4 rounded-2xl shadow-[3px_3px_0px_0px_#1A202C]">
            <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="输入卡号或宠物名检索..."
                  value={searchAssetQuery}
                  onChange={(e) => setSearchAssetQuery(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs font-black outline-none focus:ring-4 focus:ring-[#B9E3F8]/50 shadow-[1px_1px_0px_0px_#1A202C]"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              </div>

              {/* Filter tabs */}
              <div className="flex gap-1.5 border-2 border-slate-300 p-0.5 rounded-xl bg-slate-50">
                {(['all', 'platinums', 'diamonds', 'golds'] as const).map((tierOpt) => (
                  <button
                    key={tierOpt}
                    type="button"
                    onClick={() => setSelectedAssetTier(tierOpt)}
                    className={`py-1 px-2 text-[11px] font-black rounded-lg transition-all duration-150 cursor-pointer ${
                      selectedAssetTier === tierOpt
                        ? 'bg-[#B9E3F8] text-slate-900 border border-slate-800 shadow-[1px_1px_0px_0px_#1A202C]'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tierOpt === 'all' && '全部'}
                    {tierOpt === 'platinums' && '👑 铂金卡'}
                    {tierOpt === 'diamonds' && '💎 钻石卡'}
                    {tierOpt === 'golds' && '🌼 黄金卡'}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={exportAnnualCardsToExcel}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs text-sky-800 bg-sky-50 hover:bg-sky-100 border-2 border-slate-800 rounded-xl shadow-[2px_2px_0px_0px_#1A202C] font-black cursor-pointer active:translate-y-0.5 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-sky-600" />
                导出 Excel
              </button>

              {/* Quick reset button */}
              <button
                type="button"
                onClick={async () => {
                  const confirmed = customConfirm
                    ? await customConfirm('确定要重置所有会员家庭的卡包权益额度到出厂设置吗？这会清除您当前的修改。', '重置权益额度')
                    : confirm('确定要重置所有会员家庭的卡包权益额度到出厂设置吗？这会清除您当前的修改。');
                  if (confirmed) {
                    onRestoreDefaults();
                  }
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 border-2 border-slate-800 rounded-xl shadow-[2px_2px_0px_0px_#1A202C] font-black cursor-pointer active:translate-y-0.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                重置卡包权益额度
              </button>
            </div>
          </div>

          {/* Member table list */}
          <div className="bg-white border-4 border-slate-800 rounded-3xl overflow-hidden shadow-[4px_4px_0px_0px_#1A202C]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="bg-[#FFFEEB] border-b-4 border-slate-800 text-xs font-black text-slate-800 uppercase tracking-wider">
                    <th className="p-3.5 border-r-2 border-slate-300 w-[130px] text-center">会员卡号</th>
                    <th className="p-3.5 border-r-2 border-slate-300 w-[160px]">宠物&生日</th>
                    <th className="p-3.5 border-r-2 border-slate-300 w-[110px] text-center">会员等级</th>
                    <th className="p-3.5 border-r-2 border-slate-300 w-[85px] text-center">专属会员日</th>
                    <th className="p-3.5 border-r-2 border-slate-300 w-auto">共享卡包资产明细</th>
                    <th className="p-3.5 border-r-2 border-slate-300 w-[130px] text-center">有效期</th>
                    <th className="p-3.5 text-center w-[120px]">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-200">
                  {(() => {
                    const getRemainingDaysLabel = (end?: string) => {
                      if (!end) return <span className="text-slate-400 text-xs font-bold whitespace-nowrap">无期限</span>;
                      const endDate = new Date(end);
                      const now = new Date();
                      endDate.setHours(0,0,0,0);
                      now.setHours(0,0,0,0);
                      const diff = endDate.getTime() - now.getTime();
                      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                      if (days > 30) {
                        return (
                          <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-300 rounded px-2 py-0.5 text-xs font-bold whitespace-nowrap">
                            还剩 {days} 天
                          </span>
                        );
                      } else if (days >= 0) {
                        return (
                          <span className="inline-block bg-amber-50 text-amber-700 border border-amber-300 rounded px-2 py-0.5 text-xs font-bold animate-pulse whitespace-nowrap">
                            {days === 0 ? '今日到期' : `还剩 ${days} 天`}
                          </span>
                        );
                      } else {
                        return (
                          <span className="inline-block bg-rose-50 text-rose-700 border border-rose-300 rounded px-2 py-0.5 text-xs font-bold whitespace-nowrap">
                            已过期 {Math.abs(days)} 天
                          </span>
                        );
                      }
                    };

                    const getTierBadge = (tier: string) => {
                      let style = 'bg-yellow-100 text-yellow-900 border-yellow-300';
                      if (tier === '铂金年卡👑') style = 'bg-cyan-100 text-cyan-900 border-cyan-300';
                      if (tier === '钻石年卡💎') style = 'bg-purple-100 text-purple-900 border-purple-300';
                      return (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border-2 border-slate-800 shadow-[1px_1px_0px_0px_#1A202C] font-black text-xs whitespace-nowrap ${style}`}>
                          {tier}
                        </span>
                      );
                    };

                    const filtered = memberAssets.filter((account) => {
                      // Filter by Tier
                      if (selectedAssetTier === 'platinums' && account.tier !== '铂金年卡👑') return false;
                      if (selectedAssetTier === 'diamonds' && account.tier !== '钻石年卡💎') return false;
                      if (selectedAssetTier === 'golds' && account.tier !== '黄金年卡🌼') return false;

                      // Filter by Search Query
                      if (searchAssetQuery.trim()) {
                        const query = searchAssetQuery.toLowerCase();
                        const idMatch = account.memberId.toLowerCase().includes(query);
                        const petMatch = account.pets.some(p => p.name.toLowerCase().includes(query));
                        return idMatch || petMatch;
                      }

                      return true;
                    });

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-xs text-slate-400 font-bold">
                            未找到符合条件的会员家庭账户。
                          </td>
                        </tr>
                      );
                    }

                    return filtered.map((account) => (
                      <tr key={account.memberId} className="hover:bg-slate-50/50 transition-colors">
                        {/* 会员编号 */}
                        <td className="p-3.5 text-xs font-mono font-black text-slate-900 border-r-2 border-slate-200 bg-slate-50/40 text-center">
                          {account.memberId === '未知/未录入' ? (
                            <span className="text-slate-400 font-sans font-bold">未知/未录入</span>
                          ) : (
                            <span className="bg-amber-100 text-amber-900 border-2 border-slate-800 px-2 py-1 rounded-lg shadow-[1px_1px_0px_0px_#1A202C] text-xs font-mono font-bold select-all tracking-wider inline-block">
                              {account.memberId}
                            </span>
                          )}
                        </td>

                        {/* 宠物&生日 */}
                        <td className="p-3 border-r-2 border-slate-200 w-[160px]">
                          <div className="flex flex-col gap-1.5">
                            {account.pets.map((p, i) => {
                              const days = getDaysUntilBirthday(p.birthday);
                              if (days === null) {
                                return (
                                  <div key={i} className="bg-pink-50 border-2 border-pink-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-pink-700 flex flex-col">
                                    <div className="flex justify-between items-center gap-1">
                                      <span className="font-black text-[13px] text-pink-950 truncate">🐾 {p.name}</span>
                                      <span className="text-[9px] text-pink-400 shrink-0 font-mono">🎂 未设置</span>
                                    </div>
                                    <div className="text-[10px] font-black text-pink-850 mt-0.5">
                                      未设置生日
                                    </div>
                                  </div>
                                );
                              }
                              return (
                                <div key={i} className="bg-pink-50 border-2 border-pink-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-pink-700 flex flex-col">
                                  <div className="flex justify-between items-center gap-1">
                                    <span className="font-black text-[13px] text-pink-950 truncate">🐾 {p.name}</span>
                                    <span className="text-[10px] text-pink-400 shrink-0 font-mono">🎂 {p.birthday?.slice(5)}</span>
                                  </div>
                                  <div className="text-xs font-black text-pink-800 mt-1">
                                    {days === 0 ? '🎉 今天生日！' : `${days} 天后生日`}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </td>

                        {/* 会员等级 */}
                        <td className="p-3 border-r-2 border-slate-200 w-[110px] text-center">
                          {getTierBadge(account.tier)}
                        </td>

                        {/* 专属会员日 */}
                        <td className="p-3 border-r-2 border-slate-200 w-[85px] text-center">
                          <span className="inline-flex items-center bg-sky-50 text-sky-850 border border-sky-300 rounded-lg px-2 py-1 text-xs font-black whitespace-nowrap">
                            {account.memberDay || (account.tier === '铂金年卡👑' ? '周三' : account.tier === '钻石年卡💎' ? '18号' : '8号')}
                          </span>
                        </td>

                        {/* 共享卡包资产明细 */}
                        <td className="p-3 border-r-2 border-slate-200">
                          <div className="flex flex-wrap gap-2">
                            {/* Daycare */}
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${
                              account.daycareCoupons.unused > 0 
                                ? 'bg-teal-50 text-teal-800 border-teal-200' 
                                : 'bg-slate-150 text-slate-400 border-slate-200 line-through opacity-60'
                            }`}>
                              日托券: {account.daycareCoupons.unused}/{account.daycareCoupons.total}
                            </span>

                            {/* Holiday */}
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${
                              account.holidayCoupons.unused > 0 
                                ? 'bg-blue-50 text-blue-800 border-blue-200' 
                                : 'bg-slate-150 text-slate-400 border-slate-200 line-through opacity-60'
                            }`}>
                              度假升级: {account.holidayCoupons.unused}/{account.holidayCoupons.total}
                            </span>

                            {/* Special care (Diamond only) */}
                            {account.specialCareCoupons && (
                              <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${
                                account.specialCareCoupons.unused > 0 
                                  ? 'bg-purple-50 text-purple-800 border-purple-200' 
                                  : 'bg-slate-150 text-slate-400 border-slate-200 line-through opacity-60'
                              }`}>
                                陪护升级: {account.specialCareCoupons.unused}/{account.specialCareCoupons.total}
                              </span>
                            )}

                            {/* Wash */}
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${
                              account.washCoupons.unused > 0 
                                ? 'bg-rose-50 text-rose-800 border-rose-200' 
                                : 'bg-slate-150 text-slate-400 border-slate-200 line-through opacity-60'
                            }`}>
                              高端洗护: {account.washCoupons.unused}/{account.washCoupons.total}
                            </span>

                            {/* Transfer (Diamond & Platinum) */}
                            {account.transferCoupons && (
                              <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${
                                account.transferCoupons.unused > 0 
                                  ? 'bg-amber-50 text-amber-800 border-amber-200' 
                                  : 'bg-slate-150 text-slate-400 border-slate-200 line-through opacity-60'
                              }`}>
                                同城接送: {account.transferCoupons.unused}/{account.transferCoupons.total}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 有效期 */}
                        <td className="p-3 text-xs font-bold text-slate-650 border-r-2 border-slate-200 font-mono text-center">
                          {getRemainingDaysLabel(account.validityEnd)}
                        </td>

                        {/* 操作 */}
                        <td className="p-3 text-center">
                          <div className="flex flex-col gap-1.5 items-center justify-center">
                            <button
                              type="button"
                              onClick={() => setEditingAssetAccount(account)}
                              className="w-full inline-flex items-center justify-center gap-1 py-1 px-1.5 rounded-xl border-2 border-slate-800 text-xs font-black text-slate-700 bg-white hover:bg-slate-100 active:translate-y-0.5 transition-all cursor-pointer shadow-[1px_1px_0px_0px_#1A202C]"
                            >
                              <Edit className="w-3.5 h-3.5 text-teal-600" />
                              编辑卡包
                            </button>
                            {deletingId === account.memberId ? (
                              <div className="w-full flex flex-col gap-1 bg-rose-50 p-1 border-2 border-rose-800 rounded-xl">
                                <span className="text-[10px] font-black text-rose-800 block text-center leading-tight">确认删除？</span>
                                <div className="flex gap-1 justify-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMemberAssets(prev => prev.filter(a => a.memberId !== account.memberId));
                                      setDeletingId(null);
                                      showToast('成功删除该家庭卡包账户！', 'success');
                                    }}
                                    className="px-1.5 py-0.5 text-[10px] font-black text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
                                  >
                                    确定
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeletingId(null)}
                                    className="px-1.5 py-0.5 text-[10px] font-black text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg cursor-pointer"
                                  >
                                    取消
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setDeletingId(account.memberId)}
                                className="w-full inline-flex items-center justify-center gap-1 py-1 px-1.5 rounded-xl border-2 border-slate-800 text-xs font-black text-rose-700 bg-white hover:bg-rose-50 active:translate-y-0.5 transition-all cursor-pointer shadow-[1px_1px_0px_0px_#1A202C]"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                删除卡包
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 🎟️ Modal to Edit Family Asset Coupon Balance */}
      {editingAssetAccount && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-[6px_6px_0px_0px_#1A202C] space-y-4 relative animate-scale-up">
            <button 
              type="button"
              onClick={() => setEditingAssetAccount(null)}
              className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 border-2 border-slate-800 p-1.5 rounded-full text-slate-700 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5 font-hand">
              <Edit className="w-5 h-5 text-teal-600" />
              编辑年卡卡包权益 - 家庭账号 {editingAssetAccount.memberId}
            </h3>
            
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {/* Tier and validity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 text-[10px] font-black uppercase block">会员年卡级别</label>
                  <div className="bg-slate-50 border-2 border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800">
                    {editingAssetAccount.tier}
                  </div>
                </div>
                <div>
                  <label className="text-slate-500 text-[10px] font-black uppercase block">旗下关联宠物</label>
                  <div className="bg-slate-50 border-2 border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 truncate">
                    {editingAssetAccount.pets.map(p => p.name).join(', ')}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 text-[10px] font-black uppercase block">开卡日期</label>
                  <input
                    type="date"
                    value={editingAssetAccount.validityStart || ''}
                    onChange={(e) => setEditingAssetAccount({ ...editingAssetAccount, validityStart: e.target.value })}
                    className="w-full bg-white border-2 border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold focus:ring-4 focus:ring-[#B9E3F8]/50 outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-500 text-[10px] font-black uppercase block">到期日期</label>
                  <input
                    type="date"
                    value={editingAssetAccount.validityEnd || ''}
                    onChange={(e) => setEditingAssetAccount({ ...editingAssetAccount, validityEnd: e.target.value })}
                    className="w-full bg-white border-2 border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold focus:ring-4 focus:ring-[#B9E3F8]/50 outline-none"
                  />
                </div>
              </div>

              {/* Member Day and Pet Birthdays Editing */}
              <div className="grid grid-cols-2 gap-3 border-t-2 border-dashed border-slate-100 pt-3">
                <div>
                  <label className="text-slate-500 text-[10px] font-black uppercase block">会员专属日</label>
                  {editingAssetAccount.tier === '铂金年卡👑' ? (
                    <select
                      value={editingAssetAccount.memberDay || '周三'}
                      onChange={(e) => setEditingAssetAccount({ ...editingAssetAccount, memberDay: e.target.value })}
                      className="w-full bg-white border-2 border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold focus:ring-4 focus:ring-[#B9E3F8]/50 outline-none font-sans"
                    >
                      <option value="周一">每周周一</option>
                      <option value="周二">每周周二</option>
                      <option value="周三">每周周三</option>
                      <option value="周四">每周周四</option>
                      <option value="周五">每周周五</option>
                      <option value="周六">每周周六</option>
                      <option value="周日">每周周日</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="如: 18号"
                      value={editingAssetAccount.memberDay || ''}
                      onChange={(e) => setEditingAssetAccount({ ...editingAssetAccount, memberDay: e.target.value })}
                      className="w-full bg-white border-2 border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold focus:ring-4 focus:ring-[#B9E3F8]/50 outline-none"
                    />
                  )}
                  <p className="text-[9px] text-slate-400 mt-0.5 font-bold leading-tight">
                    {editingAssetAccount.tier === '铂金年卡👑' ? '👑 铂金卡为每周1天' : '🌼/💎 黄金与钻石为每月固定日期'}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-500 text-[10px] font-black uppercase block">旗下宠物生日</label>
                  <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
                    {editingAssetAccount.pets.map((pet, idx) => (
                      <div key={idx} className="flex flex-col gap-0.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                        <span className="text-[9px] font-bold text-slate-700">🐾 {pet.name}</span>
                        <input
                          type="date"
                          value={pet.birthday || ''}
                          onChange={(e) => {
                            const updatedPets = [...editingAssetAccount.pets];
                            updatedPets[idx] = { ...updatedPets[idx], birthday: e.target.value };
                            setEditingAssetAccount({
                              ...editingAssetAccount,
                              pets: updatedPets
                            });
                          }}
                          className="w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[9px] font-bold outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Coupons inputs */}
              <div className="space-y-2.5 border-t-2 border-slate-100 pt-3">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1">
                  <Ticket className="w-3.5 h-3.5 text-teal-600" />
                  卡包券额配置 (未使用 / 总额度)
                </h4>
                
                {/* Daycare */}
                <div className="flex items-center justify-between bg-slate-50 border-2 border-slate-800 p-2 rounded-xl">
                  <span className="text-xs font-bold text-slate-700">全天日托兑换券</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={editingAssetAccount.daycareCoupons.unused}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setEditingAssetAccount({
                          ...editingAssetAccount,
                          daycareCoupons: {
                            ...editingAssetAccount.daycareCoupons,
                            unused: val,
                            used: Math.max(0, editingAssetAccount.daycareCoupons.total - val)
                          }
                        });
                      }}
                      className="w-14 bg-white border-2 border-slate-800 rounded-lg px-1.5 py-0.5 text-xs text-center font-bold font-mono"
                    />
                    <span className="text-xs text-slate-400">/</span>
                    <input
                      type="number"
                      min="0"
                      value={editingAssetAccount.daycareCoupons.total}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setEditingAssetAccount({
                          ...editingAssetAccount,
                          daycareCoupons: {
                            ...editingAssetAccount.daycareCoupons,
                            total: val,
                            used: Math.max(0, val - editingAssetAccount.daycareCoupons.unused)
                          }
                        });
                      }}
                      className="w-14 bg-white border-2 border-slate-800 rounded-lg px-1.5 py-0.5 text-xs text-center font-bold font-mono"
                    />
                  </div>
                </div>

                {/* Holiday */}
                <div className="flex items-center justify-between bg-slate-50 border-2 border-slate-800 p-2 rounded-xl">
                  <span className="text-xs font-bold text-slate-700">度假房升级房券</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={editingAssetAccount.holidayCoupons.unused}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setEditingAssetAccount({
                          ...editingAssetAccount,
                          holidayCoupons: {
                            ...editingAssetAccount.holidayCoupons,
                            unused: val,
                            used: Math.max(0, editingAssetAccount.holidayCoupons.total - val)
                          }
                        });
                      }}
                      className="w-14 bg-white border-2 border-slate-800 rounded-lg px-1.5 py-0.5 text-xs text-center font-bold font-mono"
                    />
                    <span className="text-xs text-slate-400">/</span>
                    <input
                      type="number"
                      min="0"
                      value={editingAssetAccount.holidayCoupons.total}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setEditingAssetAccount({
                          ...editingAssetAccount,
                          holidayCoupons: {
                            ...editingAssetAccount.holidayCoupons,
                            total: val,
                            used: Math.max(0, val - editingAssetAccount.holidayCoupons.unused)
                          }
                        });
                      }}
                      className="w-14 bg-white border-2 border-slate-800 rounded-lg px-1.5 py-0.5 text-xs text-center font-bold font-mono"
                    />
                  </div>
                </div>

                {/* Special Care - Diamond only */}
                {editingAssetAccount.specialCareCoupons && (
                  <div className="flex items-center justify-between bg-slate-50 border-2 border-slate-800 p-2 rounded-xl">
                    <span className="text-xs font-bold text-slate-700">特殊陪护房升级券</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={editingAssetAccount.specialCareCoupons.unused}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setEditingAssetAccount({
                            ...editingAssetAccount,
                            specialCareCoupons: {
                              ...editingAssetAccount.specialCareCoupons!,
                              unused: val,
                              used: Math.max(0, editingAssetAccount.specialCareCoupons!.total - val)
                            }
                          });
                        }}
                        className="w-14 bg-white border-2 border-slate-800 rounded-lg px-1.5 py-0.5 text-xs text-center font-bold font-mono"
                      />
                      <span className="text-xs text-slate-400">/</span>
                      <input
                        type="number"
                        min="0"
                        value={editingAssetAccount.specialCareCoupons.total}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setEditingAssetAccount({
                            ...editingAssetAccount,
                            specialCareCoupons: {
                              ...editingAssetAccount.specialCareCoupons!,
                              total: val,
                              used: Math.max(0, val - editingAssetAccount.specialCareCoupons!.unused)
                            }
                          });
                        }}
                        className="w-14 bg-white border-2 border-slate-800 rounded-lg px-1.5 py-0.5 text-xs text-center font-bold font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Wash */}
                <div className="flex items-center justify-between bg-slate-50 border-2 border-slate-800 p-2 rounded-xl">
                  <span className="text-xs font-bold text-slate-700">高端洗护升级券</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={editingAssetAccount.washCoupons.unused}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setEditingAssetAccount({
                          ...editingAssetAccount,
                          washCoupons: {
                            ...editingAssetAccount.washCoupons,
                            unused: val,
                            used: Math.max(0, editingAssetAccount.washCoupons.total - val)
                          }
                        });
                      }}
                      className="w-14 bg-white border-2 border-slate-800 rounded-lg px-1.5 py-0.5 text-xs text-center font-bold font-mono"
                    />
                    <span className="text-xs text-slate-400">/</span>
                    <input
                      type="number"
                      min="0"
                      value={editingAssetAccount.washCoupons.total}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setEditingAssetAccount({
                          ...editingAssetAccount,
                          washCoupons: {
                            ...editingAssetAccount.washCoupons,
                            total: val,
                            used: Math.max(0, val - editingAssetAccount.washCoupons.unused)
                          }
                        });
                      }}
                      className="w-14 bg-white border-2 border-slate-800 rounded-lg px-1.5 py-0.5 text-xs text-center font-bold font-mono"
                    />
                  </div>
                </div>

                {/* Transfer - Diamond only */}
                {editingAssetAccount.transferCoupons && (
                  <div className="flex items-center justify-between bg-slate-50 border-2 border-slate-800 p-2 rounded-xl">
                    <span className="text-xs font-bold text-slate-700">10km接送抵用券</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={editingAssetAccount.transferCoupons.unused}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setEditingAssetAccount({
                            ...editingAssetAccount,
                            transferCoupons: {
                              ...editingAssetAccount.transferCoupons!,
                              unused: val,
                              used: Math.max(0, editingAssetAccount.transferCoupons!.total - val)
                            }
                          });
                        }}
                        className="w-14 bg-white border-2 border-slate-800 rounded-lg px-1.5 py-0.5 text-xs text-center font-bold font-mono"
                      />
                      <span className="text-xs text-slate-400">/</span>
                      <input
                        type="number"
                        min="0"
                        value={editingAssetAccount.transferCoupons.total}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setEditingAssetAccount({
                            ...editingAssetAccount,
                            transferCoupons: {
                              ...editingAssetAccount.transferCoupons!,
                              total: val,
                              used: Math.max(0, val - editingAssetAccount.transferCoupons!.unused)
                            }
                          });
                        }}
                        className="w-14 bg-white border-2 border-slate-800 rounded-lg px-1.5 py-0.5 text-xs text-center font-bold font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end border-t-2 border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setEditingAssetAccount(null)}
                className="px-4 py-2 border-2 border-slate-800 rounded-xl font-black text-xs hover:bg-slate-50 transition-all cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  if (editingAssetAccount) {
                    setMemberAssets(prev => prev.map(a => a.memberId === editingAssetAccount.memberId ? editingAssetAccount : a));
                    setEditingAssetAccount(null);
                  }
                }}
                className="px-4 py-2 bg-[#B9E3F8] border-2 border-slate-800 text-slate-900 shadow-[2px_2px_0px_0px_#1A202C] rounded-xl font-black text-xs hover:bg-[#a5dbf7] active:translate-y-0.5 transition-all cursor-pointer"
              >
                保存权益修改
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 Beautiful Custom Notification Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl border-4 border-slate-800 bg-white shadow-[4px_4px_0px_0px_#1A202C] animate-bounce">
          <div className={`w-3 h-3 rounded-full ${toastMsg.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <span className="text-xs font-black text-slate-900">{toastMsg.text}</span>
        </div>
      )}
    </div>
  );
}
