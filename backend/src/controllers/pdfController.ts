import { Request, Response } from 'express';
import pdfService from '../services/pdfService';
import aiService from '../services/aiService';

export const getPDFList = async (req: Request, res: Response) => {
  try {
    const documents = await pdfService.getPDFList();
    res.json({
      success: true,
      data: documents,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getPDFInfo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const document = await pdfService.getPDFInfo(id);

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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const searchPDF = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required',
      });
    }

    const results = await pdfService.search(id, query);

    res.json({
      success: true,
      data: {
        documentId: id,
        query,
        results,
        totalMatches: results.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getPDFFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const document = await pdfService.getPDFInfo(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(document.filename)}"`);

    const stream = pdfService.getPDFStream(id);
    stream.pipe(res);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const extractText = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pages = await pdfService.extractText(id);

    res.json({
      success: true,
      data: pages,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// 文档问答功能
export const askQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { question } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({
        success: false,
        error: '问题参数是必需的',
      });
    }

    // 检查AI服务是否配置
    if (!aiService.isConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'AI服务未配置。请联系管理员设置 DEEPSEEK_API_KEY',
      });
    }

    // 提取PDF文本
    const pages = await pdfService.extractText(id);
    const pdfContent = pages.map(p => p.text).join('\n\n');

    // 调用AI服务回答问题
    const answer = await aiService.askQuestion(pdfContent, question);

    res.json({
      success: true,
      data: {
        documentId: id,
        question,
        answer,
      },
    });
  } catch (error: any) {
    console.error('文档问答错误:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'AI服务调用失败',
    });
  }
};
