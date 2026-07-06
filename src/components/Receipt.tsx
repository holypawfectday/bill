/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { Bill, InvoiceStyle } from '../types';
import { DEFAULT_INVOICE_STYLE } from '../defaults';
import { Printer, Copy, Check, PawPrint, Heart, Download, Sparkles, Gift, FileText, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { PinkHeart, BlueSparkle, YellowSparkle, HolyPawfectPuppy } from './CuteDoodles';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ReceiptProps {
  bill: Bill;
  customAlert?: (message: string, title?: string) => Promise<void>;
  invoiceStyle?: InvoiceStyle;
  defaultMode?: 'ticket' | 'invoice';
  showInvoiceToggle?: boolean;
}

export default function Receipt({ 
  bill, 
  customAlert, 
  invoiceStyle = DEFAULT_INVOICE_STYLE, 
  defaultMode,
  showInvoiceToggle = true
}: ReceiptProps) {
  const triggerAlert = (message: string) => {
    if (customAlert) {
      customAlert(message);
    } else {
      alert(message);
    }
  };
  const [copied, setCopied] = useState(false);
  const [receiptMode, setReceiptMode] = useState<'ticket' | 'invoice'>(
    defaultMode || (showInvoiceToggle ? 'ticket' : 'invoice')
  );

  React.useEffect(() => {
    if (defaultMode) {
      setReceiptMode(defaultMode);
    } else {
      setReceiptMode(showInvoiceToggle ? 'ticket' : 'invoice');
    }
  }, [defaultMode, showInvoiceToggle]);
  const [logoError, setLogoError] = useState(false);
  const [logo2Error, setLogo2Error] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const [parentWidth, setParentWidth] = useState<number>(0);
  const [elementHeight, setElementHeight] = useState<number>(0);
  const previewWrapperRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (receiptMode !== 'invoice') return;
    
    const handleResize = () => {
      if (previewWrapperRef.current) {
        setParentWidth(previewWrapperRef.current.getBoundingClientRect().width);
      }
      if (invoiceRef.current) {
        setElementHeight(invoiceRef.current.offsetHeight);
      }
    };

    handleResize();
    
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      if (previewWrapperRef.current) resizeObserver.observe(previewWrapperRef.current);
      if (invoiceRef.current) resizeObserver.observe(invoiceRef.current);
    }

    window.addEventListener('resize', handleResize);
    const timer = setTimeout(handleResize, 150);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      clearTimeout(timer);
    };
  }, [receiptMode, invoiceStyle.containerWidth]);

  const formatDateToSlash = (dateStr?: string) => {
    if (!dateStr) return '-';
    const datePart = dateStr.split(' ')[0].split('T')[0];
    return datePart.replace(/-/g, '/');
  };

  // Helper to convert any oklch or oklab color string inside a CSS value/rule to standard rgb/rgba
  const convertOklchToRgbString = (cssText: string): string => {
    // 1. Convert oklch(L C H [/ A])
    let processed = cssText.replace(/[oO][kK][lL][cC][hH]\(([^)]+)\)/g, (match, contents) => {
      try {
        const parts = contents.trim().split(/[\s,/\u002F]+/);
        if (parts.length < 3) return 'rgb(128, 128, 128)';

        const parsePart = (valStr: string, isPercentScale = false) => {
          let val = parseFloat(valStr);
          if (valStr.endsWith('%')) {
            val = parseFloat(valStr) / 100;
            if (!isPercentScale) {
              return val;
            }
          }
          return val;
        };

        const l = parsePart(parts[0], false); // Lightness (0-1)
        const c = parsePart(parts[1], true);  // Chroma (typically 0-0.4)
        
        let hStr = parts[2];
        let h = parseFloat(hStr); // Hue
        if (hStr.endsWith('rad')) {
          h = parseFloat(hStr) * (180 / Math.PI);
        } else if (hStr.endsWith('turn')) {
          h = parseFloat(hStr) * 360;
        } else if (hStr.endsWith('deg')) {
          h = parseFloat(hStr);
        }

        let a = 1;
        if (parts.length >= 4) {
          a = parsePart(parts[3], false); // Alpha
        }

        // Math conversion from OKLCH to RGB
        const hRad = (h * Math.PI) / 180;
        const a_ = c * Math.cos(hRad);
        const b_ = c * Math.sin(hRad);
        
        const l_ = l + 0.3963377774 * a_ + 0.2158037573 * b_;
        const m_ = l - 0.1055613458 * a_ - 0.0638541728 * b_;
        const s_ = l - 0.0894841775 * a_ - 1.2914855414 * b_;
        
        const lLinear = Math.pow(Math.max(0, l_), 3);
        const mLinear = Math.pow(Math.max(0, m_), 3);
        const sLinear = Math.pow(Math.max(0, s_), 3);
        
        let r = +4.0767416621 * lLinear - 3.3077115913 * mLinear + 0.2309699292 * sLinear;
        let g = -1.2684380046 * lLinear + 2.6097574011 * mLinear - 0.3413193965 * sLinear;
        let b = -0.0041960863 * lLinear - 0.7034186147 * mLinear + 1.7076147010 * sLinear;
        
        const toSRGB = (cVal: number) => {
          if (cVal <= 0.0031308) {
            return Math.max(0, Math.min(255, Math.round(cVal * 12.92 * 255)));
          } else {
            return Math.max(0, Math.min(255, Math.round((1.055 * Math.pow(cVal, 1 / 2.4) - 0.055) * 255)));
          }
        };
        
        const rSRGB = toSRGB(r);
        const gSRGB = toSRGB(g);
        const bSRGB = toSRGB(b);
        
        if (a === 1) {
          return `rgb(${rSRGB}, ${gSRGB}, ${bSRGB})`;
        } else {
          return `rgba(${rSRGB}, ${gSRGB}, ${bSRGB}, ${a})`;
        }
      } catch (e) {
        return 'rgb(128, 128, 128)';
      }
    });

    // 2. Convert oklab(L A B [/ Alpha])
    processed = processed.replace(/[oO][kK][lL][aA][bB]\(([^)]+)\)/g, (match, contents) => {
      try {
        const parts = contents.trim().split(/[\s,/\u002F]+/);
        if (parts.length < 3) return 'rgb(128, 128, 128)';

        const parsePart = (valStr: string) => {
          let val = parseFloat(valStr);
          if (valStr.endsWith('%')) {
            val = parseFloat(valStr) / 100;
          }
          return val;
        };

        const l = parsePart(parts[0]); // Lightness (0-1)
        const a_ = parsePart(parts[1]); // a axis
        const b_ = parsePart(parts[2]); // b axis

        let alpha = 1;
        if (parts.length >= 4) {
          alpha = parsePart(parts[3]);
        }

        const l_ = l + 0.3963377774 * a_ + 0.2158037573 * b_;
        const m_ = l - 0.1055613458 * a_ - 0.0638541728 * b_;
        const s_ = l - 0.0894841775 * a_ - 1.2914855414 * b_;
        
        const lLinear = Math.pow(Math.max(0, l_), 3);
        const mLinear = Math.pow(Math.max(0, m_), 3);
        const sLinear = Math.pow(Math.max(0, s_), 3);
        
        let r = +4.0767416621 * lLinear - 3.3077115913 * mLinear + 0.2309699292 * sLinear;
        let g = -1.2684380046 * lLinear + 2.6097574011 * mLinear - 0.3413193965 * sLinear;
        let b = -0.0041960863 * lLinear - 0.7034186147 * mLinear + 1.7076147010 * sLinear;
        
        const toSRGB = (cVal: number) => {
          if (cVal <= 0.0031308) {
            return Math.max(0, Math.min(255, Math.round(cVal * 12.92 * 255)));
          } else {
            return Math.max(0, Math.min(255, Math.round((1.055 * Math.pow(cVal, 1 / 2.4) - 0.055) * 255)));
          }
        };
        
        const rSRGB = toSRGB(r);
        const gSRGB = toSRGB(g);
        const bSRGB = toSRGB(b);
        
        if (alpha === 1) {
          return `rgb(${rSRGB}, ${gSRGB}, ${bSRGB})`;
        } else {
          return `rgba(${rSRGB}, ${gSRGB}, ${bSRGB}, ${alpha})`;
        }
      } catch (e) {
        return 'rgb(128, 128, 128)';
      }
    });

    return processed;
  };

  // Helper to recursively copy critical computed style properties as absolute/rgb values
  const copyComputedStyles = (origEl: Element, cloneEl: Element) => {
    const origHtml = origEl as HTMLElement;
    const cloneHtml = cloneEl as HTMLElement;
    if (!origHtml || !cloneHtml) return;

    try {
      const computed = window.getComputedStyle(origHtml);
      if (cloneHtml.style) {
        const properties = [
          // 1. Layout & Flexbox & Grid
          'display', 'flexDirection', 'justifyContent', 'alignItems', 'flexWrap', 
          'flexGrow', 'flexShrink', 'gap', 'position', 'top', 'bottom', 'left', 'right',
          'gridTemplateColumns', 'gridTemplateRows', 'gridColumn', 'gridRow', 'alignSelf', 'justifySelf',
          
          // 2. Sizes & Spacing
          'width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight',
          'padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight',
          'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
          
          // 3. Typography
          'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'textAlign', 'textTransform', 'letterSpacing',
          'whiteSpace', 'wordBreak', 'verticalAlign', 'color',
          
          // 4. Background & Borders
          'backgroundColor', 'borderColor', 'borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor',
          'borderStyle', 'borderTopStyle', 'borderBottomStyle', 'borderLeftStyle', 'borderRightStyle',
          'borderWidth', 'borderTopWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderRightWidth',
          'borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius',
          
          // 5. Box shadow, opacity, etc.
          'boxShadow', 'opacity', 'visibility'
        ];

        for (const prop of properties) {
          // @ts-ignore
          let val = computed[prop];
          if (val && typeof val === 'string' && (val.includes('oklch(') || val.includes('oklab('))) {
            val = convertOklchToRgbString(val);
          }
          // @ts-ignore
          cloneHtml.style[prop] = val;
        }

        if (computed.fill) {
          let fillVal = computed.fill;
          if (fillVal && (fillVal.includes('oklch(') || fillVal.includes('oklab('))) fillVal = convertOklchToRgbString(fillVal);
          cloneHtml.style.fill = fillVal;
        }
        if (computed.stroke) {
          let strokeVal = computed.stroke;
          if (strokeVal && (strokeVal.includes('oklch(') || strokeVal.includes('oklab('))) strokeVal = convertOklchToRgbString(strokeVal);
          cloneHtml.style.stroke = strokeVal;
        }
        if (computed.strokeWidth) {
          cloneHtml.style.strokeWidth = computed.strokeWidth;
        }
        if (computed.strokeLinecap) {
          cloneHtml.style.strokeLinecap = computed.strokeLinecap;
        }
        if (computed.strokeLinejoin) {
          cloneHtml.style.strokeLinejoin = computed.strokeLinejoin;
        }
      }
    } catch (e) {
      // Ignore style copy errors for non-stylable elements
    }

    const origChildren = Array.from(origEl.children);
    const cloneChildren = Array.from(cloneEl.children);
    for (let i = 0; i < origChildren.length; i++) {
      if (origChildren[i] && cloneChildren[i]) {
        copyComputedStyles(origChildren[i], cloneChildren[i]);
      }
    }
  };

  // Helper to sanitize all elements, styles and sheets in the cloned document from oklch/oklab to prevent html2canvas crashes
  const sanitizeClonedDocStyles = (clonedDoc: Document) => {
    // 1. Sanitize all style tags text content
    try {
      const styleTags = Array.from(clonedDoc.querySelectorAll('style')) as HTMLStyleElement[];
      for (const style of styleTags) {
        if (style.textContent && (style.textContent.includes('oklch(') || style.textContent.includes('oklab(') || style.textContent.includes('OKLCH(') || style.textContent.includes('OKLAB('))) {
          style.textContent = convertOklchToRgbString(style.textContent);
        }
      }
    } catch (e) {
      console.error('Error sanitizing style tags', e);
    }

    // 2. Sanitize style sheets' rules (including stylesheet links and CSSOM rules)
    try {
      const sheets = Array.from(clonedDoc.styleSheets);
      for (const sheet of sheets) {
        try {
          if (!sheet.cssRules) continue;
          const rules = Array.from(sheet.cssRules);
          for (let i = rules.length - 1; i >= 0; i--) {
            const rule = rules[i];
            if (rule.cssText && (rule.cssText.includes('oklch(') || rule.cssText.includes('oklab(') || rule.cssText.includes('OKLCH(') || rule.cssText.includes('OKLAB('))) {
              try {
                const converted = convertOklchToRgbString(rule.cssText);
                sheet.deleteRule(i);
                sheet.insertRule(converted, i);
              } catch (ruleErr) {
                // If we fail to replace the rule, delete it to prevent html2canvas crashing on it
                try {
                  sheet.deleteRule(i);
                } catch (e) {}
              }
            }
          }
        } catch (sheetErr) {
          // SecurityError (cross-origin stylesheet) -> remove the node to prevent html2canvas from loading/parsing it
          try {
            const node = sheet.ownerNode as any;
            if (node && node.parentNode) {
              node.parentNode.removeChild(node);
            }
          } catch (e) {}
        }
      }
    } catch (e) {
      console.error('Error sanitizing style sheets', e);
    }

    // 3. Sanitize inline styles of all cloned elements
    try {
      const allElements = Array.from(clonedDoc.querySelectorAll('*')) as HTMLElement[];
      for (const el of allElements) {
        if (el.style) {
          for (let i = 0; i < el.style.length; i++) {
            const prop = el.style[i];
            let val = el.style.getPropertyValue(prop);
            if (val && (val.includes('oklch(') || val.includes('oklab(') || val.includes('OKLCH(') || val.includes('OKLAB('))) {
              try {
                el.style.setProperty(prop, convertOklchToRgbString(val));
              } catch (e) {}
            }
          }
        }
      }
    } catch (e) {
      console.error('Error sanitizing element styles', e);
    }
  };

  // Find matching family member account based on memberId or matching dogName to register in printing
  const matchedFamilyAccount = React.useMemo(() => {
    if (!bill.memberId) return null;
    const local = localStorage.getItem('pet_paradise_member_assets_v3');
    if (!local) return null;
    try {
      const assets = JSON.parse(local) as any[];
      const cleanInputId = bill.memberId.replace(/^MEM-/, '').trim();
      return assets.find((acc) => {
        const idMatch = cleanInputId && acc.memberId.toLowerCase() === cleanInputId.toLowerCase();
        const petMatch = bill.dogName && acc.pets.some((p: any) => p.name.toLowerCase() === bill.dogName.trim().toLowerCase());
        return idMatch || petMatch;
      });
    } catch (e) {
      return null;
    }
  }, [bill.memberId, bill.dogName]);

  const formattedDate = new Date(bill.createdAt).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Calculate savings
  const savings = bill.subtotal - bill.total;

  // Find or calculate the room type based on the boarding service selected
  const roomType = React.useMemo(() => {
    const boardingItem = bill.items.find(item => item.name.includes('房') || item.name.includes('寄养'));
    return boardingItem ? boardingItem.name.replace(/\(.*?\)/g, '').trim() : '标准度假房 Standard Room';
  }, [bill.items]);

  // Determine whether to display Remarks: only when using discount coupons or member day 88% discount
  const showRemarks = React.useMemo(() => {
    // 1. Coupon usage (vouchers / discount coupons)
    const getCouponQty = (val: boolean | number | undefined): number => {
      if (val === undefined) return 0;
      if (typeof val === 'number') return val;
      return val ? 1 : 0;
    };
    const daycareQty = getCouponQty(bill.useDaycareCoupon);
    const boardingQty = getCouponQty(bill.useBoardingUpgradeCoupon);
    const specialCareQty = getCouponQty(bill.useSpecialCareUpgradeCoupon);
    const washQty = getCouponQty(bill.useWashUpgradeCoupon);
    const transferQty = getCouponQty(bill.useTransferCoupon);
    const dentalQty = getCouponQty(bill.useDentalCoupon);
    
    const hasCoupons = daycareQty > 0 || boardingQty > 0 || specialCareQty > 0 || washQty > 0 || transferQty > 0 || dentalQty > 0;
    
    // 2. Member Day 88% discount usage
    const hasMemberDay88 = !!(bill.isMemberDay && bill.memberDayDiscountAmount && bill.memberDayDiscountAmount > 0) || bill.items.some(item => item.memberDayStacked);
    
    return hasCoupons || hasMemberDay88;
  }, [
    bill.useDaycareCoupon, 
    bill.useBoardingUpgradeCoupon, 
    bill.useSpecialCareUpgradeCoupon, 
    bill.useWashUpgradeCoupon, 
    bill.useTransferCoupon, 
    bill.useDentalCoupon, 
    bill.isMemberDay,
    bill.memberDayDiscountAmount,
    bill.items
  ]);

  const usedCouponsList = React.useMemo(() => {
    const list: string[] = [];
    const getCouponQty = (val: boolean | number | undefined): number => {
      if (val === undefined) return 0;
      if (typeof val === 'number') return val;
      return val ? 1 : 0;
    };
    if (getCouponQty(bill.useDaycareCoupon) > 0) list.push(`全天日托兑换券 (x${getCouponQty(bill.useDaycareCoupon)})`);
    if (getCouponQty(bill.useBoardingUpgradeCoupon) > 0) list.push(`度假房升级房券 (x${getCouponQty(bill.useBoardingUpgradeCoupon)})`);
    if (getCouponQty(bill.useSpecialCareUpgradeCoupon) > 0) list.push(`特殊陪护房升级券 (x${getCouponQty(bill.useSpecialCareUpgradeCoupon)})`);
    if (getCouponQty(bill.useWashUpgradeCoupon) > 0) list.push(`高端洗护升级券 (x${getCouponQty(bill.useWashUpgradeCoupon)})`);
    if (getCouponQty(bill.useTransferCoupon) > 0) list.push(`10km同城接送券 (x${getCouponQty(bill.useTransferCoupon)})`);
    if (getCouponQty(bill.useDentalCoupon) > 0) list.push(`高端洁牙抵扣券 (x${getCouponQty(bill.useDentalCoupon)})`);
    return list;
  }, [
    bill.useDaycareCoupon,
    bill.useBoardingUpgradeCoupon,
    bill.useSpecialCareUpgradeCoupon,
    bill.useWashUpgradeCoupon,
    bill.useTransferCoupon,
    bill.useDentalCoupon
  ]);

  // Print Receipt
  const handlePrint = () => {
    const isInvoice = receiptMode === 'invoice';
    const targetRef = isInvoice ? invoiceRef : receiptRef;
    const printContent = targetRef.current?.innerHTML;
    if (!printContent) return;

    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body {
          background: white !important;
          color: black !important;
          margin: 0;
          padding: 20px;
        }
        .no-print {
          display: none !important;
        }
        .print-container {
          box-shadow: none !important;
          border: ${isInvoice ? '2px solid #1A202C' : 'none'} !important;
          max-width: 100% !important;
          width: ${isInvoice ? '100%' : '320px'} !important;
          margin: 0 auto;
        }
      }
    `;
    document.head.appendChild(style);
    window.print();
    style.remove();
  };

  // Download receipt or invoice as an image
  const handleDownloadImage = async () => {
    const isInvoice = receiptMode === 'invoice';
    const element = isInvoice ? invoiceRef.current : receiptRef.current;
    if (!element) return;

    const originalScrollX = window.scrollX;
    const originalScrollY = window.scrollY;

    try {
      // Temporarily scroll to top left to prevent html2canvas offset issues or blank drawings
      window.scrollTo(0, 0);

      const containerWidthPx = isInvoice
        ? Math.round((invoiceStyle.containerWidth / 25.4) * 96)
        : 450;

      // Run html2canvas on the live element with onclone styling resets and sanitizations
      const canvas = await html2canvas(element, {
        scale: 2, // high quality
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: isInvoice ? containerWidthPx : 450, // Lock the canvas width to match the cloned element width to prevent cut-offs!
        windowWidth: containerWidthPx + 100,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        onclone: (clonedDoc) => {
          try {
            // 1. Clear any adopted stylesheets inside clonedDoc as well
            try {
              // @ts-ignore
              clonedDoc.adoptedStyleSheets = [];
            } catch (e) {
              // Ignore
            }

            // 2. Setup target cloned element using element.id and fallback classes
            const targetId = element.id || (isInvoice ? 'formal-invoice-container' : `receipt-paper-${bill.id}`);
            let clonedElement = clonedDoc.getElementById(targetId) as HTMLElement | null;
            if (!clonedElement) {
              clonedElement = clonedDoc.querySelector('.print-container') as HTMLElement | null;
            }
            if (clonedElement) {
              // Recursively copy absolute styles inline to make it completely self-contained and accurate
              copyComputedStyles(element, clonedElement);

              // Detach clonedElement, clear body, and append to make it the sole element
              if (clonedElement.parentNode) {
                clonedElement.parentNode.removeChild(clonedElement);
              }
              clonedDoc.body.innerHTML = '';
              clonedDoc.body.appendChild(clonedElement);

              // Reset body margins and padding
              clonedDoc.body.style.margin = '0';
              clonedDoc.body.style.padding = '0';
              clonedDoc.body.style.backgroundColor = '#ffffff';

              // Reset transforms, borders, shadows so it is rendered completely
              clonedElement.style.transform = 'none';
              clonedElement.style.webkitTransform = 'none';
              clonedElement.style.position = 'relative';
              clonedElement.style.left = 'auto';
              clonedElement.style.top = 'auto';
              clonedElement.style.marginLeft = 'auto';
              clonedElement.style.marginRight = 'auto';
              clonedElement.style.boxShadow = 'none';
              clonedElement.style.opacity = '1';
              clonedElement.style.visibility = 'visible';
              clonedElement.style.display = 'block';

              if (isInvoice) {
                clonedElement.style.border = 'none';
                clonedElement.style.width = `${invoiceStyle.containerWidth}mm`;
                clonedElement.style.minWidth = `${invoiceStyle.containerWidth}mm`;
                clonedElement.style.maxWidth = `${invoiceStyle.containerWidth}mm`;
                clonedElement.style.height = 'auto';
                clonedElement.style.minHeight = '297mm';
              } else {
                clonedElement.style.border = '4px solid #1A202C'; // Keep the cute border!
                clonedElement.style.borderRadius = '24px';       // Keep the cute corners!
                clonedElement.style.width = '450px';
                clonedElement.style.minWidth = '450px';
                clonedElement.style.maxWidth = '450px';
                clonedElement.style.height = 'auto';
              }
            }

            // 3. Sanitize all styles, stylesheets, and elements to replace any oklch / oklab colors
            sanitizeClonedDocStyles(clonedDoc);
          } catch (err) {
            console.error('Error during html2canvas onclone styling', err);
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const safeDogName = bill.dogName || '宝贝';
      const safeBillNumber = bill.billNumber || 'DRAFT';
      link.download = `好厉害乐园_${isInvoice ? '正式账单' : '小票'}_${safeDogName}_${safeBillNumber}.png`;
      link.href = imgData;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
      triggerAlert('生成图片失败，请稍后重试');
    } finally {
      // Restore scroll position
      window.scrollTo(originalScrollX, originalScrollY);
    }
  };

  // Download receipt or invoice as a high-quality PDF directly
  const handleDownloadPDF = async () => {
    const isInvoice = receiptMode === 'invoice';
    const element = isInvoice ? invoiceRef.current : receiptRef.current;
    if (!element) return;

    const originalScrollX = window.scrollX;
    const originalScrollY = window.scrollY;

    try {
      // Temporarily scroll to top left to prevent html2canvas offset issues or blank drawings
      window.scrollTo(0, 0);

      const containerWidthPx = isInvoice
        ? Math.round((invoiceStyle.containerWidth / 25.4) * 96)
        : 450;

      // Run html2canvas on the live element with onclone styling resets and sanitizations
      const canvas = await html2canvas(element, {
        scale: 2, // high quality
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: isInvoice ? containerWidthPx : 450, // Lock the canvas width to match the cloned element width to prevent cut-offs!
        windowWidth: containerWidthPx + 100,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        onclone: (clonedDoc) => {
          try {
            // 1. Clear any adopted stylesheets inside clonedDoc as well
            try {
              // @ts-ignore
              clonedDoc.adoptedStyleSheets = [];
            } catch (e) {
              // Ignore
            }

            // 2. Setup target cloned element using element.id and fallback classes
            const targetId = element.id || (isInvoice ? 'formal-invoice-container' : `receipt-paper-${bill.id}`);
            let clonedElement = clonedDoc.getElementById(targetId) as HTMLElement | null;
            if (!clonedElement) {
              clonedElement = clonedDoc.querySelector('.print-container') as HTMLElement | null;
            }
            if (clonedElement) {
              // Recursively copy absolute styles inline to make it completely self-contained and accurate
              copyComputedStyles(element, clonedElement);

              // Detach clonedElement, clear body, and append to make it the sole element
              if (clonedElement.parentNode) {
                clonedElement.parentNode.removeChild(clonedElement);
              }
              clonedDoc.body.innerHTML = '';
              clonedDoc.body.appendChild(clonedElement);

              // Reset body margins and padding
              clonedDoc.body.style.margin = '0';
              clonedDoc.body.style.padding = '0';
              clonedDoc.body.style.backgroundColor = '#ffffff';

              // Reset transforms, borders, shadows so it is rendered completely
              clonedElement.style.transform = 'none';
              clonedElement.style.webkitTransform = 'none';
              clonedElement.style.position = 'relative';
              clonedElement.style.left = 'auto';
              clonedElement.style.top = 'auto';
              clonedElement.style.marginLeft = 'auto';
              clonedElement.style.marginRight = 'auto';
              clonedElement.style.boxShadow = 'none';
              clonedElement.style.opacity = '1';
              clonedElement.style.visibility = 'visible';
              clonedElement.style.display = 'block';

              if (isInvoice) {
                clonedElement.style.border = 'none';
                clonedElement.style.width = `${invoiceStyle.containerWidth}mm`;
                clonedElement.style.minWidth = `${invoiceStyle.containerWidth}mm`;
                clonedElement.style.maxWidth = `${invoiceStyle.containerWidth}mm`;
                clonedElement.style.height = 'auto';
                clonedElement.style.minHeight = '297mm';
              } else {
                clonedElement.style.border = '4px solid #1A202C'; // Keep the cute border!
                clonedElement.style.borderRadius = '24px';       // Keep the cute corners!
                clonedElement.style.width = '450px';
                clonedElement.style.minWidth = '450px';
                clonedElement.style.maxWidth = '450px';
                clonedElement.style.height = 'auto';
              }
            }

            // 3. Sanitize all styles, stylesheets, and elements to replace any oklch / oklab colors
            sanitizeClonedDocStyles(clonedDoc);
          } catch (err) {
            console.error('Error during html2canvas onclone styling for PDF', err);
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Convert px to mm (1 px = 0.264583 mm). We divide by 2 because html2canvas is run with scale: 2
      const mmWidth = (imgWidth / 2) * 0.264583;
      const mmHeight = (imgHeight / 2) * 0.264583;
      
      const pdf = new jsPDF({
        orientation: mmWidth > mmHeight ? 'l' : 'p',
        unit: 'mm',
        format: [mmWidth, mmHeight]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, mmWidth, mmHeight);
      const safeDogName = bill.dogName || '宝贝';
      const safeBillNumber = bill.billNumber || 'DRAFT';
      pdf.save(`好厉害乐园_${isInvoice ? '正式账单' : '小票'}_${safeDogName}_${safeBillNumber}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
      triggerAlert('生成PDF失败，请稍后重试');
    } finally {
      // Restore scroll position
      window.scrollTo(originalScrollX, originalScrollY);
    }
  };

  // Generate plain-text representation for easy copying (WeChat/Message sharing)
  const getShareText = () => {
    const header = `🐾 【好厉害宠物乐园 · 消费结账单】 🐾\n`;
    const meta = `账单单号: ${bill.billNumber}\n结账时间: ${formattedDate}\n-----------------------------\n`;
    const dogInfo = `宝贝姓名: ${bill.dogName}\n宝贝品种: ${bill.dogBreed}\n${bill.checkInDate ? `入住日期: ${bill.checkInDate}\n` : ''}${bill.checkOutDate ? `离园时间: ${bill.checkOutDate}\n` : ''}${bill.ownerPhone ? `家长电话: ${bill.ownerPhone}\n` : ''}`;
    const separator = `-----------------------------\n`;
    
    let itemsStr = `收费明细:\n`;
    bill.items.forEach((item, index) => {
      itemsStr += `${index + 1}. ${item.name} | ¥${item.price.toFixed(1)} x ${item.quantity} ${item.unit}\n`;
    });
    
    let pricing = `\n原价合计: ¥${bill.subtotal.toFixed(1)}\n会员级别: ${bill.memberTypeName}\n`;
    if (bill.isHoliday) {
      pricing += `法定节假日: 是 (节假日不享受会员折扣与兑换券)\n`;
    } else {
      pricing += `专属折扣: ${Math.round(bill.discount * 100)}%\n`;
      if (bill.isMemberDay && bill.memberDayDiscountAmount && bill.memberDayDiscountAmount > 0) {
        pricing += `🎉 会员日额外88折: -¥${bill.memberDayDiscountAmount.toFixed(1)}\n`;
      }
    }
    pricing += `应收总计: ¥${bill.total.toFixed(1)}\n`;
    
    const footer = `-----------------------------\n凭本小票可免费领取狗狗肉干一份 🥩\n祝 ${bill.dogName} 永远开开心心，健康茁壮成长！🐾`;

    return header + meta + dogInfo + separator + itemsStr + pricing + footer;
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(getShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      triggerAlert('复制失败，请手动选定文本复制');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 w-full"
    >
      {/* Action Buttons & Mode Toggle at the very top */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center no-print bg-[#FFFEEB] p-3.5 rounded-2xl border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1A202C]">
        {/* Toggle Mode */}
        {showInvoiceToggle ? (
          <div className="flex bg-white p-1 rounded-xl border-2 border-slate-800 shadow-[1.5px_1.5px_0px_0px_#1A202C] gap-1">
            <button
              onClick={() => setReceiptMode('ticket')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                receiptMode === 'ticket'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <PawPrint className="w-3.5 h-3.5" />
              <span>🧾 简约热敏小票</span>
            </button>
            <button
              onClick={() => setReceiptMode('invoice')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                receiptMode === 'invoice'
                  ? 'bg-[#B9E3F8] text-slate-900 border border-slate-800'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>📋 正式网格账单</span>
            </button>
          </div>
        ) : (
          <div className="text-xs font-black text-slate-700 px-2 py-1">
            ✨ 正式账单预览 (Formal Layout Preview)
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 justify-end w-full sm:w-auto">
          <button
            onClick={handleDownloadImage}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-slate-850 bg-white border-2 border-slate-800 rounded-xl hover:bg-slate-50 active:translate-y-0.5 transition-all font-black shadow-[2px_2px_0px_0px_#1A202C] cursor-pointer"
            title="生成并下载PNG图片"
          >
            <ImageIcon className="w-4 h-4 text-slate-800" />
            <span>保存为账单图片</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-slate-850 bg-white border-2 border-slate-800 rounded-xl hover:bg-slate-50 active:translate-y-0.5 transition-all font-black shadow-[2px_2px_0px_0px_#1A202C] cursor-pointer"
            title="生成并下载PDF文档"
          >
            <FileText className="w-4 h-4 text-slate-850" />
            <span>保存为PDF</span>
          </button>
        </div>
      </div>

      {/* Styled Canvas Area */}
      <div className="flex justify-center w-full overflow-x-auto py-2">
        {receiptMode === 'ticket' ? (
          <div
            ref={receiptRef}
            className="print-container w-full max-w-sm bg-white px-5 sm:px-6 py-8 rounded-3xl border-4 border-slate-800 relative overflow-hidden shadow-[4px_4px_0px_0px_#1A202C]"
            id={`receipt-paper-${bill.id}`}
          >
            {/* Decorative small stars/hearts peeking in margins */}
            <PinkHeart className="absolute top-4 right-4 opacity-25 rotate-12 w-8 h-8 pointer-events-none" />
            <BlueSparkle className="absolute top-28 left-2 opacity-20 rotate-[-15deg] w-6 h-6 pointer-events-none" />
            <YellowSparkle className="absolute bottom-20 right-3 opacity-25 rotate-[20deg] w-7 h-7 pointer-events-none" />

            {/* Aesthetic Watermark Circle Background */}
            <div className="absolute right-[-20px] top-[-20px] text-slate-200 opacity-[0.1] select-none pointer-events-none">
              <PawPrint className="w-48 h-48" />
            </div>

            {/* Receipt Content */}
            <div className="space-y-5 font-mono">
              {/* Header branding */}
              <div className="text-center space-y-1.5">
                <div className="inline-flex items-center justify-center gap-1.5 text-slate-900 bg-[#B9E3F8] px-3 py-1 rounded-xl border-2 border-slate-800 shadow-[1.5px_1.5px_0px_0px_#1A202C]">
                  <PawPrint className="w-4 h-4 fill-slate-900 stroke-slate-900" />
                  <span className="text-[10px] font-black tracking-widest">Holy Pawfect Day</span>
                </div>
                <h1 className="text-lg font-black text-slate-850 tracking-tight mt-1 font-hand">🐾 好厉害宠物乐园结算单</h1>
                <p className="text-[9px] text-slate-400 font-bold tracking-wider">NO: {bill.billNumber}</p>
              </div>

              {/* Dotted separator */}
              <div className="border-t-2 border-dashed border-slate-300"></div>

              {/* Meta Information list */}
              <div className="text-[11px] text-slate-700 space-y-1.5 bg-[#FFFEEB] border-2 border-slate-800 p-3.5 rounded-2xl shadow-[2px_2px_0px_0px_#1A202C]">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">宠物姓名:</span>
                  <span className="font-black text-slate-900">{bill.dogName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">宠物类型:</span>
                  <span className="font-black text-slate-900">{bill.petType || '狗狗'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">宠物品种:</span>
                  <span className="text-slate-900 font-black">{bill.dogBreed || '未知品种'}</span>
                </div>
                {bill.petWeight !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">宠物体重:</span>
                    <span className="text-slate-900 font-black">{bill.petWeight} kg</span>
                  </div>
                )}
                {bill.checkInDate && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">入住日期:</span>
                    <span className="text-slate-900 font-bold">{bill.checkInDate}</span>
                  </div>
                )}
                {bill.checkOutDate && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">离园时间:</span>
                    <span className="text-slate-900 font-bold">{bill.checkOutDate}</span>
                  </div>
                )}
                {bill.ownerPhone && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">家长手机:</span>
                    <span className="text-slate-900 font-bold">{bill.ownerPhone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">结账时间:</span>
                  <span className="text-slate-900 font-bold">{formattedDate}</span>
                </div>
              </div>

              {/* Dotted separator */}
              <div className="border-t-2 border-dashed border-slate-300"></div>

              {/* Table Header */}
              <div>
                <div className="grid grid-cols-12 text-[10px] text-slate-500 font-black tracking-wide uppercase pb-2">
                  <span className="col-span-6">收费项目</span>
                  <span className="col-span-3 text-right">单价/数量</span>
                  <span className="col-span-3 text-right">小计</span>
                </div>

                {/* Items List */}
                <div className="space-y-3 pt-2 border-t-2 border-slate-200">
                  {bill.items.map((item, idx) => {
                    const hasDeduction = item.originalPrice !== undefined && item.price < item.originalPrice;
                    return (
                      <div key={`${item.serviceId}-${idx}`} className="grid grid-cols-12 text-xs text-slate-800 items-center">
                        <span className="col-span-6 font-black text-slate-850 break-words pr-1">{item.name}</span>
                        <span className="col-span-3 text-right text-slate-500">
                          ¥{(item.originalPrice ?? item.price).toFixed(1)}/{item.unit} <br />
                          <span className="text-[10px] font-black text-slate-400">x{item.quantity}</span>
                        </span>
                        <span className="col-span-3 text-right font-black">
                          {hasDeduction && (
                            <div className="text-[10px] line-through text-slate-300 leading-none mb-0.5">
                              ¥{(item.originalPrice! * item.quantity).toFixed(1)}
                            </div>
                          )}
                          <div className={hasDeduction ? 'text-emerald-600 leading-none' : 'text-slate-900 leading-none'}>
                            ¥{(item.price * item.quantity).toFixed(1)}
                          </div>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dotted separator */}
              <div className="border-t-2 border-dashed border-slate-300"></div>

              {/* Math totals */}
              <div className="space-y-2 text-xs text-slate-700 bg-white border-2 border-slate-800 p-3 rounded-2xl shadow-[2px_2px_0px_0px_#1A202C]">
                <div className="flex justify-between text-slate-900 text-sm font-black">
                  <span>原价小计:</span>
                  <span className="font-mono font-black text-slate-950">¥{bill.subtotal.toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-bold">
                  <span>会员折扣级别:</span>
                  <span className="text-slate-800 font-black">
                    {bill.isHoliday ? (
                      <span className="text-rose-600 bg-rose-50 border border-rose-300 px-1 py-0.5 rounded text-[10px] font-black">
                        🏮 法定节假日(无折扣)
                      </span>
                    ) : (
                      `${bill.memberTypeName} (${Math.round(bill.discount * 100)}%)`
                    )}
                  </span>
                </div>

                {/* Member Day details */}
                {!bill.isHoliday && bill.isMemberDay && bill.memberDayDiscountAmount !== undefined && bill.memberDayDiscountAmount > 0 && (
                  <div className="flex justify-between text-sky-850 bg-[#B9E3F8]/30 border border-sky-400 px-2 py-1 rounded-xl mt-1 select-none font-bold text-[11px]">
                    <span>🎉 会员日享额外88折:</span>
                    <span className="font-mono font-black text-sky-800">-¥{bill.memberDayDiscountAmount.toFixed(1)}</span>
                  </div>
                )}
                
                {/* Coupons Details */}
                {(() => {
                  const getCouponQty = (val: boolean | number | undefined): number => {
                    if (val === undefined) return 0;
                    if (typeof val === 'number') return val;
                    return val ? 1 : 0;
                  };
                  const daycareQty = getCouponQty(bill.useDaycareCoupon);
                  const boardingQty = getCouponQty(bill.useBoardingUpgradeCoupon);
                  const specialCareQty = getCouponQty(bill.useSpecialCareUpgradeCoupon);
                  const washQty = getCouponQty(bill.useWashUpgradeCoupon);
                  const transferQty = getCouponQty(bill.useTransferCoupon);
                  const dentalQty = getCouponQty(bill.useDentalCoupon);

                  if (daycareQty > 0 || boardingQty > 0 || specialCareQty > 0 || washQty > 0 || transferQty > 0 || dentalQty > 0) {
                    return (
                      <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
                        <div className="text-[10px] text-slate-800 font-black uppercase tracking-wider flex items-center gap-1">
                          🌟 已抵扣会员年卡权益：
                        </div>
                        {daycareQty > 0 && (
                          <div className="flex justify-between text-[11px] text-emerald-700 pl-2 font-bold">
                            <span>• 全天日托兑换券 {daycareQty > 1 ? `(x${daycareQty})` : ''}</span>
                            <span>已抵扣</span>
                          </div>
                        )}
                        {boardingQty > 0 && (
                          <div className="flex justify-between text-[11px] text-emerald-700 pl-2 font-bold">
                            <span>• 度假房升级房券 {boardingQty > 1 ? `(x${boardingQty})` : ''}</span>
                            <span>免费升级</span>
                          </div>
                        )}
                        {specialCareQty > 0 && (
                          <div className="flex justify-between text-[11px] text-emerald-700 pl-2 font-bold">
                            <span>• 特殊陪护房升级券 {specialCareQty > 1 ? `(x${specialCareQty})` : ''}</span>
                            <span>免费升级</span>
                          </div>
                        )}
                        {washQty > 0 && (
                          <div className="flex justify-between text-[11px] text-emerald-700 pl-2 font-bold">
                            <span>• 高端洗护升级券 {washQty > 1 ? `(x${washQty})` : ''}</span>
                            <span>药浴不计费</span>
                          </div>
                        )}
                        {transferQty > 0 && (
                          <div className="flex justify-between text-[11px] text-emerald-700 pl-2 font-bold">
                            <span>• 10km同城接送券 {transferQty > 1 ? `(x${transferQty})` : ''}</span>
                            <span>已抵扣接送</span>
                          </div>
                        )}
                        {dentalQty > 0 && (
                          <div className="flex justify-between text-[11px] text-emerald-700 pl-2 font-bold">
                            <span>• 高端洁牙抵扣券 {dentalQty > 1 ? `(x${dentalQty})` : ''}</span>
                            <span>牙结石免除</span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                })()}

                {savings > 0 && (
                  <div className="flex justify-between text-emerald-700 text-sm font-black border-t border-dashed border-slate-200 pt-2 mt-1.5">
                    <span>尊享折扣累计:</span>
                    <span className="font-mono">-¥{savings.toFixed(1)}</span>
                  </div>
                )}
                <div className="border-t-2 border-slate-200 my-1"></div>
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-slate-800 font-black text-xs">应收款项:</span>
                  <span className="text-xl font-black text-slate-900 font-mono">
                    ¥{bill.total.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Footer friendly message */}
              <div className="text-center space-y-1.5 border-t-2 border-slate-200 pt-3.5">
                <p className="text-[11px] text-slate-800 font-black font-hand">🐾 感谢您带宝贝光临好厉害宠物乐园！</p>
              </div>
            </div>
          </div>
        ) : (() => {
          const targetWidthPx = Math.round((invoiceStyle.containerWidth / 25.4) * 96);
          const availableWidth = Math.max(0, parentWidth - 16);
          const invoiceScale = availableWidth > 0 && availableWidth < targetWidthPx ? availableWidth / targetWidthPx : 1;

          return (
            <div 
              ref={previewWrapperRef} 
              className="w-full flex flex-col items-center overflow-visible select-none"
            >
              <div 
                style={{ 
                  width: `${availableWidth > 0 ? availableWidth : targetWidthPx}px`,
                  height: `${elementHeight * invoiceScale}px`,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'height 0.15s ease-out'
                }}
                className="flex justify-center"
              >
                <div
                  ref={invoiceRef}
                  id="formal-invoice-container"
                  className="print-container bg-white border border-slate-300 relative text-slate-800 font-formal shadow-md origin-top select-text"
                  style={{ 
                    width: `${invoiceStyle.containerWidth}mm`, 
                    minWidth: `${invoiceStyle.containerWidth}mm`, 
                    minHeight: '297mm',
                    padding: `${invoiceStyle.containerPadding}px`,
                    fontFamily: invoiceStyle.fontFamilyBase,
                    transform: `scale(${invoiceScale})`,
                    transformOrigin: 'top center',
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    marginLeft: `-${targetWidthPx / 2}px`
                  }}
                >
                  {/* Scoped style override for custom borders and section font-families */}
                  <style dangerouslySetInnerHTML={{ __html: `
                    #formal-invoice-container, #formal-invoice-container * {
                      border-color: ${invoiceStyle.tableBorderColor} !important;
                    }
                    #formal-invoice-container .font-formal-header, 
                    #formal-invoice-container .font-formal-header * {
                      font-family: ${invoiceStyle.fontFamilyHeader} !important;
                    }
                    #formal-invoice-container .font-formal-table,
                    #formal-invoice-container .font-formal-table * {
                      font-family: ${invoiceStyle.fontFamilyTable} !important;
                    }
                    #formal-invoice-container .font-formal-address,
                    #formal-invoice-container .font-formal-address * {
                      font-family: ${invoiceStyle.fontFamilyAddress || 'system-ui, sans-serif'} !important;
                    }
                    #formal-invoice-container table th {
                      vertical-align: middle !important;
                      border-right-color: ${invoiceStyle.tableHeaderBg} !important;
                      border-left-color: ${invoiceStyle.tableHeaderBg} !important;
                    }
                    #formal-invoice-container table td {
                      vertical-align: middle !important;
                    }
                    #formal-invoice-container .date-cell-bg-match {
                      border-right-color: transparent !important;
                      border-left-color: transparent !important;
                    }
                    #formal-invoice-container .total-row-yellow td {
                      background-color: #FFF2CC !important;
                      border-color: #FFF2CC !important;
                    }
                    
                    @media print {
                      #formal-invoice-container {
                        transform: none !important;
                        position: relative !important;
                        top: auto !important;
                        left: auto !important;
                        margin-left: auto !important;
                        margin-right: auto !important;
                        width: ${invoiceStyle.containerWidth}mm !important;
                        min-width: ${invoiceStyle.containerWidth}mm !important;
                        box-shadow: none !important;
                        border: none !important;
                      }
                    }
                  ` }} />

            {/* Formal Invoice Content */}
            <div className="space-y-6">
              {/* Header block with Logo and custom typography spacing */}
              <div className="flex flex-col items-center justify-center border-b border-slate-300 pb-6">
                {/* 【顶部 Logo 图片】：作为视觉核心，居中对齐 */}
                <div className="flex items-center justify-center" style={{ height: `${invoiceStyle.logoSize}px`, width: `${invoiceStyle.logoSize}px` }}>
                  {invoiceStyle.logoUrl ? (
                    <img
                      src={invoiceStyle.logoUrl}
                      alt="Custom Logo"
                      className="h-full w-full object-contain"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        console.log('Custom Logo load error, fallback to default');
                        (e.currentTarget as HTMLImageElement).src = '/logo.png';
                      }}
                    />
                  ) : (
                    <HolyPawfectPuppy className="h-full w-full object-contain" strokeColor="#1A202C" fillColor="#1A202C" />
                  )}
                </div>
                
                {!invoiceStyle.hideStoreName && (
                  <>
                    {/* 【Logo 与英文的间距】 */}
                    <div style={{ height: `${invoiceStyle.logoSpacing}px` }} />

                    {/* 【中间主英文店名】 */}
                    <h1 
                      className="leading-none font-black text-slate-900 text-center tracking-tight"
                      style={{ 
                        fontFamily: '"Fredoka", "Mali", "Inter", sans-serif',
                        fontSize: `${invoiceStyle.englishFontSize}px`
                      }}
                    >
                      {invoiceStyle.englishTitle}
                    </h1>

                    {/* 【英文与中文的间距】 */}
                    <div style={{ height: `${invoiceStyle.englishChineseSpacing}px` }} />

                    {/* 【底部中文店名】 */}
                    <h2 
                      className="leading-none font-black text-slate-800 text-center tracking-wider font-sans"
                      style={{ fontSize: `${invoiceStyle.chineseFontSize}px` }}
                    >
                      {invoiceStyle.chineseTitle}
                    </h2>
                  </>
                )}
              </div>

              {/* Guest and Pet Details Metadata */}
              <div 
                className="border border-slate-300 divide-y divide-slate-300 bg-white font-formal-header"
                style={{ 
                  fontSize: `${invoiceStyle.fontSizeHeader}px`, 
                  lineHeight: 1.2,
                  fontFamily: invoiceStyle.fontFamilyHeader || '"Microsoft YaHei", "微软雅黑", system-ui, sans-serif'
                }}
              >
                {/* Row 1: PET NAME / ARRIVAL */}
                <div className="flex flex-nowrap divide-x divide-slate-300 bg-white">
                  <div className="bg-slate-50/50 px-3 py-1.5 font-bold text-slate-700 flex items-center shrink-0 whitespace-nowrap" style={{ width: '150px' }}>
                    宝贝姓名 PET NAME
                  </div>
                  <div className="px-5 py-1.5 font-black text-slate-900 flex items-center shrink-0 whitespace-nowrap">
                    {bill.dogName}
                  </div>
                  <div className="flex-1 bg-white"></div>
                  <div className="bg-slate-50/50 px-3 py-1.5 font-bold text-slate-700 flex items-center shrink-0 whitespace-nowrap" style={{ width: '150px' }}>
                    入住时间 ARRIVAL
                  </div>
                  <div className="px-5 py-1.5 font-mono font-black text-slate-900 flex items-center shrink-0 whitespace-nowrap" style={{ width: '150px' }}>
                    {formatDateToSlash(bill.checkInDate)}
                  </div>
                </div>
                
                {/* Row 2: BREED / DEPARTURE */}
                <div className="flex flex-nowrap divide-x divide-slate-300 bg-white">
                  <div className="bg-slate-50/50 px-3 py-1.5 font-bold text-slate-700 flex items-center shrink-0 whitespace-nowrap" style={{ width: '150px' }}>
                    宝贝品种 BREED
                  </div>
                  <div className="px-5 py-1.5 font-black text-slate-900 flex items-center shrink-0 whitespace-nowrap">
                    {bill.dogBreed || '未知品种'}
                  </div>
                  <div className="flex-1 bg-white"></div>
                  <div className="bg-slate-50/50 px-3 py-1.5 font-bold text-slate-700 flex items-center shrink-0 whitespace-nowrap" style={{ width: '150px' }}>
                    退房日期 DEPARTURE
                  </div>
                  <div className="px-5 py-1.5 font-mono font-black text-slate-900 flex items-center shrink-0 whitespace-nowrap" style={{ width: '150px' }}>
                    {formatDateToSlash(bill.checkOutDate)}
                  </div>
                </div>

                {/* Row 3: MEMBERSHIP */}
                <div className="flex flex-nowrap divide-x divide-slate-300 bg-white">
                  <div className="bg-slate-50/50 px-3 py-1.5 font-bold text-slate-700 flex items-center shrink-0 whitespace-nowrap" style={{ width: '150px' }}>
                    会员类型 MEMBERSHIP
                  </div>
                  <div className="px-5 py-1.5 font-black text-slate-900 flex items-center shrink-0 whitespace-nowrap">
                    {bill.isMember ? (
                      <span className="text-sky-850 font-black">{bill.memberTypeName}</span>
                    ) : (
                      <span className="text-slate-400 font-bold">非会员</span>
                    )}
                  </div>
                  <div className="flex-1 bg-white"></div>
                  <div className="bg-slate-50/50 px-3 py-1.5 font-bold text-slate-700 flex items-center shrink-0 whitespace-nowrap" style={{ width: '150px' }}>
                    &nbsp;
                  </div>
                  <div className="bg-white px-5 py-1.5 font-mono font-black text-slate-900 flex items-center shrink-0 whitespace-nowrap" style={{ width: '150px' }}>
                    &nbsp;
                  </div>
                </div>
              </div>

              {/* Spacing between metadata and details table */}
              <div style={{ height: `${invoiceStyle.headerTableSpacing ?? 24}px` }} />

              {/* Grid Line Items Table */}
              <div className="overflow-x-auto border border-slate-300">
                <table className="w-full text-left border-collapse min-w-[640px] font-formal-table">
                  <thead>
                    <tr 
                      style={{ 
                        backgroundColor: invoiceStyle.tableHeaderBg, 
                        color: invoiceStyle.tableHeaderTextColor 
                      }}
                      className="border-b border-slate-300 text-xs font-bold uppercase"
                    >
                      <th className="p-3 border-r border-slate-300 text-center w-[110px] date-cell-bg-match whitespace-nowrap">日期 DATE</th>
                      <th className="p-3 border-r text-center" style={{ borderRightColor: invoiceStyle.tableHeaderBg }}>消费项目 DETAILS</th>
                      <th className="p-3 border-r text-center w-[180px]" style={{ borderRightColor: invoiceStyle.tableHeaderBg }}>备注 REFERENCE</th>
                      <th className="p-3 border-r text-center w-[75px]" style={{ borderRightColor: invoiceStyle.tableHeaderBg }}>数量 NO.</th>
                      <th className="p-3 border-r text-center w-[95px]" style={{ borderRightColor: invoiceStyle.tableHeaderBg }}>单价 PRICE</th>
                      <th className="p-3 border-r text-center w-[95px]" style={{ borderRightColor: invoiceStyle.tableHeaderBg }}>折扣 DISCOUNT</th>
                      <th className="p-3 text-center w-[110px]">消费金额 AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody 
                    className="divide-y divide-slate-300 text-xs"
                    style={{ fontSize: '12px' }}
                  >
                    {(() => {
                      const couponDeductedSum = bill.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
                      const generalDiscountFactor = couponDeductedSum > 0 ? (bill.total / couponDeductedSum) : 1.0;

                      return bill.items.map((item, idx) => {
                        // Deduce reference comment and discount label from the item-level choices
                        let reference = '标准项目 (Standard)';
                        let discountLabel = '原价';

                        const coupon = item.appliedCoupon || 'none';
                        if (coupon === 'daycare') {
                          reference = '使用会员日托券抵扣';
                          discountLabel = '免费兑换';
                        } else if (coupon === 'boarding') {
                          reference = '房型升级券免费升级';
                          discountLabel = '免费升级';
                        } else if (coupon === 'special_care') {
                          reference = '陪护房升级券抵扣';
                          discountLabel = '免费升级';
                        } else if (coupon === 'wash') {
                          reference = '高端洗护升级券抵扣';
                          discountLabel = '免费升级';
                        } else if (coupon === 'transfer') {
                          reference = '10km接送抵用券抵扣';
                          discountLabel = '免费兑换';
                        } else if (coupon === 'dental') {
                          reference = '高端洁牙抵扣券抵扣';
                          discountLabel = '免除费用';
                        } else if (bill.isHoliday) {
                          reference = '🏮 法定节假日价';
                          discountLabel = '无折扣';
                        } else {
                          const preset = item.discountPreset || '原价';
                          if (preset === '88折') {
                            reference = bill.isMemberDay ? '🎉 专属会员日额外88折' : '88折专享价';
                            discountLabel = '8.8折';
                          } else if (preset === '8折') {
                            reference = '会员专属8折';
                            discountLabel = '8折';
                          } else if (preset === '7折') {
                            reference = '会员特惠7折';
                            discountLabel = '7折';
                          } else if (preset === '6折') {
                            reference = '会员特惠6折';
                            discountLabel = '6折';
                          } else if (preset === '自定') {
                            const val = item.customDiscountValue || 10;
                            reference = '自定义折扣';
                            discountLabel = val === 10 ? '原价' : (val <= 10 ? `${val}折` : `${val}%`);
                          } else if (preset === '大众点评') {
                            reference = '大众点评专属特惠';
                            discountLabel = '大众点评价';
                          } else if (preset === '原价') {
                            discountLabel = '原价';
                            if (bill.isMember && bill.discount < 1.0) {
                              discountLabel = `${(bill.discount * 10).toFixed(1)}折`;
                              reference = '会员特惠价';
                            }
                          } else {
                            // Backup fallback calculation if original price is specified
                            if (item.originalPrice && item.price < item.originalPrice) {
                              const ratio = item.price / item.originalPrice;
                              const discountPercent = Math.round(ratio * 100);
                              if (discountPercent === 88) {
                                reference = bill.isMemberDay ? '🎉 专属会员日额外88折' : '88折专享价';
                                discountLabel = '8.8折';
                              } else if (discountPercent === 100) {
                                discountLabel = '原价';
                              } else {
                                discountLabel = `${(discountPercent / 10).toFixed(discountPercent % 10 === 0 ? 0 : 1)}折`;
                                reference = '会员专属折扣';
                              }
                            } else {
                              if (bill.isMember && bill.discount < 1.0) {
                                discountLabel = `${(bill.discount * 10).toFixed(1)}折`;
                                reference = '会员特惠价';
                              }
                            }
                          }
                        }

                        const finalLineUnitPrice = item.price * generalDiscountFactor;
                        const finalLineAmount = item.price * item.quantity * generalDiscountFactor;

                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-3 border-r border-slate-300 font-mono text-slate-500 text-center align-middle date-cell-bg-match whitespace-nowrap">
                              {formatDateToSlash(item.date || bill.checkInDate || formattedDate)}
                            </td>
                            <td className="p-3 border-r border-slate-300 font-bold text-slate-900 text-center align-middle">
                              {item.name}
                            </td>
                            <td className="p-3 border-r border-slate-300 text-slate-600 font-medium text-[11px] text-center align-middle">
                              {reference}
                            </td>
                            <td className="p-3 border-r border-slate-300 text-center align-middle font-bold">
                              {item.quantity} {item.unit}
                            </td>
                            <td className="p-3 border-r border-slate-300 text-center align-middle font-mono font-bold text-slate-600">
                              ¥{(item.originalPrice ?? item.price).toFixed(1)}
                            </td>
                            <td className={`p-3 border-r border-slate-300 text-center align-middle font-bold ${
                              discountLabel !== '原价' && discountLabel !== '无折扣' ? 'text-emerald-700' : 'text-slate-400'
                            }`}>
                              {discountLabel}
                            </td>
                            <td className="p-3 text-center align-middle font-mono font-black text-slate-900">
                              ¥{finalLineAmount.toFixed(1)}
                            </td>
                          </tr>
                        );
                      });
                    })()}

                    {/* Followed by exactly emptyRowsCount empty rows to satisfy the high-end padding constraint */}
                    {Array.from({ length: invoiceStyle.emptyRowsCount }).map((_, emptyIdx) => (
                      <tr key={`empty-${emptyIdx}`} className="h-9">
                        <td className="p-3 border-r border-slate-300 date-cell-bg-match">&nbsp;</td>
                        <td className="p-3 border-r border-slate-300">&nbsp;</td>
                        <td className="p-3 border-r border-slate-300">&nbsp;</td>
                        <td className="p-3 border-r border-slate-300">&nbsp;</td>
                        <td className="p-3 border-r border-slate-300">&nbsp;</td>
                        <td className="p-3 border-r border-slate-300">&nbsp;</td>
                        <td className="p-3">&nbsp;</td>
                      </tr>
                    ))}

                    {/* Total row - Colored yellow and borders match yellow */}
                    <tr className="font-black total-row-yellow">
                      <td colSpan={4} className="p-3.5">&nbsp;</td>
                      <td className="p-3.5 text-center align-middle text-slate-800 font-black uppercase tracking-wider text-[11px]">
                        总计 TOTAL
                      </td>
                      <td className="p-3.5">&nbsp;</td>
                      <td 
                        className="p-3.5 text-center align-middle font-mono text-slate-900 font-black"
                        style={{ fontSize: '12px' }}
                      >
                        <span>
                          ¥{bill.total.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Park Info and Notes Footer */}
              <div className="space-y-6 pt-6 border-t border-slate-300 font-formal-address">
                {/* Address and Contact Details Block */}
                <div 
                  className="text-center py-4 bg-white border border-slate-200 text-black flex flex-col justify-center items-center space-y-1.5"
                >
                  <h3 className="font-black text-black tracking-wider" style={{ fontSize: `${(invoiceStyle.addressFontSize ?? 12) + 2}px`, lineHeight: invoiceStyle.addressLineHeight || '1.0' }}>
                    好厉害宠物乐园
                  </h3>
                  <p className="text-black font-medium" style={{ fontSize: `${invoiceStyle.addressFontSize ?? 12}px`, lineHeight: invoiceStyle.addressLineHeight || '1.0' }}>
                    上海市静安区恒丰路610号A栋105室
                  </p>
                  <h3 className="font-black text-black tracking-wider" style={{ fontSize: `${(invoiceStyle.addressFontSize ?? 12) + 2}px`, lineHeight: invoiceStyle.addressLineHeight || '1.0' }}>
                    Holy Pawfect Day
                  </h3>
                  <p className="text-black font-medium" style={{ fontSize: `${invoiceStyle.addressFontSize ?? 12}px`, lineHeight: invoiceStyle.addressLineHeight || '1.0' }}>
                    Room 105, Building A, No.610 Hengfeng Road, Jing'an District, Shanghai, China
                  </p>
                  <div className="flex items-center justify-center gap-1.5 font-black text-black" style={{ fontSize: `${invoiceStyle.addressFontSize ?? 12}px`, lineHeight: invoiceStyle.addressLineHeight || '1.0' }}>
                    <span>📞 13386270878</span>
                  </div>
                </div>

                {/* Sticky Note / Instructions Block with Top Underline Separator and transparent bg */}
                <div 
                  className="space-y-2 text-left bg-white text-slate-800"
                  style={{
                    marginTop: `${invoiceStyle.remarksDividerSpacing ?? 20}px`,
                    paddingTop: invoiceStyle.showRemarksDivider ? `${invoiceStyle.remarksDividerSpacing ?? 20}px` : '0px',
                    borderTop: invoiceStyle.showRemarksDivider ? `1px solid ${invoiceStyle.tableBorderColor || '#CBD5E1'}` : 'none'
                  }}
                >
                  <div className="text-slate-800 leading-normal text-[11px] font-bold">
                    <div>备注:入住时间当天下午14点后，离园时间次日下午14点前</div>
                    <div className="text-slate-500 font-semibold mt-0.5">NOTE: Check-in is from 2:00 PM on the day of arrival, and check-out is before 2:00 PM on the day of departure.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  })()}
      </div>
    </motion.div>
  );
}
