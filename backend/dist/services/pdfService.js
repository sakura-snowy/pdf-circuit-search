"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const PDF_DIR = path_1.default.join(__dirname, '../../..', process.env.PDF_STORAGE_PATH || 'pdfs');
// 同义词字典
const SYNONYMS = {
    '油门踏板': ['踏板位置传感器', 'Accelerator Pedal Sensor', 'APS', 'accelerator pedal', '加速踏板'],
    '挂车控制模块': ['Trailer Control Module', 'TCM', 'trailer module', '拖车模块'],
    'ECU': ['电控单元', 'Electronic Control Unit', '控制器', 'controller'],
    // 可以继续添加更多同义词
};
class PDFService {
    constructor() {
        this.pdfCache = new Map();
    }
    // 获取所有PDF文件列表
    async getPDFList() {
        try {
            const files = fs_1.default.readdirSync(PDF_DIR);
            const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
            const documents = pdfFiles.map(filename => {
                const filepath = path_1.default.join(PDF_DIR, filename);
                const stats = fs_1.default.statSync(filepath);
                return {
                    id: Buffer.from(filename).toString('base64'),
                    filename,
                    filepath,
                    size: stats.size,
                };
            });
            return documents;
        }
        catch (error) {
            console.error('Error reading PDF directory:', error);
            throw error;
        }
    }
    // 获取单个PDF文档信息
    async getPDFInfo(documentId) {
        const documents = await this.getPDFList();
        return documents.find(doc => doc.id === documentId) || null;
    }
    // 提取PDF文本内容
    async extractText(documentId) {
        const doc = await this.getPDFInfo(documentId);
        if (!doc)
            throw new Error('Document not found');
        // 检查缓存
        if (this.pdfCache.has(documentId)) {
            return this.pdfCache.get(documentId);
        }
        const dataBuffer = fs_1.default.readFileSync(doc.filepath);
        const pdfData = await (0, pdf_parse_1.default)(dataBuffer);
        const pages = [];
        const text = pdfData.text;
        // 按页面分割（这是简化版本，实际可能需要更复杂的逻辑）
        const pageTexts = text.split('\f'); // \f 是换页符
        pageTexts.forEach((pageText, index) => {
            pages.push({
                page: index + 1,
                text: pageText,
                lines: pageText.split('\n').filter((line) => line.trim().length > 0),
            });
        });
        // 缓存结果
        this.pdfCache.set(documentId, pages);
        return pages;
    }
    // 搜索功能
    async search(documentId, query) {
        const pages = await this.extractText(documentId);
        const results = [];
        // 获取查询词的所有同义词
        const searchTerms = this.getSearchTerms(query);
        pages.forEach(page => {
            const lines = page.lines;
            lines.forEach((line, lineIndex) => {
                searchTerms.forEach(term => {
                    if (line.toLowerCase().includes(term.toLowerCase())) {
                        const relevanceScore = this.calculateRelevanceScore(line, term, lineIndex, lines);
                        const type = this.determineTextType(line, lineIndex, lines);
                        // 获取上下文
                        const context = this.getContext(lines, lineIndex);
                        results.push({
                            page: page.page,
                            text: line,
                            context,
                            relevanceScore,
                            type,
                        });
                    }
                });
            });
        });
        // 按相关度排序
        results.sort((a, b) => b.relevanceScore - a.relevanceScore);
        return results;
    }
    // 获取搜索词及其同义词
    getSearchTerms(query) {
        const terms = new Set([query]);
        // 查找同义词
        Object.entries(SYNONYMS).forEach(([key, values]) => {
            if (key.toLowerCase().includes(query.toLowerCase()) ||
                values.some(v => v.toLowerCase().includes(query.toLowerCase()))) {
                terms.add(key);
                values.forEach(v => terms.add(v));
            }
        });
        return Array.from(terms);
    }
    // 计算相关度分数
    calculateRelevanceScore(line, query, lineIndex, allLines) {
        let score = 0;
        // 完全匹配加分
        if (line.toLowerCase() === query.toLowerCase()) {
            score += 100;
        }
        // 包含查询词
        const occurrences = (line.toLowerCase().match(new RegExp(query.toLowerCase(), 'g')) || []).length;
        score += occurrences * 10;
        // 根据文本类型加分
        const type = this.determineTextType(line, lineIndex, allLines);
        switch (type) {
            case 'title':
                score += 50;
                break;
            case 'description':
                score += 30;
                break;
            case 'table':
                score += 20;
                break;
            default:
                score += 5;
        }
        // 行长度因素（标题通常较短）
        if (line.length < 50 && occurrences > 0) {
            score += 20;
        }
        return score;
    }
    // 判断文本类型
    determineTextType(line, lineIndex, allLines) {
        const trimmedLine = line.trim();
        // 标题特征：较短、大写字母多、可能包含数字编号
        if (trimmedLine.length < 50 && /^[\d\.\s]*[A-Z\u4e00-\u9fa5]/.test(trimmedLine)) {
            return 'title';
        }
        // 表格特征：包含制表符、多个空格、或特定符号
        if (/\t|  {2,}|[|│]/.test(line)) {
            return 'table';
        }
        // 描述特征：跟在标题后面的文本
        if (lineIndex > 0 && allLines[lineIndex - 1].length < 50) {
            return 'description';
        }
        return 'text';
    }
    // 获取上下文
    getContext(lines, currentIndex, contextSize = 2) {
        const start = Math.max(0, currentIndex - contextSize);
        const end = Math.min(lines.length, currentIndex + contextSize + 1);
        return lines.slice(start, end).join(' ');
    }
    // 获取PDF流
    getPDFStream(documentId) {
        const documents = fs_1.default.readdirSync(PDF_DIR);
        const filename = Buffer.from(documentId, 'base64').toString('utf-8');
        const filepath = path_1.default.join(PDF_DIR, filename);
        if (!fs_1.default.existsSync(filepath)) {
            throw new Error('PDF file not found');
        }
        return fs_1.default.createReadStream(filepath);
    }
}
exports.default = new PDFService();
