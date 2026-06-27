import { MemberAssetAccount } from '../types';

const UNPADDED_INITIAL_MEMBER_ASSETS: MemberAssetAccount[] = [
  // 👑 铂金年卡会员 (最高级)
  {
    memberId: '1',
    pets: [{ name: '奥利奥' }, { name: '雪球' }],
    tier: '铂金年卡👑',
    validityStart: '2026-06-01',
    validityEnd: '2027-06-01',
    daycareCoupons: { total: 1, unused: 1, used: 0 },
    holidayCoupons: { total: 0, unused: 0, used: 0 },
    washCoupons: { total: 1, unused: 1, used: 0 },
    transferCoupons: { total: 3, unused: 3, used: 0 }
  },
  {
    memberId: '2',
    pets: [{ name: '可乐' }],
    tier: '铂金年卡👑',
    validityStart: '2026-05-15',
    validityEnd: '2027-05-15',
    daycareCoupons: { total: 1, unused: 1, used: 0 },
    holidayCoupons: { total: 0, unused: 0, used: 0 },
    washCoupons: { total: 1, unused: 1, used: 0 },
    transferCoupons: { total: 3, unused: 3, used: 0 }
  },
  {
    memberId: '53',
    pets: [{ name: '奶酪' }],
    tier: '钻石年卡💎',
    validityStart: '2026-06-01',
    validityEnd: '2027-06-01',
    daycareCoupons: { total: 2, unused: 2, used: 0 },
    holidayCoupons: { total: 2, unused: 2, used: 0 },
    specialCareCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 },
    transferCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '34',
    pets: [{ name: '好丽友' }],
    tier: '黄金年卡🌼',
    validityStart: '2026-06-01',
    validityEnd: '2027-06-01',
    daycareCoupons: { total: 1, unused: 1, used: 0 },
    holidayCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 }
  },
  // 💎 钻石年卡会员 (共28个账户)
  {
    memberId: '3',
    pets: [{ name: 'Carson' }, { name: 'Mayson', birthday: '2026-05-10' }],
    tier: '钻石年卡💎',
    validityStart: '2026-02-12',
    validityEnd: '2027-02-12',
    daycareCoupons: { total: 2, unused: 2, used: 0 },
    holidayCoupons: { total: 2, unused: 2, used: 0 },
    specialCareCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 },
    transferCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '14',
    pets: [{ name: '天天' }],
    tier: '钻石年卡💎',
    daycareCoupons: { total: 2, unused: 2, used: 0 },
    holidayCoupons: { total: 2, unused: 2, used: 0 },
    specialCareCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 },
    transferCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '20',
    pets: [{ name: '乌贼' }],
    tier: '钻石年卡💎',
    daycareCoupons: { total: 2, unused: 0, used: 2 },
    holidayCoupons: { total: 2, unused: 0, used: 2 },
    specialCareCoupons: { total: 1, unused: 0, used: 1 },
    washCoupons: { total: 2, unused: 0, used: 2 },
    transferCoupons: { total: 2, unused: 0, used: 2 }
  },
  {
    memberId: '24',
    pets: [{ name: 'Chucky', birthday: '2026-08-17' }, { name: 'Gummy', birthday: '2026-02-02' }],
    tier: '钻石年卡💎',
    daycareCoupons: { total: 2, unused: 2, used: 0 },
    holidayCoupons: { total: 2, unused: 2, used: 0 },
    specialCareCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 },
    transferCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '38',
    pets: [{ name: '汤达人' }],
    tier: '钻石年卡💎',
    daycareCoupons: { total: 2, unused: 2, used: 0 },
    holidayCoupons: { total: 2, unused: 2, used: 0 },
    specialCareCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 },
    transferCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '92',
    pets: [{ name: '金宝', birthday: '2023-12-20' }],
    tier: '钻石年卡💎',
    validityStart: '2026-01-02',
    validityEnd: '2027-01-01',
    daycareCoupons: { total: 2, unused: 2, used: 0 },
    holidayCoupons: { total: 2, unused: 2, used: 0 },
    specialCareCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 },
    transferCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '96',
    pets: [{ name: '布雷克', birthday: '2025-08-23' }, { name: '振国' }],
    tier: '钻石年卡💎',
    validityStart: '2026-01-18',
    validityEnd: '2027-01-17',
    daycareCoupons: { total: 2, unused: 2, used: 0 },
    holidayCoupons: { total: 2, unused: 2, used: 0 },
    specialCareCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 },
    transferCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '99',
    pets: [{ name: '巴桑', birthday: '2024-01-04' }],
    tier: '钻石年卡💎',
    validityStart: '2026-01-19',
    validityEnd: '2027-01-18',
    daycareCoupons: { total: 2, unused: 2, used: 0 },
    holidayCoupons: { total: 2, unused: 2, used: 0 },
    specialCareCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 },
    transferCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '123',
    pets: [{ name: '汤圆妹妹', birthday: '2025-01-05' }],
    tier: '钻石年卡💎',
    validityStart: '2026-01-23',
    validityEnd: '2027-01-22',
    daycareCoupons: { total: 2, unused: 2, used: 0 },
    holidayCoupons: { total: 2, unused: 2, used: 0 },
    specialCareCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 },
    transferCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '122',
    pets: [{ name: 'Ollie腊肠', birthday: '2024-05-20' }],
    tier: '钻石年卡💎',
    validityStart: '2026-01-28',
    validityEnd: '2027-01-27',
    daycareCoupons: { total: 2, unused: 2, used: 0 },
    holidayCoupons: { total: 2, unused: 2, used: 0 },
    specialCareCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 },
    transferCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '120',
    pets: [{ name: 'Bubble', birthday: '2025-08-10' }],
    tier: '钻石年卡💎',
    validityStart: '2026-01-30',
    validityEnd: '2027-01-29',
    daycareCoupons: { total: 2, unused: 2, used: 0 },
    holidayCoupons: { total: 2, unused: 0, used: 2 },
    specialCareCoupons: { total: 1, unused: 0, used: 1 },
    washCoupons: { total: 2, unused: 2, used: 0 },
    transferCoupons: { total: 2, unused: 0, used: 2 }
  },
  {
    memberId: '119',
    pets: [{ name: '吉娃娃牛牛', birthday: '2025-04-27' }],
    tier: '钻石年卡💎',
    validityStart: '2026-02-03',
    validityEnd: '2027-02-02',
    daycareCoupons: { total: 2, unused: 2, used: 0 },
    holidayCoupons: { total: 2, unused: 2, used: 0 },
    specialCareCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 },
    transferCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '116',
    pets: [{ name: 'Pikku', birthday: '2024-08-16' }, { name: 'Momoko', birthday: '2025-03-16' }],
    tier: '钻石年卡💎',
    validityStart: '2026-02-24',
    validityEnd: '2027-02-23',
    daycareCoupons: { total: 2, unused: 2, used: 0 },
    holidayCoupons: { total: 2, unused: 2, used: 0 },
    specialCareCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 },
    transferCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '113',
    pets: [{ name: '23', birthday: '2024-06-07' }],
    tier: '钻石年卡💎',
    validityStart: '2026-03-02',
    validityEnd: '2027-03-01',
    daycareCoupons: { total: 2, unused: 2, used: 0 },
    holidayCoupons: { total: 2, unused: 2, used: 0 },
    specialCareCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 },
    transferCoupons: { total: 2, unused: 0, used: 2 }
  },
  {
    memberId: '103',
    pets: [{ name: '酱酱', birthday: '2025-08-01' }],
    tier: '钻石年卡💎',
    validityStart: '2026-03-07',
    validityEnd: '2027-03-06',
    daycareCoupons: { total: 2, unused: 2, used: 0 },
    holidayCoupons: { total: 2, unused: 2, used: 0 },
    specialCareCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 },
    transferCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '102',
    pets: [{ name: '汤圆弟弟', birthday: '2024-09-14' }],
    tier: '钻石年卡💎',
    validityStart: '2026-03-07',
    validityEnd: '2027-03-06',
    daycareCoupons: { total: 2, unused: 2, used: 0 },
    holidayCoupons: { total: 2, unused: 2, used: 0 },
    specialCareCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 },
    transferCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '101',
    pets: [{ name: 'Ollie边牧', birthday: '2022-03-27' }],
    tier: '钻石年卡💎',
    validityStart: '2026-03-08',
    validityEnd: '2027-03-07',
    daycareCoupons: { total: 2, unused: 1, used: 1 },
    holidayCoupons: { total: 2, unused: 2, used: 0 },
    specialCareCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 },
    transferCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '105',
    pets: [{ name: '太白' }],
    tier: '钻石年卡💎',
    validityStart: '2026-03-14',
    validityEnd: '2027-03-14',
    daycareCoupons: { total: 2, unused: 2, used: 0 },
    holidayCoupons: { total: 2, unused: 2, used: 0 },
    specialCareCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 },
    transferCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '108',
    pets: [{ name: 'Louis' }, { name: 'Nova' }],
    tier: '钻石年卡💎',
    validityStart: '2026-03-18',
    validityEnd: '2027-03-18',
    daycareCoupons: { total: 2, unused: 1, used: 1 },
    holidayCoupons: { total: 2, unused: 2, used: 0 },
    specialCareCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 1, used: 1 },
    transferCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '110',
    pets: [{ name: 'Wolfie' }],
    tier: '钻石年卡💎',
    validityStart: '2026-03-30',
    validityEnd: '2027-03-30',
    daycareCoupons: { total: 2, unused: 2, used: 0 },
    holidayCoupons: { total: 2, unused: 2, used: 0 },
    specialCareCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 },
    transferCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '125',
    pets: [{ name: '波波' }],
    tier: '钻石年卡💎',
    validityStart: '2026-04-11',
    validityEnd: '2027-04-11',
    daycareCoupons: { total: 2, unused: 1, used: 1 },
    holidayCoupons: { total: 2, unused: 2, used: 0 },
    specialCareCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 },
    transferCoupons: { total: 2, unused: 1, used: 1 }
  },
  {
    memberId: '129',
    pets: [{ name: '初初', birthday: '2025-10-29' }],
    tier: '钻石年卡💎',
    validityStart: '2026-04-23',
    validityEnd: '2027-04-23',
    daycareCoupons: { total: 2, unused: 2, used: 0 },
    holidayCoupons: { total: 2, unused: 2, used: 0 },
    specialCareCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 },
    transferCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '130',
    pets: [{ name: '斑花', birthday: '2020-02-02' }, { name: '妹妹', birthday: '2025-11-05' }],
    tier: '钻石年卡💎',
    validityStart: '2026-04-26',
    validityEnd: '2027-04-26',
    daycareCoupons: { total: 2, unused: 0, used: 2 },
    holidayCoupons: { total: 2, unused: 2, used: 0 },
    specialCareCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 0, used: 2 },
    transferCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '136',
    pets: [{ name: '百迎', birthday: '2025-07-08' }],
    tier: '钻石年卡💎',
    validityStart: '2026-04-12',
    validityEnd: '2027-04-12',
    daycareCoupons: { total: 2, unused: 2, used: 0 },
    holidayCoupons: { total: 2, unused: 2, used: 0 },
    specialCareCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 },
    transferCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '137',
    pets: [{ name: 'Money' }],
    tier: '钻石年卡💎',
    validityStart: '2026-05-15',
    validityEnd: '2027-05-15',
    daycareCoupons: { total: 2, unused: 2, used: 0 },
    holidayCoupons: { total: 2, unused: 2, used: 0 },
    specialCareCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 },
    transferCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '140',
    pets: [{ name: '王六一' }],
    tier: '钻石年卡💎',
    validityStart: '2026-04-21',
    validityEnd: '2027-04-21',
    daycareCoupons: { total: 2, unused: 2, used: 0 },
    holidayCoupons: { total: 2, unused: 2, used: 0 },
    specialCareCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 },
    transferCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '138',
    pets: [{ name: 'Ruby' }],
    tier: '钻石年卡💎',
    validityStart: '2026-04-12',
    validityEnd: '2027-04-12',
    daycareCoupons: { total: 2, unused: 2, used: 0 },
    holidayCoupons: { total: 2, unused: 2, used: 0 },
    specialCareCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 },
    transferCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '142',
    pets: [{ name: 'Nafla' }],
    tier: '钻石年卡💎',
    daycareCoupons: { total: 2, unused: 2, used: 0 },
    holidayCoupons: { total: 2, unused: 2, used: 0 },
    specialCareCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 },
    transferCoupons: { total: 2, unused: 2, used: 0 }
  },

  // 🌼 黄金年卡会员
  {
    memberId: '未知/未录入',
    pets: [
      { name: 'Stormi' }, { name: 'Lulu' }, { name: '肖得宝' }, { name: '煤球' },
      { name: 'Misika' }, { name: '小布溜' }, { name: 'Mango' }, { name: 'Lucky' }
    ],
    tier: '黄金年卡🌼',
    daycareCoupons: { total: 1, unused: 0, used: 1 },
    holidayCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '17',
    pets: [{ name: '豆来米' }],
    tier: '黄金年卡🌼',
    daycareCoupons: { total: 1, unused: 1, used: 0 },
    holidayCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '26',
    pets: [{ name: '米宝' }],
    tier: '黄金年卡🌼',
    validityStart: '2026-01-30',
    validityEnd: '2027-01-29',
    daycareCoupons: { total: 1, unused: 1, used: 0 },
    holidayCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '47',
    pets: [{ name: 'Remi' }],
    tier: '黄金年卡🌼',
    daycareCoupons: { total: 1, unused: 1, used: 0 },
    holidayCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '51',
    pets: [{ name: '草莓' }],
    tier: '黄金年卡🌼',
    validityStart: '2025-12-21',
    validityEnd: '2026-12-20',
    daycareCoupons: { total: 1, unused: 1, used: 0 },
    holidayCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '68',
    pets: [{ name: '方方' }],
    tier: '黄金年卡🌼',
    daycareCoupons: { total: 1, unused: 1, used: 0 },
    holidayCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '69',
    pets: [{ name: '小屁' }],
    tier: '黄金年卡🌼',
    daycareCoupons: { total: 1, unused: 1, used: 0 },
    holidayCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '88',
    pets: [{ name: '边牧牛奶' }],
    tier: '黄金年卡🌼',
    validityStart: '2025-12-31',
    validityEnd: '2026-12-30',
    daycareCoupons: { total: 1, unused: 1, used: 0 },
    holidayCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '89',
    pets: [{ name: '柴犬妹妹' }],
    tier: '黄金年卡🌼',
    validityStart: '2026-02-12',
    validityEnd: '2027-02-11',
    daycareCoupons: { total: 1, unused: 1, used: 0 },
    holidayCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '121',
    pets: [{ name: '妥妥' }],
    tier: '黄金年卡🌼',
    validityStart: '2026-01-28',
    validityEnd: '2027-01-27',
    daycareCoupons: { total: 1, unused: 1, used: 0 },
    holidayCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '112',
    pets: [{ name: 'Gidi' }, { name: '嘟嘟' }],
    tier: '黄金年卡🌼',
    daycareCoupons: { total: 1, unused: 1, used: 0 },
    holidayCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '104',
    pets: [{ name: '哈莉克' }],
    tier: '黄金年卡🌼',
    daycareCoupons: { total: 1, unused: 1, used: 0 },
    holidayCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '106',
    pets: [{ name: '柚柚' }],
    tier: '黄金年卡🌼',
    daycareCoupons: { total: 1, unused: 1, used: 0 },
    holidayCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '107',
    pets: [{ name: '肉包' }],
    tier: '黄金年卡🌼',
    daycareCoupons: { total: 1, unused: 1, used: 0 },
    holidayCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '95',
    pets: [{ name: 'Miso' }],
    tier: '黄金年卡🌼',
    validityStart: '2026-01-12',
    validityEnd: '2027-01-11',
    daycareCoupons: { total: 1, unused: 1, used: 0 },
    holidayCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '109',
    pets: [{ name: 'DQ' }],
    tier: '黄金年卡🌼',
    daycareCoupons: { total: 1, unused: 0, used: 1 },
    holidayCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '111',
    pets: [{ name: 'Polo', birthday: '2026-03-30' }],
    tier: '黄金年卡🌼',
    validityStart: '2026-03-30',
    validityEnd: '2027-03-30',
    daycareCoupons: { total: 1, unused: 0, used: 1 },
    holidayCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '131',
    pets: [{ name: '哼唧' }],
    tier: '黄金年卡🌼',
    daycareCoupons: { total: 1, unused: 0, used: 1 },
    holidayCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '132',
    pets: [{ name: '勺子' }],
    tier: '黄金年卡🌼',
    daycareCoupons: { total: 1, unused: 1, used: 0 },
    holidayCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '133',
    pets: [{ name: '鲁鲁' }],
    tier: '黄金年卡🌼',
    daycareCoupons: { total: 1, unused: 1, used: 0 },
    holidayCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '134',
    pets: [{ name: '豆丁' }],
    tier: '黄金年卡🌼',
    daycareCoupons: { total: 1, unused: 1, used: 0 },
    holidayCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '135',
    pets: [{ name: 'Olly' }],
    tier: '黄金年卡🌼',
    daycareCoupons: { total: 1, unused: 1, used: 0 },
    holidayCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '141',
    pets: [{ name: 'Jet' }],
    tier: '黄金年卡🌼',
    daycareCoupons: { total: 1, unused: 1, used: 0 },
    holidayCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 }
  },
  {
    memberId: '144',
    pets: [{ name: '瓜皮' }],
    tier: '黄金年卡🌼',
    daycareCoupons: { total: 1, unused: 1, used: 0 },
    holidayCoupons: { total: 1, unused: 1, used: 0 },
    washCoupons: { total: 2, unused: 2, used: 0 }
  }
];

export const INITIAL_MEMBER_ASSETS: MemberAssetAccount[] = UNPADDED_INITIAL_MEMBER_ASSETS.map(acc => ({
  ...acc,
  memberId: /^\d+$/.test(acc.memberId) ? acc.memberId.padStart(12, '0') : acc.memberId
}));
