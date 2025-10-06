"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractText = exports.getPDFFile = exports.searchPDF = exports.getPDFInfo = exports.getPDFList = void 0;
const pdfService_1 = __importDefault(require("../services/pdfService"));
const getPDFList = async (req, res) => {
    try {
        const documents = await pdfService_1.default.getPDFList();
        res.json({
            success: true,
            data: documents,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
exports.getPDFList = getPDFList;
const getPDFInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const document = await pdfService_1.default.getPDFInfo(id);
        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
            });
        }
        res.json({
            success: true,
            data: document,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
exports.getPDFInfo = getPDFInfo;
const searchPDF = async (req, res) => {
    try {
        const { id } = req.params;
        const { query } = req.query;
        if (!query || typeof query !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Query parameter is required',
            });
        }
        const results = await pdfService_1.default.search(id, query);
        res.json({
            success: true,
            data: {
                documentId: id,
                query,
                results,
                totalMatches: results.length,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
exports.searchPDF = searchPDF;
const getPDFFile = async (req, res) => {
    try {
        const { id } = req.params;
        const document = await pdfService_1.default.getPDFInfo(id);
        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
            });
        }
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(document.filename)}"`);
        const stream = pdfService_1.default.getPDFStream(id);
        stream.pipe(res);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
exports.getPDFFile = getPDFFile;
const extractText = async (req, res) => {
    try {
        const { id } = req.params;
        const pages = await pdfService_1.default.extractText(id);
        res.json({
            success: true,
            data: pages,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
exports.extractText = extractText;
