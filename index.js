process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

const http = require('node:http');

const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

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

    if (!ipv4Regex.test(remote_ip) && !ipv6Regex.test(remote_ip)) {
        res.writeHead(400, { "content-type": "text/plain; charset=UTF-8" });
        res.end("Invalid IP address\n");
        return;
    }


    // is_ipv6
    let is_ipv6 = false;
    if (remote_ip.includes(":")) {
        is_ipv6 = true;
    }

    // is_browser
    let is_browser = false;
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
    }
    if (req.headers['sec-fetch-dest']) if (req.headers['sec-fetch-dest'].toLowerCase() === "document") is_browser = true;
    if (req.headers['sec-fetch-mode']) if (req.headers['sec-fetch-mode'].toLowerCase() === "navigate") is_browser = true;
    if (req.headers['sec-fetch-site']) if (req.headers['sec-fetch-site'].toLowerCase() === "same-origin") is_browser = true;
    if (req.headers['sec-fetch-site']) if (req.headers['sec-fetch-site'].toLowerCase() === "cross-site") is_browser = true;

    if (req.url.startsWith("/r/")) {
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

        if (!ipv4Regex.test(old_remote_ip) && !ipv6Regex.test(old_remote_ip)) {
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
    } else if (req.url.startsWith("/raw")) {
        res.writeHead(200, {
            "content-type": "text/plain; charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Origin, Content-Type, Accept, Authorization"
        });
        res.end(`${remote_ip}`);
        return;
    } else if (is_browser) {
        res.writeHead(200, { "content-type": "text/html; charset=UTF-8" });
        // browser page fetching the other ip variant, supporting phone layout, dark mode, easy ip selection and a beatiful font :)
        res.end(`<meta name="viewport" content="width=device-width, initial-scale=1.0" /> <style>\n* { font-family: monospace; unicode-bidi: isolate; }\nbody { margin-top: 13px; }\n @media (prefers-color-scheme: dark) { \n body { background-color: #121212; color: #e0e0e0; } \n pre { color: #e0e0e0; } \n }\n</style> <script> function select(el) { if (window.getSelection().toString() !== "") return; let range = document.createRange(); range.selectNodeContents(el); let sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range); } </script> <div id="ips"> <pre onclick="select(this)">${remote_ip}</pre> </div> <script> (async ()=>{ let ip; if (ip = (await (await fetch('https://ipv${is_ipv6 ? "4" : "6"}.argv.nl/raw')).text())) { let ipre = document.createElement('pre'); ipre.setAttribute('onclick', 'select(this)'); ipre.innerText = ip; document.getElementById('ips').appendChild(ipre); }})() </script>`);
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