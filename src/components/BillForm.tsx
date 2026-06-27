/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ServiceItem, MemberType, Bill, BillItem, MemberAssetAccount, InvoiceStyle } from '../types';
import { PawPrint, Heart, ShoppingBag, Plus, Minus, UserCheck, Calendar, HelpCircle, ArrowRight, Trash2, Receipt as ReceiptIcon, Gift, Info, CheckSquare } from 'lucide-react';
import { PinkHeart, BlueSparkle, YellowSparkle, CuteCloudTag } from './CuteDoodles';
import Receipt from './Receipt';

function getSubCategory(item: ServiceItem): string {
  if (item.subCategory) return item.subCategory;
  if (item.category === '洗护') {
    if (item.name.includes('狗狗') || item.name.includes('狗')) return '狗狗洗浴';
    if (item.name.includes('猫猫') || item.name.includes('猫')) return '猫猫洗浴';
    return '基础洗护';
  }
  if (item.category === '美容') {
    if (item.name.includes('狗狗') || item.name.includes('狗')) return '狗狗美容';
    if (item.name.includes('猫猫') || item.name.includes('猫')) return '猫猫美容';
    if (item.name.includes('专项') || item.name.includes('护理') || item.name.includes('修剪')) return '专项护理';
    return '基础美容';
  }
  if (item.category === '寄养') {
    return '房型寄养';
  }
  if (item.category === '日托') {
    return '常规日托';
  }
  if (item.category === '训练') {
    return '专业训练';
  }
  if (item.category === '接送') {
    return '专车接送';
  }
  return '其他服务';
}

function getWeightGroup(weight: number, type: '狗狗' | '猫猫'): string {
  if (type === '狗狗') {
    if (weight <= 3) return '0-3kg';
    if (weight <= 5) return '3-5kg';
    if (weight <= 10) return '5-10kg';
    if (weight <= 15) return '10-15kg';
    if (weight <= 20) return '15-20kg';
    if (weight <= 25) return '20-25kg';
    if (weight <= 30) return '25-30kg';
    if (weight <= 35) return '30-35kg';
    if (weight <= 40) return '35-40kg';
    return '40kg以上';
  } else {
    if (weight <= 3) return '0-3kg';
    if (weight <= 5) return '3-5kg';
    if (weight <= 8) return '5-8kg';
    return '8kg以上';
  }
}

interface BillFormProps {
  services: ServiceItem[];
  memberships: MemberType[];
  onGenerateBill: (bill: Omit<Bill, 'id' | 'billNumber' | 'createdAt'>) => void;
  selectedBill: Bill | null;
  setSelectedBill: React.Dispatch<React.SetStateAction<Bill | null>>;
  bills: Bill[];
  memberAssets: MemberAssetAccount[];
  setMemberAssets: React.Dispatch<React.SetStateAction<MemberAssetAccount[]>>;
  customAlert?: (message: string, title?: string) => Promise<void>;
  customConfirm?: (message: string, title?: string) => Promise<boolean>;
  invoiceStyle?: InvoiceStyle;
}

