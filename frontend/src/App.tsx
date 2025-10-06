import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import PDFListPage from './pages/PDFListPage';
import PDFViewerPage from './pages/PDFViewerPage';
import './App.css';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Routes>
          <Route path="/" element={<PDFListPage />} />
          <Route path="/pdf/:id" element={<PDFViewerPage />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
