import React, { useEffect, useState } from 'react';
import { Card, List, Typography, Spin, message, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FileTextOutlined } from '@ant-design/icons';
import { pdfAPI } from '../api';
import type { PDFDocument } from '../types';

const { Title } = Typography;
const { Search } = Input;

const PDFListPage: React.FC = () => {
  const [documents, setDocuments] = useState<PDFDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredDocs, setFilteredDocs] = useState<PDFDocument[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await pdfAPI.getPDFList();
      setDocuments(docs);
      setFilteredDocs(docs);
    } catch (error) {
      message.error('Failed to load PDF documents');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    if (!value) {
      setFilteredDocs(documents);
    } else {
      const filtered = documents.filter(doc =>
        doc.filename.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredDocs(filtered);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>PDF电路图文档库</Title>
      <Search
        placeholder="搜索文档名称"
        allowClear
        enterButton
        size="large"
        onSearch={handleSearch}
        onChange={e => handleSearch(e.target.value)}
        style={{ marginBottom: '24px' }}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
          dataSource={filteredDocs}
          renderItem={(doc) => (
            <List.Item>
              <Card
                hoverable
                onClick={() => navigate(`/pdf/${doc.id}`)}
                style={{ height: '100%' }}
              >
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <FileTextOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                </div>
                <Card.Meta
                  title={<div style={{ fontSize: '14px', lineHeight: '1.4' }}>{doc.filename}</div>}
                  description={
                    <div style={{ marginTop: '8px' }}>
                      <div>大小: {formatFileSize(doc.size)}</div>
                    </div>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default PDFListPage;
