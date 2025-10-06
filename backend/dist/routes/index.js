"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pdfController_1 = require("../controllers/pdfController");
const router = express_1.default.Router();
// 获取PDF列表
router.get('/pdfs', pdfController_1.getPDFList);
// 获取PDF信息
router.get('/pdfs/:id', pdfController_1.getPDFInfo);
// 获取PDF文件
router.get('/pdfs/:id/file', pdfController_1.getPDFFile);
// 提取PDF文本
router.get('/pdfs/:id/text', pdfController_1.extractText);
// 搜索PDF
router.get('/pdfs/:id/search', pdfController_1.searchPDF);
exports.default = router;
