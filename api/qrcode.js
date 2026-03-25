const { Encoder, Hanzi, Byte } = require('@nuintun/qrcode');
const iconv = require('iconv-lite');

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { text } = req.query;
  
  if (!text) {
    return res.status(400).json({ error: '缺少 text 参数' });
  }
  
  try {
    let qrcode;
    let mode;
    
    // 检查是否全是汉字
    const hanziRegex = /^[\u4e00-\u9fa5]+$/;
    
    if (hanziRegex.test(text)) {
      // 纯汉字 -> Hanzi 模式 (GB2312)
      const encoder = new Encoder({ level: 'M' });
      qrcode = encoder.encode(new Hanzi(text));
      mode = 'hanzi';
    } else {
      // 混合内容 -> GBK 编码
      const encoder = new Encoder({ 
        level: 'M',
        encode: (content) => {
          return iconv.encode(content, 'gbk');
        }
      });
      qrcode = encoder.encode(new Byte(text));
      mode = 'gbk';
    }
    
    const dataURL = qrcode.toDataURL(10, {
      margin: 2,
      foreground: [0, 0, 0],
      background: [255, 255, 255]
    });
    
    res.status(200).json({ success: true, dataURL, mode });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};