import React, { useState, useRef } from 'react';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Legend, Area, ReferenceLine } from 'recharts';
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Set PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// ACCURATE 24-2 GRID LAYOUT - 54 points at 6° intervals, offset 3° from meridians
const VF_24_2_GRID = [
  // Row at y=21 (4 points)
  { id: 1, x: -9, y: 21 }, { id: 2, x: -3, y: 21 }, { id: 3, x: 3, y: 21 }, { id: 4, x: 9, y: 21 },
  // Row at y=15 (6 points)  
  { id: 5, x: -15, y: 15 }, { id: 6, x: -9, y: 15 }, { id: 7, x: -3, y: 15 }, { id: 8, x: 3, y: 15 }, { id: 9, x: 9, y: 15 }, { id: 10, x: 15, y: 15 },
  // Row at y=9 (8 points)
  { id: 11, x: -21, y: 9 }, { id: 12, x: -15, y: 9 }, { id: 13, x: -9, y: 9 }, { id: 14, x: -3, y: 9 },
  { id: 15, x: 3, y: 9 }, { id: 16, x: 9, y: 9 }, { id: 17, x: 15, y: 9 }, { id: 18, x: 21, y: 9 },
  // Row at y=3 (9 points)
  { id: 19, x: -27, y: 3 }, { id: 20, x: -21, y: 3 }, { id: 21, x: -15, y: 3 }, { id: 22, x: -9, y: 3 }, { id: 23, x: -3, y: 3 },
  { id: 24, x: 3, y: 3 }, { id: 25, x: 9, y: 3 }, { id: 26, x: 15, y: 3 }, { id: 27, x: 21, y: 3 },
  // Row at y=-3 (9 points)
  { id: 28, x: -27, y: -3 }, { id: 29, x: -21, y: -3 }, { id: 30, x: -15, y: -3 }, { id: 31, x: -9, y: -3 }, { id: 32, x: -3, y: -3 },
  { id: 33, x: 3, y: -3 }, { id: 34, x: 9, y: -3 }, { id: 35, x: 15, y: -3 }, { id: 36, x: 21, y: -3 },
  // Row at y=-9 (8 points)
  { id: 37, x: -21, y: -9 }, { id: 38, x: -15, y: -9 }, { id: 39, x: -9, y: -9 }, { id: 40, x: -3, y: -9 },
  { id: 41, x: 3, y: -9 }, { id: 42, x: 9, y: -9 }, { id: 43, x: 15, y: -9 }, { id: 44, x: 21, y: -9 },
  // Row at y=-15 (6 points)
  { id: 45, x: -15, y: -15 }, { id: 46, x: -9, y: -15 }, { id: 47, x: -3, y: -15 }, { id: 48, x: 3, y: -15 }, { id: 49, x: 9, y: -15 }, { id: 50, x: 15, y: -15 },
  // Row at y=-21 (4 points)
  { id: 51, x: -9, y: -21 }, { id: 52, x: -3, y: -21 }, { id: 53, x: 3, y: -21 }, { id: 54, x: 9, y: -21 },
];

// 10-2 GRID LAYOUT - 68 points at 2° intervals within central 10°
// Accurate Humphrey 10-2 pattern - diamond/oval shape like 24-2 but denser
// Based on actual HFA 10-2 printout layout
const VF_10_2_GRID = [
  // Row 1 (y=9): 2 points
  { id: 1, x: -1, y: 9 }, { id: 2, x: 1, y: 9 },
  // Row 2 (y=7): 6 points  
  { id: 3, x: -5, y: 7 }, { id: 4, x: -3, y: 7 }, { id: 5, x: -1, y: 7 }, { id: 6, x: 1, y: 7 }, { id: 7, x: 3, y: 7 }, { id: 8, x: 5, y: 7 },
  // Row 3 (y=5): 8 points
  { id: 9, x: -7, y: 5 }, { id: 10, x: -5, y: 5 }, { id: 11, x: -3, y: 5 }, { id: 12, x: -1, y: 5 }, { id: 13, x: 1, y: 5 }, { id: 14, x: 3, y: 5 }, { id: 15, x: 5, y: 5 }, { id: 16, x: 7, y: 5 },
  // Row 4 (y=3): 8 points
  { id: 17, x: -7, y: 3 }, { id: 18, x: -5, y: 3 }, { id: 19, x: -3, y: 3 }, { id: 20, x: -1, y: 3 }, { id: 21, x: 1, y: 3 }, { id: 22, x: 3, y: 3 }, { id: 23, x: 5, y: 3 }, { id: 24, x: 7, y: 3 },
  // Row 5 (y=1): 10 points
  { id: 25, x: -9, y: 1 }, { id: 26, x: -7, y: 1 }, { id: 27, x: -5, y: 1 }, { id: 28, x: -3, y: 1 }, { id: 29, x: -1, y: 1 }, { id: 30, x: 1, y: 1 }, { id: 31, x: 3, y: 1 }, { id: 32, x: 5, y: 1 }, { id: 33, x: 7, y: 1 }, { id: 34, x: 9, y: 1 },
  // Row 6 (y=-1): 10 points
  { id: 35, x: -9, y: -1 }, { id: 36, x: -7, y: -1 }, { id: 37, x: -5, y: -1 }, { id: 38, x: -3, y: -1 }, { id: 39, x: -1, y: -1 }, { id: 40, x: 1, y: -1 }, { id: 41, x: 3, y: -1 }, { id: 42, x: 5, y: -1 }, { id: 43, x: 7, y: -1 }, { id: 44, x: 9, y: -1 },
  // Row 7 (y=-3): 8 points
  { id: 45, x: -7, y: -3 }, { id: 46, x: -5, y: -3 }, { id: 47, x: -3, y: -3 }, { id: 48, x: -1, y: -3 }, { id: 49, x: 1, y: -3 }, { id: 50, x: 3, y: -3 }, { id: 51, x: 5, y: -3 }, { id: 52, x: 7, y: -3 },
  // Row 8 (y=-5): 8 points
  { id: 53, x: -7, y: -5 }, { id: 54, x: -5, y: -5 }, { id: 55, x: -3, y: -5 }, { id: 56, x: -1, y: -5 }, { id: 57, x: 1, y: -5 }, { id: 58, x: 3, y: -5 }, { id: 59, x: 5, y: -5 }, { id: 60, x: 7, y: -5 },
  // Row 9 (y=-7): 6 points
  { id: 61, x: -5, y: -7 }, { id: 62, x: -3, y: -7 }, { id: 63, x: -1, y: -7 }, { id: 64, x: 1, y: -7 }, { id: 65, x: 3, y: -7 }, { id: 66, x: 5, y: -7 },
  // Row 10 (y=-9): 2 points
  { id: 67, x: -1, y: -9 }, { id: 68, x: 1, y: -9 },
];

// Helper to get grid based on test pattern
const getVFGrid = (pattern) => pattern === '10-2' ? VF_10_2_GRID : VF_24_2_GRID;
const getVFGridSize = (pattern) => pattern === '10-2' ? 68 : 54;

// GPA test-retest variability thresholds (Heijl et al.)
// 24-2 GPA Thresholds (Heijl et al. 1989) - 1D by TD only
const GPA_THRESHOLDS_24_2 = [
  { min: 0, t: -3.6 }, { min: -5, t: -4.5 }, { min: -10, t: -6.1 }, 
  { min: -15, t: -7.9 }, { min: -20, t: -10.9 }, { min: -99, t: -15.2 }
];

// 10-2 GPA Thresholds with 2D stratification (TD × MD)
// Based on MAPS test-retest data: 282 pairs, 19,176 point measurements
// 5th percentile thresholds for 95% specificity
const GPA_THRESHOLDS_10_2_2D = {
  // Early glaucoma (MD > -3): tightest thresholds - can detect small changes
  'TD≥0|early': -4.0,
  'TD-5to0|early': -3.0,
  'TD-10to-5|early': -3.0,
  'TD-15to-10|early': -5.0,  // limited data, using conservative
  'TD<-15|early': -6.0,      // limited data, using conservative
  
  // Mild glaucoma (-6 < MD ≤ -3)
  'TD≥0|mild': -5.0,
  'TD-5to0|mild': -4.0,
  'TD-10to-5|mild': -3.0,
  'TD-15to-10|mild': -9.0,
  'TD<-15|mild': -8.0,
  
  // Moderate glaucoma (-12 < MD ≤ -6)
  'TD≥0|moderate': -6.0,
  'TD-5to0|moderate': -4.0,
  'TD-10to-5|moderate': -7.0,
  'TD-15to-10|moderate': -7.0,
  'TD<-15|moderate': -8.0,
  
  // Severe glaucoma (MD ≤ -12): widest thresholds - high variability
  'TD≥0|severe': -8.0,       // extrapolated
  'TD-5to0|severe': -12.0,   // limited data, conservative
  'TD-10to-5|severe': -12.0, // limited data
  'TD-15to-10|severe': -10.0,
  'TD<-15|severe': -13.0,
};

// Get GPA threshold based on pattern, local TD, and global MD
const getGPAThreshold = (td, pattern = '24-2', md = 0) => {
  // For 24-2, use original 1D thresholds (TD only)
  if (pattern !== '10-2') {
    const thresholds = GPA_THRESHOLDS_24_2;
    return thresholds.find(g => td > g.min)?.t || -3.6;
  }
  
  // For 10-2, use 2D thresholds (TD × MD)
  // Determine TD band
  let tdKey;
  if (td > 0) tdKey = 'TD≥0';
  else if (td > -5) tdKey = 'TD-5to0';
  else if (td > -10) tdKey = 'TD-10to-5';
  else if (td > -15) tdKey = 'TD-15to-10';
  else tdKey = 'TD<-15';
  
  // Determine MD band
  let mdKey;
  if (md > -3) mdKey = 'early';
  else if (md > -6) mdKey = 'mild';
  else if (md > -12) mdKey = 'moderate';
  else mdKey = 'severe';
  
  const key = `${tdKey}|${mdKey}`;
  return GPA_THRESHOLDS_10_2_2D[key] || -4.0;
};

// PLR thresholds
const PLR_THRESHOLDS = { pValueCutoff: 0.01 }; // Flag points with slope < 0 at P < 0.01

// Blind spot locations
const BLIND_SPOT = { OD: { x: 15, y: -3 }, OS: { x: -15, y: -3 } };

