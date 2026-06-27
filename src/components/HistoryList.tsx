/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bill } from '../types';
import { Search, Calendar, ChevronRight, Trash2, Filter, PieChart, TrendingUp, DollarSign, CalendarCheck, Download, Sparkles } from 'lucide-react';
import { PinkHeart, BlueSparkle, YellowSparkle } from './CuteDoodles';
import { downloadCSV } from '../utils/export';

interface HistoryListProps {
  bills: Bill[];
  onSelectBill: (bill: Bill) => void;
  onDeleteBill: (id: string) => void;
  selectedBillId?: string;
  lastDeletedBill: Bill | null;
  onUndoDelete: () => void;
  customAlert?: (message: string, title?: string) => Promise<void>;
  customConfirm?: (message: string, title?: string) => Promise<boolean>;
}

export default function HistoryList({
  bills,
  onSelectBill,
  onDeleteBill,
  selectedBillId,
  lastDeletedBill,
  onUndoDelete,
  customAlert,
  customConfirm,
}: HistoryListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMemberId, setFilterMemberId] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  // Filter bills
  const filteredBills = bills.filter((bill) => {
    const matchesSearch = bill.dogName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          bill.dogBreed.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (bill.billNumber && bill.billNumber.includes(searchTerm));
    
    const matchesMember = filterMemberId === 'all' || bill.memberTypeId === filterMemberId;

    const matchesDate = !filterDate || (() => {
      // Compare with creation date
      const createdDateStr = bill.createdAt ? bill.createdAt.substring(0, 10) : '';
      if (createdDateStr === filterDate) return true;
      // Also match checkInDate or checkOutDate for convenience
      if (bill.checkInDate === filterDate) return true;
      if (bill.checkOutDate === filterDate) return true;
      return false;
    })();

    return matchesSearch && matchesMember && matchesDate;
  });

  // KPI calculations
  const totalRevenue = bills.reduce((acc, curr) => acc + curr.total, 0);
  const totalSubtotal = bills.reduce((acc, curr) => acc + curr.subtotal, 0);
  const totalDiscountSaved = totalSubtotal - totalRevenue;
  
  // Calculate today's revenue
  const todayStr = new Date().toDateString();
  const todayRevenue = bills
    .filter((bill) => new Date(bill.createdAt).toDateString() === todayStr)
    .reduce((acc, curr) => acc + curr.total, 0);

  // Compute membership shares
  const memberCounts: { [name: string]: number } = {};
  bills.forEach((b) => {
    memberCounts[b.memberTypeName] = (memberCounts[b.memberTypeName] || 0) + 1;
  });

  return (
    <div className="space-y-6" id="history-dashboard">
      {/* 📊 Adorable KPI Stats Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total revenue */}
        <div className="bg-[#FFFEEB] text-slate-800 rounded-3xl p-5 border-4 border-slate-800 relative overflow-hidden shadow-[4px_4px_0px_0px_#1A202C]">
          <div className="absolute right-2 top-2 opacity-15">
            <DollarSign className="w-16 h-16 text-slate-850" />
          </div>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">累计总营业额</p>
          <p className="text-2xl font-black font-mono mt-1 text-slate-900">
            ¥{totalRevenue.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-600 font-bold">
            <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
            <span>卡内累计抵扣节省: <strong className="text-slate-800 font-mono font-black">¥{totalDiscountSaved.toFixed(0)}</strong></span>
          </div>
        </div>

        {/* Today's revenue */}
        <div className="bg-[#B9E3F8] rounded-3xl p-5 border-4 border-slate-800 relative overflow-hidden shadow-[4px_4px_0px_0px_#1A202C] flex flex-col justify-between">
          <div className="absolute right-2 top-2 opacity-15">
            <CalendarCheck className="w-12 h-12 text-slate-900" />
          </div>
          <div>
            <p className="text-[10px] text-slate-650 font-black uppercase tracking-wider">今日乐园收益</p>
            <p className="text-2xl font-black font-mono text-slate-900 mt-1">
              ¥{todayRevenue.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-[10px] text-slate-600 mt-2 flex items-center gap-1.5 font-bold">
            <span>今日账单数: <strong className="text-slate-900 font-mono font-black">{bills.filter((b) => new Date(b.createdAt).toDateString() === todayStr).length}</strong> 笔</span>
          </div>
        </div>

        {/* Total Bills */}
        <div className="bg-white rounded-3xl p-5 border-4 border-slate-800 relative overflow-hidden shadow-[4px_4px_0px_0px_#1A202C] flex flex-col justify-between">
          <div className="absolute right-2 top-2 opacity-10">
            <PieChart className="w-12 h-12 text-slate-900" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">累计已生成账单</p>
            <p className="text-2xl font-black font-mono text-slate-900 mt-1">
              {bills.length} <span className="text-xs font-bold text-slate-500">份小票</span>
            </p>
          </div>
          <div className="text-[10px] text-slate-600 mt-2 flex items-center gap-1.5 font-bold">
            <span className="truncate">
              会员占比:{' '}
              <strong className="text-slate-900 font-mono font-black">
                {bills.length > 0
                  ? `${Math.round(
                      (bills.filter((b) => b.isMember || b.memberTypeId === 'mem_2').length /
                        bills.length) *
                        100
                     )}%`
                  : '0%'}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* 🔄 Undo Deletion Banner */}
      {lastDeletedBill && (
        <div className="bg-[#FFFEEB] border-4 border-slate-800 p-4 rounded-3xl shadow-[3px_3px_0px_0px_#1A202C] flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-rose-150 rounded-xl border-2 border-slate-800">
              <Trash2 className="w-4 h-4 text-rose-600" />
            </span>
            <div className="text-xs font-black text-slate-800">
              已删除账单 <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 text-slate-700 font-bold">#{lastDeletedBill.billNumber}</span> (宠物: {lastDeletedBill.dogName})。
            </div>
          </div>
          <button
            onClick={onUndoDelete}
            className="px-4 py-1.5 bg-[#B9E3F8] hover:bg-[#a3d5ef] border-2 border-slate-800 rounded-xl text-xs font-black text-slate-900 cursor-pointer shadow-[1.5px_1.5px_0px_0px_#1A202C] active:translate-y-0.5 active:shadow-[0.5px_0.5px_0px_0px_#1A202C] transition-all flex items-center gap-1.5 w-full sm:w-auto justify-center"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>撤销删除 (Undo)</span>
          </button>
        </div>
      )}

      {/* Filter and List Section */}
      <div className="bg-white rounded-3xl border-4 border-slate-800 p-5 shadow-[4px_4px_0px_0px_#1A202C] space-y-4">
        {/* Search controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索宝贝名字, 品种, 单号..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-2 border-slate-800 focus:ring-4 focus:ring-[#B9E3F8]/50 rounded-xl pl-10 pr-3 py-2 text-xs outline-none font-bold text-slate-800 shadow-[2px_2px_0px_0px_#1A202C] transition-all"
            />
          </div>

          {/* Member Category Filter & Export */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={filterMemberId}
                onChange={(e) => setFilterMemberId(e.target.value)}
                className="bg-white border-2 border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-4 focus:ring-[#B9E3F8]/50 font-black text-slate-800 cursor-pointer shadow-[2px_2px_0px_0px_#1A202C] transition-all"
              >
                <option value="all" className="font-bold">全部顾客类型</option>
                <option value="mem_1" className="font-bold">仅非会员</option>
                <option value="mem_2" className="font-bold">仅会员年卡</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-white border-2 border-slate-800 rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-4 focus:ring-[#B9E3F8]/50 font-black text-slate-800 cursor-pointer shadow-[2px_2px_0px_0px_#1A202C] transition-all"
              />
              {filterDate && (
                <button
                  type="button"
                  onClick={() => setFilterDate('')}
                  className="px-2 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 border-2 border-slate-800 text-[10px] font-black rounded-xl shadow-[1.5px_1.5px_0px_0px_#1A202C] transition-all cursor-pointer"
                  title="清除日期筛选"
                >
                  清除
                </button>
              )}
            </div>

            <button
              type="button"
               onClick={() => {
                 if (filteredBills.length === 0) {
                   if (customAlert) {
                     customAlert('当前没有可导出的账单记录！');
                   } else {
                     alert('当前没有可导出的账单记录！');
                   }
                   return;
                 }
                 downloadCSV(filteredBills, '已筛选宠物账单数据导出.csv');
               }}
              className="px-3 py-2 bg-[#B9E3F8] hover:bg-[#a3d5ef] border-2 border-slate-800 text-slate-900 text-xs font-black rounded-xl flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#1A202C] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#1A202C] transition-all duration-150 cursor-pointer"
              title="导出当前筛选结果到 CSV 文件"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出账单列表 ({filteredBills.length} 笔)</span>
            </button>
          </div>
        </div>

        {/* History List Table */}
        <div className="overflow-hidden rounded-2xl border-2 border-slate-800 max-h-[300px] overflow-y-auto bg-white">
          {filteredBills.length === 0 ? (
            <div className="text-center py-10 px-4 bg-[#FFFEEB]/20 text-slate-400 text-xs font-bold italic">
              🐾 没有找到相关的消费账单记录。试着更改搜索词或新建一份吧！
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFFEEB] border-b-2 border-slate-800 text-[10px] font-black text-slate-800 uppercase tracking-wider">
                  <th className="py-2.5 px-3">宠物名字与品种</th>
                  <th className="py-2.5 px-3">流水单号/时间</th>
                  <th className="py-2.5 px-3">会员卡身份</th>
                  <th className="py-2.5 px-3 text-right">结算应付</th>
                  <th className="py-2.5 px-3 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100 text-xs">
                {filteredBills.map((bill) => {
                  const isSelected = selectedBillId === bill.id;
                  const billDate = new Date(bill.createdAt);
                  const timeString = `${billDate.getMonth() + 1}/${billDate.getDate()} ${billDate.getHours().toString().padStart(2, '0')}:${billDate.getMinutes().toString().padStart(2, '0')}`;
                  const isBillMember = bill.isMember || bill.memberTypeId === 'mem_2';

                  return (
                    <tr
                      key={bill.id}
                      onClick={() => onSelectBill(bill)}
                      className={`hover:bg-[#FFFEEB]/50 cursor-pointer transition-colors duration-150 ${
                        isSelected ? 'bg-[#FFFEEB] font-bold' : ''
                      }`}
                    >
                      {/* Dog Info */}
                      <td className="py-3 px-3">
                        <div className="font-black text-slate-800 flex items-center gap-1.5">
                          <span>{bill.dogName}</span>
                          <span className="text-[9px] font-black text-slate-800 bg-[#B9E3F8] px-1.5 py-0.5 rounded-md border border-slate-800">
                            {bill.dogBreed}
                          </span>
                        </div>
                        {bill.ownerPhone && (
                          <div className="text-[10px] text-slate-400 mt-0.5 font-mono font-bold">{bill.ownerPhone}</div>
                        )}
                      </td>

                      {/* Number/Time */}
                      <td className="py-3 px-3 text-slate-500 font-mono">
                        <div className="text-[10px] text-slate-400 font-bold">#{bill.billNumber}</div>
                        <div className="text-[10px] mt-0.5 font-bold">{timeString}</div>
                      </td>

                      {/* Member Tier */}
                      <td className="py-3 px-3">
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${
                            isBillMember
                              ? 'bg-[#FFFEEB] text-slate-800 border-slate-800 shadow-[1px_1px_0px_0px_#1A202C]'
                              : 'bg-white text-slate-400 border-slate-200'
                          }`}
                        >
                          {isBillMember ? '会员年卡' : '非会员'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-3 text-right font-mono font-black text-slate-900">
                        ¥{bill.total.toFixed(2)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onSelectBill(bill)}
                            className="p-1 text-slate-500 hover:text-slate-900 hover:scale-110 transition-transform cursor-pointer"
                            title="查看电子收据"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteBill(bill.id)}
                            className="p-1 text-slate-400 hover:text-red-500 hover:scale-110 transition-transform cursor-pointer"
                            title="删除账单记录"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
