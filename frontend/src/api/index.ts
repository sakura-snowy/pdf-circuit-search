import axios from 'axios';
import { PDFDocument, SearchResponse, APIResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const pdfAPI = {
  // 获取PDF列表
  getPDFList: async (): Promise<PDFDocument[]> => {
    const response = await api.get<APIResponse<PDFDocument[]>>('/pdfs');
    return response.data.data || [];
  },

  // 获取PDF信息
  getPDFInfo: async (id: string): Promise<PDFDocument> => {
    const response = await api.get<APIResponse<PDFDocument>>(`/pdfs/${id}`);
    if (!response.data.data) throw new Error('Document not found');
    return response.data.data;
  },

  // 获取PDF文件URL
  getPDFFileUrl: (id: string): string => {
    return `${API_BASE_URL}/pdfs/${id}/file`;
  },

  // 搜索PDF
  searchPDF: async (id: string, query: string): Promise<SearchResponse> => {
    const response = await api.get<APIResponse<SearchResponse>>(`/pdfs/${id}/search`, {
      params: { query },
    });
    if (!response.data.data) throw new Error('Search failed');
    return response.data.data;
  },
};

export default api;