// OCR Parser - extracts VF data from text
// Handles noisy OCR output with multiple fallback patterns
const parseOCR = text => {
  const r = { md: null, psd: null, vfi: null, date: null, eye: null, fl: null, fp: null, fn: null, td: [], warn: [], pattern: '24-2' };
  
  // Detect test pattern (10-2 vs 24-2)
  if (/10-2|10\s*-\s*2|Central\s*10/i.test(text)) {
    r.pattern = '10-2';
  } else if (/24-2|24\s*-\s*2|Central\s*24/i.test(text)) {
    r.pattern = '24-2';
  }
  
  // MD - Multiple patterns for different formats and OCR errors
  const mdPatterns = [
    /MD10-2[:\s]*([+-]?\d+\.?\d*)\s*dB/i,
    /MD24-2[:\s]*([+-]?\d+\.?\d*)\s*dB/i,
    /MD\s*(?:10|24)-2[:\s]*([+-]?\d+\.?\d*)\s*dB/i,
    /MD[:\s]+([+-]?\d+\.?\d*)\s*dB/i,
    /MD[:\s]*([+-]?\d+\.?\d*)\s*dB/i,
    /Mean\s*Deviation[:\s]*([+-]?\d+\.?\d*)/i,
    /\bMD\s+([+-]?\d+\.\d+)/i,
    /([+-]?\d+\.\d+)\s*dB\s*P\s*[<(]/i,  // "-2.06 dB P <" pattern
    /\b([+-]?\d+\.\d{2})\s*[dD][bB8]\s*P/i,  // Handle OCR "dB" as "d8"
    /[MH][DO0]\s*[:\s]*([+-]?\d+\.\d+)/i,  // Handle M0 or HD OCR errors
  ];
  for (const pat of mdPatterns) {
    const m = text.match(pat);
    if (m) {
      const v = parseFloat(m[1]);
      if (v >= -35 && v <= 5) { r.md = v; break; }
    }
  }
  
  // PSD - Multiple patterns
  const psdPatterns = [
    /PSD10-2[:\s]*(\d+\.?\d*)\s*dB/i,
    /PSD24-2[:\s]*(\d+\.?\d*)\s*dB/i,
    /PSD\s*(?:10|24)-2[:\s]*(\d+\.?\d*)\s*dB/i,
    /PSD[:\s]+(\d+\.?\d*)\s*dB/i,
    /PSD[:\s]*(\d+\.?\d*)\s*dB/i,
    /PSD\s+(\d+\.\d+)/i,
    /\bPSD\b.*?(\d+\.\d+)/i,
    /P[S5][DO0]\s*[:\s]*(\d+\.\d+)/i,  // Handle OCR errors
  ];
  for (const pat of psdPatterns) {
    const m = text.match(pat);
    if (m) {
      const v = parseFloat(m[1]);
      if (v >= 0 && v <= 20) { r.psd = v; break; }
    }
  }
  
  // VFI - Multiple patterns
  const vfiPatterns = [
    /VFI[:\s]*(\d+)\s*%/i,
    /VFI[:\s]*(\d+)/i,
    /VF[I1][:\s]*(\d+)/i,  // OCR may confuse I with 1
    /VE[I1L]\s*(\d+)/i,    // VEI, VEL OCR errors
  ];
  for (const pat of vfiPatterns) {
    const m = text.match(pat);
    if (m) {
      const v = parseInt(m[1]);
      if (v >= 0 && v <= 100) { r.vfi = v; break; }
    }
  }
  
  // Date - Handle multiple formats
  const months = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', 
                   jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
  
  // Format 0: "DATE: 05-13-2014" or "DATES 05-13-2014" (OCR typo) or "GMTES" OCR error
  let m = text.match(/[DO0]ATE[S:\s]+(\d{1,2})[-/](\d{1,2})[-/](\d{4})/i);
  if (!m) m = text.match(/[GC][MH]TES?\s*[:\s]*(\d{1,2})[-/](\d{1,2})[-/](\d{4})/i);  // GMTES OCR error
  if (m) {
    const year = parseInt(m[3]);
    if (year >= 2000 && year <= 2030) {
      r.date = `${m[3]}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`;
    }
  }
  
  // Format 1: "Date: Aug 03, 2018" - look specifically after "Date:" label
  if (!r.date) {
    m = text.match(/Date[:\s]+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[.\s]*(\d{1,2})[,\s]+(\d{4})/i);
    if (m) {
      const month = months[m[1].toLowerCase()];
      const year = parseInt(m[3]);
      if (year >= 2000 && year <= 2030) {
        r.date = `${m[3]}-${month}-${m[2].padStart(2, '0')}`;
      }
    }
  }
  
  // Format 2: "Created: 8/3/2018" or "Created: 10/12/2015"
  if (!r.date) {
    m = text.match(/Created[:\s]*(\d{1,2})\/(\d{1,2})\/(\d{4})/i);
    if (m) {
      const year = parseInt(m[3]);
      if (year >= 2000 && year <= 2030) {
        r.date = `${m[3]}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`;
      }
    }
  }
  
  // Format 3: "Oct 12, 2015" anywhere in text
  if (!r.date) {
    m = text.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[.\s]+(\d{1,2})[,\s]+(\d{4})/i);
    if (m) {
      const month = months[m[1].toLowerCase()];
      const year = parseInt(m[3]);
      if (year >= 2000 && year <= 2030) {
        r.date = `${m[3]}-${month}-${m[2].padStart(2, '0')}`;
      }
    }
  }
  
  // Format 4: Any MM-DD-YYYY or MM/DD/YYYY (not DOB)
  if (!r.date) {
    const dateMatches = text.matchAll(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/g);
    for (const match of dateMatches) {
      const year = parseInt(match[3]);
      if (year >= 2000 && year <= 2030) {
        r.date = `${match[3]}-${match[1].padStart(2,'0')}-${match[2].padStart(2,'0')}`;
        break;
      }
    }
  }
  
  // Format 5: YYYY-MM-DD
  if (!r.date) {
    m = text.match(/(20\d{2})-(\d{2})-(\d{2})/);
    if (m) r.date = `${m[1]}-${m[2]}-${m[3]}`;
  }
  
  // Eye - Look for OD/OS with multiple patterns
  if (/\bOD\b|OD\s+Single|Right\s*Eye|RIGHT/i.test(text)) r.eye = 'OD';
  else if (/\bOS\b|OS\s+Single|Left\s*Eye|LEFT/i.test(text)) r.eye = 'OS';
  // Check RX field which may have "OS" or "OD"
  if (!r.eye) {
    m = text.match(/R[XK][:\s]*(OS|OD)/i);
    if (m) r.eye = m[1].toUpperCase();
  }
  
  // Reliability indices
  m = text.match(/Fixation\s*Losses[:\s]*(\d+)\s*[\/]\s*(\d+)/i);
  if (m) r.fl = m[1] + '/' + m[2];
  m = text.match(/False\s*POS\s*Errors?[:\s]*(\d+)\s*%/i);
  if (m) r.fp = parseInt(m[1]);
  m = text.match(/False\s*NEG\s*Errors?[:\s]*(\d+)\s*%/i);
  if (m) r.fn = parseInt(m[1]);
  
  // TD values extraction based on pattern
  const grid = getVFGrid(r.pattern);
  const expectedPoints = getVFGridSize(r.pattern);
  
  // Method 1: Look for section between Total Deviation and Pattern Deviation
  let tdSection = text.match(/Tot[ao]l?\s*Dev[il]?at[il]?on([\s\S]*?)Patt?ern\s*Dev[il]?at[il]?on/i);
  if (tdSection) {
    const numbers = tdSection[1].match(/-?\d+/g);
    if (numbers) {
      const tdValues = numbers.map(n => parseInt(n)).filter(n => n >= -35 && n <= 10);
      if (tdValues.length >= Math.min(20, expectedPoints / 2)) {
        r.td = tdValues.slice(0, expectedPoints).map((v, i) => ({ ...grid[i], td: v }));
      }
    }
  }
  
  // Method 2: If TD section not found, extract all negative numbers in TD range
  if (r.td.length === 0) {
    const allNegatives = text.match(/-\d+/g);
    if (allNegatives) {
      const tdValues = allNegatives
        .map(n => parseInt(n))
        .filter(n => n >= -35 && n <= -1);
      
      if (tdValues.length >= Math.min(30, expectedPoints / 2)) {
        r.td = tdValues.slice(0, expectedPoints).map((v, i) => ({ ...grid[i], td: v }));
      }
    }
  }
  
  // Warnings
  if (r.md === null) r.warn.push('MD not found');
  if (r.date === null) r.warn.push('Date not found');
  if (r.td.length === 0) r.warn.push('TD values not extracted');
  else if (r.td.length < expectedPoints) r.warn.push(`Found ${r.td.length}/${expectedPoints} TD values`);
  
  return r;
};

// Enhanced parsing from positioned text items (preserves spatial layout)
const parsePositionedText = (items, pageHeight) => {
  const r = { md: null, psd: null, vfi: null, date: null, eye: null, fl: null, fp: null, fn: null, td: [], warn: [], pattern: '24-2' };
  
  // Sort items by position (top to bottom, left to right)
  const sortedItems = items
    .map(item => ({
      str: item.str,
      x: item.transform[4],
      y: pageHeight - item.transform[5], // Flip Y coordinate
      width: item.width,
      height: item.height
    }))
    .filter(item => item.str.trim())
    .sort((a, b) => {
      // Group by rows (within 5 units = same row)
      const rowDiff = Math.abs(a.y - b.y);
      if (rowDiff < 5) return a.x - b.x;
      return a.y - b.y;
    });
  
  // Combine into full text for basic parsing
  const fullText = sortedItems.map(i => i.str).join(' ');
  
  // Use basic parser for metadata
  const basic = parseOCR(fullText);
  r.md = basic.md;
  r.psd = basic.psd;
  r.vfi = basic.vfi;
  r.date = basic.date;
  r.eye = basic.eye;
  r.fl = basic.fl;
  r.fp = basic.fp;
  r.fn = basic.fn;
  r.pattern = basic.pattern;
  r.warn = basic.warn.filter(w => !w.includes('TD'));
  
  // Now extract TD values using spatial positioning
  // Find "Total Deviation" label
  const tdLabelIdx = sortedItems.findIndex(item => 
    /total\s*deviation/i.test(item.str)
  );
  
  // Find "Pattern Deviation" label
  const pdLabelIdx = sortedItems.findIndex(item => 
    /pattern\s*deviation/i.test(item.str)
  );
  
  if (tdLabelIdx >= 0) {
    const tdLabel = sortedItems[tdLabelIdx];
    const pdLabel = pdLabelIdx >= 0 ? sortedItems[pdLabelIdx] : null;
    
    // Find items that are:
    // 1. Below the TD label (y > tdLabel.y)
    // 2. Above the PD label if it exists (y < pdLabel.y)
    // 3. Numeric values in TD range
    const tdItems = sortedItems.filter((item, idx) => {
      if (idx <= tdLabelIdx) return false;
      if (pdLabel && item.y >= pdLabel.y - 10) return false;
      
      // Check if it's a number in TD range
      const num = parseInt(item.str.trim());
      return !isNaN(num) && num >= -35 && num <= 10;
    });
    
    // Group items by row (y coordinate within 8 units = same row)
    const rows = [];
    let currentRow = [];
    let currentY = null;
    
    tdItems.forEach(item => {
      if (currentY === null || Math.abs(item.y - currentY) < 8) {
        currentRow.push(item);
        currentY = item.y;
      } else {
        if (currentRow.length > 0) rows.push(currentRow.sort((a, b) => a.x - b.x));
        currentRow = [item];
        currentY = item.y;
      }
    });
    if (currentRow.length > 0) rows.push(currentRow.sort((a, b) => a.x - b.x));
    
    // Extract values in reading order
    const tdValues = rows.flatMap(row => 
      row.map(item => parseInt(item.str.trim()))
    ).filter(n => !isNaN(n) && n >= -35 && n <= 10);
    
    const grid = getVFGrid(r.pattern);
    const expectedPoints = getVFGridSize(r.pattern);
    
    if (tdValues.length >= Math.min(20, expectedPoints / 2)) {
      r.td = tdValues.slice(0, expectedPoints).map((v, i) => ({ ...grid[i], td: v }));
      r.warn = r.warn.filter(w => !w.includes('TD'));
      if (r.td.length < expectedPoints) {
        r.warn.push(`Found ${r.td.length}/${expectedPoints} TD values (spatial)`);
      }
    }
  }
  
  // Fallback to basic TD extraction if spatial failed
  if (r.td.length === 0 && basic.td.length > 0) {
    r.td = basic.td;
    if (basic.warn.some(w => w.includes('TD'))) {
      r.warn.push(...basic.warn.filter(w => w.includes('TD')));
    }
  }
  
  return r;
};

// Render PDF page to image for OCR (for scanned PDFs)
const renderPageToImage = async (page, scale = 2.0) => {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');
  
  await page.render({
    canvasContext: ctx,
    viewport: viewport
  }).promise;
  
  return canvas.toDataURL('image/png');
};

// OCR image using Tesseract.js
const ocrImage = async (imageData, onProgress) => {
  try {
    const result = await Tesseract.recognize(imageData, 'eng', {
      logger: m => {
        if (onProgress && m.status === 'recognizing text') {
          onProgress(Math.round(m.progress * 100));
        }
      }
    });
    return result.data.text;
  } catch (err) {
    console.error('OCR error:', err);
    return '';
  }
};

// Generate TD values from MD (for manual entry)
const generateTD = (md, pattern = '24-2') => {
  const grid = getVFGrid(pattern);
  return grid.map(p => ({ ...p, td: Math.max(-35, Math.min(5, md + (Math.random() - 0.5) * 4)) }));
};

