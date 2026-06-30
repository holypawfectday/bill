/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ServiceItem {
  id: string;
  category: string; // e.g. "日托", "寄养", "洗护", "美容", "训练", "接送"
  subCategory?: string; // e.g. "狗狗洗浴", "猫猫洗浴", "狗狗美容", "猫猫美容", "狗狗专项护理", "猫猫专项护理"
  name: string;
  price: number;
  dianpingPrice?: number; // 大众点评专属价格
  unit: string; // e.g. "次", "天", "份"
}

export interface MemberType {
  id: string;
  name: string;
  discount: number; // 0.85 means 15% off
}

export interface BillItem {
  serviceId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  originalPrice?: number;
  date?: string; // 服务日期
  discountPreset?: '原价' | '88折' | '8折' | '5折' | '7折' | '6折' | '自定' | '大众点评';
  customDiscountValue?: number;
  appliedCoupon?: 'none' | 'daycare' | 'boarding' | 'special_care' | 'wash' | 'transfer' | 'dental';
  memberDayStacked?: boolean;
}

export interface Bill {
  id: string;
  billNumber: string;
  dogName: string;
  dogBreed: string;
  petType?: '狗狗' | '猫猫';
  petWeight?: number;
  checkInDate: string;  // 入住日期
  checkOutDate: string; // 离园时间
  isMember: boolean;    // 是否会员 (true = 会员, false = 非会员)
  discountPreset: '原价' | '88折' | '8折' | '5折' | '7折' | '6折' | '100%' | '88%' | '80%' | '自定' | '大众点评';
  customDiscountValue?: number; // 比如 8.5 表示 8.5折 (0.85)
  ownerPhone?: string;
  memberTypeId: string;
  memberTypeName: string;
  memberId?: string; // 会员编号
  discount: number;
  items: BillItem[];
  subtotal: number;
  total: number;
  paymentMethod?: '微信支付' | '支付宝' | '会员卡扣款' | '现金' | '其他'; // 现在非必填或不需要，可以为可选
  notes?: string;
  groomingNotes?: string; // 美护备注
  createdAt: string; // ISO String
  isHoliday?: boolean; // 是否法定节假日
  isMemberDay?: boolean; // 是否会员日
  memberDayDiscountAmount?: number; // 会员日额外折扣金额
  // 权益券抵扣明细
  useDaycareCoupon?: boolean | number;
  useBoardingUpgradeCoupon?: boolean | number;
  useSpecialCareUpgradeCoupon?: boolean | number;
  useWashUpgradeCoupon?: boolean | number;
  useTransferCoupon?: boolean | number;
  useDentalCoupon?: boolean | number;
}

export interface MemberPet {
  name: string;
  birthday?: string;
}

export interface CouponAsset {
  total: number;
  unused: number;
  used: number;
}

export interface MemberAssetAccount {
  memberId: string; // 例如 "3", "14", "未知/未录入"
  pets: MemberPet[];
  tier: '铂金年卡👑' | '钻石年卡💎' | '黄金年卡🌼';
  validityStart?: string;
  validityEnd?: string;
  memberDay?: string; // 会员日日期 黄金/钻石 是xx号, 铂金是周几
  daycareCoupons: CouponAsset;           // 全天日托券
  holidayCoupons: CouponAsset;           // 度假升级房券
  specialCareCoupons?: CouponAsset;      // 特殊陪护房升级券 (仅钻石年卡有)
  washCoupons: CouponAsset;              // 高端洗护升级券
  transferCoupons?: CouponAsset;         // 10km同城接送券 (仅钻石年卡有, 铂金也有)
}

export interface InvoiceStyle {
  logoUrl?: string; // Empty or undefined means use the default vector /logo.png
  logoSize: number; // in px
  logoSpacing: number; // margin-bottom in px
  englishTitle: string;
  englishFontSize: number; // in px
  englishChineseSpacing: number; // in px
  chineseTitle: string;
  chineseFontSize: number; // in px
  tableHeaderBg: string; // color hex (e.g. #A4B9D4)
  tableHeaderTextColor: string; // color hex
  emptyRowsCount: number; // e.g. 10
  containerWidth: number; // in mm (e.g. 525)
  containerPadding: number; // in px (e.g. 40)
  fontSizeHeader: number; // in px (e.g. 14)
  fontSizeTable: number; // in px (e.g. 12)
  doubleUnderlineColor: string; // e.g. #1A202C
  doubleUnderlineThickness: number; // e.g. 3
  hideStoreName: boolean; // whether to hide the English and Chinese store names
  tableBorderColor: string; // table grid lines/borders color hex
  fontFamilyHeader: string; // font family for basic info section
  fontFamilyTable: string; // font family for details table section
  fontFamilyBase: string; // font family for the overall document labels
  fontFamilyAddress?: string; // font family for the address block
  addressLineHeight?: string; // line-height for address block
  headerTableSpacing?: number; // spacing between metadata grid and table details in px
  addressFontSize?: number; // address block font size in px
  showRemarksDivider?: boolean; // whether to show a divider line above the remarks
  remarksDividerSpacing?: number; // spacing/interval above the remarks in px
}


