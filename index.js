process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

const http = require('node:http');
const net = require('node:net');

const server = http.createServer((req, res) => {
    // eww, we don't do favicons, that's for noobs
    if (req.url === '/favicon.ico') {
        res.writeHead(404);
        res.end();
        return;
    }

    // determine the remote ip
    let remote_ip = req.socket.remoteAddress;
    if (req.headers['x-forwarded-for']) {
        remote_ip = req.headers['x-forwarded-for'];
        if (remote_ip.includes(",")) {
            remote_ip = remote_ip.split(",")[0].trim();
        }
    } else if (req.headers['x-real-ip']) {
        remote_ip = req.headers['x-real-ip'];
    } else if (req.headers['cf-connecting-ip']) {
        remote_ip = req.headers['cf-connecting-ip'];
    } else if (req.headers['x-client-ip']) {
        remote_ip = req.headers['x-client-ip'];
    } else if (req.headers['true-client-ip']) {
        remote_ip = req.headers['true-client-ip'];
    } else if (req.headers['x-cluster-client-ip']) {
        remote_ip = req.headers['x-cluster-client-ip'];
    } else if (req.headers['x-cluster-client-ip']) {
        remote_ip = req.headers['x-cluster-client-ip'];
    }

    if (!net.isIP(remote_ip)) {
        res.writeHead(400, { "content-type": "text/plain; charset=UTF-8" });
        res.end("Invalid IP address\n");
        return;
    }

    // is_ipv6
    let is_ipv6 = net.isIPv6(remote_ip);

    // is_browser
    let is_browser = false;
    let is_fetch = false;
    if (req.headers['user-agent']) {
        if (req.headers['user-agent'].toLowerCase().includes("chrome/")) is_browser = true;
        if (req.headers['user-agent'].toLowerCase().includes("firefox/")) is_browser = true;
        if (req.headers['user-agent'].toLowerCase().includes("edg/")) is_browser = true;
        if (req.headers['user-agent'].toLowerCase().includes("msie ")) is_browser = true;
        if (req.headers['user-agent'].toLowerCase().includes("trident/")) is_browser = true;
        if (req.headers['user-agent'].toLowerCase().includes("safari/")) is_browser = true;
        if (req.headers['user-agent'].toLowerCase().includes("brave/")) is_browser = true;
        if (req.headers['user-agent'].toLowerCase().includes("mozilla/")) is_browser = true;
        if (req.headers['user-agent'].toLowerCase().includes("applewebkit")) is_browser = true;
        if (req.headers['user-agent'].toLowerCase().includes("gecko/")) is_browser = true;

        // detect search engine crawlers (like google, bing, etc.) as browser
        if (req.headers['user-agent'].toLowerCase().includes("googlebot/")) is_browser = true;
        if (req.headers['user-agent'].toLowerCase().includes("googlebot-")) is_browser = true;
        if (req.headers['user-agent'].toLowerCase().includes("google-")) is_browser = true;
        if (req.headers['user-agent'].toLowerCase().includes("bingbot/")) is_browser = true;
        if (req.headers['user-agent'].toLowerCase().includes("duckduckbot/")) is_browser = true;
        if (req.headers['user-agent'].toLowerCase().includes("slurp/")) is_browser = true;
        if (req.headers['user-agent'].toLowerCase().includes("yandex/")) is_browser = true;
        if (req.headers['user-agent'].toLowerCase().includes("baiduspider/")) is_browser = true;
        if (req.headers['user-agent'].toLowerCase().includes("ahrefsbot/")) is_browser = true;
        if (req.headers['user-agent'].toLowerCase().includes("semrushbot/")) is_browser = true;
        if (req.headers['user-agent'].toLowerCase().includes("dotbot/")) is_browser = true;
        if (req.headers['user-agent'].toLowerCase().includes("facebookexternalhit/")) is_browser = true;
        if (req.headers['user-agent'].toLowerCase().includes("twitterbot/")) is_browser = true;
        if (req.headers['user-agent'].toLowerCase().includes("linkedinbot/")) is_browser = true;
        if (req.headers['user-agent'].toLowerCase().includes("instagram/")) is_browser = true;
        if (req.headers['user-agent'].toLowerCase().includes("whatsapp/")) is_browser = true;
        if (req.headers['user-agent'].toLowerCase().includes("telegrambot/")) is_browser = true;
    }
    if (req.headers['sec-fetch-dest']) if (req.headers['sec-fetch-dest'].toLowerCase() === "document") is_browser = true;
    if (req.headers['sec-fetch-mode']) if (req.headers['sec-fetch-mode'].toLowerCase() === "navigate") is_browser = true;
    if (req.headers['sec-fetch-site']) if (req.headers['sec-fetch-site'].toLowerCase() === "same-origin") is_browser = true;
    if (req.headers['sec-fetch-site']) if (req.headers['sec-fetch-site'].toLowerCase() === "cross-site") is_browser = true;

    if (req.headers['sec-fetch-dest'] && req.headers['sec-fetch-dest'].toLowerCase() === "empty") is_fetch = true;

    if (req.url == "/robots.txt") {
        res.writeHead(200, { "content-type": "text/plain; charset=UTF-8" });
        if (req.headers.host == "ip.argv.nl") {
            res.end("User-agent: *\nAllow: /\nSitemap: https://ip.argv.nl/sitemap.xml\n");
        } else {
            res.end("User-agent: *\nAllow: /\n");
        }
        return;
    } else if (req.url == "/sitemap.xml") {
        if (req.headers.host == "ip.argv.nl") {
            res.writeHead(200, { "content-type": "application/xml; charset=UTF-8" });
            res.end(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://ip.argv.nl/</loc></url></urlset>`);
        } else {
            res.writeHead(404, { "content-type": "text/plain; charset=UTF-8" });
            res.end("Not Found\n");
        }
        return;
    } else if (req.url == "/favicon.ico") {
        res.writeHead(404, { "content-type": "image/x-icon" });
        res.end();
        return;
    } else if (req.url.startsWith("/r/")) {
        let old_remote_ip;
        if (req.url.length > 3) {
            old_remote_ip = decodeURIComponent(req.url.substring(3));
        } else {
            res.writeHead(200 /* 400 */, {
                "content-type": "text/plain; charset=UTF-8",
                "content-disposition": `inline; filename="ips.txt"`,
            });
            res.end(`${remote_ip}\n`);
            return;
        }

        if (!net.isIP(old_remote_ip)) {
            res.writeHead(200 /* 400 */, {
                "content-type": "text/plain; charset=UTF-8",
                "content-disposition": `inline; filename="ips.txt"`,
            });
            res.end(`${remote_ip}\n`);
            return;
        }

        if (old_remote_ip === remote_ip) {
            res.writeHead(200, { "content-type": "text/plain; charset=UTF-8" });
            res.end(`${remote_ip}\n`);
            return;
        } else {
            res.writeHead(200, {
                "content-type": "text/plain; charset=UTF-8",
                "content-disposition": `inline; filename="ips.txt"`,
            });
            res.end(`${old_remote_ip}\n${remote_ip}\n`);
            return;
        }
    } else if (req.url.startsWith("/raw") || (is_browser && is_fetch)) {
        res.writeHead(200, {
            "content-type": "text/plain; charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Origin, Content-Type, Accept, Authorization",

            "cache-control": "no-cache, no-store, must-revalidate, max-age=0",
            "pragma": "no-cache",
            "expires": "0",
        });
        res.end(`${remote_ip}`);
        return;
    } else if (is_browser) {
        res.writeHead(200, {
            "content-type": "text/html; charset=UTF-8",
            "link": `<https://ipv${is_ipv6 ? "4" : "6"}.argv.nl>; rel="preconnect"`,
            "cache-control": "no-cache, no-store, must-revalidate, max-age=0",
            "pragma": "no-cache",
            "expires": "0",
        });
        // browser page fetching the other ip variant, supporting phone layout, dark mode, easy ip selection and a beatiful font :)
        res.end(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta name="darkreader-lock" /><meta name="darkreader" content="disable" /><link rel="preconnect" href="https://ipv${is_ipv6 ? "4" : "6"}.argv.nl" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><meta name="description" content="${remote_ip}" /><title>${remote_ip}</title><meta property="og:title" content="${remote_ip}" /><meta property="og:url" content="https://ip.argv.nl" /></head> <body><style>\n* { font-family: monospace; unicode-bidi: isolate; }\nbody { margin-top: 13px; }\n @media (prefers-color-scheme: dark) { \n body { background-color: #121212; color: #e0e0e0; } \n pre { color: #e0e0e0; } \n }\n</style> <script> function select(el) { if (window.getSelection().toString() !== "") return; let range = document.createRange(); range.selectNodeContents(el); let sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range); } </script> <div id="ips"> <pre onclick="select(this)">${remote_ip}</pre> </div> <script> (async ()=>{ let ip; if (ip = (await (await fetch('https://ipv${is_ipv6 ? "4" : "6"}.argv.nl/raw')).text())) { let ipre = document.createElement('pre'); ipre.setAttribute('onclick', 'select(this)'); ipre.innerText = ip; document.getElementById('ips').appendChild(ipre); document.title += \` \${ip}\`; document.querySelector('meta[name="description"]').content += \` \${ip}\`; document.querySelector('meta[property="og:title"]').content += \` \${ip}\`; }})() </script></body></html>`);
        return;
    } else {
        if (is_ipv6) {
            res.writeHead(302, {
                "content-type": "text/plain; charset=UTF-8",
                "location": `https://ipv4.argv.nl/r/${encodeURIComponent(remote_ip)}`,
                "content-disposition": `inline; filename="ips.txt"`,
            });
        } else {
            res.writeHead(200, {
                "content-type": "text/plain; charset=UTF-8",
                "content-disposition": `inline; filename="ips.txt"`,
            });
        }
        res.end(`${remote_ip}\n`);
        return;
    }
});

server.listen(3416, "127.0.0.1", () => {
    console.log('Server running at http://localhost:3416/');
});