// Demo data
const createDemoVF = () => [
  { id: 1, date: '2022-01-15', md: -2.5, psd: 1.8, vfi: 97, eye: 'OD' },
  { id: 2, date: '2022-06-20', md: -2.8, psd: 1.9, vfi: 96, eye: 'OD' },
  { id: 3, date: '2023-01-10', md: -3.5, psd: 2.3, vfi: 94, eye: 'OD' },
  { id: 4, date: '2023-06-05', md: -4.1, psd: 2.8, vfi: 91, eye: 'OD' },
  { id: 5, date: '2024-01-18', md: -4.8, psd: 3.2, vfi: 88, eye: 'OD' },
  { id: 6, date: '2024-06-22', md: -5.6, psd: 3.6, vfi: 85, eye: 'OD' },
].map((t, i) => {
  // Simulate arcuate defect progression
  const td = VF_24_2_GRID.map(p => {
    const isSupArc = p.y > 9 && p.x < 0;
    const isInfArc = p.y < -9 && p.x < 0;
    const prog = isSupArc ? -0.9 * i : isInfArc ? -0.6 * i : -0.15 * i;
    return { ...p, td: Math.max(-35, Math.min(5, -2 + prog + (Math.random() - 0.5) * 2)) };
  });
  return { ...t, td };
});

const createDemoOCT = () => [
  { id: 1, date: '2022-01-20', eye: 'OD', global: 92, superior: 115, inferior: 120, temporal: 68, nasal: 72 },
  { id: 2, date: '2022-07-15', eye: 'OD', global: 90, superior: 113, inferior: 118, temporal: 67, nasal: 71 },
  { id: 3, date: '2023-01-22', eye: 'OD', global: 88, superior: 110, inferior: 115, temporal: 66, nasal: 71 },
  { id: 4, date: '2023-07-18', eye: 'OD', global: 86, superior: 107, inferior: 112, temporal: 65, nasal: 70 },
  { id: 5, date: '2024-01-25', eye: 'OD', global: 84, superior: 104, inferior: 109, temporal: 64, nasal: 70 },
  { id: 6, date: '2024-07-20', eye: 'OD', global: 82, superior: 101, inferior: 106, temporal: 63, nasal: 69 },
];

// Linear regression with statistics
const linearRegression = (x, y) => {
  const n = x.length;
  if (n < 2) return null;
  
  // Filter out any NaN or null values
  const validPairs = x.map((xi, i) => ({ x: xi, y: y[i] }))
    .filter(p => !isNaN(p.x) && !isNaN(p.y) && p.x !== null && p.y !== null);
  
  if (validPairs.length < 2) return null;
  
  const xValid = validPairs.map(p => p.x);
  const yValid = validPairs.map(p => p.y);
  const nValid = validPairs.length;
  
  const sx = xValid.reduce((a, b) => a + b, 0);
  const sy = yValid.reduce((a, b) => a + b, 0);
  const sxy = xValid.reduce((s, xi, i) => s + xi * yValid[i], 0);
  const sx2 = xValid.reduce((s, xi) => s + xi * xi, 0);
  
  const denom = nValid * sx2 - sx * sx;
  if (denom === 0) return null;
  
  const slope = (nValid * sxy - sx * sy) / denom;
  const intercept = (sy - slope * sx) / nValid;
  
  // Check for NaN results
  if (isNaN(slope) || isNaN(intercept)) return null;
  
  const yMean = sy / nValid;
  const ssTotal = yValid.reduce((s, yi) => s + (yi - yMean) ** 2, 0);
  const ssRes = yValid.reduce((s, yi, i) => s + (yi - (intercept + slope * xValid[i])) ** 2, 0);
  const r2 = ssTotal > 0 ? 1 - ssRes / ssTotal : 0;
  
  const se = nValid > 2 ? Math.sqrt(ssRes / (nValid - 2) / (sx2 - sx * sx / nValid)) : 0;
  const tStat = se > 0 ? Math.abs(slope / se) : 0;
  
  const tCrit = 2.776; // t-critical for df=4, alpha=0.05
  const ciLower = slope - tCrit * se;
  const ciUpper = slope + tCrit * se;
  
  let pValue = 1;
  if (tStat > 4.0) pValue = 0.001;
  else if (tStat > 3.0) pValue = 0.01;
  else if (tStat > 2.5) pValue = 0.02;
  else if (tStat > 2.0) pValue = 0.05;
  else if (tStat > 1.5) pValue = 0.1;
  
  return { slope, intercept, r2, se, pValue, ciLower, ciUpper };
};

// Robust Linear Regression using Theil-Sen Estimator
// More resistant to outliers than OLS
const robustLinearRegression = (x, y) => {
  const n = x.length;
  if (n < 2) return null;
  
  // Filter out any NaN or null values
  const validPairs = x.map((xi, i) => ({ x: xi, y: y[i] }))
    .filter(p => !isNaN(p.x) && !isNaN(p.y) && p.x !== null && p.y !== null);
  
  if (validPairs.length < 2) return null;
  
  const xValid = validPairs.map(p => p.x);
  const yValid = validPairs.map(p => p.y);
  const nValid = validPairs.length;
  
  // Calculate all pairwise slopes
  const slopes = [];
  for (let i = 0; i < nValid; i++) {
    for (let j = i + 1; j < nValid; j++) {
      if (xValid[j] !== xValid[i]) {
        slopes.push((yValid[j] - yValid[i]) / (xValid[j] - xValid[i]));
      }
    }
  }
  
  if (slopes.length === 0) return null;
  
  // Theil-Sen slope is the median of all pairwise slopes
  slopes.sort((a, b) => a - b);
  const medianIdx = Math.floor(slopes.length / 2);
  const slope = slopes.length % 2 === 0 
    ? (slopes[medianIdx - 1] + slopes[medianIdx]) / 2 
    : slopes[medianIdx];
  
  // Intercept is median of (y_i - slope * x_i)
  const intercepts = xValid.map((xi, i) => yValid[i] - slope * xi);
  intercepts.sort((a, b) => a - b);
  const intIdx = Math.floor(intercepts.length / 2);
  const intercept = intercepts.length % 2 === 0 
    ? (intercepts[intIdx - 1] + intercepts[intIdx]) / 2 
    : intercepts[intIdx];
  
  // Calculate R² and standard error using OLS formulas for compatibility
  const yMean = yValid.reduce((a, b) => a + b, 0) / nValid;
  const ssTotal = yValid.reduce((s, yi) => s + (yi - yMean) ** 2, 0);
  const ssRes = yValid.reduce((s, yi, i) => s + (yi - (intercept + slope * xValid[i])) ** 2, 0);
  const r2 = ssTotal > 0 ? 1 - ssRes / ssTotal : 0;
  
  // Approximate SE and p-value using residuals
  const sx2 = xValid.reduce((s, xi) => s + (xi - xValid.reduce((a,b)=>a+b,0)/nValid) ** 2, 0);
  const se = nValid > 2 ? Math.sqrt(ssRes / (nValid - 2) / sx2) : 0;
  const tStat = se > 0 ? Math.abs(slope / se) : 0;
  
  const tCrit = 2.776;
  const ciLower = slope - tCrit * se;
  const ciUpper = slope + tCrit * se;
  
  let pValue = 1;
  if (tStat > 4.0) pValue = 0.001;
  else if (tStat > 3.0) pValue = 0.01;
  else if (tStat > 2.5) pValue = 0.02;
  else if (tStat > 2.0) pValue = 0.05;
  else if (tStat > 1.5) pValue = 0.1;
  
  return { slope, intercept, r2, se, pValue, ciLower, ciUpper, method: 'theil-sen' };
};

// MD Slope threshold for progression
const MD_SLOPE_THRESHOLD = -0.5; // dB/year - flag as progressing if slope < this

// Regression helper for test data (uses robust regression for MD)
const regress = (data, key, useRobust = false) => {
  if (data.length < 2) return null;
  const x = data.map(d => (new Date(d.date) - new Date(data[0].date)) / 31536000000);
  const y = data.map(d => d[key]);
  return useRobust ? robustLinearRegression(x, y) : linearRegression(x, y);
};

// GPA Analysis
const gpaAnalysis = tests => {
  if (tests.length < 3 || !tests[0].td?.length) return { status: 'insufficient', prog: [], poss: [], bl: [], pattern: '24-2' };
  
  const sorted = [...tests].sort((a, b) => new Date(a.date) - new Date(b.date));
  const pattern = sorted[0].pattern || '24-2';
  
  // Calculate baseline MD (average of first 2 tests) for 2D threshold lookup
  const baselineMD = ((sorted[0].md || 0) + (sorted[1].md || 0)) / 2;
  
  // Baseline = average of first 2 tests
  // Use pattern-specific thresholds (with MD for 10-2)
  const bl = sorted[0].td.map((p, i) => {
    const avgTd = (p.td + (sorted[1].td?.[i]?.td || p.td)) / 2;
    return {
      ...p,
      td: avgTd,
      thresh: getGPAThreshold(avgTd, pattern, baselineMD)
    };
  });
  
  // Track flagged tests per location
  const status = {};
  bl.forEach(p => status[p.id] = { ...p, flagged: [] });
  
  // Check follow-up tests
  sorted.slice(2).forEach((test, testIdx) => {
    test.td?.forEach(p => {
      if (status[p.id]) {
        const change = p.td - status[p.id].td;
        if (change <= status[p.id].thresh) {
          status[p.id].flagged.push(testIdx);
        }
      }
    });
  });
  
  const prog = Object.values(status).filter(s => s.flagged.length >= 2);
  const poss = Object.values(status).filter(s => s.flagged.length === 1);
  
  let st = 'stable';
  if (prog.length >= 3) st = 'likely';
  else if (prog.length > 0 || poss.length >= 3) st = 'possible';
  
  return { status: st, prog, poss, bl, pattern };
};

// PLR Analysis
const plrAnalysis = tests => {
  if (tests.length < 3 || !tests[0].td?.length) {
    return { status: 'insufficient', points: [], significant: 0, stable: 0, improving: 0, avgSlope: 0, pattern: '24-2' };
  }
  
  const sorted = [...tests].sort((a, b) => new Date(a.date) - new Date(b.date));
  const baseDate = new Date(sorted[0].date);
  const years = sorted.map(t => (new Date(t.date) - baseDate) / 31536000000);
  
  // Detect pattern from first test
  const pattern = sorted[0].pattern || '24-2';
  const grid = getVFGrid(pattern);
  const gridSize = getVFGridSize(pattern);
  
  const points = [];
  let significant = 0, stable = 0, improving = 0;
  
  for (let i = 0; i < gridSize; i++) {
    const tdValues = sorted.map(t => t.td?.[i]?.td).filter(v => v != null);
    if (tdValues.length < 3) continue;
    
    const reg = linearRegression(years.slice(0, tdValues.length), tdValues);
    if (!reg) continue;
    
    const loc = grid[i];
    let status = 'stable';
    
    // Flag as significant if slope < 0 AND p < 0.01
    if (reg.slope < 0 && reg.pValue < PLR_THRESHOLDS.pValueCutoff) {
      status = 'significant'; 
      significant++;
    } else if (reg.slope > 0.5) {
      status = 'improving'; 
      improving++;
    } else {
      stable++;
    }
    
    points.push({ id: loc.id, x: loc.x, y: loc.y, slope: reg.slope, pValue: reg.pValue, r2: reg.r2, status });
  }
  
  let overallStatus = 'stable';
  if (significant >= 3) overallStatus = 'likely';
  else if (significant >= 1) overallStatus = 'possible';
  
  const avgSlope = points.length > 0 ? points.reduce((s, p) => s + p.slope, 0) / points.length : 0;
  
  return { status: overallStatus, points, significant, stable, improving, avgSlope, pattern };
};