export default function BillForm({
  services,
  memberships,
  onGenerateBill,
  selectedBill,
  setSelectedBill,
  bills,
  memberAssets,
  setMemberAssets,
  customAlert,
  customConfirm,
  invoiceStyle,
}: BillFormProps) {
  const triggerAlert = (message: string) => {
    if (customAlert) {
      customAlert(message);
    } else {
      alert(message);
    }
  };
  // 宠物姓名、宠物类型、宠物品种、体重
  const [dogName, setDogName] = useState('');
  const [petType, setPetType] = useState<'狗狗' | '猫猫'>('狗狗');
  const [dogBreed, setDogBreed] = useState('');
  const [petWeight, setPetWeight] = useState('');
  const [memberId, setMemberId] = useState(''); // 会员编号
  const [groomingNotes, setGroomingNotes] = useState(''); // 美护备注
  const [notes, setNotes] = useState(''); // 普通备注

  // 结算日期：入住日期、离园时间
  const [checkInDate, setCheckInDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [checkOutDate, setCheckOutDate] = useState(() => new Date().toISOString().slice(0, 10));

  // 会员类型选择：“非会员” “会员”
  const [isMember, setIsMember] = useState(false);
  const [isHoliday, setIsHoliday] = useState(false); // 是否法定节假日
  const [isMemberDay, setIsMemberDay] = useState(false); // 是否会员日

  // 折扣：100%, 88%, 80%, 自定, 大众点评
  const [discountPreset, setDiscountPreset] = useState<'原价' | '88折' | '8折' | '7折' | '6折' | '100%' | '88%' | '80%' | '自定' | '大众点评'>('100%');
  const [customDiscountValue, setCustomDiscountValue] = useState<string>('');

  // 会员专属年卡权益券
  const [useDaycareCoupon, setUseDaycareCoupon] = useState<number>(0);
  const [useBoardingUpgradeCoupon, setUseBoardingUpgradeCoupon] = useState<number>(0);
  const [useSpecialCareUpgradeCoupon, setUseSpecialCareUpgradeCoupon] = useState<number>(0);
  const [useWashUpgradeCoupon, setUseWashUpgradeCoupon] = useState<number>(0);
  const [useTransferCoupon, setUseTransferCoupon] = useState<number>(0);
  const [useDentalCoupon, setUseDentalCoupon] = useState<number>(0);

  // 已选服务项目数量：serviceId -> quantity
  const [selectedItems, setSelectedItems] = useState<{ [serviceId: string]: number }>({});

  // Resolve matching family member account based on memberId or dogName
  const matchedAccount = React.useMemo(() => {
    if (!isMember) return null;
    const rawInput = memberId.replace(/^MEM-/, '').trim();
    const cleanInputId = /^\d+$/.test(rawInput) ? rawInput.padStart(12, '0') : rawInput;
    if (cleanInputId) {
      const match = memberAssets.find(acc => acc.memberId.toLowerCase() === cleanInputId.toLowerCase());
      if (match) return match;
    }
    if (dogName.trim()) {
      const match = memberAssets.find(acc => acc.pets.some(p => p.name.toLowerCase() === dogName.trim().toLowerCase()));
      if (match) return match;
    }
    return null;
  }, [isMember, memberId, dogName, memberAssets]);

  // Helper function to check if service matches current pet type
  const isPetTypeMatched = (srv: ServiceItem, type: '狗狗' | '猫猫') => {
    const name = srv.name || '';
    const sub = srv.subCategory || getSubCategory(srv) || '';
    const cat = srv.category || '';
    
    const hasCatKeyword = name.includes('猫') || sub.includes('猫') || cat.includes('猫');
    const hasDogKeyword = name.includes('狗') || sub.includes('狗') || cat.includes('狗');
    
    if (type === '狗狗') {
      return !hasCatKeyword;
    } else {
      return !hasDogKeyword;
    }
  };

  // Helper functions to identify special and standard services
  const isSpecialService = (item: ServiceItem) => {
    const sub = item.subCategory || getSubCategory(item);
    return sub.includes('专项护理');
  };

  const isStandardService = (item: ServiceItem) => !isSpecialService(item);

  const getSubCategoryLabel = (item: ServiceItem): string => {
    return item.subCategory || getSubCategory(item);
  };

  // Helper to resolve Dianping price for each service
  const getDianpingPrice = (srv: ServiceItem): number => {
    if (srv.dianpingPrice !== undefined) return srv.dianpingPrice;

    const name = srv.name || '';
    if (srv.category === '日托') {
      if (name.includes('半天日托')) return 149;
      if (name.includes('全天日托')) return 259;
    }
    if (srv.category === '寄养') {
      if (name.includes('温馨舒适') || name.includes('舒适温馨') || (name.includes('舒适') && name.includes('温馨'))) return 309;
      if (name.includes('温馨度假') || (name.includes('乐园度假') && !name.includes('豪华大房型'))) return 488;
      if (name.includes('豪华阳光')) return 389;
      if (name.includes('阳光度假') || name.includes('豪华大房型')) return 548;
      if (name.includes('特殊陪护')) return 549;
    }
    return srv.price;
  };

  // 消费项目大类
  const categoriesOrder = ['日托', '寄养', '洗护', '美容', '训练', '接送'];

  // Cascading dropdown states (Simplified to 2 dropdowns)
  const [selectedCategory, setSelectedCategory] = useState('日托');
  
  const [selectedServiceId, setSelectedServiceId] = useState(() => {
    const catServices = services.filter((s) => s.category === '日托' && isStandardService(s) && isPetTypeMatched(s, '狗狗'));
    return catServices.length > 0 ? catServices[0].id : '';
  });

  // State for the third column: 专项服务 (狗狗/猫猫 专项护理 & 接送)
  const [selectedSpecialServiceId, setSelectedSpecialServiceId] = useState(() => {
    const specServices = services.filter((s) => isSpecialService(s) && isPetTypeMatched(s, '狗狗'));
    return specServices.length > 0 ? specServices[0].id : '';
  });
  
  const getFilteredStandardServices = (cat: string) => {
    const weightNum = parseFloat(petWeight);
    return services.filter((s) => {
      if (s.category !== cat || !isStandardService(s) || !isPetTypeMatched(s, petType)) {
        return false;
      }
      if ((cat === '洗护' || cat === '美容') && !isNaN(weightNum) && weightNum > 0) {
        const group = getWeightGroup(weightNum, petType);
        return s.name.includes(group);
      }
      return true;
    });
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    
    const catServices = getFilteredStandardServices(cat);
    if (catServices.length > 0) {
      setSelectedServiceId(catServices[0].id);
    } else {
      setSelectedServiceId('');
    }
  };

  const handleAddItem = () => {
    if (!selectedServiceId) return;
    setSelectedItems((prev) => ({
      ...prev,
      [selectedServiceId]: (prev[selectedServiceId] || 0) + 1,
    }));
  };

  const handleAddItemSpecial = () => {
    if (!selectedSpecialServiceId) return;
    setSelectedItems((prev) => ({
      ...prev,
      [selectedSpecialServiceId]: (prev[selectedSpecialServiceId] || 0) + 1,
    }));
  };

  // Reset selected service states if services, selected category, petType, or petWeight changes
  React.useEffect(() => {
    const catServices = getFilteredStandardServices(selectedCategory);
    if (catServices.length > 0) {
      const currentIdValid = catServices.some((s) => s.id === selectedServiceId);
      if (!currentIdValid) {
        setSelectedServiceId(catServices[0].id);
      }
    } else {
      setSelectedServiceId('');
    }
  }, [services.length, selectedCategory, petType, petWeight, selectedServiceId]);

  // Reset selected special service state if services, petType, or selected items change
  React.useEffect(() => {
    const hasWashOrGroom = Object.keys(selectedItems).some((id) => {
      const srv = services.find((s) => s.id === id);
      return srv && (srv.category === '洗护' || srv.category === '美容');
    });

    if (!hasWashOrGroom) {
      setSelectedSpecialServiceId('');
      return;
    }

    const specServices = services.filter((s) => isSpecialService(s) && isPetTypeMatched(s, petType));
    if (specServices.length > 0) {
      const currentIdValid = specServices.some((s) => s.id === selectedSpecialServiceId);
      if (!currentIdValid) {
        setSelectedSpecialServiceId(specServices[0].id);
      }
    } else {
      setSelectedSpecialServiceId('');
    }
  }, [services.length, petType, selectedItems, selectedSpecialServiceId]);

  // Synchronize discountPreset with membership changes
  React.useEffect(() => {
    if (!isMember) {
      if (discountPreset !== '100%' && discountPreset !== '大众点评') {
        setDiscountPreset('100%');
      }
    } else {
      if (discountPreset === '100%') {
        setDiscountPreset('88%');
      }
    }
  }, [isMember, discountPreset]);

  // Synchronize holiday and coupons/member day
  React.useEffect(() => {
    if (isHoliday) {
      setIsMemberDay(false);
      setUseDaycareCoupon(0);
      setUseBoardingUpgradeCoupon(0);
      setUseSpecialCareUpgradeCoupon(0);
      setUseWashUpgradeCoupon(0);
      setUseTransferCoupon(0);
      setUseDentalCoupon(0);
    }
  }, [isHoliday]);

  // Auto-apply coupons when member ID / matched account or selected services change
  const lastMatchedAccountIdRef = React.useRef<string | null>(null);
  const lastSelectedItemsHashRef = React.useRef<string>('');

  React.useEffect(() => {
    if (!isMember || isHoliday) return;

    const matchedId = matchedAccount ? matchedAccount.memberId : null;
    const itemsHash = Object.entries(selectedItems)
      .map(([id, qty]) => `${id}:${qty}`)
      .join(',');

    // Only run auto-apply if the member account changed, or if selected services/quantities changed
    if (lastMatchedAccountIdRef.current !== matchedId || lastSelectedItemsHashRef.current !== itemsHash) {
      lastMatchedAccountIdRef.current = matchedId;
      lastSelectedItemsHashRef.current = itemsHash;

      if (matchedAccount) {
        // 1. Daycare
        let daycareQty = 0;
        Object.entries(selectedItems).forEach(([id, qty]) => {
          const srv = services.find(s => s.id === id);
          if (srv && srv.name.includes('全天') && srv.unit === '天') {
            daycareQty += qty as number;
          }
        });
        setUseDaycareCoupon(Math.min(daycareQty, matchedAccount.daycareCoupons.unused));

        // 2. Boarding Upgrade
        let boardingQty = 0;
        Object.entries(selectedItems).forEach(([id, qty]) => {
          const srv = services.find(s => s.id === id);
          if (srv && (srv.name.includes('度假房') || srv.name.includes('阳光度假房'))) {
            boardingQty += qty as number;
          }
        });
        setUseBoardingUpgradeCoupon(Math.min(boardingQty, matchedAccount.holidayCoupons.unused));

        // 3. Special Care
        let specialQty = 0;
        Object.entries(selectedItems).forEach(([id, qty]) => {
          const srv = services.find(s => s.id === id);
          if (srv && srv.name.includes('特殊陪护房')) {
            specialQty += qty as number;
          }
        });
        const specialLimit = matchedAccount.specialCareCoupons ? matchedAccount.specialCareCoupons.unused : 0;
        setUseSpecialCareUpgradeCoupon(Math.min(specialQty, specialLimit));

        // 4. Wash Upgrade
        let washQty = 0;
        Object.entries(selectedItems).forEach(([id, qty]) => {
          const srv = services.find(s => s.id === id);
          if (srv && (srv.name.includes('药浴') || srv.name.toUpperCase().includes('SPA') || srv.name.includes('SPA'))) {
            washQty += qty as number;
          }
        });
        setUseWashUpgradeCoupon(Math.min(washQty, matchedAccount.washCoupons.unused));

        // 5. Transfer
        let transferQty = 0;
        Object.entries(selectedItems).forEach(([id, qty]) => {
          const srv = services.find(s => s.id === id);
          if (srv && (srv.name.includes('接送') || srv.name.includes('专车')) && 
              (srv.name.includes('5km') || srv.name.includes('10km') || srv.name.includes('5-10km'))) {
            transferQty += qty as number;
          }
        });
        const transferLimit = matchedAccount.transferCoupons ? matchedAccount.transferCoupons.unused : 0;
        setUseTransferCoupon(Math.min(transferQty, transferLimit));

        // 6. Dental
        let dentalQty = 0;
        Object.entries(selectedItems).forEach(([id, qty]) => {
          const srv = services.find(s => s.id === id);
          if (srv && srv.name.includes('牙结石')) {
            dentalQty += qty as number;
          }
        });
        setUseDentalCoupon(dentalQty);
      }
    }
  }, [isMember, isHoliday, matchedAccount, selectedItems, services]);

  // Toggle item selection
  const handleToggleItem = (srv: ServiceItem) => {
    setSelectedItems((prev) => {
      const existing = prev[srv.id];
      if (existing) {
        const { [srv.id]: _, ...rest } = prev;
        return rest;
      } else {
        return { ...prev, [srv.id]: 1 };
      }
    });
  };

  // Adjust quantity
  const handleAdjustQuantity = (id: string, amount: number) => {
    setSelectedItems((prev) => {
      const current = prev[id] || 0;
      const next = current + amount;
      if (next <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  // 计算折扣倍率
  let discountRate = 1.0;
  if (isHoliday) {
    discountRate = 1.0; // 法定节假日不能使用会员折扣
  } else {
    if (discountPreset === '原价' || discountPreset === '100%') {
      discountRate = 1.0;
    } else if (discountPreset === '88折' || discountPreset === '88%') {
      discountRate = 0.88;
    } else if (discountPreset === '8折' || discountPreset === '80%') {
      discountRate = 0.8;
    } else if (discountPreset === '7折') {
      discountRate = 0.7;
    } else if (discountPreset === '6折') {
      discountRate = 0.6;
    } else if (discountPreset === '自定') {
      const cleanVal = customDiscountValue.trim().replace('%', '');
      const val = parseFloat(cleanVal);
      if (!isNaN(val) && val > 0) {
        if (val <= 10) {
          discountRate = val / 10; // 比如输入 8.5 表示 8.5折 = 0.85
        } else if (val <= 100) {
          discountRate = val / 100; // 比如输入 85 表示 85% = 0.85
        } else {
          discountRate = 1.0;
        }
      }
    } else if (discountPreset === '大众点评') {
      discountRate = 1.0; // 大众点评对应的价格已直接反映在具体项目的单价里
    }
  }

  // 构建结算的项目列表，并在单项层级处理升级券与抵扣券 (法定节假日禁用年卡兑换券)
  const canUseCoupons = isMember && !isHoliday;
  let remainingBoardingUpgradeCoupons = canUseCoupons ? (typeof useBoardingUpgradeCoupon === 'number' ? useBoardingUpgradeCoupon : (useBoardingUpgradeCoupon ? 9999 : 0)) : 0;
  let remainingSpecialCareUpgradeCoupons = canUseCoupons ? (typeof useSpecialCareUpgradeCoupon === 'number' ? useSpecialCareUpgradeCoupon : (useSpecialCareUpgradeCoupon ? 9999 : 0)) : 0;
  let remainingWashUpgradeCoupons = canUseCoupons ? (typeof useWashUpgradeCoupon === 'number' ? useWashUpgradeCoupon : (useWashUpgradeCoupon ? 9999 : 0)) : 0;
  let remainingDaycareCoupons = canUseCoupons ? (typeof useDaycareCoupon === 'number' ? useDaycareCoupon : (useDaycareCoupon ? 9999 : 0)) : 0;
  let remainingTransferCoupons = canUseCoupons ? (typeof useTransferCoupon === 'number' ? useTransferCoupon : (useTransferCoupon ? 9999 : 0)) : 0;
  let remainingDentalCoupons = canUseCoupons ? (typeof useDentalCoupon === 'number' ? useDentalCoupon : (useDentalCoupon ? 9999 : 0)) : 0;

  // 为了公平抵扣，先将选中的项目按原价从高到低排序，然后再在单项中逐个扣减
  const sortedSelectedEntries = Object.entries(selectedItems).sort(([idA], [idB]) => {
    const srvA = services.find((s) => s.id === idA);
    const srvB = services.find((s) => s.id === idB);
    const priceA = srvA ? (discountPreset === '大众点评' ? getDianpingPrice(srvA) : srvA.price) : 0;
    const priceB = srvB ? (discountPreset === '大众点评' ? getDianpingPrice(srvB) : srvB.price) : 0;
    return priceB - priceA;
  });

  const billItemsUnsorted: BillItem[] = sortedSelectedEntries.map(([id, rawQty]) => {
    const qty = rawQty as number;
    const srv = services.find((s) => s.id === id)!;
    
    // 如果选择大众点评，则使用大众点评折后价格，否则使用原价
    let itemPrice = discountPreset === '大众点评' ? getDianpingPrice(srv) : srv.price;
    let totalPrice = itemPrice * qty;

    // 1. 度假房升级房券
    if (remainingBoardingUpgradeCoupons > 0) {
      // 温馨度假房变成舒适温馨房的价格
      if (srv.name.includes('度假房')) {
        const targetRoom = services.find(s => s.name.includes('温馨舒适') || s.name.includes('舒适温馨'));
        const targetPrice = targetRoom ? (discountPreset === '大众点评' ? getDianpingPrice(targetRoom) : targetRoom.price) : 359;
        if (itemPrice > targetPrice) {
          const appliedCount = Math.min(qty, remainingBoardingUpgradeCoupons);
          remainingBoardingUpgradeCoupons -= appliedCount;
          totalPrice = (targetPrice * appliedCount) + (itemPrice * (qty - appliedCount));
        }
      }
      // 阳光度假房变成豪华阳光房的价格 (虽然我们默认有豪华阳光房，若用户添加了更贵的“阳光度假房”，此券起效)
      else if (srv.name.includes('阳光度假房')) {
        const targetRoom = services.find(s => s.name.includes('豪华阳光'));
        const targetPrice = targetRoom ? (discountPreset === '大众点评' ? getDianpingPrice(targetRoom) : targetRoom.price) : 429;
        if (itemPrice > targetPrice) {
          const appliedCount = Math.min(qty, remainingBoardingUpgradeCoupons);
          remainingBoardingUpgradeCoupons -= appliedCount;
          totalPrice = (targetPrice * appliedCount) + (itemPrice * (qty - appliedCount));
        }
      }
    }

    // 2. 特殊陪护房升级券
    if (remainingSpecialCareUpgradeCoupons > 0 && srv.name.includes('特殊陪护房')) {
      // 特殊陪护房变成温馨度假房的价格 (温馨度假房即“乐园度假房” 538)
      const targetRoom = services.find(s => s.name.includes('乐园度假房') || s.name.includes('温馨度假房'));
      const targetPrice = targetRoom ? (discountPreset === '大众点评' ? getDianpingPrice(targetRoom) : targetRoom.price) : 538;
      if (itemPrice > targetPrice) {
        const appliedCount = Math.min(qty, remainingSpecialCareUpgradeCoupons);
        remainingSpecialCareUpgradeCoupons -= appliedCount;
        totalPrice = (targetPrice * appliedCount) + (itemPrice * (qty - appliedCount));
      }
    }

    // 3. 高端洗护升级券
    if (remainingWashUpgradeCoupons > 0 && (srv.name.includes('药浴') || srv.name.toUpperCase().includes('SPA') || srv.name.includes('SPA'))) {
      // 狗狗/猫猫的药浴、SPA全部不计入计算金额（价格降为0）
      const appliedCount = Math.min(qty, remainingWashUpgradeCoupons);
      remainingWashUpgradeCoupons -= appliedCount;
      totalPrice = (0 * appliedCount) + (itemPrice * (qty - appliedCount));
    }

    // 4. 全天日托兑换券抵扣
    if (remainingDaycareCoupons > 0 && srv.name.includes('全天') && srv.unit === '天') {
      const appliedCount = Math.min(qty, remainingDaycareCoupons);
      remainingDaycareCoupons -= appliedCount;
      totalPrice = (0 * appliedCount) + (itemPrice * (qty - appliedCount));
    }

    // 5. 10km同城接送券抵扣
    if (remainingTransferCoupons > 0 && 
        (srv.name.includes('接送') || srv.name.includes('专车')) && 
        (srv.name.includes('5km') || srv.name.includes('10km') || srv.name.includes('5-10km'))) {
      const appliedCount = Math.min(qty, remainingTransferCoupons);
      remainingTransferCoupons -= appliedCount;
      totalPrice = (0 * appliedCount) + (itemPrice * (qty - appliedCount));
    }

    // 6. 高端洁牙抵扣券抵扣
    if (remainingDentalCoupons > 0 && srv.name.includes('牙结石')) {
      const appliedCount = Math.min(qty, remainingDentalCoupons);
      remainingDentalCoupons -= appliedCount;
      totalPrice = (0 * appliedCount) + (itemPrice * (qty - appliedCount));
    }

    return {
      serviceId: id,
      name: srv.name,
      price: qty > 0 ? totalPrice / qty : itemPrice,
      quantity: qty as number,
      unit: srv.unit,
      originalPrice: itemPrice,
    };
  });

  // 渲染显示时恢复成大类的默认逻辑排序，使用户界面更整洁
  const billItems = [...billItemsUnsorted].sort((a, b) => {
    const srvA = services.find((s) => s.id === a.serviceId);
    const srvB = services.find((s) => s.id === b.serviceId);
    if (!srvA || !srvB) return 0;
    const catIdxA = categoriesOrder.indexOf(srvA.category);
    const catIdxB = categoriesOrder.indexOf(srvB.category);
    if (catIdxA !== catIdxB) return catIdxA - catIdxB;
    return srvA.name.localeCompare(srvB.name);
  });

  // check if any of standard added items has category '洗护' or '美容'
  const hasWashOrGroomItem = billItems.some((item) => {
    const srv = services.find((s) => s.id === item.serviceId);
    return srv && (srv.category === '洗护' || srv.category === '美容');
  });

  // 原价合计（不包含任何券抵扣与折扣）
  const originalSubtotal = Object.entries(selectedItems).reduce((acc, [id, qty]) => {
    const srv = services.find((s) => s.id === id);
    if (!srv) return acc;
    const originalPrice = discountPreset === '大众点评' ? getDianpingPrice(srv) : srv.price;
    return acc + originalPrice * (qty as number);
  }, 0);

  // 权益抵扣完后的项目小计
  const subtotal = billItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // 抵扣的总金额
  const totalDeduction = originalSubtotal - subtotal;

  // 计算最终付款金额（对抵扣后的价格打上折扣）
  let total = subtotal * discountRate;
  let memberDayDiscountAmount = 0;
  if (isMember && !isHoliday && isMemberDay) {
    memberDayDiscountAmount = total * 0.12; // 额外 88 折表示再扣减 12%
    total = total * 0.88;
  }

  // Real-time preview draft bill
  const draftBill: Bill = {
    id: 'draft',
    billNumber: 'PREVIEW-DRAFT',
    dogName: dogName.trim() || '宠物名',
    dogBreed: dogBreed.trim() || '未录入品种',
    petType,
    petWeight: petWeight.trim() ? parseFloat(petWeight) || undefined : undefined,
    checkInDate,
    checkOutDate,
    isMember,
    discountPreset,
    customDiscountValue: discountPreset === '自定' ? parseFloat(customDiscountValue) || undefined : undefined,
    memberTypeId: isMember ? 'mem_2' : 'mem_1',
    memberTypeName: isMember ? '会员' : '非会员',
    memberId: isMember && memberId.trim() ? memberId.trim() : undefined,
    discount: discountRate,
    items: billItems,
    subtotal: originalSubtotal,
    total,
    notes: notes.trim() || undefined,
    groomingNotes: groomingNotes.trim() || undefined,
    useDaycareCoupon,
    useBoardingUpgradeCoupon,
    useSpecialCareUpgradeCoupon,
    useWashUpgradeCoupon,
    useTransferCoupon,
    useDentalCoupon,
    isHoliday,
    isMemberDay,
    memberDayDiscountAmount,
    createdAt: new Date().toISOString(),
  };

  // Automatically clear selected saved bill if any form draft state is edited,
  // so the live preview of the current draft bill is shown instead.
  React.useEffect(() => {
    if (selectedBill) {
      setSelectedBill(null);
    }
  }, [
    dogName,
    petType,
    dogBreed,
    petWeight,
    checkInDate,
    checkOutDate,
    isMember,
    memberId,
    discountPreset,
    customDiscountValue,
    isHoliday,
    isMemberDay,
    useDaycareCoupon,
    useBoardingUpgradeCoupon,
    useSpecialCareUpgradeCoupon,
    useWashUpgradeCoupon,
    useTransferCoupon,
    useDentalCoupon,
    selectedItems,
    groomingNotes,
    notes
  ]);

  const handleSubmit = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!dogName.trim()) return;
    if (billItems.length === 0) {
      triggerAlert('请至少选择一个收费项目！');
      return;
    }

    // Deduct used coupons from the family account in memberAssets state
    if (isMember && matchedAccount) {
      setMemberAssets(prevAssets => prevAssets.map(acc => {
        if (acc.memberId === matchedAccount.memberId) {
          const updated = { ...acc };
          
          if (useDaycareCoupon > 0) {
            updated.daycareCoupons = {
              ...updated.daycareCoupons,
              unused: Math.max(0, updated.daycareCoupons.unused - useDaycareCoupon),
              used: updated.daycareCoupons.used + useDaycareCoupon
            };
          }
          if (useBoardingUpgradeCoupon > 0) {
            updated.holidayCoupons = {
              ...updated.holidayCoupons,
              unused: Math.max(0, updated.holidayCoupons.unused - useBoardingUpgradeCoupon),
              used: updated.holidayCoupons.used + useBoardingUpgradeCoupon
            };
          }
          if (useSpecialCareUpgradeCoupon > 0 && updated.specialCareCoupons) {
            updated.specialCareCoupons = {
              ...updated.specialCareCoupons,
              unused: Math.max(0, updated.specialCareCoupons.unused - useSpecialCareUpgradeCoupon),
              used: updated.specialCareCoupons.used + useSpecialCareUpgradeCoupon
            };
          }
          if (useWashUpgradeCoupon > 0) {
            updated.washCoupons = {
              ...updated.washCoupons,
              unused: Math.max(0, updated.washCoupons.unused - useWashUpgradeCoupon),
              used: updated.washCoupons.used + useWashUpgradeCoupon
            };
          }
          if (useTransferCoupon > 0 && updated.transferCoupons) {
            updated.transferCoupons = {
              ...updated.transferCoupons,
              unused: Math.max(0, updated.transferCoupons.unused - useTransferCoupon),
              used: updated.transferCoupons.used + useTransferCoupon
            };
          }
          return updated;
        }
        return acc;
      }));
    }

    onGenerateBill({
      dogName: dogName.trim(),
      dogBreed: dogBreed.trim() || '通用犬种',
      petType,
      petWeight: petWeight.trim() ? parseFloat(petWeight) || undefined : undefined,
      checkInDate,
      checkOutDate,
      isMember,
      discountPreset,
      customDiscountValue: discountPreset === '自定' ? parseFloat(customDiscountValue) || undefined : undefined,
      memberTypeId: isMember ? 'mem_2' : 'mem_1',
      memberTypeName: isMember ? '会员' : '非会员',
      memberId: isMember && memberId.trim() ? memberId.trim() : undefined,
      discount: discountRate,
      items: billItems,
      subtotal: originalSubtotal,
      total,
      paymentMethod: undefined,
      notes: notes.trim() || undefined,
      groomingNotes: groomingNotes.trim() || undefined,
      useDaycareCoupon,
      useBoardingUpgradeCoupon,
      useSpecialCareUpgradeCoupon,
      useWashUpgradeCoupon,
      useTransferCoupon,
      useDentalCoupon,
      isHoliday,
      isMemberDay,
      memberDayDiscountAmount,
    });

    // Selective reset
    setDogName('');
    setDogBreed('');
    setPetWeight('');
    setMemberId('');
    setGroomingNotes('');
    setNotes('');
    setSelectedItems({});
    setUseDaycareCoupon(0);
    setUseBoardingUpgradeCoupon(0);
    setUseSpecialCareUpgradeCoupon(0);
    setUseWashUpgradeCoupon(0);
    setUseTransferCoupon(0);
    setUseDentalCoupon(0);
  };

  const isHolidaySupported = !matchedAccount || matchedAccount.holidayCoupons.total > 0;
  const isSpecialCareSupported = !matchedAccount || (matchedAccount.specialCareCoupons !== undefined && matchedAccount.specialCareCoupons !== null);
  const isTransferSupported = !matchedAccount || (matchedAccount.transferCoupons !== undefined && matchedAccount.transferCoupons !== null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start animate-fade-in" id="bill-form-workspace">
      {/* Left side: Bill form inputs */}
      <form onSubmit={handleSubmit} className="md:col-span-7 bg-[#FFFEEB] cute-card-border p-5 sm:p-6 space-y-6 relative overflow-hidden" id="bill-form-container">
      {/* Decorative stars / hearts peeking from margins */}
      <PinkHeart className="absolute top-4 right-4 opacity-15 rotate-12 w-8 h-8 pointer-events-none" />
      <BlueSparkle className="absolute bottom-24 left-3 opacity-15 rotate-[-15deg] w-6 h-6 pointer-events-none" />
      
      {/* 🧾 Heading */}
      <div className="border-b-2 border-slate-200 pb-4 flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-base sm:text-lg font-hand font-black text-slate-800 flex items-center gap-1.5">
          🐾 宠物离园/入住结算表 <PinkHeart className="w-5 h-5 -mt-1" />
        </h2>
        <span className="text-[10px] bg-[#B9E3F8] text-slate-800 border-2 border-slate-800 px-2 py-0.5 rounded-lg font-black shadow-[1.5px_1.5px_0px_0px_#1A202C]">
          前台收银系统
        </span>
      </div>

      {/* 🐶 Row 1: 宠物基本信息 / Pet Info */}
      <div className="space-y-4">
        <div className="text-xs font-black text-slate-800 flex items-center gap-1.5 font-hand bg-[#B9E3F8]/40 border-2 border-slate-800 py-1 px-3 rounded-xl shadow-[1.5px_1.5px_0px_0px_#1A202C] w-fit">
          1. 宠物基本信息 / Pet Info
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* 宠物姓名 */}
          <div className="space-y-1.5 md:col-span-3">
            <label className="text-slate-500 text-[11px] font-black uppercase block flex items-center gap-1">
              宠物姓名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="如: 旺财"
              value={dogName}
              onChange={(e) => setDogName(e.target.value)}
              className="w-full bg-white border-2 border-slate-800 focus:ring-4 focus:ring-[#B9E3F8]/50 focus:border-slate-800 rounded-xl px-4 py-2 text-xs outline-none transition-all duration-150 font-bold shadow-[2px_2px_0px_0px_#1A202C]"
              required
            />
          </div>

          {/* 宠物类型 */}
          <div className="space-y-1.5 md:col-span-3">
            <label className="text-slate-500 text-[11px] font-black uppercase block">
              宠物类型 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPetType('狗狗')}
                className={`py-2 px-3 rounded-xl border-2 text-xs font-black transition-all duration-150 cursor-pointer ${
                  petType === '狗狗'
                    ? 'bg-[#B9E3F8] text-slate-950 border-slate-800 shadow-[2px_2px_0px_0px_#1A202C]'
                    : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-300 hover:border-slate-800'
                }`}
              >
                🐶 狗狗
              </button>
              <button
                type="button"
                onClick={() => setPetType('猫猫')}
                className={`py-2 px-3 rounded-xl border-2 text-xs font-black transition-all duration-150 cursor-pointer ${
                  petType === '猫猫'
                    ? 'bg-[#B9E3F8] text-slate-950 border-slate-800 shadow-[2px_2px_0px_0px_#1A202C]'
                    : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-300 hover:border-slate-800'
                }`}
              >
                🐱 猫猫
              </button>
            </div>
          </div>

          {/* 宠物品种 */}
          <div className="space-y-1.5 md:col-span-3">
            <label className="text-slate-500 text-[11px] font-black uppercase block">
              宠物品种
            </label>
            <input
              type="text"
              placeholder="如: 柴犬/布偶"
              value={dogBreed}
              onChange={(e) => setDogBreed(e.target.value)}
              className="w-full bg-white border-2 border-slate-800 focus:ring-4 focus:ring-[#B9E3F8]/50 focus:border-slate-800 rounded-xl px-4 py-2 text-xs outline-none transition-all duration-150 font-bold shadow-[2px_2px_0px_0px_#1A202C]"
            />
          </div>

          {/* 宠物体重 */}
          <div className="space-y-1.5 md:col-span-3">
            <label className="text-slate-500 text-[11px] font-black uppercase block">
              体重 (kg)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0.1"
                placeholder="如: 7.5"
                value={petWeight}
                onChange={(e) => setPetWeight(e.target.value)}
                className="w-full bg-white border-2 border-slate-800 focus:ring-4 focus:ring-[#B9E3F8]/50 focus:border-slate-800 rounded-xl pl-3 pr-8 py-2 text-xs outline-none transition-all duration-150 font-bold font-mono text-slate-800 shadow-[2px_2px_0px_0px_#1A202C]"
              />
              <span className="absolute right-3 top-2 text-[10px] text-slate-400 font-bold uppercase font-mono">kg</span>
            </div>
          </div>
        </div>

        {/* 离园入住日期 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1.5">
            <label className="text-slate-500 text-[11px] font-black uppercase block flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              入住日期
            </label>
            <input
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="w-full bg-white border-2 border-slate-800 focus:ring-4 focus:ring-[#B9E3F8]/50 focus:border-slate-800 rounded-xl px-4 py-2 text-xs outline-none transition-all duration-150 font-bold font-mono shadow-[2px_2px_0px_0px_#1A202C]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-500 text-[11px] font-black uppercase block flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              离园时间
            </label>
            <input
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              className="w-full bg-white border-2 border-slate-800 focus:ring-4 focus:ring-[#B9E3F8]/50 focus:border-slate-800 rounded-xl px-4 py-2 text-xs outline-none transition-all duration-150 font-bold font-mono shadow-[2px_2px_0px_0px_#1A202C]"
            />
          </div>
        </div>

        {/* 备注与美护备注 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1.5">
            <label className="text-slate-500 text-[11px] font-black uppercase block">
              美护备注
            </label>
            <input
              type="text"
              placeholder="例如: 修屁股毛/不剃肚子/自带沐浴露"
              value={groomingNotes}
              onChange={(e) => setGroomingNotes(e.target.value)}
              className="w-full bg-white border-2 border-slate-800 focus:ring-4 focus:ring-[#B9E3F8]/50 focus:border-slate-800 rounded-xl px-4 py-2 text-xs outline-none transition-all duration-150 font-bold shadow-[2px_2px_0px_0px_#1A202C]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-500 text-[11px] font-black uppercase block">
              账单备注
            </label>
            <input
              type="text"
              placeholder="例如: 离园前喂狗粮/带走牵引绳"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border-2 border-slate-800 focus:ring-4 focus:ring-[#B9E3F8]/50 focus:border-slate-800 rounded-xl px-4 py-2 text-xs outline-none transition-all duration-150 font-bold shadow-[2px_2px_0px_0px_#1A202C]"
            />
          </div>
        </div>
      </div>

      {/* 🏷️ Row 2: 会员级别 & 专属折扣 */}
      <div className="pt-4 border-t-2 border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="text-xs font-black text-slate-800 flex items-center gap-1.5 font-hand bg-[#B9E3F8]/40 border-2 border-slate-800 py-1 px-3 rounded-xl shadow-[1.5px_1.5px_0px_0px_#1A202C] w-fit">
            2. 会员级别选择 / Member Tier
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setIsMember(false);
              }}
              className={`py-3 px-4 rounded-2xl border-2 text-xs font-black transition-all duration-150 cursor-pointer flex flex-col items-center justify-center gap-1 ${
                !isMember
                  ? 'bg-[#B9E3F8] text-slate-900 border-slate-800 shadow-[3px_3px_0px_0px_#1A202C]'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-300 hover:border-slate-800'
              }`}
            >
              <span className="text-sm font-black">🐾 非会员</span>
              <span className="text-[9px] font-bold opacity-80">常规结算费率</span>
            </button>
            <button
              type="button"
              onClick={() => setIsMember(true)}
              className={`py-3 px-4 rounded-2xl border-2 text-xs font-black transition-all duration-150 cursor-pointer flex flex-col items-center justify-center gap-1 ${
                isMember
                  ? 'bg-[#B9E3F8] text-slate-900 border-slate-800 shadow-[3px_3px_0px_0px_#1A202C]'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-300 hover:border-slate-800'
              }`}
            >
              <span className="text-sm font-black">💎 会员</span>
              <span className="text-[9px] font-bold opacity-80">可享年卡权益券</span>
            </button>
          </div>
          {isMember && (
            <div className="space-y-1.5 pt-1.5 animate-fade-in">
              <label className="text-slate-500 text-[10px] font-black uppercase block">会员卡号 / 会员编号</label>
              <input
                type="text"
                placeholder="请输入会员卡号 (如: 000000000034)"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full bg-white border-2 border-slate-800 focus:ring-4 focus:ring-[#B9E3F8]/50 focus:border-slate-800 rounded-xl px-3 py-1.5 text-xs outline-none transition-all duration-150 font-bold shadow-[1.5px_1.5px_0px_0px_#1A202C]"
              />

              {/* Dynamic Family Assets Card below member ID input */}
              {matchedAccount ? (
                <div className="bg-white border-2 border-slate-800 rounded-xl p-3 shadow-[2px_2px_0px_0px_#1A202C] space-y-2 animate-scale-up text-left">
                  <div className="flex justify-between items-center border-b-2 border-dashed border-slate-200 pb-1.5">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                      <Gift className="w-3.5 h-3.5 text-rose-500" />
                      {matchedAccount.memberId} ({matchedAccount.tier})
                    </span>
                    <span className="text-[8px] font-black text-emerald-800 bg-emerald-50 border border-emerald-300 px-1 py-0.2 rounded">
                      家庭年卡绑定成功
                    </span>
                  </div>
                  <div className="text-[10px] space-y-1.5 text-slate-700">
                    <p className="font-bold text-slate-800">
                      该会员账号共计剩余可用券：
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 text-[9px] font-black">
                      <div className={`border px-2 py-0.5 rounded flex justify-between ${matchedAccount.daycareCoupons.unused > 0 ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-slate-50 border-slate-200 text-slate-400 line-through'}`}>
                        <span>日托券:</span>
                        <span>{matchedAccount.daycareCoupons.unused}张</span>
                      </div>
                      <div className={`border px-2 py-0.5 rounded flex justify-between ${matchedAccount.holidayCoupons.unused > 0 ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-slate-50 border-slate-200 text-slate-400 line-through'}`}>
                        <span>度假升级:</span>
                        <span>{matchedAccount.holidayCoupons.unused}张</span>
                      </div>
                      {matchedAccount.specialCareCoupons && (
                        <div className={`border px-2 py-0.5 rounded flex justify-between ${matchedAccount.specialCareCoupons.unused > 0 ? 'bg-purple-50 border-purple-200 text-purple-800' : 'bg-slate-50 border-slate-200 text-slate-400 line-through'}`}>
                          <span>陪护升级:</span>
                          <span>{matchedAccount.specialCareCoupons.unused}张</span>
                        </div>
                      )}
                      <div className={`border px-2 py-0.5 rounded flex justify-between ${matchedAccount.washCoupons.unused > 0 ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-slate-50 border-slate-200 text-slate-400 line-through'}`}>
                        <span>高端洗护:</span>
                        <span>{matchedAccount.washCoupons.unused}张</span>
                      </div>
                      {matchedAccount.transferCoupons && (
                        <div className={`border px-2 py-0.5 rounded flex justify-between ${matchedAccount.transferCoupons.unused > 0 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-400 line-through'}`}>
                          <span>同城接送:</span>
                          <span>{matchedAccount.transferCoupons.unused}张</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[9px] text-slate-500 font-bold leading-tight mt-1">
                      * 权益可供旗下宠物 {matchedAccount.pets.map(p => p.name).join('、')} 共同使用，一狗核销全家扣减。
                    </p>
                  </div>
                </div>
              ) : memberId.trim() ? (
                <div className="text-[9px] text-amber-700 bg-amber-50 border-2 border-dashed border-amber-300 rounded-xl p-2.5 font-bold leading-relaxed flex items-start gap-1">
                  <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    未检索到该卡号的年卡记录，权益功能将作为普通自由套用模式，结算将不会自动扣减系统卡包。
                  </span>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="text-xs font-black text-slate-800 flex items-center gap-1.5 font-hand bg-[#B9E3F8]/40 border-2 border-slate-800 py-1 px-3 rounded-xl shadow-[1.5px_1.5px_0px_0px_#1A202C] w-fit">
              3. 折扣类型 / Discounts
            </div>
            {discountPreset === '大众点评' && (
              <span className="text-[9px] bg-orange-100 text-orange-800 border-2 border-slate-800 px-1.5 py-0.5 rounded-lg font-black font-mono shadow-[1px_1px_0px_0px_#1A202C]">
                自动对应大众点评特惠价
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-5 gap-1.5">
            {([
              { label: '100%', val: '100%' as const },
              { label: '88%', val: '88%' as const },
              { label: '80%', val: '80%' as const },
              { label: '大众点评', val: '大众点评' as const },
              { label: '自定', val: '自定' as const }
            ]).map((item) => {
              const isDisabled = !isMember
                ? (item.val !== '100%' && item.val !== '大众点评')
                : (item.val === '100%');
              return (
                <button
                  key={item.val}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => setDiscountPreset(item.val)}
                  className={`py-2 text-[11px] font-black rounded-xl border-2 text-center transition-all duration-150 ${
                    isDisabled
                      ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed opacity-40'
                      : discountPreset === item.val
                        ? 'bg-[#B9E3F8] text-slate-900 border-slate-800 shadow-[2px_2px_0px_0px_#1A202C] cursor-pointer'
                        : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-300 hover:border-slate-800 cursor-pointer'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {discountPreset === '自定' && (
            <div className="pt-1.5 animate-fade-in flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-black shrink-0">手动折数:</span>
              <div className="relative max-w-[150px]">
                <input
                  type="text"
                  placeholder="如: 8.8"
                  value={customDiscountValue}
                  onChange={(e) => setCustomDiscountValue(e.target.value)}
                  className="w-full bg-white border-2 border-slate-800 focus:ring-4 focus:ring-[#B9E3F8]/50 focus:border-slate-800 rounded-xl px-3 py-1 text-xs outline-none transition-all duration-150 font-black font-mono text-slate-800 shadow-[1.5px_1.5px_0px_0px_#1A202C]"
                />
                <span className="absolute right-3 top-1.5 text-[10px] text-slate-400 font-black">%</span>
              </div>
              <p className="text-[10px] text-slate-400">（如 88% 或 8.5）</p>
            </div>
          )}

          {/* 法定节假日与会员日选项 / Holiday & Member's Day Options */}
          <div className="pt-3 flex flex-col sm:flex-row gap-3 border-t-2 border-dashed border-slate-200 mt-2">
            <label className={`flex items-center gap-2.5 cursor-pointer select-none bg-rose-50 hover:bg-rose-100/80 border-2 p-2.5 rounded-xl transition-all sm:w-1/2 shadow-[1.5px_1.5px_0px_0px_#E11D48] ${
              isHoliday ? 'border-rose-600' : 'border-rose-200'
            }`}>
              <input
                type="checkbox"
                checked={isHoliday}
                onChange={(e) => setIsHoliday(e.target.checked)}
                className="w-4.5 h-4.5 rounded border-slate-400 text-rose-600 focus:ring-rose-500 accent-rose-600 cursor-pointer"
              />
              <div className="flex flex-col text-left">
                <span className="text-xs font-black text-rose-850 flex items-center gap-1">
                  🏮 法定节假日
                </span>
                <span className="text-[9px] text-rose-500 font-bold leading-tight">
                  期间暂停使用会员折扣与兑换券
                </span>
              </div>
            </label>

            <label className={`flex items-center gap-2.5 select-none border-2 p-2.5 rounded-xl transition-all sm:w-1/2 shadow-[1.5px_1.5px_0px_0px_#0284C7] ${
              !isMember || isHoliday
                ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200'
                : isMemberDay
                  ? 'bg-sky-50 border-sky-600 cursor-pointer'
                  : 'bg-white hover:bg-sky-50/50 border-slate-300 cursor-pointer'
            }`}>
              <input
                type="checkbox"
                disabled={!isMember || isHoliday}
                checked={isMemberDay}
                onChange={(e) => setIsMemberDay(e.target.checked)}
                className="w-4.5 h-4.5 rounded border-slate-400 text-sky-600 focus:ring-sky-500 accent-sky-600 cursor-pointer"
              />
              <div className="flex flex-col text-left">
                <span className="text-xs font-black text-sky-850 flex items-center gap-1">
                  🎉 今天是会员日
                </span>
                <span className="text-[9px] text-sky-500 font-bold leading-tight">
                  {matchedAccount ? (
                    `✨ 专属会员日: ${matchedAccount.memberDay || (matchedAccount.tier === '铂金年卡👑' ? '每周三' : matchedAccount.tier === '钻石年卡💎' ? '18号' : '8号')} (享额外88折)`
                  ) : '会员独享额外88折'}
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* 🎟️ Row 3: 年卡会员专属权益券 / Annual Pass Member Benefits */}
      <div className={`pt-4 border-t-2 border-slate-200 space-y-3 transition-opacity duration-300 ${(!isMember || isHoliday) ? 'opacity-60' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="text-xs font-black text-slate-800 flex items-center gap-1.5 font-hand bg-[#B9E3F8]/40 border-2 border-slate-800 py-1 px-3 rounded-xl shadow-[1.5px_1.5px_0px_0px_#1A202C] w-fit">
            <span>4. 年卡会员权益券抵扣 / Member Coupons</span>
            {!isMember && (
              <span className="text-[9px] bg-slate-100 text-slate-500 border-2 border-slate-200 px-1.5 py-0.5 rounded-lg font-black ml-2 shadow-[1px_1px_0px_0px_#1A202C]">
                (开启会员级别后生效)
              </span>
            )}
            {isMember && isHoliday && (
              <span className="text-[9px] bg-rose-100 text-rose-700 border-2 border-rose-400 px-1.5 py-0.5 rounded-lg font-black ml-2 animate-pulse shadow-[1px_1px_0px_0px_#E11D48]">
                🏮 法定节假日不能使用兑换券
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {/* 全天日托兑换券 */}
          <div
            onClick={() => {
              if (!isMember || isHoliday) return;
              const limit = matchedAccount ? matchedAccount.daycareCoupons.unused : 99;
              if (limit <= 0) {
                triggerAlert('⚠️ 该会员此卡包剩余“全天日托兑换券”额度为 0，整个家庭(旗下宠物)皆不可再用！');
                return;
              }
              setUseDaycareCoupon(prev => prev > 0 ? 0 : 1);
            }}
            className={`p-3 rounded-2xl border-2 text-left transition-all duration-150 flex flex-col justify-between gap-1.5 select-none ${
              useDaycareCoupon > 0 && isMember && !isHoliday
                ? 'bg-[#B9E3F8]/30 border-slate-800 text-slate-900 shadow-[2px_2px_0px_0px_#1A202C]'
                : 'bg-white hover:bg-slate-50 text-slate-500 border-slate-300'
            } ${(!isMember || isHoliday) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] xl:text-[11px] font-bold truncate">全天日托兑换券</span>
                {isMember && matchedAccount && (
                  <span className={`text-[8px] font-black w-fit px-1 rounded mt-0.5 ${
                    matchedAccount.daycareCoupons.unused > 0 ? 'bg-teal-50 text-teal-700' : 'bg-rose-50 text-rose-600 line-through'
                  }`}>
                    剩余: {matchedAccount.daycareCoupons.unused}张
                  </span>
                )}
              </div>
              
              <div 
                className="flex items-center gap-1 bg-white/80 border border-gray-150 rounded-lg p-0.5 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  disabled={!isMember || isHoliday || useDaycareCoupon <= 0}
                  onClick={() => setUseDaycareCoupon(prev => Math.max(0, prev - 1))}
                  className="w-4.5 h-4.5 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center text-[10px] font-black text-gray-700 transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="text-[10px] font-mono font-bold w-4 text-center text-teal-800">
                  {isMember && !isHoliday ? useDaycareCoupon : 0}
                </span>
                <button
                  type="button"
                  disabled={!isMember || isHoliday || useDaycareCoupon >= (matchedAccount ? matchedAccount.daycareCoupons.unused : 99)}
                  onClick={() => {
                    const limit = matchedAccount ? matchedAccount.daycareCoupons.unused : 99;
                    setUseDaycareCoupon(prev => prev < limit ? prev + 1 : prev);
                  }}
                  className="w-4.5 h-4.5 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center text-[10px] font-black text-gray-700 transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
            <span className="text-[9px] text-gray-400 font-medium leading-tight block">抵扣1个全天日托的价格</span>
          </div>

          {/* 度假房升级房券 */}
          <div
            onClick={() => {
              if (!isMember || isHoliday) return;
              if (!isHolidaySupported) return;
              const limit = matchedAccount ? matchedAccount.holidayCoupons.unused : 99;
              if (limit <= 0) {
                triggerAlert('⚠️ 该会员此卡包剩余“度假房升级房券”额度为 0，整个家庭(旗下宠物)皆不可再用！');
                return;
              }
              setUseBoardingUpgradeCoupon(prev => prev > 0 ? 0 : 1);
            }}
            className={`p-3 rounded-2xl border-2 text-left transition-all duration-150 flex flex-col justify-between gap-1.5 select-none ${
              useBoardingUpgradeCoupon > 0 && isMember && !isHoliday
                ? 'bg-[#B9E3F8]/30 border-slate-800 text-slate-900 shadow-[2px_2px_0px_0px_#1A202C]'
                : 'bg-white hover:bg-slate-50 text-slate-500 border-slate-300'
            } ${(!isMember || isHoliday) ? 'opacity-50 cursor-not-allowed' : !isHolidaySupported ? 'opacity-40 bg-gray-50/50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] xl:text-[11px] font-bold truncate">度假房升级房券</span>
                {isMember && matchedAccount && (
                  <span className={`text-[8px] font-black w-fit px-1 rounded mt-0.5 ${
                    !isHolidaySupported
                      ? 'bg-rose-50 text-rose-600 line-through'
                      : matchedAccount.holidayCoupons.unused > 0
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-rose-50 text-rose-600 line-through'
                  }`}>
                    {!isHolidaySupported ? '❌ 年卡无此权益' : `剩余: ${matchedAccount.holidayCoupons.unused}张`}
                  </span>
                )}
              </div>
              
              <div 
                className="flex items-center gap-1 bg-white/80 border border-gray-150 rounded-lg p-0.5 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  disabled={!isMember || isHoliday || !isHolidaySupported || useBoardingUpgradeCoupon <= 0}
                  onClick={() => setUseBoardingUpgradeCoupon(prev => Math.max(0, prev - 1))}
                  className="w-4.5 h-4.5 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center text-[10px] font-black text-gray-700 transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="text-[10px] font-mono font-bold w-4 text-center text-teal-800">
                  {isMember && !isHoliday && isHolidaySupported ? useBoardingUpgradeCoupon : 0}
                </span>
                <button
                  type="button"
                  disabled={!isMember || isHoliday || !isHolidaySupported || useBoardingUpgradeCoupon >= (matchedAccount ? matchedAccount.holidayCoupons.unused : 99)}
                  onClick={() => {
                    const limit = matchedAccount ? matchedAccount.holidayCoupons.unused : 99;
                    setUseBoardingUpgradeCoupon(prev => prev < limit ? prev + 1 : prev);
                  }}
                  className="w-4.5 h-4.5 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center text-[10px] font-black text-gray-700 transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
            <span className="text-[9px] text-gray-400 font-medium leading-tight block">温馨房变舒适, 阳光房变豪华</span>
          </div>

          {/* 特殊陪护房升级券 */}
          <div
            onClick={() => {
              if (!isMember || isHoliday) return;
              if (!isSpecialCareSupported) return;
              const limit = matchedAccount ? (matchedAccount.specialCareCoupons ? matchedAccount.specialCareCoupons.unused : 0) : 99;
              if (limit <= 0) {
                triggerAlert('⚠️ 该会员此卡包剩余“特殊陪护房升级券”额度为 0（或无此卡包），整个家庭(旗下宠物)皆不可使用！');
                return;
              }
              setUseSpecialCareUpgradeCoupon(prev => prev > 0 ? 0 : 1);
            }}
            className={`p-3 rounded-2xl border-2 text-left transition-all duration-150 flex flex-col justify-between gap-1.5 select-none ${
              useSpecialCareUpgradeCoupon > 0 && isMember && !isHoliday
                ? 'bg-[#B9E3F8]/30 border-slate-800 text-slate-900 shadow-[2px_2px_0px_0px_#1A202C]'
                : 'bg-white hover:bg-slate-50 text-slate-500 border-slate-300'
            } ${(!isMember || isHoliday) ? 'opacity-50 cursor-not-allowed' : !isSpecialCareSupported ? 'opacity-40 bg-gray-50/50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] xl:text-[11px] font-bold truncate">特殊陪护房升级券</span>
                {isMember && matchedAccount && (
                  <span className={`text-[8px] font-black w-fit px-1 rounded mt-0.5 ${
                    !isSpecialCareSupported
                      ? 'bg-rose-50 text-rose-600 line-through'
                      : matchedAccount.specialCareCoupons && matchedAccount.specialCareCoupons.unused > 0 ? 'bg-purple-50 text-purple-700' : 'bg-rose-50 text-rose-600 line-through'
                  }`}>
                    {!isSpecialCareSupported ? '❌ 年卡无此权益' : `剩余: ${matchedAccount.specialCareCoupons ? matchedAccount.specialCareCoupons.unused : 0}张`}
                  </span>
                )}
              </div>
              
              <div 
                className="flex items-center gap-1 bg-white/80 border border-gray-150 rounded-lg p-0.5 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  disabled={!isMember || isHoliday || !isSpecialCareSupported || useSpecialCareUpgradeCoupon <= 0}
                  onClick={() => setUseSpecialCareUpgradeCoupon(prev => Math.max(0, prev - 1))}
                  className="w-4.5 h-4.5 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center text-[10px] font-black text-gray-700 transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="text-[10px] font-mono font-bold w-4 text-center text-teal-800">
                  {isMember && !isHoliday && isSpecialCareSupported ? useSpecialCareUpgradeCoupon : 0}
                </span>
                <button
                  type="button"
                  disabled={!isMember || isHoliday || !isSpecialCareSupported || useSpecialCareUpgradeCoupon >= (matchedAccount ? (matchedAccount.specialCareCoupons ? matchedAccount.specialCareCoupons.unused : 0) : 99)}
                  onClick={() => {
                    const limit = matchedAccount ? (matchedAccount.specialCareCoupons ? matchedAccount.specialCareCoupons.unused : 0) : 99;
                    setUseSpecialCareUpgradeCoupon(prev => prev < limit ? prev + 1 : prev);
                  }}
                  className="w-4.5 h-4.5 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center text-[10px] font-black text-gray-700 transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
            <span className="text-[9px] text-gray-400 font-medium leading-tight block">特殊陪护房降至温馨度假房价格</span>
          </div>

          {/* 高端洗护升级券 */}
          <div
            onClick={() => {
              if (!isMember || isHoliday) return;
              const limit = matchedAccount ? matchedAccount.washCoupons.unused : 99;
              if (limit <= 0) {
                triggerAlert('⚠️ 该会员此卡包剩余“高端洗护升级券”额度为 0，整个家庭(旗下宠物)皆不可再用！');
                return;
              }
              setUseWashUpgradeCoupon(prev => prev > 0 ? 0 : 1);
            }}
            className={`p-3 rounded-2xl border-2 text-left transition-all duration-150 flex flex-col justify-between gap-1.5 select-none ${
              useWashUpgradeCoupon > 0 && isMember && !isHoliday
                ? 'bg-[#B9E3F8]/30 border-slate-800 text-slate-900 shadow-[2px_2px_0px_0px_#1A202C]'
                : 'bg-white hover:bg-slate-50 text-slate-500 border-slate-300'
            } ${(!isMember || isHoliday) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] xl:text-[11px] font-bold truncate">高端洗护升级券</span>
                {isMember && matchedAccount && (
                  <span className={`text-[8px] font-black w-fit px-1 rounded mt-0.5 ${
                    matchedAccount.washCoupons.unused > 0 ? 'bg-rose-50 text-rose-700' : 'bg-rose-50 text-rose-600 line-through'
                  }`}>
                    剩余: {matchedAccount.washCoupons.unused}张
                  </span>
                )}
              </div>
              
              <div 
                className="flex items-center gap-1 bg-white/80 border border-gray-150 rounded-lg p-0.5 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  disabled={!isMember || isHoliday || useWashUpgradeCoupon <= 0}
                  onClick={() => setUseWashUpgradeCoupon(prev => Math.max(0, prev - 1))}
                  className="w-4.5 h-4.5 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center text-[10px] font-black text-gray-700 transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="text-[10px] font-mono font-bold w-4 text-center text-teal-800">
                  {isMember && !isHoliday ? useWashUpgradeCoupon : 0}
                </span>
                <button
                  type="button"
                  disabled={!isMember || isHoliday || useWashUpgradeCoupon >= (matchedAccount ? matchedAccount.washCoupons.unused : 99)}
                  onClick={() => {
                    const limit = matchedAccount ? matchedAccount.washCoupons.unused : 99;
                    setUseWashUpgradeCoupon(prev => prev < limit ? prev + 1 : prev);
                  }}
                  className="w-4.5 h-4.5 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center text-[10px] font-black text-gray-700 transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
            <span className="text-[9px] text-gray-400 font-medium leading-tight block">添加的药浴、SPA均免单</span>
          </div>

          {/* 10km接送抵用券 */}
          <div
            onClick={() => {
              if (!isMember || isHoliday) return;
              if (!isTransferSupported) return;
              const limit = matchedAccount ? (matchedAccount.transferCoupons ? matchedAccount.transferCoupons.unused : 0) : 99;
              if (limit <= 0) {
                triggerAlert('⚠️ 该会员此卡包剩余“10km接送抵用券”额度为 0（或无此卡包），整个家庭(旗下宠物)皆不可使用！');
                return;
              }
              setUseTransferCoupon(prev => prev > 0 ? 0 : 1);
            }}
            className={`p-3 rounded-2xl border-2 text-left transition-all duration-150 flex flex-col justify-between gap-1.5 select-none ${
              useTransferCoupon > 0 && isMember && !isHoliday
                ? 'bg-[#B9E3F8]/30 border-slate-800 text-slate-900 shadow-[2px_2px_0px_0px_#1A202C]'
                : 'bg-white hover:bg-slate-50 text-slate-500 border-slate-300'
            } ${(!isMember || isHoliday) ? 'opacity-50 cursor-not-allowed' : !isTransferSupported ? 'opacity-40 bg-gray-50/50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] xl:text-[11px] font-bold truncate">10km接送抵用券</span>
                {isMember && matchedAccount && (
                  <span className={`text-[8px] font-black w-fit px-1 rounded mt-0.5 ${
                    !isTransferSupported
                      ? 'bg-rose-50 text-rose-600 line-through'
                      : matchedAccount.transferCoupons && matchedAccount.transferCoupons.unused > 0 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-600 line-through'
                  }`}>
                    {!isTransferSupported ? '❌ 年卡无此权益' : `剩余: ${matchedAccount.transferCoupons ? matchedAccount.transferCoupons.unused : 0}张`}
                  </span>
                )}
              </div>
              
              <div 
                className="flex items-center gap-1 bg-white/80 border border-gray-150 rounded-lg p-0.5 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  disabled={!isMember || isHoliday || !isTransferSupported || useTransferCoupon <= 0}
                  onClick={() => setUseTransferCoupon(prev => Math.max(0, prev - 1))}
                  className="w-4.5 h-4.5 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center text-[10px] font-black text-gray-700 transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="text-[10px] font-mono font-bold w-4 text-center text-teal-800">
                  {isMember && !isHoliday && isTransferSupported ? useTransferCoupon : 0}
                </span>
                <button
                  type="button"
                  disabled={!isMember || isHoliday || !isTransferSupported || useTransferCoupon >= (matchedAccount ? (matchedAccount.transferCoupons ? matchedAccount.transferCoupons.unused : 0) : 99)}
                  onClick={() => {
                    const limit = matchedAccount ? (matchedAccount.transferCoupons ? matchedAccount.transferCoupons.unused : 0) : 99;
                    setUseTransferCoupon(prev => prev < limit ? prev + 1 : prev);
                  }}
                  className="w-4.5 h-4.5 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center text-[10px] font-black text-gray-700 transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
            <span className="text-[9px] text-gray-400 font-medium leading-tight block">抵扣10km同城接送费用一次</span>
          </div>

          {/* 高端洁牙抵扣券 */}
          <div
            onClick={() => {
              if (!isMember || isHoliday) return;
              setUseDentalCoupon(prev => prev > 0 ? 0 : 1);
            }}
            className={`p-3 rounded-2xl border-2 text-left transition-all duration-150 flex flex-col justify-between gap-1.5 select-none ${
              useDentalCoupon > 0 && isMember && !isHoliday
                ? 'bg-[#B9E3F8]/30 border-slate-800 text-slate-900 shadow-[2px_2px_0px_0px_#1A202C]'
                : 'bg-white hover:bg-slate-50 text-slate-500 border-slate-300'
            } ${(!isMember || isHoliday) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] xl:text-[11px] font-bold truncate">高端洁牙抵扣券</span>
                {isMember && (
                  <span className="text-[8px] font-black w-fit px-1 rounded mt-0.5 bg-gray-50 text-gray-500">
                    自由套用
                  </span>
                )}
              </div>
              
              <div 
                className="flex items-center gap-1 bg-white/80 border border-gray-150 rounded-lg p-0.5 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  disabled={!isMember || isHoliday || useDentalCoupon <= 0}
                  onClick={() => setUseDentalCoupon(prev => Math.max(0, prev - 1))}
                  className="w-4.5 h-4.5 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center text-[10px] font-black text-gray-700 transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="text-[10px] font-mono font-bold w-4 text-center text-teal-800">
                  {isMember && !isHoliday ? useDentalCoupon : 0}
                </span>
                <button
                  type="button"
                  disabled={!isMember || isHoliday}
                  onClick={() => setUseDentalCoupon(prev => prev + 1)}
                  className="w-4.5 h-4.5 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center text-[10px] font-black text-gray-700 transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
            <span className="text-[9px] text-gray-400 font-medium leading-tight block">抵扣狗狗/猫猫牙结石专项护理费用一次</span>
          </div>
        </div>
      </div>

      {/* 🛍️ Row 4: 消费项目 (大类：日托, 寄养, 洗护, 美容, 训练, 接送) */}
      <div className="space-y-4 pt-4 border-t-2 border-slate-200">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs font-black text-slate-800 flex items-center gap-1.5 font-hand bg-[#B9E3F8]/40 border-2 border-slate-800 py-1 px-3 rounded-xl shadow-[1.5px_1.5px_0px_0px_#1A202C] w-fit">
            <span>5. 消费项目选择 / Service Items ({petType}专属)</span>
          </div>
          {Object.keys(selectedItems).length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedItems({})}
              className="text-[10px] text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors duration-150 cursor-pointer font-black border-2 border-red-200 hover:border-red-500 bg-white px-2 py-1 rounded-lg shadow-[1px_1px_0px_0px_#1A202C]"
            >
              <Trash2 className="w-3 h-3" /> 清空全部已选
            </button>
          )}
        </div>

        {/* 3个级联下拉列表选择 */}
        <div className="bg-[#FFFEEB] rounded-2xl p-4 border-2 border-slate-800 flex flex-col gap-3 shadow-[3px_3px_0px_0px_#1A202C]">
          {/* Row 1: 标准服务大类 + 标准项目 */}
          <div className="flex flex-col md:flex-row gap-3 items-start w-full">
            <div className="space-y-1.5 w-full md:w-32 shrink-0">
              <label className="text-slate-600 text-[10px] font-black uppercase block">1. 标准服务大类</label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full bg-white border-2 border-slate-800 focus:ring-4 focus:ring-[#B9E3F8]/50 rounded-xl px-2.5 py-2 text-xs outline-none font-black text-slate-800 cursor-pointer shadow-[1.5px_1.5px_0px_0px_#1A202C]"
              >
                {categoriesOrder.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 w-full md:flex-1 flex flex-col">
              <label className="text-slate-600 text-[10px] font-black uppercase block">2. 标准项目 ({petType}过滤)</label>
              <div className="flex gap-2 items-center w-full">
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="flex-1 bg-white border-2 border-slate-800 focus:ring-4 focus:ring-[#B9E3F8]/50 rounded-xl px-3 py-2 text-xs outline-none font-black text-slate-800 cursor-pointer truncate shadow-[1.5px_1.5px_0px_0px_#1A202C]"
                >
                  {(() => {
                    const catServices = getFilteredStandardServices(selectedCategory);
                    if (catServices.length === 0) {
                      return <option value="">暂无此分类下{petType}服务</option>;
                    }
                    const subCats = Array.from(new Set(catServices.map((s) => getSubCategory(s))));
                    return subCats.map((subCat) => {
                      const matched = catServices.filter((s) => getSubCategory(s) === subCat);
                      return (
                        <optgroup key={subCat} label={subCat} className="font-black text-slate-800 bg-[#FFFEEB]">
                          {matched.map((srv) => (
                            <option key={srv.id} value={srv.id} className="text-slate-700 font-bold bg-white">
                              {srv.name} (¥{srv.price}/{srv.unit})
                            </option>
                          ))}
                        </optgroup>
                      );
                    });
                  })()}
                </select>
                <button
                  type="button"
                  onClick={handleAddItem}
                  disabled={!selectedServiceId}
                  className="bg-[#B9E3F8] hover:bg-[#a3d5ef] disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:shadow-none text-slate-900 w-9 h-9 flex items-center justify-center rounded-xl border-2 border-slate-800 transition-all duration-150 shadow-[1.5px_1.5px_0px_0px_#1A202C] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#1A202C] cursor-pointer shrink-0 animate-fade-in"
                  title="添加"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: 专项服务 (和2.标准项目左对齐) */}
          <div className="flex flex-col md:flex-row gap-3 items-start w-full">
            <div className="hidden md:block w-32 shrink-0" />
            <div className="space-y-1.5 w-full md:flex-1 flex flex-col">
              <label className="text-slate-600 text-[10px] font-black uppercase block">3. 专项服务</label>
              <div className="flex gap-2 items-center w-full">
                <select
                  value={selectedSpecialServiceId}
                  onChange={(e) => setSelectedSpecialServiceId(e.target.value)}
                  disabled={!hasWashOrGroomItem}
                  className="flex-1 bg-white disabled:bg-slate-50 disabled:text-slate-450 disabled:border-slate-200 border-2 border-slate-800 focus:ring-4 focus:ring-[#B9E3F8]/50 rounded-xl px-3 py-2 text-xs outline-none font-black text-slate-800 cursor-pointer truncate shadow-[1.5px_1.5px_0px_0px_#1A202C]"
                >
                  {!hasWashOrGroomItem ? (
                    <option value="">请先勾选洗护/美容服务大类</option>
                  ) : (() => {
                    const specServices = services.filter((s) => isSpecialService(s) && isPetTypeMatched(s, petType));
                    if (specServices.length === 0) {
                      return <option value="">暂无该宠物专属专项服务</option>;
                    }
                    const subCats = Array.from(new Set(specServices.map(getSubCategoryLabel)));
                    return subCats.map((subCat) => {
                      const matched = specServices.filter((s) => getSubCategoryLabel(s) === subCat);
                      return (
                        <optgroup key={subCat} label={subCat} className="font-black text-slate-800 bg-[#FFFEEB]">
                          {matched.map((srv) => (
                            <option key={srv.id} value={srv.id} className="text-slate-700 font-bold bg-white">
                              {srv.name} (¥{srv.price}/{srv.unit})
                            </option>
                          ))}
                        </optgroup>
                      );
                    });
                  })()}
                </select>
                <button
                  type="button"
                  onClick={handleAddItemSpecial}
                  disabled={!selectedSpecialServiceId || !hasWashOrGroomItem}
                  className="bg-[#B9E3F8] hover:bg-[#a3d5ef] disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:shadow-none text-slate-900 w-9 h-9 flex items-center justify-center rounded-xl border-2 border-slate-800 transition-all duration-150 shadow-[1.5px_1.5px_0px_0px_#1A202C] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#1A202C] cursor-pointer shrink-0 animate-fade-in"
                  title="添加"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 已添加收费明细 (明细) */}
      <div className="bg-[#FFFEEB] cute-card-border p-4 space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-800 flex items-center gap-1 font-hand">
            已添加收费明细 ({billItems.length} 项)
          </span>
          {Object.keys(selectedItems).length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedItems({})}
              className="text-[10px] text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors duration-150 cursor-pointer font-black border-2 border-red-200 hover:border-red-500 bg-white px-2 py-0.5 rounded-lg shadow-[1px_1px_0px_0px_#1A202C]"
            >
              <Trash2 className="w-3 h-3" /> 清空全部
            </button>
          )}
        </div>

        {billItems.length === 0 ? (
          <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-white p-6 text-center text-slate-400 text-xs font-bold">
            暂无收费项目，请在上方选择服务项目并点击“+”添加。
          </div>
        ) : (
          <div className="border-2 border-slate-800 rounded-2xl overflow-hidden bg-white divide-y-2 divide-slate-100 shadow-[2px_2px_0px_0px_#1A202C]">
            {billItems.map((item) => {
              const srv = services.find((s) => s.id === item.serviceId);
              const originalSinglePrice = item.originalPrice ?? (srv ? srv.price : item.price);
              const hasDeduction = item.price < originalSinglePrice;
              const originalTotalPrice = originalSinglePrice * item.quantity;
              const adjustedTotalPrice = item.price * item.quantity;

              return (
                <div key={item.serviceId} className="p-2.5 flex items-center justify-between hover:bg-[#FFFEEB]/50 transition-colors duration-150">
                  <div className="min-w-0 flex-1 mr-2 flex flex-wrap items-center gap-1">
                    <span className="text-[9px] font-black bg-[#B9E3F8] text-slate-800 border-2 border-slate-800 px-1.5 py-0.2 rounded shadow-[1px_1px_0px_0px_#1A202C]">
                      {srv?.category || '服务'}
                    </span>
                    <span className="text-xs font-black text-slate-800 ml-1 truncate max-w-[120px]">{item.name}</span>
                    <p className="text-[9px] text-slate-400 font-bold w-full font-mono flex items-center gap-1 flex-wrap">
                      <span>单价:</span>
                      {hasDeduction ? (
                        <>
                          <span className="line-through text-slate-300">¥{originalSinglePrice.toFixed(2)}</span>
                          <span className="text-emerald-600 font-black">¥{item.price.toFixed(2)}</span>
                        </>
                      ) : (
                        <span>¥{item.price.toFixed(2)}</span>
                      )}
                      <span>/{item.unit}</span>
                      {hasDeduction && (
                        <span className="text-[8px] font-black bg-emerald-100 text-emerald-800 px-1 rounded-md border border-emerald-300">
                          已享券优惠
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="text-right w-16 mr-1">
                      {hasDeduction && (
                        <div className="text-[9px] line-through text-slate-300 font-mono font-bold leading-none mb-0.5">
                          ¥{originalTotalPrice.toFixed(2)}
                        </div>
                      )}
                      <div className={`text-xs font-black font-mono leading-none ${hasDeduction ? 'text-emerald-600' : 'text-slate-800'}`}>
                        ¥{adjustedTotalPrice.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-[#FFFEEB] border border-slate-800 rounded-lg p-0.5 shadow-[1px_1px_0px_0px_#1A202C]">
                      <button
                        type="button"
                        onClick={() => handleAdjustQuantity(item.serviceId, -1)}
                        className="w-4 h-4 bg-white hover:bg-slate-50 text-slate-700 rounded flex items-center justify-center border border-slate-300 transition-colors duration-150 cursor-pointer"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="text-xs font-black text-slate-800 w-3 text-center font-mono">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAdjustQuantity(item.serviceId, 1)}
                        className="w-4 h-4 bg-white hover:bg-slate-50 text-slate-700 rounded flex items-center justify-center border border-slate-300 transition-colors duration-150 cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedItems((prev) => {
                          const { [item.serviceId]: _, ...rest } = prev;
                          return rest;
                        });
                      }}
                      className="text-slate-400 hover:text-red-500 hover:scale-110 p-0.5 transition-all duration-150 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </form>

    {/* Right side: Active Receipt viewer and pricing calculation */}
    <div className="md:col-span-5 md:sticky md:top-24 space-y-4">
        <div className="bg-[#FFFEEB] cute-card-border p-4 flex flex-wrap justify-between items-center gap-3 relative overflow-hidden">
          <div className="space-y-1">
            <div className="text-slate-500 text-[10px] flex flex-wrap items-center gap-1 font-black uppercase tracking-wider">
              <span>原价: <strong className="font-mono text-slate-700">¥{originalSubtotal.toFixed(2)}</strong></span>
              {totalDeduction > 0 && (
                <>
                  <span className="text-slate-300">|</span>
                  <span className="text-emerald-700 font-bold">抵扣: -¥{totalDeduction.toFixed(2)}</span>
                </>
              )}
              <span className="text-slate-300">|</span>
              <span>
                折扣:{' '}
                <strong className="font-mono text-slate-700">
                  {isHoliday ? '原价(节假日)' : `${Math.round(discountRate * 100)}%`}
                </strong>
              </span>
              {isMemberDay && memberDayDiscountAmount > 0 && (
                <>
                  <span className="text-slate-300">|</span>
                  <span className="text-sky-700 font-bold animate-pulse">
                    会员日额外88折: -¥{memberDayDiscountAmount.toFixed(2)}
                  </span>
                </>
              )}
            </div>
            <div className="text-xs text-slate-800 font-black">
              应收款项总额:{' '}
              <span className="text-lg font-black font-mono text-slate-900">
                ¥{total.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-3 bg-[#EBA53B] hover:bg-[#db9326] border-2 border-slate-800 text-slate-900 text-xs font-black rounded-2xl flex items-center gap-1.5 shadow-[3px_3px_0px_0px_#1A202C] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_#1A202C] transition-all duration-150 cursor-pointer"
            id="btn-generate-receipt"
          >
            <CheckSquare className="w-4 h-4" />
            <span>确认记账</span>
          </button>
        </div>

        {/* 3. 收据预览标题栏 */}
        <div className="bg-[#FFFEEB] rounded-2xl border-2 border-slate-800 p-2 text-center shadow-[2px_2px_0px_0px_#1A202C]">
          <span className="text-xs text-slate-800 font-black font-hand uppercase tracking-wider">
            🐾 账单收据预览 / Receipt Preview
          </span>
        </div>

        {/* 4. 电子小票 */}
        {(selectedBill || billItems.length > 0) ? (
          <Receipt bill={selectedBill || draftBill} customAlert={customAlert} invoiceStyle={invoiceStyle} />
        ) : (
          <div className="border-4 border-slate-800 rounded-3xl p-8 text-center bg-white space-y-4 shadow-[4px_4px_0px_0px_#1A202C] relative overflow-hidden">
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '15px 15px' }}></div>
            <div className="w-14 h-14 bg-[#FFFEEB] rounded-full flex items-center justify-center mx-auto text-slate-700 relative z-10 border-2 border-slate-800 shadow-[1px_1px_0px_0px_#1A202C]">
              <ReceiptIcon className="w-7 h-7" />
            </div>
            <div className="space-y-1 relative z-10">
              <p className="text-slate-800 text-xs font-black font-hand">暂无选中的未付账单</p>
              <p className="text-slate-500 text-[11px] max-w-xs mx-auto leading-relaxed font-bold">
                请在左侧表单中录入宠物名字、点击加号选择服务项目，然后点击“导出账单”按钮，即可导出 CSV 格式的账单数据，并在此生成可爱实体小票样式的电子收据。
              </p>
            </div>
            {bills.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedBill(bills[0])}
                className="text-xs font-black text-slate-900 bg-[#B9E3F8] hover:bg-[#a3d5ef] px-3.5 py-1.5 rounded-xl border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1A202C] active:translate-y-0.5 transition-all cursor-pointer relative z-10"
              >
                加载最近一笔小票
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
