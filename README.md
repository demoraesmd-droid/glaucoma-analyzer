# Glaucoma Progression Analyzer

A clinical tool for analyzing visual field (VF) progression in glaucoma patients.

**Live Demo:** https://glaucoma-analyzer.vercel.app

## Features

- **GPA (Guided Progression Analysis)** - Event-based analysis with pattern-specific thresholds
- **PLR (Pointwise Linear Regression)** - Slope analysis at each VF location  
- **PoPLR (Permutation of PLR)** - Global progression probability
- **MD Slope Chart** - Global trend with confidence intervals
- **Fastest Declining Points** - Top 5 locations with greatest dB loss
- **OCT RNFL Tracking** - Quadrant-based thickness monitoring
- **PDF/Image Upload** - Batch upload with OCR support
- **10-2 and 24-2 Support** - Both test patterns with accurate grids

## Novel: Empirically-Derived 10-2 GPA Thresholds

Based on MAPS dataset test-retest analysis (282 pairs, 19,176 point measurements) with **2D stratification** by both local TD and global MD.

## Quick Start

```bash
npm install
npm start
```

## Deployment

```bash
vercel --prod
```

## Technologies

- React 18
- Recharts (charts)
- PDF.js (PDF parsing)
- Tesseract.js (OCR)