// Fastest Declining Points Analysis
// Identifies the 5 points with greatest dB loss at 12 and 24 month timepoints
const fastestDecliningAnalysis = tests => {
  if (tests.length < 2 || !tests[0].td?.length) {
    return { 
      status: 'insufficient',
      at12Months: [],
      at24Months: [],
      pattern: '24-2'
    };
  }
  
  const sorted = [...tests].sort((a, b) => new Date(a.date) - new Date(b.date));
  const baseDate = new Date(sorted[0].date);
  const pattern = sorted[0].pattern || '24-2';
  const grid = getVFGrid(pattern);
  const gridSize = getVFGridSize(pattern);
  
  // Calculate days from baseline for each test
  const testsWithDays = sorted.map(t => ({
    ...t,
    daysFromBaseline: (new Date(t.date) - baseDate) / (1000 * 60 * 60 * 24)
  }));
  
  // Find tests closest to 12 months (365 days) and 24 months (730 days)
  const find12MonthTest = () => {
    const target = 365;
    let closest = null;
    let minDiff = Infinity;
    testsWithDays.forEach((t, idx) => {
      if (idx === 0) return; // Skip baseline
      const diff = Math.abs(t.daysFromBaseline - target);
      if (diff < minDiff && t.daysFromBaseline >= 180) { // At least 6 months
        minDiff = diff;
        closest = t;
      }
    });
    return closest;
  };
  
  const find24MonthTest = () => {
    const target = 730;
    let closest = null;
    let minDiff = Infinity;
    testsWithDays.forEach((t, idx) => {
      if (idx === 0) return; // Skip baseline
      const diff = Math.abs(t.daysFromBaseline - target);
      if (diff < minDiff && t.daysFromBaseline >= 540) { // At least 18 months
        minDiff = diff;
        closest = t;
      }
    });
    return closest;
  };
  
  // Calculate baseline (average of first 2 tests if available)
  const baseline = sorted[0].td.map((p, i) => ({
    ...p,
    td: sorted.length > 1 ? (p.td + (sorted[1].td?.[i]?.td || p.td)) / 2 : p.td
  }));
  
  // Calculate change at each location
  const calcChanges = (targetTest) => {
    if (!targetTest) return [];
    
    const changes = [];
    for (let i = 0; i < Math.min(gridSize, baseline.length); i++) {
      const blTD = baseline[i]?.td;
      const targetTD = targetTest.td?.[i]?.td;
      
      if (blTD != null && targetTD != null) {
        const change = targetTD - blTD;
        const monthsElapsed = targetTest.daysFromBaseline / 30.44;
        const ratePerYear = (change / monthsElapsed) * 12;
        
        changes.push({
          id: grid[i].id,
          x: grid[i].x,
          y: grid[i].y,
          index: i,
          baselineTD: blTD,
          finalTD: targetTD,
          change,
          ratePerYear,
          monthsElapsed: Math.round(monthsElapsed)
        });
      }
    }
    
    // Sort by change (most negative = fastest decline) and take top 5
    return changes
      .filter(c => c.change < 0) // Only declining points
      .sort((a, b) => a.change - b.change)
      .slice(0, 5);
  };
  
  const test12 = find12MonthTest();
  const test24 = find24MonthTest();
  
  const at12Months = calcChanges(test12);
  const at24Months = calcChanges(test24);
  
  return {
    status: at12Months.length > 0 || at24Months.length > 0 ? 'available' : 'insufficient',
    at12Months,
    at24Months,
    test12Date: test12?.date,
    test24Date: test24?.date,
    test12Months: test12 ? Math.round(test12.daysFromBaseline / 30.44) : null,
    test24Months: test24 ? Math.round(test24.daysFromBaseline / 30.44) : null,
    pattern
  };
};

// PoPLR Analysis (Permutation of Pointwise Linear Regression)
// Reference: O'Leary et al. "Asymmetric progression of visual field defects in glaucoma"
// 
// METHODOLOGY:
// 1. For each test location, fit linear regression of TD vs time
// 2. For locations with NEGATIVE slopes (worsening), record the p-value
// 3. Calculate S-statistic = Σ(-log10(p)) for all negative-slope locations
//    - Higher S means more/stronger declining locations
// 4. Permutation test: Shuffle temporal order of tests 5000 times
//    - For each permutation, recalculate slopes and S-statistic
//    - This breaks the temporal structure (null hypothesis: no progression)
// 5. Global p-value = proportion of permuted S >= observed S
//    - If observed S is rarely exceeded by chance, progression is significant
//
// INTERPRETATION:
// - p < 0.01: Likely progression
// - p < 0.05: Possible progression
// - p >= 0.05: Stable (no significant progression detected)
const poplrAnalysis = tests => {
  if (tests.length < 4 || !tests[0].td?.length) {
    return { 
      status: 'insufficient', 
      sStatistic: null, 
      pValue: null, 
      progressing: false,
      numPermutations: 0,
      pointsUsed: 0,
      pattern: '24-2'
    };
  }
  
  const sorted = [...tests].sort((a, b) => new Date(a.date) - new Date(b.date));
  const baseDate = new Date(sorted[0].date);
  const years = sorted.map(t => (new Date(t.date) - baseDate) / 31536000000);
  const n = sorted.length;
  
  // Detect pattern from first test
  const pattern = sorted[0].pattern || '24-2';
  const gridSize = getVFGridSize(pattern);
  
  // Step 1: Calculate observed slopes and p-values for each location
  const locationData = [];
  
  for (let i = 0; i < gridSize; i++) {
    const tdValues = sorted.map(t => t.td?.[i]?.td).filter(v => v != null);
    if (tdValues.length < 4) continue;
    
    const validYears = years.slice(0, tdValues.length);
    const reg = linearRegression(validYears, tdValues);
    if (!reg) continue;
    
    // Only include locations with negative slopes (potential progression)
    if (reg.slope < 0) {
      locationData.push({
        index: i,
        tdValues: tdValues,
        years: validYears,
        slope: reg.slope,
        pValue: reg.pValue
      });
    }
  }
  
  if (locationData.length === 0) {
    return { 
      status: 'stable', 
      sStatistic: 0, 
      pValue: 1, 
      progressing: false,
      numPermutations: 0,
      pointsUsed: 0,
      pattern
    };
  }
  
  // Step 2: Calculate S-statistic (sum of -log10(p) for negative slopes)
  // Truncate p-values at 0.0001 to avoid log(0)
  const calcSStatistic = (pValues) => {
    return pValues.reduce((sum, p) => {
      const truncP = Math.max(p, 0.0001);
      return sum + (-Math.log10(truncP));
    }, 0);
  };
  
  const observedS = calcSStatistic(locationData.map(d => d.pValue));
  
  // Step 3: Permutation test
  // Shuffle the temporal order of tests and recalculate S-statistic
  const numPermutations = 5000;
  let countGreaterOrEqual = 0;
  
  // Fisher-Yates shuffle helper
  const shuffle = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
  
  for (let perm = 0; perm < numPermutations; perm++) {
    // Create shuffled time indices
    const shuffledIndices = shuffle([...Array(n).keys()]);
    const shuffledYears = shuffledIndices.map(i => years[i]);
    
    // Recalculate slopes and p-values for each location with shuffled times
    const permPValues = [];
    
    for (const loc of locationData) {
      // Reorder TD values according to shuffled indices
      const shuffledTD = shuffledIndices.map(i => {
        const test = sorted[i];
        return test.td?.[loc.index]?.td;
      }).filter(v => v != null);
      
      if (shuffledTD.length < 4) continue;
      
      const reg = linearRegression(shuffledYears.slice(0, shuffledTD.length), shuffledTD);
      if (reg && reg.slope < 0) {
        permPValues.push(reg.pValue);
      }
    }
    
    if (permPValues.length > 0) {
      const permS = calcSStatistic(permPValues);
      if (permS >= observedS) {
        countGreaterOrEqual++;
      }
    }
  }
  
  // Step 4: Calculate global p-value
  const globalPValue = (countGreaterOrEqual + 1) / (numPermutations + 1);
  
  // Determine progression status
  let status = 'stable';
  let progressing = false;
  
  if (globalPValue < 0.01) {
    status = 'likely';
    progressing = true;
  } else if (globalPValue < 0.05) {
    status = 'possible';
    progressing = true;
  }
  
  return {
    status,
    sStatistic: observedS,
    pValue: globalPValue,
    progressing,
    numPermutations,
    pointsUsed: locationData.length,
    locationData, // Include for detailed analysis
    pattern
  };
};

// OCT Analysis
const octAnalysis = scans => {
  if (scans.length < 2) return { status: 'insufficient' };
  const g = regress(scans, 'global');
  const s = regress(scans, 'superior');
  const inf = regress(scans, 'inferior');
  const worst = Math.min(g?.slope || 0, s?.slope || 0, inf?.slope || 0);
  return {
    status: worst <= -2 ? 'likely' : worst <= -1 ? 'possible' : 'stable',
    global: g, superior: s, inferior: inf
  };
};

// Status helpers
const statusColor = s => s === 'likely' ? '#f87171' : s === 'possible' ? '#fbbf24' : '#34d399';
const statusText = s => s === 'likely' ? 'Likely Progression' : s === 'possible' ? 'Possible Progression' : 'Stable';

// Icon component
const Icon = ({ d }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d={d} />
  </svg>
);

