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

  // 1. Array of custom selected items
  const [customSelectedItems, setCustomSelectedItems] = useState<BillItem[]>([]);

  const [isResetting, setIsResetting] = useState(false);
  const [itemMemberDayStacked, setItemMemberDayStacked] = useState(false);

  // 2. Per-item selection form states
  const [itemServiceDate, setItemServiceDate] = useState(() => checkInDate);
  const [itemDiscountPreset, setItemDiscountPreset] = useState<'原价' | '88折' | '8折' | '5折' | '7折' | '6折' | '自定' | '大众点评'>('原价');
  const [itemCustomDiscountValue, setItemCustomDiscountValue] = useState<string>('');
  const [itemAppliedCoupon, setItemAppliedCoupon] = useState<'none' | 'daycare' | 'boarding' | 'special_care' | 'wash' | 'transfer' | 'dental'>('none');
  const [itemQuantity, setItemQuantity] = useState<number>(1);

  // 3. Ref to service date input for focal reset
  const serviceDateInputRef = React.useRef<HTMLInputElement | null>(null);

  // Resolve matching family member account based on memberId ONLY
  const matchedAccount = React.useMemo(() => {
    if (!isMember || !memberId.trim()) return null;
    const rawInput = memberId.replace(/^MEM-/, '').trim();
    const cleanInputId = /^\d+$/.test(rawInput) ? rawInput.padStart(12, '0') : rawInput;
    if (cleanInputId) {
      const match = memberAssets.find(acc => acc.memberId.toLowerCase() === cleanInputId.toLowerCase());
      if (match) return match;
    }
    return null;
  }, [isMember, memberId, memberAssets]);

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
  const categoriesOrder = ['日托', '寄养', '洗护', '美容', '专项服务', '训练', '接送'];
  const selectableCategories = [...categoriesOrder];

  // Cascading dropdown states (Unified category and service)
  const [selectedCategory, setSelectedCategory] = useState('日托');
  const [selectedServiceId, setSelectedServiceId] = useState('');

  // Synchronize itemServiceDate and items dates with checkInDate
  const prevCheckInDateRef = React.useRef(checkInDate);
  React.useEffect(() => {
    const oldDate = prevCheckInDateRef.current;
    if (oldDate !== checkInDate) {
      setItemServiceDate(checkInDate);
      setCustomSelectedItems(prev => prev.map(item => {
        if (item.date === oldDate) {
          return { ...item, date: checkInDate };
        }
        return item;
      }));
      prevCheckInDateRef.current = checkInDate;
    }
  }, [checkInDate]);

  const getFilteredServicesForCategory = (cat: string) => {
    const weightNum = parseFloat(petWeight);
    return services.filter((s) => {
      if (s.category !== cat || !isPetTypeMatched(s, petType)) {
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
    const catServices = getFilteredServicesForCategory(cat);
    if (catServices.length > 0) {
      setSelectedServiceId(catServices[0].id);
    } else {
      setSelectedServiceId('');
    }
  };

  // Synchronize first service when services, category or pet type changes
  React.useEffect(() => {
    const catServices = getFilteredServicesForCategory(selectedCategory);
    if (catServices.length > 0) {
      const currentIdValid = catServices.some((s) => s.id === selectedServiceId);
      if (!currentIdValid) {
        setSelectedServiceId(catServices[0].id);
      }
    } else {
      setSelectedServiceId('');
    }
  }, [services.length, selectedCategory, petType, petWeight]);

  // Synchronize discountPreset with membership changes
  React.useEffect(() => {
    if (!isMember) {
      if (discountPreset !== '100%' && discountPreset !== '大众点评') {
        setDiscountPreset('100%');
      }
      setItemMemberDayStacked(false); // If not a member, Member Day discount cannot be stacked
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

  // Helper to get available coupons for a given service item (showing all annual card benefit coupons in dropdown)
  const getAvailableCouponsForService = (srv: ServiceItem | undefined) => {
    const list: { id: typeof itemAppliedCoupon; name: string }[] = [{ id: 'none', name: '不使用' }];
    if (!srv || !isMember || isHoliday) return list;

    list.push({ id: 'daycare', name: '全天日托兑换券' });
    list.push({ id: 'boarding', name: '度假房升级房券' });
    list.push({ id: 'special_care', name: '特殊陪护房升级券' });
    list.push({ id: 'wash', name: '高端洗护升级券' });
    list.push({ id: 'transfer', name: '10km接送抵用券' });
    list.push({ id: 'dental', name: '高端洁牙抵扣券' });

    return list;
  };

  // Default coupon selection for the item should always be 'none' (不使用)
  React.useEffect(() => {
    setItemAppliedCoupon('none');
  }, [selectedServiceId, matchedAccount]);

  const handleAddItemCustom = () => {
    if (!selectedServiceId) {
      triggerAlert('请先选择一个服务项目！');
      return;
    }
    const srv = services.find((s) => s.id === selectedServiceId);
    if (!srv) return;

    if (itemAppliedCoupon !== 'none') {
      const avail = getAvailableCouponsForService(srv);
      const isCouponStillValid = avail.some(c => c.id === itemAppliedCoupon);
      if (!isCouponStillValid) {
        triggerAlert('⚠️ 该会员此卡包对应的权益券余额不足，无法使用！');
        return;
      }
    }

    let basePrice = srv.price;
    if (itemDiscountPreset === '大众点评') {
      basePrice = getDianpingPrice(srv);
    }

    let finalPrice = basePrice;
    if (itemAppliedCoupon === 'daycare') {
      finalPrice = 0;
    } else if (itemAppliedCoupon === 'boarding') {
      if (srv.name.includes('度假房')) {
        const targetRoom = services.find(s => s.name.includes('温馨舒适') || s.name.includes('舒适温馨'));
        finalPrice = targetRoom ? targetRoom.price : 359;
      } else if (srv.name.includes('阳光度假房')) {
        const targetRoom = services.find(s => s.name.includes('豪华阳光'));
        finalPrice = targetRoom ? targetRoom.price : 429;
      }
    } else if (itemAppliedCoupon === 'special_care') {
      const targetRoom = services.find(s => s.name.includes('乐园度假房') || s.name.includes('温馨度假房'));
      finalPrice = targetRoom ? targetRoom.price : 538;
    } else if (itemAppliedCoupon === 'wash') {
      finalPrice = 0;
    } else if (itemAppliedCoupon === 'transfer') {
      finalPrice = 0;
    } else if (itemAppliedCoupon === 'dental') {
      finalPrice = 0;
    } else {
      if (itemDiscountPreset === '88折') {
        finalPrice = basePrice * 0.88;
      } else if (itemDiscountPreset === '8折') {
        finalPrice = basePrice * 0.80;
      } else if (itemDiscountPreset === '5折') {
        finalPrice = basePrice * 0.50;
      } else if (itemDiscountPreset === '自定') {
        const cleanVal = itemCustomDiscountValue.trim().replace('%', '');
        const val = parseFloat(cleanVal);
        if (!isNaN(val) && val > 0) {
          if (val <= 10) {
            finalPrice = basePrice * (val / 10);
          } else if (val <= 100) {
            finalPrice = basePrice * (val / 100);
          }
        }
      }

      // Apply stacked Member Day discount if checked
      if (itemMemberDayStacked) {
        finalPrice = finalPrice * 0.88;
      }
    }

    const newItem: BillItem = {
      serviceId: srv.id,
      name: srv.name,
      price: finalPrice,
      quantity: 1, // Quantity is always 1 by default
      unit: srv.unit,
      originalPrice: basePrice,
      date: itemServiceDate,
      discountPreset: itemDiscountPreset,
      customDiscountValue: itemDiscountPreset === '自定' ? parseFloat(itemCustomDiscountValue) : undefined,
      appliedCoupon: itemAppliedCoupon === 'none' ? undefined : itemAppliedCoupon,
      memberDayStacked: itemMemberDayStacked
    };

    setCustomSelectedItems(prev => [...prev, newItem]);
    setItemAppliedCoupon('none');
    setItemQuantity(1);
    setItemMemberDayStacked(false); // Reset member day stack toggle

    if (serviceDateInputRef.current) {
      serviceDateInputRef.current.focus();
    }
  };

  const handleAdjustItemQuantity = (index: number, amount: number) => {
    setCustomSelectedItems(prev => {
      const updated = [...prev];
      const nextQty = updated[index].quantity + amount;
      if (nextQty <= 0) {
        updated.splice(index, 1);
      } else {
        updated[index] = {
          ...updated[index],
          quantity: nextQty
        };
      }
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCustomSelectedItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Derive used coupon counts across the array
  const usedDaycareCouponsCount = customSelectedItems.filter(item => item.appliedCoupon === 'daycare').reduce((sum, item) => sum + item.quantity, 0);
  const usedBoardingCouponsCount = customSelectedItems.filter(item => item.appliedCoupon === 'boarding').reduce((sum, item) => sum + item.quantity, 0);
  const usedSpecialCareCouponsCount = customSelectedItems.filter(item => item.appliedCoupon === 'special_care').reduce((sum, item) => sum + item.quantity, 0);
  const usedWashCouponsCount = customSelectedItems.filter(item => item.appliedCoupon === 'wash').reduce((sum, item) => sum + item.quantity, 0);
  const usedTransferCouponsCount = customSelectedItems.filter(item => item.appliedCoupon === 'transfer').reduce((sum, item) => sum + item.quantity, 0);
  const usedDentalCouponsCount = customSelectedItems.filter(item => item.appliedCoupon === 'dental').reduce((sum, item) => sum + item.quantity, 0);

  // Auto-sync derived coupon counts with state for submit and draft preview
  React.useEffect(() => {
    setUseDaycareCoupon(usedDaycareCouponsCount);
    setUseBoardingUpgradeCoupon(usedBoardingCouponsCount);
    setUseSpecialCareUpgradeCoupon(usedSpecialCareCouponsCount);
    setUseWashUpgradeCoupon(usedWashCouponsCount);
    setUseTransferCoupon(usedTransferCouponsCount);
    setUseDentalCoupon(usedDentalCouponsCount);
  }, [
    usedDaycareCouponsCount,
    usedBoardingCouponsCount,
    usedSpecialCareCouponsCount,
    usedWashCouponsCount,
    usedTransferCouponsCount,
    usedDentalCouponsCount
  ]);

  let discountRate = 1.0; // individual item discount is reflected in its price directly
  const billItems = customSelectedItems;

  const originalSubtotal = billItems.reduce((acc, item) => {
    return acc + (item.originalPrice || item.price) * item.quantity;
  }, 0);

  const subtotal = billItems.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);

  const totalDeduction = originalSubtotal - subtotal;

  let total = subtotal;
  let memberDayDiscountAmount = 0;
  if (isMember && !isHoliday && isMemberDay) {
    memberDayDiscountAmount = subtotal * 0.12;
    total = subtotal * 0.88;
  }

  const hasWashOrGroomItem = billItems.some((item) => {
    const srv = services.find((s) => s.id === item.serviceId);
    return srv && (srv.category === '洗护' || srv.category === '美容');
  });

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

  const isInternalLoadingRef = React.useRef(false);

  // Load selectedBill into form inputs when a saved bill is selected
  React.useEffect(() => {
    if (selectedBill && selectedBill.id !== 'draft') {
      isInternalLoadingRef.current = true;
      setDogName(selectedBill.dogName || '');
      setPetType(selectedBill.petType || '狗狗');
      setDogBreed(selectedBill.dogBreed || '');
      setPetWeight(selectedBill.petWeight ? selectedBill.petWeight.toString() : '');
      setMemberId(selectedBill.memberId || '');
      setGroomingNotes(selectedBill.groomingNotes || '');
      setNotes(selectedBill.notes || '');
      setCheckInDate(selectedBill.checkInDate);
      setCheckOutDate(selectedBill.checkOutDate);
      setIsMember(selectedBill.isMember);
      setIsHoliday(selectedBill.isHoliday || false);
      setIsMemberDay(selectedBill.isMemberDay || false);
      setDiscountPreset(selectedBill.discountPreset || '100%');
      setCustomDiscountValue(selectedBill.customDiscountValue ? selectedBill.customDiscountValue.toString() : '');
      setCustomSelectedItems(selectedBill.items || []);
      
      // Delay resetting the ref to allow React to flush the state updates
      const timer = setTimeout(() => {
        isInternalLoadingRef.current = false;
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [selectedBill]);

  // Automatically clear selected saved bill if any form draft state is edited,
  // so the live preview of the current draft bill is shown instead.
  React.useEffect(() => {
    if (isInternalLoadingRef.current) return;
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
    customSelectedItems,
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

    // Complete clean slate reset
    setDogName('');
    setDogBreed('');
    setPetWeight('');
    setMemberId('');
    setGroomingNotes('');
    setNotes('');
    setCustomSelectedItems([]);
    setUseDaycareCoupon(0);
    setUseBoardingUpgradeCoupon(0);
    setUseSpecialCareUpgradeCoupon(0);
    setUseWashUpgradeCoupon(0);
    setUseTransferCoupon(0);
    setUseDentalCoupon(0);
    setIsMember(false);
    setIsHoliday(false);
    setIsMemberDay(false);
    setDiscountPreset('100%');
    setCustomDiscountValue('');
    setSelectedServiceId('');
    setItemDiscountPreset('原价');
    setItemCustomDiscountValue('');
    setItemAppliedCoupon('none');
    setItemQuantity(1);
    setItemMemberDayStacked(false);
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

      {/* 🏷️ Row 2: 会员级别 & 日期/节假日设置 */}
      <div className="pt-4 border-t-2 border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: Member tier select */}
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

              {matchedAccount && (
                <div className="text-[9px] text-slate-500 font-bold leading-tight mt-1 text-left">
                  * 权益可供旗下宠物 {matchedAccount.pets.map(p => p.name).join('、')} 共同使用。
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column: Coupon Balance Summary */}
        <div className="space-y-3">
          <div className="text-xs font-black text-slate-800 flex items-center gap-1.5 font-hand bg-[#B9E3F8]/40 border-2 border-slate-800 py-1 px-3 rounded-xl shadow-[1.5px_1.5px_0px_0px_#1A202C] w-fit">
            3. 会员卡包券余额 / Coupons
          </div>

          {/* Real-time Coupon Balance Quick Viewer */}
          {isMember && matchedAccount ? (
            <div className="bg-white border-2 border-slate-800 rounded-xl p-2.5 shadow-[1.5px_1.5px_0px_0px_#1A202C] space-y-1.5 text-left animate-scale-up">
              <div className="flex justify-between items-center border-b-2 border-dashed border-slate-100 pb-1">
                <span className="text-[10px] font-black text-slate-800 flex items-center gap-1">
                  <Gift className="w-3 h-3 text-rose-500 animate-bounce" />
                  {matchedAccount.memberId} ({matchedAccount.tier})
                </span>
                <span className="text-[7.5px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-1 py-0.1 rounded">
                  年卡券包联动成功
                </span>
              </div>
              <div className="text-[9px] space-y-1">
                <p className="font-bold text-slate-500">剩余可用权益卡包余额 (自动扣减)：</p>
                <div className="grid grid-cols-2 gap-1 font-black text-[8.5px]">
                  {(() => {
                    // Calculate remaining counts after subtracting used items in customSelectedItems
                    const daycareLeft = Math.max(0, matchedAccount.daycareCoupons.unused - usedDaycareCouponsCount);
                    const boardingLeft = Math.max(0, matchedAccount.holidayCoupons.unused - usedBoardingCouponsCount);
                    const specialLeft = matchedAccount.specialCareCoupons ? Math.max(0, matchedAccount.specialCareCoupons.unused - usedSpecialCareCouponsCount) : 0;
                    const washLeft = Math.max(0, matchedAccount.washCoupons.unused - usedWashCouponsCount);
                    const transferLeft = matchedAccount.transferCoupons ? Math.max(0, matchedAccount.transferCoupons.unused - usedTransferCouponsCount) : 0;

                    return (
                      <>
                        <div className={`px-1.5 py-0.5 rounded flex justify-between ${daycareLeft > 0 ? 'bg-teal-50 border border-teal-200 text-teal-800' : 'bg-slate-50 text-slate-300 line-through'}`}>
                          <span>全天日托:</span>
                          <span>{daycareLeft}张</span>
                        </div>
                        <div className={`px-1.5 py-0.5 rounded flex justify-between ${boardingLeft > 0 ? 'bg-blue-50 border border-blue-200 text-blue-800' : 'bg-slate-50 text-slate-300 line-through'}`}>
                          <span>度假房升级:</span>
                          <span>{boardingLeft}张</span>
                        </div>
                        {matchedAccount.specialCareCoupons && (
                          <div className={`px-1.5 py-0.5 rounded flex justify-between ${specialLeft > 0 ? 'bg-purple-50 border border-purple-200 text-purple-800' : 'bg-slate-50 text-slate-300 line-through'}`}>
                            <span>陪护升级:</span>
                            <span>{specialLeft}张</span>
                          </div>
                        )}
                        <div className={`px-1.5 py-0.5 rounded flex justify-between ${washLeft > 0 ? 'bg-rose-50 border border-rose-200 text-rose-800' : 'bg-slate-50 text-slate-300 line-through'}`}>
                          <span>高端洗护:</span>
                          <span>{washLeft}张</span>
                        </div>
                        {matchedAccount.transferCoupons && (
                          <div className={`px-1.5 py-0.5 rounded flex justify-between ${transferLeft > 0 ? 'bg-amber-50 border border-amber-200 text-amber-800' : 'bg-slate-50 text-slate-300 line-through'}`}>
                            <span>接送抵扣:</span>
                            <span>{transferLeft}张</span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-300 rounded-xl bg-white p-4 text-center text-slate-400 text-[11px] font-bold">
              输入会员卡号后即可在此显示名下资产。
            </div>
          )}
        </div>
      </div>

      {/* 🛍️ Row 3: 服务项目选择与自定义折扣/券套用 */}
      <div className="pt-4 border-t-2 border-slate-200 space-y-4">
        <div className="text-xs font-black text-slate-800 flex items-center gap-1.5 font-hand bg-[#B9E3F8]/40 border-2 border-slate-800 py-1 px-3 rounded-xl shadow-[1.5px_1.5px_0px_0px_#1A202C] w-fit">
          4. 添加服务项目 / Add Service Item
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-slate-800 space-y-4 shadow-[3px_3px_0px_0px_#1A202C] text-left">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            {/* 1. 服务日期 */}
            <div className="space-y-1.5 md:col-span-3">
              <label className="text-slate-500 text-[10px] font-black uppercase block flex items-center gap-1">
                📅 服务日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                ref={serviceDateInputRef}
                value={itemServiceDate}
                onChange={(e) => setItemServiceDate(e.target.value)}
                className="w-full bg-[#FFFEEB] border-2 border-slate-800 focus:ring-4 focus:ring-[#B9E3F8]/50 rounded-xl px-2.5 py-1.5 text-xs outline-none font-bold shadow-[1.5px_1.5px_0px_0px_#1A202C] cursor-pointer"
                required
              />
            </div>

            {/* 2. 服务大类 */}
            <div className="space-y-1.5 md:col-span-3">
              <label className="text-slate-500 text-[10px] font-black uppercase block">🏷️ 服务大类</label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full bg-white border-2 border-slate-800 focus:ring-4 focus:ring-[#B9E3F8]/50 rounded-xl px-2.5 py-1.5 text-xs outline-none font-black text-slate-800 cursor-pointer shadow-[1.5px_1.5px_0px_0px_#1A202C]"
              >
                {categoriesOrder.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. 具体服务项目 */}
            <div className="space-y-1.5 md:col-span-6">
              <label className="text-slate-500 text-[10px] font-black uppercase block flex items-center gap-1">
                ✨ 服务项目 ({petType}过滤) <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => {
                  setSelectedServiceId(e.target.value);
                }}
                className="w-full bg-white border-2 border-slate-800 focus:ring-4 focus:ring-[#B9E3F8]/50 rounded-xl px-2.5 py-1.5 text-xs outline-none font-black text-slate-800 cursor-pointer shadow-[1.5px_1.5px_0px_0px_#1A202C] truncate"
              >
                <option value="">-- 请选择服务项目 --</option>
                {getFilteredServicesForCategory(selectedCategory).map((srv) => (
                  <option key={srv.id} value={srv.id}>
                    {srv.name} (¥{srv.price}/{srv.unit})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 border-t border-dashed border-slate-100 pt-3">
            {/* 5. 项目折数 / Discount */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-slate-500 text-[10px] font-black uppercase block">🏷️ 折扣类型</label>
              <select
                value={itemDiscountPreset}
                onChange={(e) => setItemDiscountPreset(e.target.value as any)}
                className="w-full bg-white border-2 border-slate-800 focus:ring-4 focus:ring-[#B9E3F8]/50 rounded-xl px-2.5 py-1.5 text-xs outline-none font-black text-slate-800 cursor-pointer shadow-[1.5px_1.5px_0px_0px_#1A202C]"
              >
                <option value="原价">原价</option>
                <option value="88折">88折</option>
                <option value="8折">8折</option>
                <option value="5折">5折</option>
                <option value="大众点评">大众点评</option>
                <option value="自定">自定义折扣</option>
              </select>

              {itemDiscountPreset === '自定' && (
                <div className="pt-1.5 animate-fade-in flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="如: 8.5"
                    value={itemCustomDiscountValue}
                    onChange={(e) => setItemCustomDiscountValue(e.target.value)}
                    className="w-20 bg-white border-2 border-slate-800 focus:ring-4 focus:ring-[#B9E3F8]/50 rounded-xl px-2 py-1 text-xs outline-none font-black font-mono shadow-[1px_1px_0px_0px_#1A202C]"
                  />
                  <span className="text-[10px] text-slate-500 font-bold">%</span>
                </div>
              )}
            </div>

            {/* 会员日88折 放到折扣类型后面 */}
            <div className="space-y-1.5 md:col-span-3 flex flex-col justify-end">
              <label className="text-slate-500 text-[10px] font-black uppercase block select-none">&nbsp;</label>
              <label className={`flex items-center justify-center gap-1.5 border-2 p-1.5 rounded-xl transition-all h-[34px] cursor-pointer select-none shadow-[1.5px_1.5px_0px_0px_#1A202C] active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-[1px_1px_0px_0px_#1A202C] ${
                !isMember
                  ? 'opacity-35 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400'
                  : itemAppliedCoupon !== 'none'
                    ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400'
                    : itemMemberDayStacked
                      ? 'bg-[#B9E3F8] border-slate-800 text-slate-900 shadow-[1.5px_1.5px_0px_0px_#1A202C]'
                      : 'bg-white hover:bg-slate-50/50 border-slate-300 text-slate-700'
              }`}>
                <input
                  type="checkbox"
                  disabled={!isMember || itemAppliedCoupon !== 'none'}
                  checked={itemMemberDayStacked}
                  onChange={(e) => setItemMemberDayStacked(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-400 text-sky-600 focus:ring-sky-500 accent-sky-600 cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
                />
                <span className="text-[10px] font-black whitespace-nowrap leading-none">
                  🎉 会员日88折
                </span>
              </label>
            </div>

            {/* 7. 专属年卡抵扣券 */}
            <div className="space-y-1.5 md:col-span-4">
              <label className="text-slate-500 text-[10px] font-black uppercase block flex items-center gap-1">
                🎟️ 会员年卡权益券 (单项核销)
              </label>
              <select
                disabled={!isMember || isHoliday || !selectedServiceId}
                value={itemAppliedCoupon}
                onChange={(e) => setItemAppliedCoupon(e.target.value as any)}
                className="w-full bg-white disabled:bg-slate-50 disabled:text-slate-400 border-2 border-slate-800 focus:ring-4 focus:ring-[#B9E3F8]/50 rounded-xl px-2.5 py-1.5 text-xs outline-none font-black text-slate-800 cursor-pointer shadow-[1.5px_1.5px_0px_0px_#1A202C]"
              >
                <option value="none">不使用</option>
                {(() => {
                  const srv = services.find((s) => s.id === selectedServiceId);
                  const availableCoupons = getAvailableCouponsForService(srv);
                  // Omit the first element which is "不使用" since we already render it above explicitly with value="none"
                  return availableCoupons.filter(c => c.id !== 'none').map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ));
                })()}
              </select>
              {!isMember && (
                <span className="text-[8px] text-slate-400 font-bold block">* 仅限年卡会员级别可用</span>
              )}
              {isHoliday && (
                <span className="text-[8px] text-rose-500 font-bold block animate-pulse">* 🏮 法定节假日期间不可核销卡包券</span>
              )}
            </div>

            {/* 8. 添加按钮 */}
            <div className="space-y-1.5 md:col-span-3 flex flex-col justify-end">
              <button
                type="button"
                onClick={handleAddItemCustom}
                disabled={!selectedServiceId}
                className="bg-[#B9E3F8] hover:bg-[#a3d5ef] disabled:bg-slate-100 disabled:text-slate-300 disabled:border-slate-200 disabled:shadow-none text-slate-900 font-black text-xs px-4 h-[34px] rounded-xl border-2 border-slate-800 transition-all duration-150 shadow-[1.5px_1.5px_0px_0px_#1A202C] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#1A202C] cursor-pointer w-full flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> 添加服务
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 已添加收费明细 (明细) */}
      <div className="bg-[#FFFEEB] cute-card-border p-4 space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-800 flex items-center gap-1 font-hand">
            已添加收费明细 ({customSelectedItems.length} 项)
          </span>
          {customSelectedItems.length > 0 && (
            <button
              type="button"
              onClick={() => setCustomSelectedItems([])}
              className="text-[10px] text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors duration-150 cursor-pointer font-black border-2 border-red-200 hover:border-red-500 bg-white px-2 py-0.5 rounded-lg shadow-[1px_1px_0px_0px_#1A202C]"
            >
              <Trash2 className="w-3 h-3" /> 清空全部
            </button>
          )}
        </div>

        {customSelectedItems.length === 0 ? (
          <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-white p-6 text-center text-slate-400 text-xs font-bold">
            暂无收费项目，请在上方选择日期、项目与折扣后点击“添加”。
          </div>
        ) : (
          <div className="border-2 border-slate-800 rounded-2xl overflow-hidden bg-white shadow-[2px_2px_0px_0px_#1A202C] overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px] text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-[10px] font-black uppercase border-b-2 border-slate-800">
                  <th className="p-2.5 font-bold text-center w-24 whitespace-nowrap">日期</th>
                  <th className="p-2.5 font-bold w-40 min-w-[130px]">收费项目</th>
                  <th className="p-2.5 font-bold text-center w-20">原价</th>
                  <th className="p-2.5 font-bold text-center w-36">折扣/权益</th>
                  <th className="p-2.5 font-bold text-right w-20">折扣后价格</th>
                  <th className="p-2.5 font-bold text-center w-24">数量</th>
                  <th className="p-2.5 font-bold text-center w-12">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {customSelectedItems.map((item, index) => {
                  const originalSinglePrice = item.originalPrice ?? item.price;
                  const hasDeduction = item.price < originalSinglePrice;
                  const originalTotalPrice = originalSinglePrice * item.quantity;
                  const adjustedTotalPrice = item.price * item.quantity;

                  const couponNames: Record<string, string> = {
                    daycare: '日托兑换券',
                    boarding: '度假房升级券',
                    special_care: '陪护房升级券',
                    wash: '高端洗护券',
                    transfer: '同城接送券',
                    dental: '洁牙抵扣券',
                  };

                  let discountText = '';
                  if (item.appliedCoupon) {
                    discountText = couponNames[item.appliedCoupon] || '卡包券抵扣';
                  } else {
                    const preset = item.discountPreset || '原价';
                    if (preset === '原价') {
                      discountText = '原价';
                    } else {
                      discountText = preset;
                    }
                    if (item.memberDayStacked) {
                      discountText += ' + 会员日88折';
                    }
                  }

                  return (
                    <tr key={`${item.serviceId}-${item.date}-${index}`} className="hover:bg-slate-50/55 transition-colors">
                      {/* 日期 */}
                      <td className="p-2.5 text-center font-mono whitespace-nowrap">
                        <span className="text-[9px] font-black bg-[#B9E3F8] text-slate-850 border border-slate-400 px-1.5 py-0.5 rounded shadow-[1px_1px_0px_0px_#1A202C] whitespace-nowrap">
                          {item.date}
                        </span>
                      </td>
                      {/* 消费项目 */}
                      <td className="p-2.5 font-black text-slate-800 font-sans w-40 min-w-[130px]">
                        {item.name}
                      </td>
                      {/* 原价 */}
                      <td className="p-2.5 text-center font-mono text-slate-500 font-bold">
                        ¥{originalSinglePrice.toFixed(1)}
                      </td>
                      {/* 折扣/权益 */}
                      <td className="p-2.5 text-center">
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${
                          item.appliedCoupon 
                            ? 'bg-purple-50 text-purple-800 border-purple-200' 
                            : item.memberDayStacked 
                              ? 'bg-sky-50 text-sky-800 border-sky-200'
                              : item.discountPreset !== '原价'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                          {discountText}
                        </span>
                      </td>
                      {/* 折扣后价格 */}
                      <td className="p-2.5 text-right font-mono font-black text-slate-800">
                        {hasDeduction ? (
                          <span className="text-emerald-600">¥{item.price.toFixed(1)}</span>
                        ) : (
                          <span>¥{item.price.toFixed(1)}</span>
                        )}
                      </td>
                      {/* 数量 */}
                      <td className="p-2.5 text-center">
                        <div className="inline-flex items-center gap-1 bg-[#FFFEEB] border border-slate-800 rounded-lg p-0.5 shadow-[1px_1px_0px_0px_#1A202C]">
                          <button
                            type="button"
                            onClick={() => handleAdjustItemQuantity(index, -1)}
                            className="w-4 h-4 bg-white hover:bg-slate-50 text-slate-700 rounded flex items-center justify-center border border-slate-300 transition-colors duration-150 cursor-pointer font-black text-xs"
                          >
                            -
                          </button>
                          <span className="text-xs font-black text-slate-800 w-4 text-center font-mono">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAdjustItemQuantity(index, 1)}
                            className="w-4 h-4 bg-white hover:bg-slate-50 text-slate-700 rounded flex items-center justify-center border border-slate-300 transition-colors duration-150 cursor-pointer font-black text-xs"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      {/* 操作 */}
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-300 hover:border-rose-400 rounded-lg flex items-center justify-center mx-auto transition-all cursor-pointer shadow-[1px_1px_0px_0px_rgba(225,29,72,0.2)] active:translate-y-0.5"
                          title="删除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </form>

    {/* Right side: Active Receipt viewer and pricing calculation */}
    <div className="md:col-span-5 md:sticky md:top-24 space-y-4">
        <div className="bg-[#FFFEEB] cute-card-border p-4 flex flex-wrap justify-between items-center gap-3 relative overflow-hidden">
          <div className="space-y-1">
            <div className="text-slate-500 text-[10px] flex flex-wrap items-center gap-1 font-black uppercase tracking-wider">
              <span>原价: <strong className="font-mono text-slate-700">¥{originalSubtotal.toFixed(1)}</strong></span>
              {totalDeduction > 0 && (
                <>
                  <span className="text-slate-300">|</span>
                  <span className="text-emerald-700 font-bold">抵扣: -¥{totalDeduction.toFixed(1)}</span>
                </>
              )}
              {isMemberDay && memberDayDiscountAmount > 0 && (
                <>
                  <span className="text-slate-300">|</span>
                  <span className="text-sky-700 font-bold animate-pulse">
                    🎉 会员日额外88折: -¥{memberDayDiscountAmount.toFixed(1)}
                  </span>
                </>
              )}
            </div>
            <div className="text-xs text-slate-800 font-black">
              应收款项总额:{' '}
              <span className="text-lg font-black font-mono text-slate-900">
                ¥{total.toFixed(1)}
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
          <Receipt 
            bill={selectedBill || draftBill} 
            customAlert={customAlert} 
            invoiceStyle={invoiceStyle} 
            showInvoiceToggle={true}
          />
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
