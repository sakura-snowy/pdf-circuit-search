import { Request, Response } from 'express';
import pdfService from '../services/pdfService';

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
