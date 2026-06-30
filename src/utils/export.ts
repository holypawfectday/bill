import { Bill } from '../types';

const escapeCSV = (val: string | number | undefined | null): string => {
  if (val === undefined || val === null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const getDaysDifference = (checkIn: string, checkOut: string): number => {
  if (!checkIn || !checkOut) return 1;
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return isNaN(diffDays) || diffDays <= 0 ? 1 : diffDays;
};

export const generateCSVContent = (bills: Bill[]): string => {
  const headers = [
    '会员编号', '月份', '日期', '天', '宠物姓名', '宠物类型', '宠物品种',
    '日托', '寄养', '度假', '陪护', '洗护', '美容', '洁牙', '游泳', '训练',
    '接送(次数)', '接送(折后费用)',
    '日托金额', '寄养金额', '度假金额', '陪护金额', '游泳金额', '洗护金额', '美容金额', '洁牙金额',
    '加班费（不打折）', '训练金额', '总金额',
    '会员类型', '消费平台', '美护备注', '备注'
  ];

  const rows: string[] = [];

  bills.forEach((bill) => {
    const isBillMember = bill.isMember || bill.memberTypeId === 'mem_2';

    // Group items of this bill by date
    const itemsByDate: { [date: string]: typeof bill.items } = {};
    bill.items.forEach((item) => {
      let itemDate = item.date || bill.checkOutDate || bill.createdAt.slice(0, 10);
      if (!itemsByDate[itemDate]) {
        itemsByDate[itemDate] = [];
      }
      itemsByDate[itemDate].push(item);
    });

    // Generate a separate row for each date
    Object.keys(itemsByDate).sort().forEach((dateStr) => {
      const items = itemsByDate[dateStr];

      let monthStr = '';
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        monthStr = `${d.getMonth() + 1}月`;
      }

      // Category quantities & amounts for this specific date
      let qtyDaycare = 0;
      let amtDaycare = 0;

      let qtyBoarding = 0;
      let amtBoarding = 0;

      let qtyHoliday = 0;
      let amtHoliday = 0;

      let qtyCare = 0;
      let amtCare = 0;

      let qtyWash = 0;
      let amtWash = 0;

      let qtyGrooming = 0;
      let amtGrooming = 0;

      let qtyDental = 0;
      let amtDental = 0;

      let qtySwim = 0;
      let amtSwim = 0;

      let qtyTraining = 0;
      let amtTraining = 0;

      let qtyTransfer = 0;
      let amtTransfer = 0;

      let amtOvertime = 0;

      const discount = bill.discount ?? 1.0;

      // Process each item in the subset for this date
      items.forEach((item) => {
        const name = item.name || '';
        const qty = item.quantity;

        if (name.includes('牙结石') || name.includes('洁牙')) {
          qtyDental += qty;
          amtDental += item.price * qty * discount;
        } else if (name.includes('游泳')) {
          qtySwim += qty;
          amtSwim += item.price * qty * discount;
        } else if (name.includes('加班') || name.includes('加班费')) {
          amtOvertime += item.price * qty; // 加班费不打折
        } else {
          if (name.includes('日托')) {
            qtyDaycare += qty;
            amtDaycare += item.price * qty * discount;
          } else if (name.includes('度假')) {
            qtyHoliday += qty;
            amtHoliday += item.price * qty * discount;
          } else if (name.includes('陪护')) {
            qtyCare += qty;
            amtCare += item.price * qty * discount;
          } else if (name.includes('舒适') || name.includes('阳光') || name.includes('寄养')) {
            qtyBoarding += qty;
            amtBoarding += item.price * qty * discount;
          } else if (name.includes('洗护') || name.includes('洗浴') || name.includes('SPA') || name.includes('药浴')) {
            qtyWash += qty;
            amtWash += item.price * qty * discount;
          } else if (name.includes('美容') || name.includes('修剪') || name.includes('剪指甲') || name.includes('刷牙') || name.includes('清理') || name.includes('屁股') || name.includes('拔毛') || name.includes('去油')) {
            qtyGrooming += qty;
            amtGrooming += item.price * qty * discount;
          } else if (name.includes('训练') || name.includes('课程')) {
            qtyTraining += qty;
            amtTraining += item.price * qty * discount;
          } else if (name.includes('接送') || name.includes('专车')) {
            qtyTransfer += qty;
            amtTransfer += item.price * qty * discount;
          } else {
            // General fallback based on any categories we can detect or defaults
            qtyDaycare += qty;
            amtDaycare += item.price * qty * discount;
          }
        }
      });

      const totalForDate = amtDaycare + amtBoarding + amtHoliday + amtCare + amtSwim + amtWash + amtGrooming + amtDental + amtOvertime + amtTraining + amtTransfer;

      const row = [
        bill.memberId || (isBillMember ? '会员顾客' : '非会员'), // 会员编号
        monthStr,                                              // 月份
        dateStr,                                               // 日期
        1,                                                     // 天 (每一行代表具体的日期)
        bill.dogName,                                          // 宠物姓名
        bill.petType || '狗狗',                                 // 宠物类型
        bill.dogBreed || '通用犬种',                             // 宠物品种
        qtyDaycare || '',                                      // 日托 (qty)
        qtyBoarding || '',                                     // 寄养 (qty)
        qtyHoliday || '',                                      // 度假 (qty)
        qtyCare || '',                                         // 陪护 (qty)
        qtyWash || '',                                         // 洗护 (qty)
        qtyGrooming || '',                                     // 美容 (qty)
        qtyDental || '',                                       // 洁牙 (qty)
        qtySwim || '',                                         // 游泳 (qty)
        qtyTraining || '',                                     // 训练 (qty)
        qtyTransfer || '',                                     // 接送(次数)
        amtTransfer ? amtTransfer.toFixed(2) : '',             // 接送(折后费用)
        amtDaycare ? amtDaycare.toFixed(2) : '',               // 日托金额
        amtBoarding ? amtBoarding.toFixed(2) : '',             // 寄养金额
        amtHoliday ? amtHoliday.toFixed(2) : '',               // 度假金额
        amtCare ? amtCare.toFixed(2) : '',                     // 陪护金额
        amtSwim ? amtSwim.toFixed(2) : '',                     // 游泳金额
        amtWash ? amtWash.toFixed(2) : '',                     // 洗护金额
        amtGrooming ? amtGrooming.toFixed(2) : '',             // 美容金额
        amtDental ? amtDental.toFixed(2) : '',                 // 洁牙金额
        amtOvertime ? amtOvertime.toFixed(2) : '',             // 加班费（不打折）
        amtTraining ? amtTraining.toFixed(2) : '',             // 训练金额
        totalForDate.toFixed(2),                               // 总金额
        bill.memberTypeName,                                   // 会员类型
        bill.discountPreset,                                   // 消费平台
        bill.groomingNotes || '',                              // 美护备注
        bill.notes || ''                                       // 备注
      ].map(escapeCSV).join(',');

      rows.push(row);
    });
  });

  return [headers.join(','), ...rows].join('\n');
};

export const downloadCSV = (bills: Bill[], filename: string = '宠物账单数据导出.csv') => {
  const csvContent = generateCSVContent(bills);
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
