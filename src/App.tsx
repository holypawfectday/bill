/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ServiceItem, MemberType, Bill, MemberAssetAccount, InvoiceStyle } from './types';
import { DEFAULT_SERVICES, DEFAULT_MEMBERSHIPS, DEFAULT_INVOICE_STYLE } from './defaults';
import { INITIAL_MEMBER_ASSETS } from './data/memberAssets';
import BillForm from './components/BillForm';
import ServiceSettings from './components/ServiceSettings';
import Receipt from './components/Receipt';
import HistoryList from './components/HistoryList';
import InvoiceStyleEditor from './components/InvoiceStyleEditor';
import { PawPrint, Settings, Receipt as ReceiptIcon, Calendar, CheckSquare, PlusCircle, BarChart3, Clock, Sparkles } from 'lucide-react';
import { CutePuppyHead, PinkHeart, BlueSparkle, YellowSparkle, HolyPawfectPuppy, HolyPawfectLogo } from './components/CuteDoodles';
import { downloadCSV } from './utils/export';

export default function App() {
  // --- States ---
  const [services, setServices] = useState<ServiceItem[]>(() => {
    let rawServices = DEFAULT_SERVICES;
    const local = localStorage.getItem('pet_paradise_services_v3');
    if (local) {
      try {
        const parsed = JSON.parse(local) as ServiceItem[];
        // Auto-upgrade if any service lacks the newly added subCategory field
        const needsUpgrade = parsed.some((s) => !s.subCategory);
        const needsSpUpgrade = parsed.some((s) => s.id.startsWith('srv_mr_sp_') && s.category !== '专项服务');
        if (!needsUpgrade && !needsSpUpgrade) {
          rawServices = parsed;
        } else {
          rawServices = parsed.map((s) => {
            const updated = { ...s };
            if (s.id.startsWith('srv_mr_sp_') && s.category !== '专项服务') {
              updated.category = '专项服务';
            }
            return updated;
          });
        }
      } catch (e) {
        console.error('Failed to parse local services:', e);
      }
    }
    const seen = new Set<string>();
    return rawServices.filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
  });

  const [memberships, setMemberships] = useState<MemberType[]>(() => {
    const local = localStorage.getItem('pet_paradise_memberships_v3');
    return local ? JSON.parse(local) : DEFAULT_MEMBERSHIPS;
  });

  const [memberAssets, setMemberAssets] = useState<MemberAssetAccount[]>(() => {
    const local = localStorage.getItem('pet_paradise_member_assets_v3');
    const loadedRaw = local ? JSON.parse(local) : INITIAL_MEMBER_ASSETS;
    
    // Normalize member ID function
    const getNormalizedId = (id: any) => {
      const trimmed = String(id).trim();
      return /^\d+$/.test(trimmed) ? trimmed.padStart(12, '0') : trimmed;
    };

    // Store normalized loaded IDs
    const loadedNormalizedIds = new Set(loadedRaw.map((acc: any) => getNormalizedId(acc.memberId)));

    // Merge any missing accounts from INITIAL_MEMBER_ASSETS
    const mergedRaw = [...loadedRaw];
    for (const initAcc of INITIAL_MEMBER_ASSETS) {
      const initIdNormalized = getNormalizedId(initAcc.memberId);
      if (!loadedNormalizedIds.has(initIdNormalized)) {
        mergedRaw.push(initAcc);
        loadedNormalizedIds.add(initIdNormalized);
      }
    }

    return mergedRaw
      .map((acc: any) => ({
        ...acc,
        memberId: getNormalizedId(acc.memberId)
      }))
      .filter(
        (acc: any) => acc.memberId !== '000000000001' && acc.memberId !== '000000000002'
      );
  });

  const [bills, setBills] = useState<Bill[]>(() => {
    const local = localStorage.getItem('pet_paradise_bills');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse pet_paradise_bills:', e);
      }
    }
    const defaultBill: Bill = {
      id: 'bill_demo_1',
      billNumber: 'P-20260627-0001',
      createdAt: '2026-06-27T06:00:00.000Z',
      dogName: '椰子 (Coconut)',
      dogBreed: '萨摩耶 (Samoyed)',
      petType: '狗狗',
      petWeight: 22,
      checkInDate: '2026-06-20',
      checkOutDate: '2026-06-25',
      isMember: true,
      discountPreset: '88折',
      memberTypeId: 'mem_2',
      memberTypeName: '钻石年卡💎',
      memberId: '100000000001',
      discount: 0.88,
      items: [
        { serviceId: 'srv_jy_4', name: '豪华乐园度假房寄养 (Suite Boarding)', price: 473.44, originalPrice: 538, quantity: 5, unit: '天' },
        { serviceId: 'srv_xh_d2025_2', name: '狗狗赛级定制洗护SPA (Samoyed Grooming)', price: 376.64, originalPrice: 428, quantity: 1, unit: '次' },
        { serviceId: 'srv_js_2', name: '萌宠专车接送服务 (Pet Taxi Service)', price: 0, originalPrice: 90, quantity: 1, unit: '次' }
      ],
      subtotal: 3208.00,
      total: 2743.84,
      paymentMethod: '会员卡扣款',
      notes: '每日三次大草坪活动，全程私人宠物管家陪同照顾，情绪稳定，非常乖巧。',
      isHoliday: false,
      isMemberDay: true,
      useDaycareCoupon: 0,
      useBoardingUpgradeCoupon: 0,
      useSpecialCareUpgradeCoupon: 0,
      useWashUpgradeCoupon: 0,
      useTransferCoupon: 1,
      useDentalCoupon: 0
    };
    return [defaultBill];
  });

  const [invoiceStyle, setInvoiceStyle] = useState<InvoiceStyle>(() => {
    const local = localStorage.getItem('pet_paradise_invoice_style_v3');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed && parsed.containerWidth === 525) {
          parsed.containerWidth = 305;
        }
        return { ...DEFAULT_INVOICE_STYLE, ...parsed };
      } catch (e) {
        console.error('Failed to parse invoice style:', e);
      }
    }
    return DEFAULT_INVOICE_STYLE;
  });

  // --- Auto-sync local invoiceStyle drafts to the server or sync from server if local is stale ---
  useEffect(() => {
    const local = localStorage.getItem('pet_paradise_invoice_style_v3');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        const serverTimestamp = DEFAULT_INVOICE_STYLE.lastUpdated || 0;
        const localTimestamp = parsed.lastUpdated || 0;

        if (localTimestamp < serverTimestamp) {
          // Stale local storage detected! Let's synchronize B's stale layout to the new server master style.
          setInvoiceStyle(DEFAULT_INVOICE_STYLE);
          localStorage.setItem('pet_paradise_invoice_style_v3', JSON.stringify(DEFAULT_INVOICE_STYLE));
          console.log('Stale local invoice style discarded. Synchronized with the latest server style!');
        } else if (localTimestamp === 0 && serverTimestamp === 0) {
          // Both are 0 (unversioned). This is the custom layout designed on their computer.
          // Let's promote this layout to the server-side DEFAULT_INVOICE_STYLE.
          const updatedWithTimestamp = {
            ...parsed,
            lastUpdated: Date.now()
          };
          setInvoiceStyle(updatedWithTimestamp);
          localStorage.setItem('pet_paradise_invoice_style_v3', JSON.stringify(updatedWithTimestamp));
          
          fetch('/api/save-defaults', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              invoiceStyle: updatedWithTimestamp,
            }),
          }).then(res => {
            if (res.ok) {
              console.log('Successfully auto-promoted local invoice style custom draft to server defaults!');
            }
          }).catch(err => {
            console.error('Failed to auto-sync local draft to server:', err);
          });
        }
      } catch (e) {
        console.error('Failed to run startup sync for invoiceStyle:', e);
      }
    } else {
      // If no local storage exists at all, make sure it is updated with the server's default
      localStorage.setItem('pet_paradise_invoice_style_v3', JSON.stringify(DEFAULT_INVOICE_STYLE));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pet_paradise_invoice_style_v3', JSON.stringify(invoiceStyle));
  }, [invoiceStyle]);

  const [activeTab, setActiveTab] = useState<'cashier' | 'history' | 'settings' | 'invoice_design'>('cashier');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  // Auto-select the first bill on initial load if none is selected
  const hasAutoSelectedRef = React.useRef(false);
  useEffect(() => {
    if (bills.length > 0 && !selectedBill && !hasAutoSelectedRef.current) {
      setSelectedBill(bills[0]);
      hasAutoSelectedRef.current = true;
    }
  }, [bills, selectedBill]);
  const [logoError, setLogoError] = useState(false);
  const [logo2Error, setLogo2Error] = useState(false);

  // --- Custom Dialog States ---
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'alert' | 'confirm';
    title: string;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  } | null>(null);

  const customAlert = (message: string, title = '系统提示') => {
    return new Promise<void>((resolve) => {
      setModalConfig({
        isOpen: true,
        type: 'alert',
        title,
        message,
        onConfirm: () => {
          setModalConfig(null);
          resolve();
        }
      });
    });
  };

  const customConfirm = (message: string, title = '确认操作') => {
    return new Promise<boolean>((resolve) => {
      setModalConfig({
        isOpen: true,
        type: 'confirm',
        title,
        message,
        onConfirm: () => {
          setModalConfig(null);
          resolve(true);
        },
        onCancel: () => {
          setModalConfig(null);
          resolve(false);
        }
      });
    });
  };

  // --- Undo deletion states ---
  const [lastDeletedBill, setLastDeletedBill] = useState<Bill | null>(null);
  const [deletedBillIndex, setDeletedBillIndex] = useState<number | null>(null);

  // --- Sync to LocalStorage ---
  useEffect(() => {
    localStorage.setItem('pet_paradise_services_v3', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('pet_paradise_memberships_v3', JSON.stringify(memberships));
  }, [memberships]);

  useEffect(() => {
    localStorage.setItem('pet_paradise_member_assets_v3', JSON.stringify(memberAssets));
  }, [memberAssets]);

  useEffect(() => {
    localStorage.setItem('pet_paradise_bills', JSON.stringify(bills));
  }, [bills]);

  // --- Actions ---
  // Generate high-end sequential bill numbers
  const generateBillNumber = () => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const todaysBillsCount = bills.filter((b) => b.createdAt.startsWith(new Date().toISOString().slice(0, 10))).length;
    const serial = String(todaysBillsCount + 1).padStart(4, '0');
    return `P-${dateStr}-${serial}`;
  };

  // Create a new bill from form submission
  const handleGenerateBill = (newBillData: Omit<Bill, 'id' | 'billNumber' | 'createdAt'>) => {
    const uniqueId = `bill_${Date.now()}`;
    const billNumber = generateBillNumber();
    const createdAt = new Date().toISOString();

    const fullBill: Bill = {
      ...newBillData,
      id: uniqueId,
      billNumber,
      createdAt,
    };

    setBills((prev) => [fullBill, ...prev]);
    setSelectedBill(fullBill);
    // Switch view to ensure the ticket is highlighted
    setActiveTab('cashier');
  };

  // Delete an existing bill with undo support
  const handleDeleteBill = async (id: string) => {
    const confirmed = await customConfirm('确认要删除这条账单记录吗？(删除后可在历史列表顶部撤销)', '确认删除账单');
    if (confirmed) {
      const idx = bills.findIndex((b) => b.id === id);
      if (idx !== -1) {
        setLastDeletedBill(bills[idx]);
        setDeletedBillIndex(idx);
        setBills((prev) => prev.filter((b) => b.id !== id));
        if (selectedBill?.id === id) {
          setSelectedBill(null);
        }
      }
    }
  };

  // Delete all bills
  const handleDeleteAllBills = async () => {
    if (bills.length === 0) {
      if (customAlert) {
        await customAlert('当前没有任何账单记录！');
      } else {
        alert('当前没有任何账单记录！');
      }
      return;
    }
    const confirmed = await customConfirm('⚠️ 警告：您确认要彻底删除“全部”账单记录吗？此操作将无法撤销，所有历史流水将全部清空！', '确认清空全部账单');
    if (confirmed) {
      setBills([]);
      setSelectedBill(null);
      setLastDeletedBill(null);
      setDeletedBillIndex(null);
      if (customAlert) {
        await customAlert('已成功清空全部历史账单记录！');
      }
    }
  };

  // Undo the deletion of the last deleted bill
  const handleUndoDelete = () => {
    if (lastDeletedBill) {
      setBills((prev) => {
        const newBills = [...prev];
        if (deletedBillIndex !== null && deletedBillIndex <= prev.length) {
          newBills.splice(deletedBillIndex, 0, lastDeletedBill);
        } else {
          newBills.unshift(lastDeletedBill);
        }
        return newBills;
      });
      setSelectedBill(lastDeletedBill);
      setLastDeletedBill(null);
      setDeletedBillIndex(null);
    }
  };

  // Restore catalog defaults
  const handleRestoreDefaults = async () => {
    const confirmed = await customConfirm('确认要恢复默认的价目表和折扣配置吗？这将会覆盖您当前修改的内容。', '恢复默认配置');
    if (confirmed) {
      setServices(DEFAULT_SERVICES);
      setMemberships(DEFAULT_MEMBERSHIPS);
    }
  };

  // Select bill from history to preview
  const handleSelectBillFromHistory = (bill: Bill) => {
    setSelectedBill(bill);
    setActiveTab('cashier'); // Switch to cashier tab to see the ticket
  };

  // --- Clock State for header ---
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDF6C7] text-slate-800 flex flex-col font-sans selection:bg-[#B9E3F8] selection:text-slate-900" id="app-root-container">
      {/* 🐾 Branding Top Header (Cute Hand-Drawn / Pastel Style) */}
      <header className="bg-white border-b-4 border-slate-800 py-4 px-6 sticky top-0 z-40 relative" id="app-header">
        <div className="max-w-7xl mx-auto flex flex-row justify-between items-center relative z-10">
          {/* 中英文放在左边 (logo.png) */}
          <div className="flex-shrink-0">
            {!logoError ? (
              <img
                src="/logo.png"
                alt="Holy Pawfect Logo"
                className="h-16 sm:h-20 md:h-24 object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="flex flex-col">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-hand tracking-tight text-slate-900 leading-none">
                  Holy Pawfect Day!
                </h1>
                <p className="text-xs sm:text-sm md:text-base font-black text-[#EBA53B] tracking-widest mt-1.5 font-sans">
                  好厉害宠物乐园
                </p>
              </div>
            )}
          </div>

          {/* 狗狗logo 放在右边 (logo2.png) */}
          <div className="flex-shrink-0">
            {!logo2Error ? (
              <img
                src="/logo2.png"
                alt="Holy Pawfect Puppy Logo"
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain"
                onError={() => setLogo2Error(true)}
              />
            ) : (
              <HolyPawfectPuppy className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24" strokeColor="#EBA53B" fillColor="#EBA53B" />
            )}
          </div>
        </div>
      </header>

      {/* 🧭 Nav Tabs Menu (Adorable Hand-Drawn Style) */}
      <nav className="bg-[#FFFEEB] border-b-2 border-slate-800 py-3 px-6" id="app-nav">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab('cashier')}
            className={`flex items-center gap-2 py-2 px-4 text-xs font-black rounded-xl transition-all duration-150 cursor-pointer border-2 ${
              activeTab === 'cashier'
                ? 'bg-[#B9E3F8] text-slate-900 border-slate-800 shadow-[2px_2px_0px_0px_#1A202C]'
                : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-300 hover:border-slate-800 hover:shadow-[1px_1px_0px_0px_#1A202C]'
            }`}
            id="nav-tab-cashier"
          >
            <ReceiptIcon className="w-3.5 h-3.5 text-slate-800" />
            新建账单
          </button>

          <button
            onClick={() => setActiveTab('invoice_design')}
            className={`flex items-center gap-2 py-2 px-4 text-xs font-black rounded-xl transition-all duration-150 cursor-pointer border-2 ${
              activeTab === 'invoice_design'
                ? 'bg-[#B9E3F8] text-slate-900 border-slate-800 shadow-[2px_2px_0px_0px_#1A202C]'
                : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-300 hover:border-slate-800 hover:shadow-[1px_1px_0px_0px_#1A202C]'
            }`}
            id="nav-tab-invoice-design"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#EBA53B]" />
            正式账单格式
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 py-2 px-4 text-xs font-black rounded-xl transition-all duration-150 cursor-pointer border-2 ${
              activeTab === 'history'
                ? 'bg-[#B9E3F8] text-slate-900 border-slate-800 shadow-[2px_2px_0px_0px_#1A202C]'
                : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-300 hover:border-slate-800 hover:shadow-[1px_1px_0px_0px_#1A202C]'
            }`}
            id="nav-tab-history"
          >
            <BarChart3 className="w-3.5 h-3.5 text-slate-800" />
            历史记录 ({bills.length})
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 py-2 px-4 text-xs font-black rounded-xl transition-all duration-150 cursor-pointer border-2 ${
              activeTab === 'settings'
                ? 'bg-[#B9E3F8] text-slate-900 border-slate-800 shadow-[2px_2px_0px_0px_#1A202C]'
                : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-300 hover:border-slate-800 hover:shadow-[1px_1px_0px_0px_#1A202C]'
            }`}
            id="nav-tab-settings"
          >
            <Settings className="w-3.5 h-3.5 text-slate-800" />
            价格与会员配置
          </button>
        </div>
      </nav>

      {/* 🖥️ Main Dashboard Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6" id="app-main-workspace">
        <div className={activeTab === 'cashier' ? '' : 'hidden'} id="tab-content-cashier">
          <BillForm
            services={services}
            memberships={memberships}
            onGenerateBill={handleGenerateBill}
            selectedBill={selectedBill}
            setSelectedBill={setSelectedBill}
            bills={bills}
            memberAssets={memberAssets}
            setMemberAssets={setMemberAssets}
            customAlert={customAlert}
            customConfirm={customConfirm}
            invoiceStyle={invoiceStyle}
          />
        </div>

        <div className={activeTab === 'history' ? '' : 'hidden'} id="tab-content-history">
          <HistoryList
            bills={bills}
            onSelectBill={handleSelectBillFromHistory}
            onDeleteBill={handleDeleteBill}
            onDeleteAllBills={handleDeleteAllBills}
            selectedBillId={selectedBill?.id}
            lastDeletedBill={lastDeletedBill}
            onUndoDelete={handleUndoDelete}
            customAlert={customAlert}
            customConfirm={customConfirm}
          />
        </div>

        <div className={activeTab === 'settings' ? '' : 'hidden'} id="tab-content-settings">
          <ServiceSettings
            services={services}
            setServices={setServices}
            memberships={memberships}
            setMemberships={setMemberships}
            onRestoreDefaults={handleRestoreDefaults}
            memberAssets={memberAssets}
            setMemberAssets={setMemberAssets}
            customAlert={customAlert}
            customConfirm={customConfirm}
          />
        </div>

        <div className={activeTab === 'invoice_design' ? 'w-full max-w-7xl mx-auto px-4 md:px-6' : 'hidden'} id="tab-content-invoice-design">
          <InvoiceStyleEditor
            invoiceStyle={invoiceStyle}
            setInvoiceStyle={setInvoiceStyle}
            bills={bills}
            customAlert={customAlert}
          />
        </div>
      </main>

      {/* 🐾 Footer credits */}
      <footer className="bg-white border-t-4 border-slate-800 py-5 text-center text-xs text-slate-500 font-bold no-print" id="app-footer-credits">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="font-sans">© 2026 好厉害宠物乐园</p>
          <div className="flex gap-4 uppercase font-black text-[10px] text-slate-700">
            <span>🐾 日托寄养 </span>
            <span>·</span>
            <span> 洗护美容 </span>
            <span>·</span>
            <span> 训练接送</span>
          </div>
        </div>
      </footer>

      {/* 🎨 Cute Custom Alert/Confirm Modal Overlay */}
      {modalConfig?.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" id="custom-modal-overlay">
          <div className="bg-[#FFFEEB] border-4 border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-[6px_6px_0px_0px_#1A202C] relative overflow-hidden">
            {/* Paw print background accent */}
            <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none">
              <PawPrint className="w-24 h-24 text-slate-850" />
            </div>
            
            <h3 className="text-base font-black text-slate-950 font-hand border-b-2 border-slate-200 pb-2 flex items-center gap-2">
              🐾 {modalConfig.title}
            </h3>
            
            <p className="text-xs font-bold text-slate-700 leading-relaxed my-4 whitespace-pre-wrap">
              {modalConfig.message}
            </p>
            
            <div className="flex items-center justify-end gap-3 mt-2">
              {modalConfig.type === 'confirm' && (
                <button
                  type="button"
                  onClick={modalConfig.onCancel}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-slate-800 rounded-xl text-xs font-black text-slate-650 hover:text-slate-950 transition-all duration-150 cursor-pointer"
                >
                  取消
                </button>
              )}
              <button
                type="button"
                onClick={modalConfig.onConfirm}
                className="px-4 py-2 bg-[#B9E3F8] hover:bg-[#a3d5ef] border-2 border-slate-800 rounded-xl text-xs font-black text-slate-950 shadow-[2px_2px_0px_0px_#1A202C] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1A202C] transition-all duration-150 cursor-pointer"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
