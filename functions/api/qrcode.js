import { Encoder, Hanzi, Byte } from '@nuintun/qrcode';

export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const text = searchParams.get('text');
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };
  
  if (!text) {
    return new Response(JSON.stringify({ error: '缺少 text 参数' }), { status: 400, headers });
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
    
    return new Response(JSON.stringify({ success: true, dataURL, mode }), { headers });
    
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}