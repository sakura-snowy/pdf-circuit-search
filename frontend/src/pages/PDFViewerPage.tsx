import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { Input, Button, List, Typography, Space, Card, message, Spin, Tag } from 'antd';
import { ArrowLeftOutlined, SearchOutlined, ZoomInOutlined, ZoomOutOutlined, QuestionCircleOutlined, CloseOutlined } from '@ant-design/icons';
import { pdfAPI } from '../api';
import type { SearchResult } from '../types';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// 设置 PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const { Search } = Input;
const { Text } = Typography;

const PDFViewerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [question, setQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    if (id) {
      setPdfUrl(pdfAPI.getPDFFileUrl(id));
    }
  }, [id]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !id) {
      message.warning('请输入搜索关键词');
      return;
    }

    try {
      setSearching(true);
      const response = await pdfAPI.searchPDF(id, searchQuery);
      setSearchResults(response.results);
      setCurrentResultIndex(0);

      if (response.results.length > 0) {
        // 跳转到第一个结果
        setCurrentPage(response.results[0].page);
        message.success(`找到 ${response.totalMatches} 处匹配`);
      } else {
        message.info('未找到匹配结果');
      }
    } catch (error) {
      message.error('搜索失败');
      console.error(error);
    } finally {
      setSearching(false);
    }
  };

  const handleNextResult = () => {
    if (searchResults.length === 0) return;
    const nextIndex = (currentResultIndex + 1) % searchResults.length;
    setCurrentResultIndex(nextIndex);
    setCurrentPage(searchResults[nextIndex].page);
  };

  const handlePreviousResult = () => {
    if (searchResults.length === 0) return;
    const prevIndex = currentResultIndex === 0 ? searchResults.length - 1 : currentResultIndex - 1;
    setCurrentResultIndex(prevIndex);
    setCurrentPage(searchResults[prevIndex].page);
  };

  const handleAskQuestion = async () => {
    if (!question.trim() || !id) {
      message.warning('请输入问题');
      return;
    }

    try {
      setAsking(true);
      const response = await pdfAPI.askQuestion(id, question);
      setAnswer(response.answer);
      message.success('已获取回答');
    } catch (error: any) {
      message.error(error.response?.data?.error || '问答失败');
      console.error(error);
    } finally {
      setAsking(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'title':
        return 'red';
      case 'description':
        return 'orange';
      case 'table':
        return 'blue';
      default:
        return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'title':
        return '标题';
      case 'description':
        return '描述';
      case 'table':
        return '表格';
      default:
        return '文本';
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 顶部工具栏 */}
      <div style={{ padding: '16px', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>
            返回列表
          </Button>

          <Space.Compact style={{ width: '100%' }}>
            <Search
              placeholder="输入元器件关键词，如：油门踏板、挂车控制模块"
              enterButton={<SearchOutlined />}
              size="large"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSearch={handleSearch}
              loading={searching}
            />
          </Space.Compact>

          <Space.Compact style={{ width: '100%' }}>
            <Search
              placeholder="提问电路图相关问题，如：油门踏板连接到ECU的哪些针脚号"
              enterButton={
                <>
                  <QuestionCircleOutlined /> 提问
                </>
              }
              size="large"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onSearch={handleAskQuestion}
              loading={asking}
            />
          </Space.Compact>

          {answer && (
            <Card
              size="small"
              title="AI 回答"
              extra={
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={() => setAnswer('')}
                  size="small"
                />
              }
              style={{
                background: '#f0f5ff',
                maxHeight: '200px',
                overflow: 'hidden'
              }}
              bodyStyle={{
                maxHeight: '150px',
                overflowY: 'auto'
              }}
            >
              <Text style={{ whiteSpace: 'pre-wrap' }}>{answer}</Text>
            </Card>
          )}

          {searchResults.length > 0 && (
            <Space>
              <Text>
                第 {currentResultIndex + 1} / {searchResults.length} 个结果
              </Text>
              <Button onClick={handlePreviousResult}>上一处</Button>
              <Button onClick={handleNextResult} type="primary">
                下一处
              </Button>
            </Space>
          )}
        </Space>
      </div>

      {/* 主内容区 */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* PDF查看器 */}
        <div style={{ flex: 1, overflow: 'auto', background: '#f5f5f5', padding: '16px' }}>
          <div style={{ marginBottom: '16px', textAlign: 'center' }}>
            <Space>
              <Button icon={<ZoomOutOutlined />} onClick={() => setScale(s => Math.max(0.5, s - 0.1))}>
                缩小
              </Button>
              <Text>{Math.round(scale * 100)}%</Text>
              <Button icon={<ZoomInOutlined />} onClick={() => setScale(s => Math.min(2.0, s + 0.1))}>
                放大
              </Button>
              <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                上一页
              </Button>
              <Text>
                第 {currentPage} / {numPages} 页
              </Text>
              <Button onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))} disabled={currentPage === numPages}>
                下一页
              </Button>
            </Space>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {pdfUrl ? (
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<Spin size="large" />}
              >
                <Page
                  pageNumber={currentPage}
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
              </Document>
            ) : (
              <Spin size="large" />
            )}
          </div>
        </div>

        {/* 搜索结果面板 */}
        {searchResults.length > 0 && (
          <div style={{ width: '400px', borderLeft: '1px solid #f0f0f0', background: '#fff', overflow: 'auto' }}>
            <Card title="搜索结果" bordered={false}>
              <List
                dataSource={searchResults}
                renderItem={(result, index) => (
                  <List.Item
                    style={{
                      cursor: 'pointer',
                      background: index === currentResultIndex ? '#e6f7ff' : 'transparent',
                    }}
                    onClick={() => {
                      setCurrentResultIndex(index);
                      setCurrentPage(result.page);
                    }}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text>第 {result.page} 页</Text>
                          <Tag color={getTypeColor(result.type)}>{getTypeLabel(result.type)}</Tag>
                          <Text type="secondary">相关度: {result.relevanceScore}</Text>
                        </Space>
                      }
                      description={
                        <div>
                          <Text ellipsis>{result.text}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {result.context.substring(0, 100)}...
                          </Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewerPage;
