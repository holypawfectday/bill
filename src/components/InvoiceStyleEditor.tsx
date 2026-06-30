/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bill, InvoiceStyle } from '../types';
import { DEFAULT_INVOICE_STYLE } from '../defaults';
import Receipt from './Receipt';
import { 
  Palette, 
  Type, 
  Sliders, 
  RotateCcw, 
  Image as ImageIcon, 
  Grid, 
  Coins, 
  Check, 
  Sparkles, 
  HelpCircle,
  Eye,
  Settings
} from 'lucide-react';

interface InvoiceStyleEditorProps {
  invoiceStyle: InvoiceStyle;
  setInvoiceStyle: React.Dispatch<React.SetStateAction<InvoiceStyle>>;
  bills: Bill[];
  customAlert: (message: string, title?: string) => Promise<void>;
}

export default function InvoiceStyleEditor({
  invoiceStyle,
  setInvoiceStyle,
  bills,
  customAlert,
}: InvoiceStyleEditorProps) {
  const [activeSection, setActiveSection] = useState<'layout' | 'logo' | 'title' | 'fonts' | 'table' | 'underline'>('layout');
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Use the first bill for preview
  const previewBill = bills.length > 0 ? bills[0] : null;

  const handleReset = () => {
    setInvoiceStyle(DEFAULT_INVOICE_STYLE);
    customAlert('正式账单排版格式已恢复为出厂默认设置！', '重置成功');
  };

  const updateStyle = <K extends keyof InvoiceStyle>(key: K, value: InvoiceStyle[K]) => {
    setInvoiceStyle(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Cute preset cute image links
  const logoPresets = [
    { name: '专属乐园 Logo (logo-bill.jpg)', url: '/logo-bill.jpg' },
    { name: '可爱卡通狗 (Vector)', url: '' },
    { name: '温馨大脚印 (Footprint)', url: 'https://images.unsplash.com/photo-1541599540903-216a46ca1df0?auto=format&fit=crop&w=150&q=80' },
    { name: '圣洁宠物光环 (Halo)', url: 'https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&w=150&q=80' }
  ];

  const colorPresets = [
    { name: '莫兰迪蓝', bg: '#A4B9D4', text: '#000000' },
    { name: '静谧深灰', bg: '#1E293B', text: '#FFFFFF' },
    { name: '温暖森林', bg: '#2D6A4F', text: '#FFFFFF' },
    { name: '古典酒红', bg: '#7A1F1D', text: '#FFFFFF' },
    { name: '奶黄芝士', bg: '#FFF2CC', text: '#7F6000' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="invoice-style-workspace">
      {/* 🛠️ CONTROLS PANEL (5 cols) */}
      <div className="lg:col-span-5 bg-white border-4 border-slate-800 rounded-3xl p-5 md:p-6 shadow-[6px_6px_0px_0px_#1A202C] space-y-6">
        <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#EBA53B]" />
            <h2 className="text-lg font-black text-slate-900 font-sans">
              账单排版设计器
            </h2>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-slate-700 bg-slate-50 hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-300 rounded-xl transition-all cursor-pointer font-bold"
            title="恢复到出厂默认格式"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>恢复默认</span>
          </button>
        </div>

        {/* 💾 保存格式按钮 */}
        <button
          onClick={async () => {
            // 1. 保存到当前浏览器的 LocalStorage
            localStorage.setItem('pet_paradise_invoice_style_v3', JSON.stringify(invoiceStyle));
            
            // 2. 同步保存到服务器根目录 defaults.ts 中，确保其他设备打开时保持完全一致
            try {
              const response = await fetch('/api/save-defaults', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  invoiceStyle,
                }),
              });
              
              if (response.ok) {
                customAlert("正式账单格式已成功保存到本地并同步至服务器！在其他设备打开时，将自动沿用此排版和 Logo 🐾", "格式保存且同步成功 🐾");
              } else {
                const errData = await response.json();
                customAlert(`本地保存成功，但服务器同步失败: ${errData.error || '未知错误'}. 建议在当前设备继续使用。`, "本地已保存 🐾");
              }
            } catch (err: any) {
              console.error('Failed to sync invoice style to server:', err);
              customAlert(`正式账单格式已成功保存在当前浏览器！但同步至服务器时遇到网络问题: ${err.message}`, "本地已保存 🐾");
            }
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#EBA53B] hover:bg-[#d6932c] border-2 border-slate-800 rounded-2xl font-black text-slate-900 shadow-[3px_3px_0px_0px_#1A202C] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer text-xs"
        >
          <Sparkles className="w-4 h-4" />
          <span>保存当前排版格式 (所有设备同步)</span>
        </button>

        {/* Section Navigation Tabs */}
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveSection('layout')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-black rounded-xl transition-all cursor-pointer ${
              activeSection === 'layout' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>尺寸</span>
          </button>
          <button
            onClick={() => setActiveSection('logo')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-black rounded-xl transition-all cursor-pointer ${
              activeSection === 'logo' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>图标</span>
          </button>
          <button
            onClick={() => setActiveSection('title')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-black rounded-xl transition-all cursor-pointer ${
              activeSection === 'title' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>店名</span>
          </button>
          <button
            onClick={() => setActiveSection('fonts')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-black rounded-xl transition-all cursor-pointer ${
              activeSection === 'fonts' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>字体</span>
          </button>
          <button
            onClick={() => setActiveSection('table')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-black rounded-xl transition-all cursor-pointer ${
              activeSection === 'table' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>表格</span>
          </button>
          <button
            onClick={() => setActiveSection('underline')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-black rounded-xl transition-all cursor-pointer ${
              activeSection === 'underline' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>下划线</span>
          </button>
        </div>

        {/* SECTION 1: LAYOUT & PADDING */}
        {activeSection === 'layout' && (
          <div className="space-y-5 animate-fade-in">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                🐾 <strong>页面尺寸配置：</strong>调整正式账单的宽度、页边距以及下方预留的空白表格行数。
              </p>
            </div>

            {/* Container Width Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-black">
                <span className="text-slate-700">正式账单页面宽度 (Width)</span>
                <span className="text-sky-700 font-mono bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                  {invoiceStyle.containerWidth} mm
                </span>
              </div>
              <input
                type="range"
                min="210"
                max="800"
                step="5"
                value={invoiceStyle.containerWidth}
                onChange={(e) => updateStyle('containerWidth', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>210 mm (标准A4)</span>
                <span>305 mm (默认宽)</span>
                <span>800 mm</span>
              </div>
            </div>

            {/* Container Padding Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-black">
                <span className="text-slate-700">页面内边距 (Padding)</span>
                <span className="text-sky-700 font-mono bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                  {invoiceStyle.containerPadding} px
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="2"
                value={invoiceStyle.containerPadding}
                onChange={(e) => updateStyle('containerPadding', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>10 px</span>
                <span>40 px (默认)</span>
                <span>100 px</span>
              </div>
            </div>

            {/* Empty Rows Count Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-black">
                <span className="text-slate-700">底部空白网格行数 (Blank Rows)</span>
                <span className="text-sky-700 font-mono bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                  {invoiceStyle.emptyRowsCount} 行
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={invoiceStyle.emptyRowsCount}
                onChange={(e) => updateStyle('emptyRowsCount', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>0 行</span>
                <span>10 行 (标准)</span>
                <span>20 行</span>
              </div>
            </div>

            {/* Remarks Section Separator Options */}
            <div className="border-t border-slate-200 pt-4 mt-2 space-y-4">
              <span className="block text-[11px] font-black text-slate-500 uppercase tracking-wider">📝 备注排版与间隔 (Remarks Layout)</span>
              
              {/* Toggle Show Remarks Divider */}
              <div className="bg-[#FFFEEB] border-2 border-slate-800 p-3 rounded-2xl flex items-center justify-between shadow-[2px_2px_0px_0px_#1A202C]">
                <div className="space-y-0.5">
                  <label className="block text-xs font-black text-slate-900 cursor-pointer" htmlFor="show-remarks-divider-checkbox">
                    显示备注上方分割线
                  </label>
                  <p className="text-[10px] text-slate-500 font-bold">
                    在底部备注框上方绘制一条水平分割线
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="show-remarks-divider-checkbox"
                  checked={invoiceStyle.showRemarksDivider ?? true}
                  onChange={(e) => updateStyle('showRemarksDivider', e.target.checked)}
                  className="w-5 h-5 accent-slate-900 rounded cursor-pointer"
                />
              </div>

              {/* Remarks Divider Spacing Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-black">
                  <span className="text-slate-700">备注上方行间隔/边距 (Spacing)</span>
                  <span className="text-sky-700 font-mono bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                    {invoiceStyle.remarksDividerSpacing ?? 20} px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="2"
                  value={invoiceStyle.remarksDividerSpacing ?? 20}
                  onChange={(e) => updateStyle('remarksDividerSpacing', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                  <span>0 px (紧凑)</span>
                  <span>20 px (默认)</span>
                  <span>80 px</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: BRAND LOGO */}
        {activeSection === 'logo' && (
          <div className="space-y-5 animate-fade-in">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                🐾 <strong>品牌标志配置：</strong>支持上传自定义图片文件、输入网址或使用内置的标志。设置 Logo 的视觉尺寸和与下方文字的上下间距。
              </p>
            </div>

            {/* Logo File Upload */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700">
                本地上传 Logo 图片文件 (Upload File)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="logo-file-upload-input"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        updateStyle('logoUrl', reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="logo-file-upload-input"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 hover:border-slate-800 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all font-bold text-xs text-slate-700"
                >
                  <ImageIcon className="w-4 h-4 text-slate-500" />
                  <span>选择图片文件...</span>
                </label>
                {invoiceStyle.logoUrl && (
                  <button
                    type="button"
                    onClick={() => updateStyle('logoUrl', '')}
                    className="px-3 py-2 bg-red-50 hover:bg-red-100 border-2 border-red-200 hover:border-red-300 rounded-xl text-red-600 hover:text-red-700 transition-all text-xs font-bold cursor-pointer"
                  >
                    清除
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                * 支持 JPEG, PNG, SVG 等格式。上传后将自动以 Base64 格式保存并实时渲染。
              </p>
            </div>

            {/* Logo URL Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700">
                或使用图片网址 (Image URL)
              </label>
              <input
                type="text"
                placeholder="例如 /logo.png 或 https://..."
                value={invoiceStyle.logoUrl || ''}
                onChange={(e) => updateStyle('logoUrl', e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold border-2 border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EBA53B] bg-[#FFFEEB]"
              />
              <p className="text-[10px] text-slate-400 leading-tight">
                * 留空则默认使用乐园专属精美矢量“好厉害狗狗”店徽。
              </p>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="block text-[11px] font-black text-slate-500">快速应用预设标志</span>
              <div className="flex flex-col gap-1.5">
                {logoPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => updateStyle('logoUrl', preset.url)}
                    className="flex items-center justify-between px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-800 rounded-xl bg-white hover:bg-slate-50 font-bold cursor-pointer text-left transition-all"
                  >
                    <span>{preset.name}</span>
                    {invoiceStyle.logoUrl === preset.url && (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Logo Size Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-black">
                <span className="text-slate-700">Logo 占据高度 (Size)</span>
                <span className="text-sky-700 font-mono bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                  {invoiceStyle.logoSize} px
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="300"
                step="5"
                value={invoiceStyle.logoSize}
                onChange={(e) => updateStyle('logoSize', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>40 px</span>
                <span>112 px (默认)</span>
                <span>300 px</span>
              </div>
            </div>

            {/* Logo Bottom Spacing Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-black">
                <span className="text-slate-700">Logo 与下方店名间距 (Margin Bottom)</span>
                <span className="text-sky-700 font-mono bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                  {invoiceStyle.logoSpacing} px
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="2"
                value={invoiceStyle.logoSpacing}
                onChange={(e) => updateStyle('logoSpacing', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>0 px (紧凑)</span>
                <span>10 px (默认)</span>
                <span>80 px</span>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: STORE HEADERS (TEXT & FONTS) */}
        {activeSection === 'title' && (
          <div className="space-y-5 animate-fade-in">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                🐾 <strong>双语店名文本与排版：</strong>自定义主英文招牌、中文字号和极具设计感的紧凑/空旷行距布局，还可一键隐藏。
              </p>
            </div>

            {/* Toggle Hide Store Name */}
            <div className="bg-[#FFFEEB] border-2 border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-[2px_2px_0px_0px_#1A202C]">
              <div className="space-y-0.5">
                <label className="block text-xs font-black text-slate-900 cursor-pointer" htmlFor="hide-store-name-checkbox">
                  隐藏顶部英文与中文店名
                </label>
                <p className="text-[10px] text-slate-500 font-bold">
                  隐藏英文 {invoiceStyle.englishTitle} 与中文 {invoiceStyle.chineseTitle}
                </p>
              </div>
              <input
                type="checkbox"
                id="hide-store-name-checkbox"
                checked={invoiceStyle.hideStoreName}
                onChange={(e) => updateStyle('hideStoreName', e.target.checked)}
                className="w-5 h-5 accent-slate-900 rounded cursor-pointer"
              />
            </div>

            {/* English Title Text */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700">
                主英文店名 (English Signboard)
              </label>
              <input
                type="text"
                value={invoiceStyle.englishTitle}
                onChange={(e) => updateStyle('englishTitle', e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold border-2 border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EBA53B] bg-[#FFFEEB]"
              />
            </div>

            {/* English Font Size Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-black">
                <span className="text-slate-700">主英文字号 (Font Size)</span>
                <span className="text-sky-700 font-mono bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                  {invoiceStyle.englishFontSize} px
                </span>
              </div>
              <input
                type="range"
                min="16"
                max="64"
                step="1"
                value={invoiceStyle.englishFontSize}
                onChange={(e) => updateStyle('englishFontSize', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>16 px</span>
                <span>32 px (24pt 默认)</span>
                <span>64 px</span>
              </div>
            </div>

            {/* English to Chinese Spacing Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-black">
                <span className="text-slate-700">英文店名与中文店名间距</span>
                <span className="text-sky-700 font-mono bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                  {invoiceStyle.englishChineseSpacing} px
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="1"
                value={invoiceStyle.englishChineseSpacing}
                onChange={(e) => updateStyle('englishChineseSpacing', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>0 px</span>
                <span>4 px (默认极紧凑)</span>
                <span>40 px</span>
              </div>
            </div>

            {/* Chinese Title Text */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700">
                副中文店名 (Chinese Signboard)
              </label>
              <input
                type="text"
                value={invoiceStyle.chineseTitle}
                onChange={(e) => updateStyle('chineseTitle', e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold border-2 border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EBA53B] bg-[#FFFEEB]"
              />
            </div>

            {/* Chinese Font Size Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-black">
                <span className="text-slate-700">中文字号 (Font Size)</span>
                <span className="text-sky-700 font-mono bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                  {invoiceStyle.chineseFontSize} px
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="36"
                step="1"
                value={invoiceStyle.chineseFontSize}
                onChange={(e) => updateStyle('chineseFontSize', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>10 px</span>
                <span>15 px (11pt 默认)</span>
                <span>36 px</span>
              </div>
            </div>
          </div>
        )}

        {/* NEW SECTION: FONTS CUSTOMIZATION */}
        {activeSection === 'fonts' && (
          <div className="space-y-5 animate-fade-in">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                🐾 <strong>每个部分的字体与行距调整：</strong>支持为“全局基础文字”、“顾客/宠物基础信息栏”、“消费明细网格表格”以及“底部地址区块”分别设置专属的印刷/手写体风格，并调整中英文地址行距。
              </p>
            </div>

            {/* Font Family 1: Base Font */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700">
                1. 全局基础与标签字体 (Global Base Font)
              </label>
              <select
                value={invoiceStyle.fontFamilyBase}
                onChange={(e) => updateStyle('fontFamilyBase', e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold border-2 border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EBA53B] bg-white cursor-pointer"
              >
                <option value='system-ui, -apple-system, sans-serif'>默认系统字体 (Standard System Sans-serif)</option>
                <option value='"Noto Sans SC", "PingFang SC", "Microsoft YaHei", SimHei, sans-serif'>优雅现代黑体 (Noto Sans SC / PingFang / YaHei)</option>
                <option value='Georgia, "Times New Roman", SimSun, serif'>经典报刊宋体 (Georgia / SimSun)</option>
                <option value='KaiTi, STKaiti, cursive, serif'>温暖复古楷体 (Kaiti / STKaiti)</option>
                <option value='"JetBrains Mono", ui-monospace, SFMono-Regular, monospace'>极客技术等宽体 (JetBrains Mono / Code)</option>
                <option value='FangSong, STFangsong, serif'>庄重书卷仿宋 (FangSong / STFangsong)</option>
              </select>
            </div>

            {/* Font Family 2: Header Font */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700">
                2. 基础信息栏字体 (Metadata Font)
              </label>
              <select
                value={invoiceStyle.fontFamilyHeader}
                onChange={(e) => updateStyle('fontFamilyHeader', e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold border-2 border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EBA53B] bg-white cursor-pointer"
              >
                <option value='system-ui, -apple-system, sans-serif'>默认系统字体 (Standard System Sans-serif)</option>
                <option value='"Noto Sans SC", "PingFang SC", "Microsoft YaHei", SimHei, sans-serif'>优雅现代黑体 (Noto Sans SC / PingFang / YaHei)</option>
                <option value='Georgia, "Times New Roman", SimSun, serif'>经典报刊宋体 (Georgia / SimSun)</option>
                <option value='KaiTi, STKaiti, cursive, serif'>温暖复古楷体 (Kaiti / STKaiti)</option>
                <option value='"JetBrains Mono", ui-monospace, SFMono-Regular, monospace'>极客技术等宽体 (JetBrains Mono / Code)</option>
                <option value='FangSong, STFangsong, serif'>庄重书卷仿宋 (FangSong / STFangsong)</option>
              </select>
            </div>

            {/* Font Family 3: Table Font */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700">
                3. 明细表格数据字体 (Table Details Font)
              </label>
              <select
                value={invoiceStyle.fontFamilyTable}
                onChange={(e) => updateStyle('fontFamilyTable', e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold border-2 border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EBA53B] bg-white cursor-pointer"
              >
                <option value='system-ui, -apple-system, sans-serif'>默认系统字体 (Standard System Sans-serif)</option>
                <option value='"Noto Sans SC", "PingFang SC", "Microsoft YaHei", SimHei, sans-serif'>优雅现代黑体 (Noto Sans SC / PingFang / YaHei)</option>
                <option value='Georgia, "Times New Roman", SimSun, serif'>经典报刊宋体 (Georgia / SimSun)</option>
                <option value='KaiTi, STKaiti, cursive, serif'>温暖复古楷体 (Kaiti / STKaiti)</option>
                <option value='"JetBrains Mono", ui-monospace, SFMono-Regular, monospace'>极客技术等宽体 (JetBrains Mono / Code)</option>
                <option value='FangSong, STFangsong, serif'>庄重书卷仿宋 (FangSong / STFangsong)</option>
              </select>
            </div>

            {/* Font Family 4: Address Font */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700">
                4. 底部地址联系方式字体 (Address Block Font)
              </label>
              <select
                value={invoiceStyle.fontFamilyAddress || 'system-ui, -apple-system, sans-serif'}
                onChange={(e) => updateStyle('fontFamilyAddress', e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold border-2 border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EBA53B] bg-white cursor-pointer"
              >
                <option value='system-ui, -apple-system, sans-serif'>默认系统字体 (Standard System Sans-serif)</option>
                <option value='"Noto Sans SC", "PingFang SC", "Microsoft YaHei", SimHei, sans-serif'>优雅现代黑体 (Noto Sans SC / PingFang / YaHei)</option>
                <option value='Georgia, "Times New Roman", SimSun, serif'>经典报刊宋体 (Georgia / SimSun)</option>
                <option value='KaiTi, STKaiti, cursive, serif'>温暖复古楷体 (Kaiti / STKaiti)</option>
                <option value='"JetBrains Mono", ui-monospace, SFMono-Regular, monospace'>极客技术等宽体 (JetBrains Mono / Code)</option>
                <option value='FangSong, STFangsong, serif'>庄重书卷仿宋 (FangSong / STFangsong)</option>
              </select>
            </div>

            {/* Address Line Height Select */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700">
                5. 中英文地址行间距 (Address Line Spacing)
              </label>
              <select
                value={invoiceStyle.addressLineHeight || '1.0'}
                onChange={(e) => updateStyle('addressLineHeight', e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold border-2 border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EBA53B] bg-white cursor-pointer"
              >
                <option value="1.0">单倍行距 (1.0 - Default)</option>
                <option value="1.15">紧凑 (1.15)</option>
                <option value="1.3">舒适 (1.3)</option>
                <option value="1.5">宽敞 (1.5)</option>
              </select>
            </div>

            {/* Address Font Size Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-black">
                <span className="text-slate-700">6. 底部地址字号 (Address Font Size)</span>
                <span className="text-sky-700 font-mono bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                  {invoiceStyle.addressFontSize ?? 12} px
                </span>
              </div>
              <input
                type="range"
                min="8"
                max="24"
                step="1"
                value={invoiceStyle.addressFontSize ?? 12}
                onChange={(e) => updateStyle('addressFontSize', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>8 px</span>
                <span>12 px (默认)</span>
                <span>24 px</span>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: TABLE & GRID SIZES */}
        {activeSection === 'table' && (
          <div className="space-y-5 animate-fade-in">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                🐾 <strong>表格与信息栏微调：</strong>设定网格边框颜色、水单表头背景、表头文本颜色，调节基本属性区及数据网格的整体字号，打造极佳可读性。
              </p>
            </div>

            {/* Table Header Background Color */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-700">
                数据表头背景色 (Header Bg Color)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={invoiceStyle.tableHeaderBg}
                  onChange={(e) => updateStyle('tableHeaderBg', e.target.value)}
                  className="w-10 h-10 border-2 border-slate-800 rounded-xl cursor-pointer"
                />
                <input
                  type="text"
                  value={invoiceStyle.tableHeaderBg}
                  onChange={(e) => updateStyle('tableHeaderBg', e.target.value)}
                  className="w-28 px-3 py-2 text-xs font-mono font-bold border-2 border-slate-800 rounded-xl focus:outline-none"
                />
              </div>

              {/* Color Presets */}
              <div className="space-y-1.5 pt-1">
                <span className="block text-[10px] font-black text-slate-400">高级莫兰迪色卡推荐：</span>
                <div className="flex flex-wrap gap-2">
                  {colorPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        updateStyle('tableHeaderBg', preset.bg);
                        updateStyle('tableHeaderTextColor', preset.text);
                      }}
                      className="px-2.5 py-1 text-[10px] font-black rounded-lg border border-slate-300 hover:border-slate-800 transition-all cursor-pointer flex items-center gap-1.5 bg-white"
                    >
                      <span className="w-3.5 h-3.5 rounded-md border border-slate-200 shadow-sm" style={{ backgroundColor: preset.bg }} />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table Header Text Color */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-700">
                表头文本颜色 (Header Text Color)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={invoiceStyle.tableHeaderTextColor}
                  onChange={(e) => updateStyle('tableHeaderTextColor', e.target.value)}
                  className="w-10 h-10 border-2 border-slate-800 rounded-xl cursor-pointer"
                />
                <input
                  type="text"
                  value={invoiceStyle.tableHeaderTextColor}
                  onChange={(e) => updateStyle('tableHeaderTextColor', e.target.value)}
                  className="w-28 px-3 py-2 text-xs font-mono font-bold border-2 border-slate-800 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            {/* Table Border Color Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-700">
                网格线与边框颜色 (Table Border Color)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={invoiceStyle.tableBorderColor || '#CBD5E1'}
                  onChange={(e) => updateStyle('tableBorderColor', e.target.value)}
                  className="w-10 h-10 border-2 border-slate-800 rounded-xl cursor-pointer"
                />
                <input
                  type="text"
                  value={invoiceStyle.tableBorderColor || '#CBD5E1'}
                  onChange={(e) => updateStyle('tableBorderColor', e.target.value)}
                  className="w-28 px-3 py-2 text-xs font-mono font-bold border-2 border-slate-800 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            {/* Header / Guest Metadata Details Font Size */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-black">
                <span className="text-slate-700">基础信息栏字号 (Details Font Size)</span>
                <span className="text-sky-700 font-mono bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                  {invoiceStyle.fontSizeHeader} px
                </span>
              </div>
              <input
                type="range"
                min="8"
                max="24"
                step="1"
                value={invoiceStyle.fontSizeHeader}
                onChange={(e) => updateStyle('fontSizeHeader', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>8 px</span>
                <span>14 px (默认)</span>
                <span>24 px</span>
              </div>
            </div>

            {/* Table Content Font Size */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-black">
                <span className="text-slate-700">商品表格明细字号 (Table Font Size)</span>
                <span className="text-sky-700 font-mono bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                  {invoiceStyle.fontSizeTable} px
                </span>
              </div>
              <input
                type="range"
                min="8"
                max="24"
                step="1"
                value={invoiceStyle.fontSizeTable}
                onChange={(e) => updateStyle('fontSizeTable', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>8 px</span>
                <span>12 px (默认)</span>
                <span>24 px</span>
              </div>
            </div>

            {/* Metadata to Table Spacing Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-black">
                <span className="text-slate-700">宝贝姓名与明细表格间距 (Header-Table Spacing)</span>
                <span className="text-sky-700 font-mono bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                  {invoiceStyle.headerTableSpacing ?? 24} px
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="2"
                value={invoiceStyle.headerTableSpacing ?? 24}
                onChange={(e) => updateStyle('headerTableSpacing', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>0 px (无间距)</span>
                <span>24 px (默认)</span>
                <span>100 px</span>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: TOTALS & DOUBLE UNDERLINE */}
        {activeSection === 'underline' && (
          <div className="space-y-5 animate-fade-in">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                🐾 <strong>金额双下划线（会计专用格式）：</strong>配置总计金额下方的双横线（代表最终记账核销线）的颜色、粗细，体现极其尊贵的财务报表感。
              </p>
            </div>

            {/* Underline Color */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-700">
                双下划线颜色 (Line Color)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={invoiceStyle.doubleUnderlineColor}
                  onChange={(e) => updateStyle('doubleUnderlineColor', e.target.value)}
                  className="w-10 h-10 border-2 border-slate-800 rounded-xl cursor-pointer"
                />
                <input
                  type="text"
                  value={invoiceStyle.doubleUnderlineColor}
                  onChange={(e) => updateStyle('doubleUnderlineColor', e.target.value)}
                  className="w-28 px-3 py-2 text-xs font-mono font-bold border-2 border-slate-800 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            {/* Underline Thickness */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-black">
                <span className="text-slate-700">双下划线粗细 (Thickness)</span>
                <span className="text-sky-700 font-mono bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                  {invoiceStyle.doubleUnderlineThickness} px
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={invoiceStyle.doubleUnderlineThickness}
                onChange={(e) => updateStyle('doubleUnderlineThickness', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>1 px</span>
                <span>3 px (默认双线)</span>
                <span>8 px</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 👁️ REAL-TIME LIVE PREVIEW (7 cols) */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <div className="bg-[#FFFEEB] rounded-2xl border-2 border-slate-800 p-3 flex items-center justify-between shadow-[2px_2px_0px_0px_#1A202C]">
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-slate-800" />
            <span className="text-xs text-slate-800 font-black font-sans uppercase tracking-wider">
              正式网格账单实时排版效果 (Live Layout Preview)
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
            画布宽度: {invoiceStyle.containerWidth}mm
          </span>
        </div>

        {previewBill ? (
          <div className="w-full flex justify-center bg-slate-50 border-4 border-dashed border-slate-300 rounded-3xl p-4 overflow-x-auto">
            <div className="min-w-max">
              <Receipt 
                bill={previewBill} 
                customAlert={customAlert} 
                invoiceStyle={invoiceStyle}
                defaultMode="invoice"
                showInvoiceToggle={true}
              />
            </div>
          </div>
        ) : (
          <div className="border-4 border-dashed border-slate-350 bg-white rounded-3xl p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-[#FFFEEB] rounded-full flex items-center justify-center mx-auto border-2 border-slate-800">
              <HelpCircle className="w-6 h-6 text-slate-600" />
            </div>
            <p className="text-xs text-slate-800 font-black">请在收银台生成或选择一笔账单查看预览</p>
          </div>
        )}
      </div>
    </div>
  );
}
