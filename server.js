const http = require('http');
const url = require('url');
const { Encoder, Hanzi, Byte } = require('@nuintun/qrcode');
const iconv = require('iconv-lite');

const PORT = 8080;

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // API: 生成二维码
    if (parsedUrl.pathname === '/api/qrcode') {
        const text = parsedUrl.query.text;
        
        if (!text) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '缺少 text 参数' }));
            return;
        }
        
        try {
            // 检查是否全是汉字
            const hanziRegex = /^[\u4e00-\u9fa5]+$/;
            
            let qrcode;
            let mode;
            
            if (hanziRegex.test(text)) {
                // 纯汉字 -> Hanzi 模式
                const encoder = new Encoder({ level: 'M' });
                qrcode = encoder.encode(new Hanzi(text));
                mode = 'hanzi';
            } else {
                // 混合内容 -> GB2312 编码
                // 使用自定义编码函数
                const encoder = new Encoder({
                    level: 'M',
                    encode: (content) => {
                        // 用 iconv-lite 编码成 GB2312
                        return iconv.encode(content, 'gb2312');
                    }
                });
                qrcode = encoder.encode(new Byte(text));
                mode = 'gb2312';
            }
            
            const dataURL = qrcode.toDataURL(10, {
                margin: 2,
                foreground: [0, 0, 0],
                background: [255, 255, 255]
            });
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                dataURL: dataURL,
                mode: mode
            }));
            
        } catch (err) {
            console.error(err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }
    
    // 静态文件
    let filePath = parsedUrl.pathname === '/' ? '/index.html' : parsedUrl.pathname;
    filePath = require('path').join(__dirname, filePath);
    
    require('fs').readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('Not Found');
        } else {
            const ext = require('path').extname(filePath);
            const mimeTypes = {
                '.html': 'text/html; charset=utf-8',
                '.js': 'application/javascript',
                '.css': 'text/css'
            };
            res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
            res.end(content);
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`For mobile: http://192.168.0.100:${PORT}/`);
});