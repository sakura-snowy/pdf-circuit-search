import express from 'express';
import { getPDFList, getPDFInfo, searchPDF, getPDFFile, extractText } from '../controllers/pdfController';

const router = express.Router();

// 获取PDF列表
router.get('/pdfs', getPDFList);

// 获取PDF信息
router.get('/pdfs/:id', getPDFInfo);

// 获取PDF文件
router.get('/pdfs/:id/file', getPDFFile);

// 提取PDF文本
router.get('/pdfs/:id/text', extractText);

// 搜索PDF
router.get('/pdfs/:id/search', searchPDF);

export default router;