// VF Grid Component - handles both 24-2 and 10-2
const VFGrid = ({ gpa, plr, poplr, mode, eye = 'OD' }) => {
  // For PoPLR, use the PLR points but color by PoPLR declining locations
  const data = mode === 'poplr' ? plr.points : mode === 'plr' ? plr.points : gpa.bl;
  if (!data?.length) return null;
  
  // Detect pattern from analysis results
  const pattern = plr.pattern || gpa.pattern || '24-2';
  const is10_2 = pattern === '10-2';
  
  const blindSpot = BLIND_SPOT[eye];
  const size = 240;
  const padding = 20;
  
  // For 10-2: points range from -9 to +9, use 11 as max for padding
  // For 24-2: points range from -27 to +21, use 30 as max
  const maxDeg = is10_2 ? 11 : 30;
  const scale = (size - 2 * padding) / (maxDeg * 2);
  const cx = size / 2;
  const cy = size / 2;
  const toX = deg => cx + deg * scale;
  const toY = deg => cy - deg * scale;
  
  // Point radius - smaller for 10-2 since points are denser
  const pointRadius = is10_2 ? 6 : 4;
  
  // For PoPLR, get the declining location indices
  const poplrDeclining = new Set(poplr?.locationData?.map(l => l.index) || []);
  
  const getColor = (p, idx) => {
    if (mode === 'poplr') {
      // Color points based on whether they contribute to PoPLR S-statistic
      if (poplrDeclining.has(idx)) {
        // Declining location - color by slope severity
        const loc = poplr.locationData?.find(l => l.index === idx);
        if (loc) {
          if (loc.slope <= -1.5) return '#EF4444'; // Fast decline
          if (loc.slope <= -1.0) return '#F97316'; // Moderate decline
          if (loc.slope <= -0.5) return '#FBBF24'; // Slow decline
          return '#F59E0B'; // Minimal decline
        }
        return '#F59E0B';
      }
      return '#10B981'; // Stable/improving
    }
    if (mode === 'plr') {
      if (p.status === 'significant') return '#EF4444'; // Slope < 0 and P < 0.01
      if (p.status === 'improving') return '#3B82F6';
      return '#10B981'; // Stable
    }
    const isProg = gpa.prog.some(x => x.id === p.id);
    const isPoss = gpa.poss.some(x => x.id === p.id);
    if (isProg) return '#EF4444';
    if (isPoss) return '#F59E0B';
    if (p.td >= -2) return '#10B981';
    if (p.td >= -6) return '#84CC16';
    if (p.td >= -12) return '#FBBF24';
    return '#F97316';
  };
  
  const getStroke = (p, idx) => {
    if (mode === 'poplr') {
      return poplrDeclining.has(idx) ? '#fff' : 'none';
    }
    if (mode === 'plr') return p.status === 'significant' ? '#fff' : 'none';
    return gpa.prog.some(x => x.id === p.id) ? '#fff' : gpa.poss.some(x => x.id === p.id) ? '#fbbf24' : 'none';
  };
  
  const getTitle = (p, idx) => {
    if (mode === 'poplr') {
      const loc = poplr?.locationData?.find(l => l.index === idx);
      if (loc) {
        return `(${p.x}°, ${p.y}°)\nSlope: ${loc.slope.toFixed(2)} dB/yr\np=${loc.pValue.toFixed(3)}\nContributes to S-stat`;
      }
      return `(${p.x}°, ${p.y}°)\nStable/Improving`;
    }
    if (mode === 'plr') {
      return `(${p.x}°, ${p.y}°)\nSlope: ${p.slope?.toFixed(2)} dB/yr\np=${p.pValue?.toFixed(3)}`;
    }
    return `(${p.x}°, ${p.y}°)\nTD: ${p.td?.toFixed(1)} dB`;
  };
  
  // Degree markers based on pattern
  // Degree markers based on pattern - show at key positions
  const degreeMarkers = is10_2 ? [-9, -5, 5, 9] : [-20, -10, 10, 20];
  
  return (
    <div style={{ background: '#0f172a', borderRadius: 12, padding: 16, border: '1px solid #334155' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{pattern} Visual Field ({eye})</span>
        <span style={{ fontSize: 11, color: '#64748b' }}>
          {mode === 'poplr' ? 'PoPLR Declining' : mode === 'plr' ? 'PLR Slopes' : 'GPA Events'}
        </span>
      </div>
      
      <svg width={size} height={size} style={{ display: 'block', margin: '0 auto', background: '#020617', borderRadius: 8 }}>
        {/* Grid lines */}
        <line x1={cx} y1={padding} x2={cx} y2={size - padding} stroke="#1e293b" />
        <line x1={padding} y1={cy} x2={size - padding} y2={cy} stroke="#1e293b" />
        
        {/* Degree markers - use pattern-specific markers */}
        {degreeMarkers.map(d => (
          <g key={d}>
            <line x1={toX(d)} y1={cy - 3} x2={toX(d)} y2={cy + 3} stroke="#334155" />
            <line x1={cx - 3} y1={toY(d)} x2={cx + 3} y2={toY(d)} stroke="#334155" />
          </g>
        ))}
        
        {/* Labels */}
        <text x={cx} y={12} textAnchor="middle" fill="#64748b" fontSize="9">Superior</text>
        <text x={cx} y={size - 5} textAnchor="middle" fill="#64748b" fontSize="9">Inferior</text>
        <text x={8} y={cy + 3} fill="#64748b" fontSize="9">T</text>
        <text x={size - 12} y={cy + 3} fill="#64748b" fontSize="9">N</text>
        
        {/* Fixation */}
        <circle cx={cx} cy={cy} r={2} fill="#fff" opacity={0.5} />
        
        {/* Blind spot - only show for 24-2 (not in 10-2 central field) */}
        {!is10_2 && (
          <ellipse cx={toX(blindSpot.x)} cy={toY(blindSpot.y)} rx={10} ry={6} fill="#020617" stroke="#334155" strokeDasharray="2,2" />
        )}
        
        {/* Points */}
        {data.map((p, idx) => (
          <circle
            key={p.id}
            cx={toX(p.x)}
            cy={toY(p.y)}
            r={getStroke(p, idx) !== 'none' ? 6 : (is10_2 ? 3 : 4)}
            fill={getColor(p, idx)}
            stroke={getStroke(p, idx)}
            strokeWidth={1.5}
          >
            <title>{getTitle(p, idx)}</title>
          </circle>
        ))}
      </svg>
      
      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 12, fontSize: 10 }}>
        {mode === 'poplr' ? (
          <>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', border: '1px solid #fff' }} />Fast</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F97316' }} />Mod</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FBBF24' }} />Slow</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />Stable</span>
          </>
        ) : mode === 'plr' ? (
          <>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', border: '1px solid #fff' }} />Sig</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} />Border</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />Stable</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6' }} />Improv</span>
          </>
        ) : (
          <>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', border: '1px solid #fff' }} />Confirmed</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} />Possible</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />Normal</span>
          </>
        )}
      </div>
    </div>
  );
};

// MD Slope Chart Component
const MDSlopeChart = ({ tests }) => {
  const sorted = [...tests].sort((a, b) => new Date(a.date) - new Date(b.date));
  const reg = regress(sorted, 'md', true); // Use robust Theil-Sen regression
  if (!reg || sorted.length < 2) return null;
  
  const { slope, intercept, r2, pValue, ciLower, ciUpper } = reg;
  const baseDate = new Date(sorted[0].date);
  
  // Calculate years for each test
  const lastYears = (new Date(sorted[sorted.length - 1].date) - baseDate) / 31536000000;
  const projectionYears = lastYears + 2;
  
  // Create data points with MD values
  // Trend = best fit line value at each time point (y = intercept + slope * x)
  const chartData = sorted.map((t, idx) => {
    const years = (new Date(t.date) - baseDate) / 31536000000;
    return {
      date: t.date,
      label: new Date(t.date).toLocaleDateString('en', { month: 'short', year: '2-digit' }),
      md: t.md,
      years,
      trend: intercept + slope * years, // Best fit value at this time point
    };
  });
  
  // Add projection point
  chartData.push({
    label: '+2yr',
    md: null,
    trend: intercept + slope * projectionYears,
    isProjection: true,
  });
  
  // Progression status based on -0.5 dB/year threshold
  const isProgressing = slope < MD_SLOPE_THRESHOLD;
  const rateLabel = slope >= -0.5 ? 'Stable' : slope > -1 ? 'Progressing' : slope > -2 ? 'Moderate' : 'Fast';
  const rateColor = slope >= -0.5 ? '#34d399' : slope > -1 ? '#fbbf24' : slope > -2 ? '#f97316' : '#ef4444';
  
  return (
    <div style={{ background: '#0f172a', borderRadius: 12, padding: 16, border: '1px solid #334155' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>MD Slope Analysis</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>Robust linear regression (Theil-Sen)</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isProgressing && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(239,68,68,0.2)', color: '#ef4444' }}>PROGRESSING</span>}
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: `${rateColor}20`, color: rateColor }}>{rateLabel}</span>
        </div>
      </div>
      
      <div style={{ height: 180 }}>
        <ResponsiveContainer>
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={{ stroke: '#475569' }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={{ stroke: '#475569' }} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
            <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" />
            <Line type="linear" dataKey="trend" stroke={isProgressing ? '#ef4444' : '#06b6d4'} strokeWidth={2} dot={false} name="Best Fit" />
            <Line type="linear" dataKey="md" stroke="#22d3ee" strokeWidth={0} dot={{ fill: '#22d3ee', r: 4, stroke: '#0f172a', strokeWidth: 2 }} connectNulls={false} name="MD" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 12 }}>
        <div style={{ textAlign: 'center', padding: 8, background: '#1e293b', borderRadius: 6 }}>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: isProgressing ? '#ef4444' : '#22d3ee' }}>{slope.toFixed(2)}</div>
          <div style={{ fontSize: 10, color: '#64748b' }}>dB/year</div>
        </div>
        <div style={{ textAlign: 'center', padding: 8, background: '#1e293b', borderRadius: 6 }}>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#cbd5e1' }}>{r2.toFixed(3)}</div>
          <div style={{ fontSize: 10, color: '#64748b' }}>R²</div>
        </div>
        <div style={{ textAlign: 'center', padding: 8, background: '#1e293b', borderRadius: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 'bold', color: '#cbd5e1' }}>{ciLower.toFixed(2)} to {ciUpper.toFixed(2)}</div>
          <div style={{ fontSize: 10, color: '#64748b' }}>95% CI</div>
        </div>
        <div style={{ textAlign: 'center', padding: 8, background: '#1e293b', borderRadius: 6 }}>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: pValue < 0.05 ? '#f87171' : '#94a3b8' }}>{pValue < 0.001 ? '<.001' : pValue.toFixed(3)}</div>
          <div style={{ fontSize: 10, color: '#64748b' }}>p-value</div>
        </div>
      </div>
      
      <div style={{ marginTop: 8, padding: 8, background: 'rgba(30,41,59,0.3)', borderRadius: 6, fontSize: 10, color: '#64748b' }}>
        Threshold: slope &lt; -0.5 dB/year = Progressing
      </div>
    </div>
  );
};

