/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ServiceItem, MemberType, InvoiceStyle } from './types';

export const DEFAULT_SERVICES: ServiceItem[] = [
  // === 日托 ===
  { id: 'srv_dt_1', category: '日托', subCategory: '宠物日托', name: '全天日托 (含5km免费上门接送+1小时训练课程)', price: 299, unit: '天' },
  { id: 'srv_dt_2', category: '日托', subCategory: '宠物日托', name: '半天日托', price: 179, unit: '天' },

  // === 寄养 ===
  { id: 'srv_jy_1', category: '寄养', subCategory: '宠物寄养', name: '温馨舒适房', price: 359, unit: '天' },
  { id: 'srv_jy_2', category: '寄养', subCategory: '宠物寄养', name: '豪华阳光房', price: 429, unit: '天' },
  { id: 'srv_jy_3', category: '寄养', subCategory: '宠物寄养', name: '乐园度假房', price: 538, unit: '天' },
  { id: 'srv_jy_4', category: '寄养', subCategory: '宠物寄养', name: '豪华乐园度假房', price: 608, unit: '天' },
  { id: 'srv_jy_5', category: '寄养', subCategory: '宠物寄养', name: '特殊陪护房', price: 649, unit: '天' },

  // === 洗护 ===
  { id: 'srv_xh_d03_1', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (0-3kg 定制洗护)', price: 248, unit: '次' },
  { id: 'srv_xh_d03_2', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (0-3kg 赛级洗护)', price: 338, unit: '次' },
  { id: 'srv_xh_d03_3', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (0-3kg SPA)', price: 100, unit: '次' },
  { id: 'srv_xh_d03_4', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (0-3kg 药浴)', price: 88, unit: '次' },

  { id: 'srv_xh_d35_1', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (3-5kg 定制洗护)', price: 268, unit: '次' },
  { id: 'srv_xh_d35_2', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (3-5kg 赛级洗护)', price: 378, unit: '次' },
  { id: 'srv_xh_d35_3', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (3-5kg SPA)', price: 100, unit: '次' },
  { id: 'srv_xh_d35_4', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (3-5kg 药浴)', price: 88, unit: '次' },

  { id: 'srv_xh_d510_1', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (5-10kg 定制洗护)', price: 298, unit: '次' },
  { id: 'srv_xh_d510_2', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (5-10kg 赛级洗护)', price: 428, unit: '次' },
  { id: 'srv_xh_d510_3', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (5-10kg SPA)', price: 120, unit: '次' },
  { id: 'srv_xh_d510_4', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (5-10kg 药浴)', price: 118, unit: '次' },

  { id: 'srv_xh_d1015_1', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (10-15kg 定制洗护)', price: 348, unit: '次' },
  { id: 'srv_xh_d1015_2', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (10-15kg 赛级洗护)', price: 488, unit: '次' },
  { id: 'srv_xh_d1015_3', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (10-15kg SPA)', price: 120, unit: '次' },
  { id: 'srv_xh_d1015_4', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (10-15kg 药浴)', price: 118, unit: '次' },

  { id: 'srv_xh_d1520_1', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (15-20kg 定制洗护)', price: 398, unit: '次' },
  { id: 'srv_xh_d1520_2', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (15-20kg 赛级洗护)', price: 558, unit: '次' },
  { id: 'srv_xh_d1520_3', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (15-20kg SPA)', price: 150, unit: '次' },
  { id: 'srv_xh_d1520_4', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (15-20kg 药浴)', price: 158, unit: '次' },

  { id: 'srv_xh_d2025_1', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (20-25kg 定制洗护)', price: 468, unit: '次' },
  { id: 'srv_xh_d2025_2', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (20-25kg 赛级洗护)', price: 638, unit: '次' },
  { id: 'srv_xh_d2025_3', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (20-25kg SPA)', price: 150, unit: '次' },
  { id: 'srv_xh_d2025_4', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (20-25kg 药浴)', price: 158, unit: '次' },

  { id: 'srv_xh_d2530_1', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (25-30kg 定制洗护)', price: 558, unit: '次' },
  { id: 'srv_xh_d2530_2', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (25-30kg 赛级洗护)', price: 728, unit: '次' },
  { id: 'srv_xh_d2530_3', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (25-30kg SPA)', price: 200, unit: '次' },
  { id: 'srv_xh_d2530_4', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (25-30kg 药浴)', price: 158, unit: '次' },

  { id: 'srv_xh_d3035_1', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (30-35kg 定制洗护)', price: 658, unit: '次' },
  { id: 'srv_xh_d3035_2', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (30-35kg 赛级洗护)', price: 828, unit: '次' },
  { id: 'srv_xh_d3035_3', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (30-35kg SPA)', price: 200, unit: '次' },
  { id: 'srv_xh_d3035_4', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (30-35kg 药浴)', price: 198, unit: '次' },

  { id: 'srv_xh_d3540_1', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (35-40kg 定制洗护)', price: 768, unit: '次' },
  { id: 'srv_xh_d3540_2', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (35-40kg 赛级洗护)', price: 938, unit: '次' },
  { id: 'srv_xh_d3540_3', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (35-40kg SPA)', price: 260, unit: '次' },
  { id: 'srv_xh_d3540_4', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (35-40kg 药浴)', price: 198, unit: '次' },

  { id: 'srv_xh_d40_1', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (40kg以上 定制洗护)', price: 898, unit: '次' },
  { id: 'srv_xh_d40_2', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (40kg以上 赛级洗护)', price: 1068, unit: '次' },
  { id: 'srv_xh_d40_3', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (40kg以上 SPA)', price: 260, unit: '次' },
  { id: 'srv_xh_d40_4', category: '洗护', subCategory: '狗狗洗浴', name: '狗狗洗护 (40kg以上 药浴)', price: 198, unit: '次' },

  // 猫猫洗浴
  { id: 'srv_xh_c03_1', category: '洗护', subCategory: '猫猫洗浴', name: '猫猫洗护 (0-3kg 定制洗护/短毛)', price: 248, unit: '次' },
  { id: 'srv_xh_c03_2', category: '洗护', subCategory: '猫猫洗浴', name: '猫猫洗护 (0-3kg 定制洗护/中毛)', price: 308, unit: '次' },
  { id: 'srv_xh_c03_3', category: '洗护', subCategory: '猫猫洗浴', name: '猫猫洗护 (0-3kg 赛级洗护/中毛)', price: 558, unit: '次' },
  { id: 'srv_xh_c03_4', category: '洗护', subCategory: '猫猫洗浴', name: '猫猫洗护 (0-3kg SPA)', price: 150, unit: '次' },

  { id: 'srv_xh_c35_1', category: '洗护', subCategory: '猫猫洗浴', name: '猫猫洗护 (3-5kg 定制洗护/短毛)', price: 268, unit: '次' },
  { id: 'srv_xh_c35_2', category: '洗护', subCategory: '猫猫洗浴', name: '猫猫洗护 (3-5kg 定制洗护/中毛)', price: 338, unit: '次' },
  { id: 'srv_xh_c35_3', category: '洗护', subCategory: '猫猫洗浴', name: '猫猫洗护 (3-5kg 赛级洗护/中毛)', price: 598, unit: '次' },
  { id: 'srv_xh_c35_4', category: '洗护', subCategory: '猫猫洗浴', name: '猫猫洗护 (3-5kg SPA)', price: 150, unit: '次' },

  { id: 'srv_xh_c58_1', category: '洗护', subCategory: '猫猫洗浴', name: '猫猫洗护 (5-8kg 定制洗护/短毛)', price: 288, unit: '次' },
  { id: 'srv_xh_c58_2', category: '洗护', subCategory: '猫猫洗浴', name: '猫猫洗护 (5-8kg 定制洗护/中毛)', price: 368, unit: '次' },
  { id: 'srv_xh_c58_3', category: '洗护', subCategory: '猫猫洗浴', name: '猫猫洗护 (5-8kg 赛级洗护/中毛)', price: 638, unit: '次' },
  { id: 'srv_xh_c58_4', category: '洗护', subCategory: '猫猫洗浴', name: '猫猫洗护 (5-8kg SPA)', price: 150, unit: '次' },

  { id: 'srv_xh_c8_1', category: '洗护', subCategory: '猫猫洗浴', name: '猫猫洗护 (8kg以上 定制洗护/短毛)', price: 308, unit: '次' },
  { id: 'srv_xh_c8_2', category: '洗护', subCategory: '猫猫洗浴', name: '猫猫洗护 (8kg以上 定制洗护/中毛)', price: 398, unit: '次' },
  { id: 'srv_xh_c8_3', category: '洗护', subCategory: '猫猫洗浴', name: '猫猫洗护 (8kg以上 赛级洗护/中毛)', price: 688, unit: '次' },
  { id: 'srv_xh_c8_4', category: '洗护', subCategory: '猫猫洗浴', name: '猫猫洗护 (8kg以上 SPA)', price: 150, unit: '次' },

  // === 美容 ===
  { id: 'srv_mr_d03_1', category: '美容', subCategory: '狗狗美容', name: '狗狗美容 (0-3kg 全身剃剪)', price: 120, unit: '次' },
  { id: 'srv_mr_d03_2', category: '美容', subCategory: '狗狗美容', name: '狗狗美容 (0-3kg 背部剃剪)', price: 200, unit: '次' },
  { id: 'srv_mr_d03_3', category: '美容', subCategory: '狗狗美容', name: '狗狗美容 (0-3kg 全身手剪)', price: 260, unit: '次' },

  { id: 'srv_mr_d35_1', category: '美容', subCategory: '狗狗美容', name: '狗狗美容 (3-5kg 全身剃剪)', price: 150, unit: '次' },
  { id: 'srv_mr_d35_2', category: '美容', subCategory: '狗狗美容', name: '狗狗美容 (3-5kg 背部剃剪)', price: 230, unit: '次' },
  { id: 'srv_mr_d35_3', category: '美容', subCategory: '狗狗美容', name: '狗狗美容 (3-5kg 全身手剪)', price: 290, unit: '次' },

  { id: 'srv_mr_d510_1', category: '美容', subCategory: '狗狗美容', name: '狗狗美容 (5-10kg 全身剃剪)', price: 180, unit: '次' },
  { id: 'srv_mr_d510_2', category: '美容', subCategory: '狗狗美容', name: '狗狗美容 (5-10kg 背部剃剪)', price: 260, unit: '次' },
  { id: 'srv_mr_d510_3', category: '美容', subCategory: '狗狗美容', name: '狗狗美容 (5-10kg 全身手剪)', price: 330, unit: '次' },

  { id: 'srv_mr_d1015_1', category: '美容', subCategory: '狗狗美容', name: '狗狗美容 (10-15kg 全身剃剪)', price: 210, unit: '次' },
  { id: 'srv_mr_d1015_2', category: '美容', subCategory: '狗狗美容', name: '狗狗美容 (10-15kg 背部剃剪)', price: 300, unit: '次' },
  { id: 'srv_mr_d1015_3', category: '美容', subCategory: '狗狗美容', name: '狗狗美容 (10-15kg 全身手剪)', price: 380, unit: '次' },

  { id: 'srv_mr_d1520_1', category: '美容', subCategory: '狗狗美容', name: '狗狗美容 (15-20kg 全身剃剪)', price: 240, unit: '次' },
  { id: 'srv_mr_d1520_2', category: '美容', subCategory: '狗狗美容', name: '狗狗美容 (15-20kg 背部剃剪)', price: 350, unit: '次' },
  { id: 'srv_mr_d1520_3', category: '美容', subCategory: '狗狗美容', name: '狗狗美容 (15-20kg 全身手剪)', price: 450, unit: '次' },

  { id: 'srv_mr_d2025_1', category: '美容', subCategory: '狗狗美容', name: '狗狗美容 (20-25kg 全身剃剪)', price: 270, unit: '次' },
  { id: 'srv_mr_d2025_2', category: '美容', subCategory: '狗狗美容', name: '狗狗美容 (20-25kg 背部剃剪)', price: 420, unit: '次' },
  { id: 'srv_mr_d2025_3', category: '美容', subCategory: '狗狗美容', name: '狗狗美容 (20-25kg 全身手剪)', price: 520, unit: '次' },

  { id: 'srv_mr_d2530_1', category: '美容', subCategory: '狗狗美容', name: '狗狗美容 (25-30kg 全身剃剪)', price: 300, unit: '次' },
  { id: 'srv_mr_d2530_2', category: '美容', subCategory: '狗狗美容', name: '狗狗美容 (25-30kg 背部剃剪)', price: 490, unit: '次' },
  { id: 'srv_mr_d2530_3', category: '美容', subCategory: '狗狗美容', name: '狗狗美容 (25-30kg 全身手剪)', price: 590, unit: '次' },

  { id: 'srv_mr_d3035_1', category: '美容', subCategory: '狗狗美容', name: '狗狗美容 (30-35kg 全身剃剪)', price: 330, unit: '次' },
  { id: 'srv_mr_d3035_2', category: '美容', subCategory: '狗狗美容', name: '狗狗美容 (30-35kg 背部剃剪)', price: 560, unit: '次' },
  { id: 'srv_mr_d3035_3', category: '美容', subCategory: '狗狗美容', name: '狗狗美容 (30-35kg 全身手剪)', price: 680, unit: '次' },

  { id: 'srv_mr_d3540_1', category: '美容', subCategory: '狗狗美容', name: '狗狗美容 (35-40kg 全身剃剪)', price: 360, unit: '次' },
  { id: 'srv_mr_d3540_2', category: '美容', subCategory: '狗狗美容', name: '狗狗美容 (35-40kg 背部剃剪)', price: 630, unit: '次' },
  { id: 'srv_mr_d3540_3', category: '美容', subCategory: '狗狗美容', name: '狗狗美容 (35-40kg 全身手剪)', price: 770, unit: '次' },

  { id: 'srv_mr_d40_1', category: '美容', subCategory: '狗狗美容', name: '狗狗美容 (40kg以上 全身剃剪)', price: 380, unit: '次' },
  { id: 'srv_mr_d40_2', category: '美容', subCategory: '狗狗美容', name: '狗狗美容 (40kg以上 背部剃剪)', price: 700, unit: '次' },
  { id: 'srv_mr_d40_3', category: '美容', subCategory: '狗狗美容', name: '狗狗美容 (40kg以上 全身手剪)', price: 860, unit: '次' },

  // 猫猫美容
  { id: 'srv_mr_c03_1', category: '美容', subCategory: '猫猫美容', name: '猫猫美容 (0-3kg 全身剃剪 不含洗护)', price: 240, unit: '次' },
  { id: 'srv_mr_c03_2', category: '美容', subCategory: '猫猫美容', name: '猫猫美容 (0-3kg 全身手剪 不含洗护)', price: 360, unit: '次' },
  { id: 'srv_mr_c35_1', category: '美容', subCategory: '猫猫美容', name: '猫猫美容 (3-5kg 全身剃剪 不含洗护)', price: 240, unit: '次' },
  { id: 'srv_mr_c35_2', category: '美容', subCategory: '猫猫美容', name: '猫猫美容 (3-5kg 全身手剪 不含洗护)', price: 360, unit: '次' },
  { id: 'srv_mr_c58_1', category: '美容', subCategory: '猫猫美容', name: '猫猫美容 (5-8kg 全身剃剪 不含洗护)', price: 240, unit: '次' },
  { id: 'srv_mr_c58_2', category: '美容', subCategory: '猫猫美容', name: '猫猫美容 (5-8kg 全身手剪 不含洗护)', price: 360, unit: '次' },
  { id: 'srv_mr_c8_1', category: '美容', subCategory: '猫猫美容', name: '猫猫美容 (8kg以上 全身剃剪 不含洗护)', price: 240, unit: '次' },
  { id: 'srv_mr_c8_2', category: '美容', subCategory: '猫猫美容', name: '猫猫美容 (8kg以上 全身手剪 不含洗护)', price: 360, unit: '次' },

  // 专项护理
  { id: 'srv_mr_sp_1', category: '美容', subCategory: '狗狗专项护理', name: '局部修剪', price: 100, unit: '次' },
  { id: 'srv_mr_sp_2', category: '美容', subCategory: '狗狗专项护理', name: '剪指甲', price: 38, unit: '次' },
  { id: 'srv_mr_sp_3', category: '美容', subCategory: '狗狗专项护理', name: '刷牙', price: 28, unit: '次' },
  { id: 'srv_mr_sp_4', category: '美容', subCategory: '狗狗专项护理', name: '爱心屁股', price: 150, unit: '次' },
  { id: 'srv_mr_sp_5', category: '美容', subCategory: '狗狗专项护理', name: '耳道清理', price: 28, unit: '次' },
  { id: 'srv_mr_sp_6', category: '美容', subCategory: '狗狗专项护理', name: '剃贵宾脚', price: 48, unit: '次' },
  { id: 'srv_mr_sp_7', category: '美容', subCategory: '狗狗专项护理', name: '开结 15分钟', price: 68, unit: '次' },
  { id: 'srv_mr_sp_8', category: '美容', subCategory: '狗狗专项护理', name: '单独修头', price: 150, unit: '次' },
  { id: 'srv_mr_sp_9', category: '美容', subCategory: '狗狗专项护理', name: '开荒拔毛', price: 1088, unit: '次' },
  { id: 'srv_mr_sp_10', category: '美容', subCategory: '狗狗专项护理', name: '循环拔毛', price: 788, unit: '次' },
  { id: 'srv_mr_sp_11', category: '美容', subCategory: '狗狗专项护理', name: '梗犬单独做头', price: 200, unit: '次' },
  { id: 'srv_mr_sp_12', category: '美容', subCategory: '狗狗专项护理', name: '除底绒/狗', price: 158, unit: '次' },
  { id: 'srv_mr_sp_13', category: '美容', subCategory: '猫猫专项护理', name: '去黑下巴/猫', price: 38, unit: '次' },
  { id: 'srv_mr_sp_14', category: '美容', subCategory: '猫猫专项护理', name: '去油尾/猫', price: 68, unit: '次' },
  { id: 'srv_mr_sp_15', category: '美容', subCategory: '猫猫专项护理', name: '自带药浴/猫', price: 38, unit: '次' },
  { id: 'srv_mr_sp_16', category: '美容', subCategory: '猫猫专项护理', name: '除底绒/猫', price: 98, unit: '次' },
  { id: 'srv_mr_sp_17', category: '美容', subCategory: '猫猫专项护理', name: '全身去油/猫', price: 168, unit: '次' },
  { id: 'srv_mr_sp_18', category: '美容', subCategory: '猫猫专项护理', name: '药浴/猫', price: 98, unit: '次' },
  { id: 'srv_mr_sp_19', category: '美容', subCategory: '狗狗专项护理', name: '牙结石 轻度', price: 488, unit: '次' },
  { id: 'srv_mr_sp_20', category: '美容', subCategory: '狗狗专项护理', name: '牙结石 中度', price: 688, unit: '次' },
  { id: 'srv_mr_sp_21', category: '美容', subCategory: '狗狗专项护理', name: '牙结石 重度', price: 888, unit: '次' },

  // === 训练 ===
  { id: 'srv_xl_1', category: '训练', subCategory: '行为训练课程', name: '上门亲子课训练课程 (赠送7天线上跟进)', price: 1600, unit: '90分钟' },
  { id: 'srv_xl_2', category: '训练', subCategory: '行为训练课程', name: '单项行为纠正课程 (解决爆冲/唤回等单项问题)', price: 4800, unit: '14天' },
  { id: 'srv_xl_3', category: '训练', subCategory: '行为训练课程', name: '全能幼宠/综合行为进阶课', price: 6800, unit: '21天' },
  { id: 'srv_xl_4', category: '训练', subCategory: '行为训练课程', name: '综合行为纠正/幼宠训练', price: 7600, unit: '30天' },
  { id: 'srv_xl_5', category: '训练', subCategory: '行为训练课程', name: '分离焦虑/攻击行为专项纠正', price: 9800, unit: '40天' },
  { id: 'srv_xl_6', category: '训练', subCategory: '行为训练课程', name: '个人化课程 按需定制', price: 0, unit: '定制' },

  // === 接送 ===
  { id: 'srv_js_1', category: '接送', subCategory: '乐园接送服务', name: '萌宠专车接送 (5km内)', price: 60, unit: '次' },
  { id: 'srv_js_2', category: '接送', subCategory: '乐园接送服务', name: '萌宠专车接送 (5-10km)', price: 90, unit: '次' },
  { id: 'srv_js_3', category: '接送', subCategory: '乐园接送服务', name: '萌宠专车接送 (10-20km)', price: 120, unit: '次' },
];

export const DEFAULT_MEMBERSHIPS: MemberType[] = [
  { id: 'mem_1', name: '非会员', discount: 1.0 },
  { id: 'mem_2', name: '会员', discount: 1.0 },
];

export const DEFAULT_INVOICE_STYLE: InvoiceStyle = {
  logoUrl: '',
  logoSize: 112, // 112px
  logoSpacing: 10, // 10px spacing
  englishTitle: 'Holy Pawfect Day!',
  englishFontSize: 32, // 32px (24pt ≈ 32px)
  englishChineseSpacing: 4, // 4px spacing
  chineseTitle: '好厉害宠物乐园',
  chineseFontSize: 15, // 15px (11pt ≈ 15px)
  tableHeaderBg: '#A4B9D4', // morandi blue
  tableHeaderTextColor: '#000000',
  emptyRowsCount: 10,
  containerWidth: 305, // 305mm as requested
  containerPadding: 40, // 40px (py-12 px-10 is about 40px)
  fontSizeHeader: 14,
  fontSizeTable: 12,
  doubleUnderlineColor: '#1A202C',
  doubleUnderlineThickness: 3,
  hideStoreName: true, // Go ahead and hide store name by default as requested
  tableBorderColor: '#CBD5E1', // default slate-300 color
  fontFamilyHeader: 'Georgia, serif', // default formal serif for basic info
  fontFamilyTable: 'ui-monospace, monospace', // default technical mono for table data
  fontFamilyBase: 'system-ui, sans-serif', // default sans-serif for rest
  fontFamilyAddress: 'system-ui, -apple-system, sans-serif',
  addressLineHeight: '1.0',
  headerTableSpacing: 24,
  addressFontSize: 12,
  showRemarksDivider: true,
  remarksDividerSpacing: 20,
};

