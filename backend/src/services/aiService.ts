import axios from 'axios';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class AIService {
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor() {
    // DeepSeek API 配置
    this.apiKey = process.env.DEEPSEEK_API_KEY || '';
    this.apiUrl = 'https://api.deepseek.com/v1/chat/completions';
    this.model = 'deepseek-chat';
  }

  /**
   * 基于PDF内容回答问题
   */
  async askQuestion(pdfContent: string, question: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('DeepSeek API密钥未配置。请在.env文件中设置 DEEPSEEK_API_KEY');
    }

    // 限制上下文长度，避免超出token限制
    const maxContentLength = 8000;
    const truncatedContent = pdfContent.length > maxContentLength
      ? pdfContent.substring(0, maxContentLength) + '\n...(内容已截断)'
      : pdfContent;

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `你是一个专业的电路图分析助手。你的任务是根据提供的PDF电路图文本内容回答用户的问题。

规则：
1. 仅根据提供的文本内容回答问题
2. 如果文本中没有明确的相关信息，诚实地告知用户"文档中未找到相关信息"
3. 对于针脚号、连接关系等信息，要给出明确的数字和位置
4. 回答要准确、专业、简洁
5. 如果涉及多个可能的答案，列出所有相关信息
6. 使用中文回答`
      },
      {
        role: 'user',
        content: `电路图文本内容：\n\n${truncatedContent}\n\n用户问题：${question}`
      }
    ];

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: messages,
          temperature: 0.1,
          max_tokens: 800,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const answer = response.data.choices[0].message.content;
      return answer;

    } catch (error: any) {
      console.error('DeepSeek API调用错误:', error.response?.data || error.message);

      if (error.response?.status === 401) {
        throw new Error('API密钥验证失败，请检查 DEEPSEEK_API_KEY 是否正确');
      } else if (error.response?.status === 429) {
        throw new Error('API调用频率超限，请稍后重试');
      } else if (error.response?.status === 400) {
        throw new Error('请求参数错误：' + (error.response?.data?.error?.message || '未知错误'));
      } else {
        throw new Error('AI服务暂时不可用，请稍后重试');
      }
    }
  }

  /**
   * 检查AI服务是否已配置
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

export default new AIService();