// Fastest Declining Points Component
const FastestDecliningPoints = ({ analysis }) => {
  if (analysis.status === 'insufficient') return null;
  
  const renderPointsList = (points, title, months) => {
    if (!points || points.length === 0) {
      return (
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>{title}</div>
          <div style={{ fontSize: 11, color: '#475569', fontStyle: 'italic' }}>No data at {months} months</div>
        </div>
      );
    }
    
    return (
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>
          {title} <span style={{ color: '#94a3b8' }}>({points[0]?.monthsElapsed || months} mo)</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {points.map((p, i) => (
            <div key={p.id} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8, 
              padding: '4px 8px', 
              background: 'rgba(30,41,59,0.5)', 
              borderRadius: 4,
              borderLeft: `3px solid ${p.change <= -6 ? '#ef4444' : p.change <= -3 ? '#f97316' : '#fbbf24'}`
            }}>
              <span style={{ 
                fontSize: 10, 
                color: '#64748b',
                minWidth: 14
              }}>#{i + 1}</span>
              <span style={{ 
                fontSize: 10, 
                color: '#94a3b8',
                minWidth: 50
              }}>({p.x}°, {p.y}°)</span>
              <span style={{ 
                fontSize: 11, 
                fontWeight: 600, 
                color: p.change <= -6 ? '#ef4444' : p.change <= -3 ? '#f97316' : '#fbbf24'
              }}>{p.change.toFixed(1)} dB</span>
              <span style={{ 
                fontSize: 9, 
                color: '#64748b'
              }}>{p.baselineTD.toFixed(0)}→{p.finalTD.toFixed(0)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div style={{ background: '#0f172a', borderRadius: 12, padding: 16, border: '1px solid #334155' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Fastest Declining Locations</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>Top 5 points with greatest dB loss</div>
        </div>
        <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(168,85,247,0.2)', color: '#a855f7' }}>
          {analysis.pattern}
        </span>
      </div>
      
      <div style={{ display: 'flex', gap: 16 }}>
        {renderPointsList(analysis.at12Months, '12-Month Change', 12)}
        {renderPointsList(analysis.at24Months, '24-Month Change', 24)}
      </div>
      
      {/* Summary */}
      {(analysis.at12Months?.length > 0 || analysis.at24Months?.length > 0) && (
        <div style={{ marginTop: 12, padding: 8, background: 'rgba(30,41,59,0.3)', borderRadius: 6, fontSize: 10, color: '#64748b' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {analysis.at12Months?.length > 0 && (
              <span>
                12mo worst: <strong style={{ color: '#f87171' }}>{analysis.at12Months[0].change.toFixed(1)} dB</strong> at ({analysis.at12Months[0].x}°, {analysis.at12Months[0].y}°)
              </span>
            )}
            {analysis.at24Months?.length > 0 && (
              <span>
                24mo worst: <strong style={{ color: '#f87171' }}>{analysis.at24Months[0].change.toFixed(1)} dB</strong> at ({analysis.at24Months[0].x}°, {analysis.at24Months[0].y}°)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Main App Component
export default function App() {
  const [tab, setTab] = useState('vf');
  const [vf, setVf] = useState([]);
  const [oct, setOct] = useState([]);
  const [eye, setEye] = useState('all');
  const [vfMode, setVfMode] = useState('gpa');
  const [showForm, setShowForm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [ocrMsg, setOcrMsg] = useState('');
  const [review, setReview] = useState(null);
  const [batchResults, setBatchResults] = useState(null); // For batch upload results
  const fileRef = useRef();
  
  const [vfForm, setVfForm] = useState({ date: '', md: '', eye: 'OD', pattern: '24-2' });
  const [octForm, setOctForm] = useState({ date: '', eye: 'OD', global: '', superior: '', inferior: '', temporal: '', nasal: '' });
  
  // Filtered and sorted data
  const filteredVf = eye === 'all' ? vf : vf.filter(t => t.eye === eye);
  const filteredOct = eye === 'all' ? oct : oct.filter(t => t.eye === eye);
  const sortedVf = [...filteredVf].sort((a, b) => new Date(a.date) - new Date(b.date));
  const sortedOct = [...filteredOct].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Analysis
  const gpa = gpaAnalysis(sortedVf);
  const plr = plrAnalysis(sortedVf);
  const poplr = poplrAnalysis(sortedVf);
  const fastestDecline = fastestDecliningAnalysis(sortedVf);
  const octA = octAnalysis(sortedOct);
  const mdReg = regress(sortedVf, 'md', true); // Use robust Theil-Sen regression for MD
  
  // Process single PDF file
  const processPDF = async (file, onProgress) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let result = null;
      const numPages = Math.min(pdf.numPages, 5);
      
      // Try each page until we find valid data
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const viewport = page.getViewport({ scale: 1.0 });
        
        // Method 1: Try spatial parsing with positioned text
        if (textContent.items.length > 10) {
          const parsed = parsePositionedText(textContent.items, viewport.height);
          
          // Check if we got meaningful data
          if (parsed.md !== null && parsed.date !== null) {
            result = { ...parsed, file: file.name, success: true, method: 'spatial' };
            break;
          }
        }
        
        // Method 2: Fallback to simple text extraction
        const pageText = textContent.items.map(item => item.str).join(' ');
        if (pageText.trim().length > 50) {
          const parsed = parseOCR(pageText);
          if (parsed.md !== null || parsed.date !== null) {
            result = { ...parsed, file: file.name, success: true, method: 'text' };
            break;
          }
        }
      }
      
      // Method 3: If no text found, try OCR on rendered page
      if (!result || (result.md === null && result.date === null)) {
        if (onProgress) onProgress('Running OCR...');
        
        const page = await pdf.getPage(1);
        const imageData = await renderPageToImage(page, 2.0);
        const ocrText = await ocrImage(imageData, pct => {
          if (onProgress) onProgress(`OCR: ${pct}%`);
        });
        
        if (ocrText.trim()) {
          const parsed = parseOCR(ocrText);
          result = { ...parsed, file: file.name, success: true, method: 'ocr' };
        }
      }
      
      if (result) {
        return result;
      } else {
        return { file: file.name, success: false, error: 'No text found in PDF' };
      }
    } catch (err) {
      return { file: file.name, success: false, error: err.message };
    }
  };
  
  // Process image file (PNG, JPG, etc.)
  const processImage = async (file, onProgress) => {
    try {
      if (onProgress) onProgress('Running OCR on image...');
      
      const imageData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      const ocrText = await ocrImage(imageData, pct => {
        if (onProgress) onProgress(`OCR: ${pct}%`);
      });
      
      if (ocrText.trim()) {
        const parsed = parseOCR(ocrText);
        return { ...parsed, file: file.name, success: true, method: 'ocr' };
      } else {
        return { file: file.name, success: false, error: 'OCR failed - no text recognized' };
      }
    } catch (err) {
      return { file: file.name, success: false, error: err.message };
    }
  };
  
  // Batch file upload handler
  const handleFileUpload = async e => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    // Helper to check file type
    const isPDF = file => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file => file.type.startsWith('image/') || /\.(png|jpg|jpeg|gif|bmp|tiff?)$/i.test(file.name);
    
    // Single file - use review modal
    if (files.length === 1) {
      const file = files[0];
      setProcessing(true);
      setOcrMsg('Reading file...');
      
      let result;
      if (isPDF(file)) {
        setOcrMsg('Extracting text from PDF...');
        result = await processPDF(file, msg => setOcrMsg(msg));
      } else if (isImage(file)) {
        setOcrMsg('Running OCR on image...');
        result = await processImage(file, msg => setOcrMsg(msg));
      } else {
        result = { 
          md: null, date: null, eye: 'OD', td: [], pattern: '24-2',
          warn: ['Unsupported file type - please use PDF or image'], 
          file: file.name,
          success: false
        };
      }
      
      if (result.success) {
        setReview(result);
      } else {
        setReview({ 
          md: null, date: null, eye: 'OD', td: [], pattern: '24-2',
          warn: [result.error || 'Error reading file'], 
          file: file.name 
        });
      }
      
      setProcessing(false);
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    
    // Multiple files - batch process
    setProcessing(true);
    const results = [];
    const newTests = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setOcrMsg(`Processing ${i + 1}/${files.length}: ${file.name}`);
      
      let result;
      if (isPDF(file)) {
        result = await processPDF(file, msg => setOcrMsg(`${i + 1}/${files.length}: ${msg}`));
      } else if (isImage(file)) {
        result = await processImage(file, msg => setOcrMsg(`${i + 1}/${files.length}: ${msg}`));
      } else {
        result = { file: file.name, success: false, error: 'Unsupported file type' };
      }
      
      results.push(result);
      
      // Auto-add if we have both date and MD
      if (result.success && result.date && result.md !== null) {
        const pattern = result.pattern || '24-2';
        newTests.push({
          id: Date.now() + i,
          date: result.date,
          md: result.md,
          psd: result.psd,
          vfi: result.vfi,
          eye: result.eye || 'OD',
          pattern,
          td: result.td?.length ? result.td : generateTD(result.md, pattern)
        });
      }
    }
    
    // Add all successful tests
    if (newTests.length > 0) {
      setVf(prev => [...prev, ...newTests]);
    }
    
    // Show batch results summary
    setBatchResults(results);
    setProcessing(false);
    if (fileRef.current) fileRef.current.value = '';
  };
  
  // Add VF test
  const addVfTest = () => {
    if (!vfForm.date || !vfForm.md) return;
    const md = parseFloat(vfForm.md);
    const pattern = vfForm.pattern || '24-2';
    setVf([...vf, {
      id: Date.now(),
      date: vfForm.date,
      md,
      eye: vfForm.eye,
      pattern,
      td: generateTD(md, pattern)
    }]);
    setVfForm({ date: '', md: '', eye: 'OD', pattern: '24-2' });
    setShowForm(false);
  };
  
  // Add from OCR review
  const addFromReview = () => {
    if (!review?.date || review?.md == null) {
      alert('Date and MD are required');
      return;
    }
    const pattern = review.pattern || '24-2';
    setVf([...vf, {
      id: Date.now(),
      date: review.date,
      md: review.md,
      psd: review.psd,
      vfi: review.vfi,
      eye: review.eye || 'OD',
      pattern,
      td: review.td?.length ? review.td : generateTD(review.md, pattern)
    }]);
    setReview(null);
  };
  
  // Add OCT scan
  const addOctScan = () => {
    if (!octForm.date || !octForm.global) return;
    setOct([...oct, {
      id: Date.now(),
      date: octForm.date,
      eye: octForm.eye,
      global: parseFloat(octForm.global),
      superior: parseFloat(octForm.superior) || null,
      inferior: parseFloat(octForm.inferior) || null,
      temporal: parseFloat(octForm.temporal) || null,
      nasal: parseFloat(octForm.nasal) || null
    }]);
    setOctForm({ date: '', eye: 'OD', global: '', superior: '', inferior: '', temporal: '', nasal: '' });
    setShowForm(false);
  };
  
  const inputStyle = { width: '100%', background: '#1e293b', border: '1px solid #475569', borderRadius: 6, padding: '6px 8px', color: '#fff', fontSize: 14 };
  
  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#fff', fontFamily: 'system-ui' }}>
      {/* OCR Review Modal */}
      {review && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#0f172a', borderRadius: 12, border: '1px solid #334155', width: 450, maxHeight: '80vh', overflow: 'auto', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>Review: {review.file}</h3>
              <button onClick={() => setReview(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            
            {review.warn?.length > 0 && (
              <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 6, padding: 8, marginBottom: 12, color: '#fbbf24', fontSize: 12 }}>
                ⚠ {review.warn.join(', ')}
              </div>
            )}
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8' }}>Date *</label>
                <input type="date" value={review.date || ''} onChange={e => setReview({ ...review, date: e.target.value })} style={{ ...inputStyle, borderColor: review.date ? '#10b981' : '#ef4444' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8' }}>MD (dB) *</label>
                <input type="number" step="0.1" value={review.md ?? ''} onChange={e => setReview({ ...review, md: parseFloat(e.target.value) || null })} style={{ ...inputStyle, borderColor: review.md != null ? '#10b981' : '#ef4444' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8' }}>PSD</label>
                <input type="number" step="0.1" value={review.psd ?? ''} onChange={e => setReview({ ...review, psd: parseFloat(e.target.value) || null })} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8' }}>VFI %</label>
                <input type="number" value={review.vfi ?? ''} onChange={e => setReview({ ...review, vfi: parseInt(e.target.value) || null })} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8' }}>Eye</label>
                <select value={review.eye || 'OD'} onChange={e => setReview({ ...review, eye: e.target.value })} style={inputStyle}>
                  <option>OD</option><option>OS</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8' }}>Pattern</label>
                <select value={review.pattern || '24-2'} onChange={e => setReview({ ...review, pattern: e.target.value })} style={inputStyle}>
                  <option value="24-2">24-2</option><option value="10-2">10-2</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8' }}>Fix Loss</label>
                <input value={review.fl || ''} onChange={e => setReview({ ...review, fl: e.target.value })} style={inputStyle} placeholder="1/12" />
              </div>
            </div>
            
            {review.td?.length > 0 && <p style={{ color: '#22d3ee', fontSize: 12, marginTop: 12 }}>✓ Extracted {review.td.length} TD values ({review.pattern || '24-2'})</p>}
            
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button onClick={addFromReview} style={{ flex: 1, padding: 10, background: '#0891b2', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>Add Test</button>
              <button onClick={() => setReview(null)} style={{ padding: '10px 16px', background: '#334155', color: '#cbd5e1', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header style={{ borderBottom: '1px solid #1e293b', background: 'rgba(15,23,42,0.95)', position: 'sticky', top: 0, zIndex: 10, padding: '12px 16px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #06b6d4, #2563eb)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z" />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: 18 }}>Glaucoma Progression Analyzer</h1>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>VF (GPA + PLR) + OCT RNFL</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select value={eye} onChange={e => setEye(e.target.value)} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 6, padding: '4px 8px', color: '#cbd5e1', fontSize: 12 }}>
                <option value="all">All Eyes</option>
                <option value="OD">OD</option>
                <option value="OS">OS</option>
              </select>
              <button onClick={() => { setVf([]); setOct([]); }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 12 }}>Clear</button>
              <button onClick={() => { setVf(createDemoVF()); setOct(createDemoOCT()); }} style={{ background: '#1e293b', border: 'none', borderRadius: 6, padding: '4px 8px', color: '#cbd5e1', cursor: 'pointer', fontSize: 12 }}>Demo</button>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {['vf', 'oct', 'combined'].map(t => (
              <button key={t} onClick={() => { setTab(t); setShowForm(false); }} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 500, background: tab === t ? '#0891b2' : '#1e293b', color: tab === t ? '#fff' : '#94a3b8' }}>
                {t === 'vf' ? 'Visual Field' : t === 'oct' ? 'OCT RNFL' : 'Combined'}
              </button>
            ))}
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: 16 }}>
        {/* VF Tab */}
        {tab === 'vf' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Upload */}
              <div onClick={() => fileRef.current?.click()} style={{ border: '2px dashed #475569', borderRadius: 12, padding: 24, textAlign: 'center', cursor: 'pointer', background: 'rgba(30,41,59,0.3)' }}>
                <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.gif,.bmp,.tiff" multiple onChange={handleFileUpload} style={{ display: 'none' }} />
                <Icon d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5 M12 3v12" />
                <p style={{ margin: '8px 0 4px', fontWeight: 500 }}>Upload VF Tests</p>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Select multiple PDFs • Auto-extracts MD, Date, TD</p>
              </div>
              
              {processing && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'rgba(6,182,212,0.1)', borderRadius: 8, color: '#22d3ee' }}>
                  <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid #22d3ee', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  {ocrMsg}
                </div>
              )}
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              
              {/* Batch Results Modal */}
              {batchResults && (
                <div style={{ background: 'rgba(30,41,59,0.8)', borderRadius: 12, padding: 16, border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h4 style={{ margin: 0, fontSize: 14 }}>Batch Upload Results</h4>
                    <button onClick={() => setBatchResults(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 18 }}>×</button>
                  </div>
                  <div style={{ maxHeight: 200, overflow: 'auto' }}>
                    {batchResults.map((r, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #334155', fontSize: 12 }}>
                        <span style={{ color: '#cbd5e1', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 8 }}>{r.file}</span>
                        {r.success && r.date && r.md !== null ? (
                          <span style={{ color: '#34d399' }}>✓ Added (MD: {r.md?.toFixed(1)}, {r.date})</span>
                        ) : r.success ? (
                          <span style={{ color: '#fbbf24' }}>⚠ Missing {!r.date ? 'date' : ''}{!r.date && r.md === null ? ', ' : ''}{r.md === null ? 'MD' : ''}</span>
                        ) : (
                          <span style={{ color: '#f87171' }}>✗ {r.error}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 12, padding: 8, background: 'rgba(16,185,129,0.1)', borderRadius: 6, fontSize: 12, color: '#34d399' }}>
                    {batchResults.filter(r => r.success && r.date && r.md !== null).length} of {batchResults.length} tests added successfully
                  </div>
                </div>
              )}
              
              <button onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: '#1e293b', border: 'none', borderRadius: 8, color: '#cbd5e1', cursor: 'pointer', width: 'fit-content' }}>
                <Icon d="M12 5v14 M5 12h14" /> Manual Entry
              </button>
              
              {showForm && (
                <div style={{ background: 'rgba(30,41,59,0.5)', borderRadius: 12, padding: 16, border: '1px solid #334155' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, color: '#94a3b8' }}>Date</label>
                      <input type="date" value={vfForm.date} onChange={e => setVfForm({ ...vfForm, date: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: '#94a3b8' }}>MD *</label>
                      <input type="number" step="0.1" value={vfForm.md} onChange={e => setVfForm({ ...vfForm, md: e.target.value })} placeholder="-3.5" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: '#94a3b8' }}>Eye</label>
                      <select value={vfForm.eye} onChange={e => setVfForm({ ...vfForm, eye: e.target.value })} style={inputStyle}>
                        <option>OD</option><option>OS</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: '#94a3b8' }}>Pattern</label>
                      <select value={vfForm.pattern} onChange={e => setVfForm({ ...vfForm, pattern: e.target.value })} style={inputStyle}>
                        <option value="24-2">24-2</option><option value="10-2">10-2</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button onClick={addVfTest} style={{ padding: '8px 16px', background: '#0891b2', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Add</button>
                    <button onClick={() => setShowForm(false)} style={{ padding: '8px 16px', background: '#334155', color: '#cbd5e1', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              )}
              
              {/* Test List */}
              {sortedVf.length > 0 && (
                <div style={{ background: 'rgba(30,41,59,0.3)', borderRadius: 12, border: '1px solid #334155', overflow: 'hidden' }}>
                  <div style={{ padding: '8px 12px', background: 'rgba(30,41,59,0.5)', borderBottom: '1px solid #334155', fontWeight: 500, fontSize: 13 }}>
                    VF Tests ({sortedVf.length})
                  </div>
                  <div style={{ maxHeight: 140, overflow: 'auto' }}>
                    {sortedVf.map((t, i) => (
                      <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid rgba(51,65,85,0.5)', fontSize: 12 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ padding: '2px 6px', borderRadius: 4, background: i < 2 ? 'rgba(6,182,212,0.2)' : '#334155', color: i < 2 ? '#22d3ee' : '#94a3b8', fontSize: 10 }}>
                            {i < 2 ? 'BL' : `F${i - 1}`}
                          </span>
                          <span style={{ color: '#94a3b8' }}>{new Date(t.date).toLocaleDateString()}</span>
                          <span style={{ color: '#22d3ee', fontWeight: 500 }}>MD: {t.md?.toFixed(1)}</span>
                          <span style={{ color: '#64748b' }}>{t.eye}</span>
                          <span style={{ padding: '1px 4px', borderRadius: 3, background: t.pattern === '10-2' ? 'rgba(168,85,247,0.2)' : 'rgba(59,130,246,0.2)', color: t.pattern === '10-2' ? '#a855f7' : '#3b82f6', fontSize: 9 }}>
                            {t.pattern || '24-2'}
                          </span>
                        </div>
                        <button onClick={() => setVf(vf.filter(x => x.id !== t.id))} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 16 }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* MD Slope Chart */}
              {sortedVf.length >= 2 && <MDSlopeChart tests={sortedVf} />}
              
              {/* Fastest Declining Points */}
              {sortedVf.length >= 2 && <FastestDecliningPoints analysis={fastestDecline} />}
            </div>
            
            {/* Right Column - Analysis */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>VF Progression Analysis</h2>
                {sortedVf.length >= 3 && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => setVfMode('gpa')} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 500, background: vfMode === 'gpa' ? '#0891b2' : '#334155', color: vfMode === 'gpa' ? '#fff' : '#94a3b8' }}>GPA</button>
                    <button onClick={() => setVfMode('plr')} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 500, background: vfMode === 'plr' ? '#0891b2' : '#334155', color: vfMode === 'plr' ? '#fff' : '#94a3b8' }}>PLR</button>
                    <button onClick={() => setVfMode('poplr')} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 500, background: vfMode === 'poplr' ? '#0891b2' : '#334155', color: vfMode === 'poplr' ? '#fff' : '#94a3b8' }}>PoPLR</button>
                  </div>
                )}
              </div>
              
              {sortedVf.length < 3 ? (
                <div style={{ background: 'rgba(30,41,59,0.3)', borderRadius: 12, padding: 32, border: '1px solid #334155', textAlign: 'center' }}>
                  <p style={{ color: '#64748b', margin: 0 }}>Add at least 3 VF tests for progression analysis</p>
                </div>
              ) : (
                <>
                  {/* Analysis Stats */}
                  <div style={{ background: 'linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.8))', borderRadius: 12, padding: 16, border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <h3 style={{ margin: 0, fontSize: 14 }}>
                        {vfMode === 'gpa' ? 'GPA Event Analysis' : vfMode === 'plr' ? 'Pointwise Linear Regression' : 'PoPLR Analysis'}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: statusColor(vfMode === 'gpa' ? gpa.status : vfMode === 'plr' ? plr.status : poplr.status) }} />
                        <span style={{ fontWeight: 600, color: statusColor(vfMode === 'gpa' ? gpa.status : vfMode === 'plr' ? plr.status : poplr.status) }}>
                          {statusText(vfMode === 'gpa' ? gpa.status : vfMode === 'plr' ? plr.status : poplr.status)}
                        </span>
                      </div>
                    </div>
                    
                    {vfMode === 'gpa' ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                        <div style={{ textAlign: 'center', padding: 10, background: 'rgba(30,41,59,0.5)', borderRadius: 6 }}>
                          <p style={{ fontSize: 22, fontWeight: 'bold', color: '#f87171', margin: 0 }}>{gpa.prog.length}</p>
                          <p style={{ fontSize: 10, color: '#64748b', margin: '4px 0 0' }}>Confirmed</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: 10, background: 'rgba(30,41,59,0.5)', borderRadius: 6 }}>
                          <p style={{ fontSize: 22, fontWeight: 'bold', color: '#fbbf24', margin: 0 }}>{gpa.poss.length}</p>
                          <p style={{ fontSize: 10, color: '#64748b', margin: '4px 0 0' }}>Possible</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: 10, background: 'rgba(30,41,59,0.5)', borderRadius: 6 }}>
                          <p style={{ fontSize: 22, fontWeight: 'bold', color: '#94a3b8', margin: 0 }}>54</p>
                          <p style={{ fontSize: 10, color: '#64748b', margin: '4px 0 0' }}>Total Points</p>
                        </div>
                      </div>
                    ) : vfMode === 'plr' ? (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                          <div style={{ textAlign: 'center', padding: 8, background: 'rgba(30,41,59,0.5)', borderRadius: 6 }}>
                            <p style={{ fontSize: 18, fontWeight: 'bold', color: '#f87171', margin: 0 }}>{plr.significant}</p>
                            <p style={{ fontSize: 9, color: '#64748b', margin: '2px 0 0' }}>Progressing</p>
                          </div>
                          <div style={{ textAlign: 'center', padding: 8, background: 'rgba(30,41,59,0.5)', borderRadius: 6 }}>
                            <p style={{ fontSize: 18, fontWeight: 'bold', color: '#10b981', margin: 0 }}>{plr.stable}</p>
                            <p style={{ fontSize: 9, color: '#64748b', margin: '2px 0 0' }}>Stable</p>
                          </div>
                          <div style={{ textAlign: 'center', padding: 8, background: 'rgba(30,41,59,0.5)', borderRadius: 6 }}>
                            <p style={{ fontSize: 18, fontWeight: 'bold', color: '#3b82f6', margin: 0 }}>{plr.improving}</p>
                            <p style={{ fontSize: 9, color: '#64748b', margin: '2px 0 0' }}>Improving</p>
                          </div>
                        </div>
                        <div style={{ marginTop: 8, padding: 8, background: 'rgba(30,41,59,0.3)', borderRadius: 6 }}>
                          <div style={{ textAlign: 'center' }}>
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>Mean Slope: </span>
                            <span style={{ fontWeight: 'bold', color: plr.avgSlope < -0.5 ? '#f87171' : '#10b981' }}>{plr.avgSlope.toFixed(2)} dB/yr</span>
                          </div>
                          <div style={{ fontSize: 9, color: '#64748b', textAlign: 'center', marginTop: 4 }}>
                            Progressing = slope &lt; 0 at P &lt; 0.01
                          </div>
                        </div>
                      </>
                    ) : (
                      /* PoPLR Display */
                      <>
                        {sortedVf.length < 4 ? (
                          <div style={{ padding: 16, textAlign: 'center', color: '#94a3b8' }}>
                            <p style={{ margin: 0 }}>PoPLR requires at least 4 VF tests</p>
                            <p style={{ margin: '8px 0 0', fontSize: 12 }}>Current: {sortedVf.length} tests</p>
                          </div>
                        ) : (
                          <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                              <div style={{ textAlign: 'center', padding: 10, background: 'rgba(30,41,59,0.5)', borderRadius: 6 }}>
                                <p style={{ fontSize: 20, fontWeight: 'bold', color: poplr.pValue !== null && poplr.pValue < 0.05 ? '#f87171' : '#10b981', margin: 0 }}>
                                  {poplr.pValue !== null ? (poplr.pValue < 0.001 ? '<0.001' : poplr.pValue.toFixed(3)) : '—'}
                                </p>
                                <p style={{ fontSize: 10, color: '#64748b', margin: '4px 0 0' }}>Global p-value</p>
                              </div>
                              <div style={{ textAlign: 'center', padding: 10, background: 'rgba(30,41,59,0.5)', borderRadius: 6 }}>
                                <p style={{ fontSize: 20, fontWeight: 'bold', color: '#22d3ee', margin: 0 }}>
                                  {poplr.sStatistic !== null ? poplr.sStatistic.toFixed(1) : '—'}
                                </p>
                                <p style={{ fontSize: 10, color: '#64748b', margin: '4px 0 0' }}>S-statistic</p>
                              </div>
                              <div style={{ textAlign: 'center', padding: 10, background: 'rgba(30,41,59,0.5)', borderRadius: 6 }}>
                                <p style={{ fontSize: 20, fontWeight: 'bold', color: '#a78bfa', margin: 0 }}>
                                  {poplr.pointsUsed || 0}
                                </p>
                                <p style={{ fontSize: 10, color: '#64748b', margin: '4px 0 0' }}>Declining Locs</p>
                              </div>
                            </div>
                            
                            <div style={{ marginTop: 12, padding: 12, background: 'rgba(30,41,59,0.3)', borderRadius: 8 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <span style={{ fontSize: 12, color: '#94a3b8' }}>Progression Status:</span>
                                <span style={{ 
                                  fontSize: 12, 
                                  fontWeight: 600, 
                                  padding: '2px 8px', 
                                  borderRadius: 4,
                                  background: poplr.progressing ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
                                  color: poplr.progressing ? '#f87171' : '#10b981'
                                }}>
                                  {poplr.progressing ? 'PROGRESSING' : 'STABLE'}
                                </span>
                              </div>
                              
                              <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>
                                <p style={{ margin: '0 0 4px' }}>
                                  • p {'<'} 0.05: Possible Progression
                                </p>
                                <p style={{ margin: '0 0 4px' }}>
                                  • p {'<'} 0.01: Likely Progression
                                </p>
                                <p style={{ margin: 0, fontSize: 10, fontStyle: 'italic' }}>
                                  Based on {poplr.numPermutations?.toLocaleString() || 5000} permutations
                                </p>
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                  
                  {/* VF Grid */}
                  <VFGrid gpa={gpa} plr={plr} poplr={poplr} mode={vfMode} eye={sortedVf[0]?.eye || 'OD'} />
                </>
              )}
            </div>
          </div>
        )}
        
        {/* OCT Tab */}
        {tab === 'oct' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: '#1e293b', border: 'none', borderRadius: 8, color: '#cbd5e1', cursor: 'pointer', width: 'fit-content' }}>
                <Icon d="M12 5v14 M5 12h14" /> Add OCT Scan
              </button>
              
              {showForm && (
                <div style={{ background: 'rgba(30,41,59,0.5)', borderRadius: 12, padding: 16, border: '1px solid #334155' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, color: '#94a3b8' }}>Date</label>
                      <input type="date" value={octForm.date} onChange={e => setOctForm({ ...octForm, date: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: '#94a3b8' }}>Global *</label>
                      <input type="number" value={octForm.global} onChange={e => setOctForm({ ...octForm, global: e.target.value })} placeholder="92" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: '#94a3b8' }}>Eye</label>
                      <select value={octForm.eye} onChange={e => setOctForm({ ...octForm, eye: e.target.value })} style={inputStyle}>
                        <option>OD</option><option>OS</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: '#94a3b8' }}>Superior</label>
                      <input type="number" value={octForm.superior} onChange={e => setOctForm({ ...octForm, superior: e.target.value })} placeholder="115" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: '#94a3b8' }}>Inferior</label>
                      <input type="number" value={octForm.inferior} onChange={e => setOctForm({ ...octForm, inferior: e.target.value })} placeholder="120" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: '#94a3b8' }}>Temporal</label>
                      <input type="number" value={octForm.temporal} onChange={e => setOctForm({ ...octForm, temporal: e.target.value })} style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button onClick={addOctScan} style={{ padding: '8px 16px', background: '#9333ea', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Add</button>
                    <button onClick={() => setShowForm(false)} style={{ padding: '8px 16px', background: '#334155', color: '#cbd5e1', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              )}
              
              {/* OCT List */}
              {sortedOct.length > 0 && (
                <div style={{ background: 'rgba(30,41,59,0.3)', borderRadius: 12, border: '1px solid #334155', overflow: 'hidden' }}>
                  <div style={{ padding: '8px 12px', background: 'rgba(30,41,59,0.5)', borderBottom: '1px solid #334155', fontWeight: 500, fontSize: 13 }}>
                    OCT Scans ({sortedOct.length})
                  </div>
                  <div style={{ maxHeight: 160, overflow: 'auto' }}>
                    {sortedOct.map(s => (
                      <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid rgba(51,65,85,0.5)', fontSize: 12 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ color: '#94a3b8' }}>{new Date(s.date).toLocaleDateString()}</span>
                          <span style={{ color: '#a855f7', fontWeight: 500 }}>G:{s.global?.toFixed(0)}</span>
                          <span style={{ color: '#64748b' }}>S:{s.superior?.toFixed(0) || '-'}</span>
                          <span style={{ color: '#64748b' }}>I:{s.inferior?.toFixed(0) || '-'}</span>
                        </div>
                        <button onClick={() => setOct(oct.filter(x => x.id !== s.id))} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 16 }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* RNFL Chart */}
              {sortedOct.length >= 2 && (
                <div style={{ background: 'rgba(30,41,59,0.3)', borderRadius: 12, padding: 16, border: '1px solid #334155' }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: 14 }}>RNFL Trends</h3>
                  <div style={{ height: 180 }}>
                    <ResponsiveContainer>
                      <ComposedChart data={sortedOct} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={d => new Date(d).toLocaleDateString('en', { month: 'short', year: '2-digit' })} />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 6 }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Line dataKey="global" stroke="#a855f7" strokeWidth={2} dot={{ r: 3 }} name="Global" />
                        <Line dataKey="superior" stroke="#22d3ee" strokeWidth={2} dot={{ r: 3 }} name="Superior" />
                        <Line dataKey="inferior" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} name="Inferior" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
            
            {/* OCT Analysis */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>OCT RNFL Analysis</h2>
              
              {sortedOct.length < 2 ? (
                <div style={{ background: 'rgba(30,41,59,0.3)', borderRadius: 12, padding: 32, border: '1px solid #334155', textAlign: 'center' }}>
                  <p style={{ color: '#64748b', margin: 0 }}>Add at least 2 OCT scans for trend analysis</p>
                </div>
              ) : (
                <>
                  <div style={{ background: 'linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.8))', borderRadius: 12, padding: 16, border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <h3 style={{ margin: 0, fontSize: 14 }}>RNFL Status</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: statusColor(octA.status) }} />
                        <span style={{ fontWeight: 600, color: statusColor(octA.status) }}>{statusText(octA.status)}</span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                      {octA.global && (
                        <div style={{ textAlign: 'center', padding: 10, background: 'rgba(30,41,59,0.5)', borderRadius: 6 }}>
                          <p style={{ fontSize: 18, fontWeight: 'bold', color: '#a855f7', margin: 0 }}>{octA.global.slope.toFixed(2)}</p>
                          <p style={{ fontSize: 10, color: '#64748b', margin: '4px 0 0' }}>Global µm/yr</p>
                        </div>
                      )}
                      {octA.superior && (
                        <div style={{ textAlign: 'center', padding: 10, background: 'rgba(30,41,59,0.5)', borderRadius: 6 }}>
                          <p style={{ fontSize: 18, fontWeight: 'bold', color: '#22d3ee', margin: 0 }}>{octA.superior.slope.toFixed(2)}</p>
                          <p style={{ fontSize: 10, color: '#64748b', margin: '4px 0 0' }}>Superior µm/yr</p>
                        </div>
                      )}
                      {octA.inferior && (
                        <div style={{ textAlign: 'center', padding: 10, background: 'rgba(30,41,59,0.5)', borderRadius: 6 }}>
                          <p style={{ fontSize: 18, fontWeight: 'bold', color: '#f97316', margin: 0 }}>{octA.inferior.slope.toFixed(2)}</p>
                          <p style={{ fontSize: 10, color: '#64748b', margin: '4px 0 0' }}>Inferior µm/yr</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Combined Tab */}
        {tab === 'combined' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {/* VF Summary */}
            <div style={{ background: 'linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.8))', borderRadius: 12, padding: 20, border: '1px solid #334155' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>Visual Field</h3>
              {sortedVf.length >= 3 ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: '#94a3b8' }}>GPA:</span>
                    <span style={{ fontWeight: 600, color: statusColor(gpa.status) }}>{statusText(gpa.status)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: '#94a3b8' }}>PLR:</span>
                    <span style={{ fontWeight: 600, color: statusColor(plr.status) }}>{statusText(plr.status)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: '#94a3b8' }}>MD Slope:</span>
                    <span style={{ fontWeight: 600, color: '#22d3ee' }}>{mdReg?.slope.toFixed(2)} dB/yr</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Sig. Points (PLR):</span>
                    <span style={{ fontWeight: 600, color: '#f87171' }}>{plr.significant}/54</span>
                  </div>
                </>
              ) : (
                <p style={{ color: '#64748b', margin: 0 }}>Need 3+ VF tests</p>
              )}
            </div>
            
            {/* OCT Summary */}
            <div style={{ background: 'linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.8))', borderRadius: 12, padding: 20, border: '1px solid #334155' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>OCT RNFL</h3>
              {sortedOct.length >= 2 ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: '#94a3b8' }}>Status:</span>
                    <span style={{ fontWeight: 600, color: statusColor(octA.status) }}>{statusText(octA.status)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: '#94a3b8' }}>Global:</span>
                    <span style={{ fontWeight: 600, color: '#a855f7' }}>{octA.global?.slope.toFixed(2)} µm/yr</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Inferior:</span>
                    <span style={{ fontWeight: 600, color: '#f97316' }}>{octA.inferior?.slope.toFixed(2)} µm/yr</span>
                  </div>
                </>
              ) : (
                <p style={{ color: '#64748b', margin: 0 }}>Need 2+ OCT scans</p>
              )}
            </div>
            
            {/* Overall Assessment */}
            {(sortedVf.length >= 3 || sortedOct.length >= 2) && (
              <div style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.8))', borderRadius: 12, padding: 20, border: '1px solid #334155' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>Combined Assessment</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                  <div style={{ textAlign: 'center', padding: 16, background: 'rgba(30,41,59,0.5)', borderRadius: 8 }}>
                    <p style={{ color: '#94a3b8', margin: '0 0 8px', fontSize: 12 }}>Overall</p>
                    <p style={{ fontSize: 18, fontWeight: 'bold', margin: 0, color:
                      ((gpa.status === 'likely' || plr.status === 'likely') && octA.status === 'likely') ? '#f87171' :
                      (gpa.status === 'likely' || plr.status === 'likely' || octA.status === 'likely') ? '#f97316' : '#34d399'
                    }}>
                      {((gpa.status === 'likely' || plr.status === 'likely') && octA.status === 'likely') ? 'High Risk' :
                       (gpa.status === 'likely' || plr.status === 'likely' || octA.status === 'likely') ? 'Progressing' : 'Stable'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'center', padding: 16, background: 'rgba(30,41,59,0.5)', borderRadius: 8 }}>
                    <p style={{ color: '#94a3b8', margin: '0 0 8px', fontSize: 12 }}>Structure-Function</p>
                    <p style={{ fontSize: 14, fontWeight: 'bold', margin: 0, color: '#fbbf24' }}>
                      {(mdReg?.slope || 0) < -1 && (octA.global?.slope || 0) < -1 ? 'Both Progressing' :
                       (octA.global?.slope || 0) < -1 ? 'Structure First' :
                       (mdReg?.slope || 0) < -1 ? 'Function First' : 'Concordant'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'center', padding: 16, background: 'rgba(30,41,59,0.5)', borderRadius: 8 }}>
                    <p style={{ color: '#94a3b8', margin: '0 0 8px', fontSize: 12 }}>Follow-up Period</p>
                    <p style={{ fontSize: 18, fontWeight: 'bold', margin: 0, color: '#cbd5e1' }}>
                      {Math.max(
                        sortedVf.length >= 2 ? (new Date(sortedVf[sortedVf.length - 1].date) - new Date(sortedVf[0].date)) / 31536000000 : 0,
                        sortedOct.length >= 2 ? (new Date(sortedOct[sortedOct.length - 1].date) - new Date(sortedOct[0].date)) / 31536000000 : 0
                      ).toFixed(1)} yr
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        <p style={{ textAlign: 'center', color: '#475569', fontSize: 12, marginTop: 32 }}>
          Educational purposes only. Consult healthcare professionals for clinical decisions.
        </p>
      </main>
    </div>
  );
}
