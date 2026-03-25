import { Encoder, Hanzi, Byte } from '@nuintun/qrcode';

export default async function handler(req, res) {
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
    const encoder = new Encoder({ level: 'M' });
    let qrcode;
    let mode;
    
    const hanziRegex = /^[\u4e00-\u9fa5]+$/;
    
    if (hanziRegex.test(text)) {
      qrcode = encoder.encode(new Hanzi(text));
      mode = 'hanzi';
    } else {
      qrcode = encoder.encode(new Byte(text));
      mode = 'utf8';
    }
    
    const dataURL = qrcode.toDataURL(10, {
      margin: 2,
      foreground: [0, 0, 0],
      background: [255, 255, 255]
    });
    
    res.status(200).json({ success: true, dataURL, mode });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}