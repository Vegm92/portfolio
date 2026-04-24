const { spawn } = require('child_process');
const { chromium } = require('playwright');
const path = require('path');

async function takeScreenshot(projectPath, outputName, port) {
    console.log(`Starting server for ${projectPath} on port ${port}...`);
    
    // Start Vite server
    const server = spawn('npx', ['vite', '--port', port], {
        shell: true,
        cwd: path.resolve(projectPath)
    });

    server.stdout.on('data', (data) => {
        console.log(`[server] ${data}`);
    });

    server.stderr.on('data', (data) => {
        console.error(`[server-error] ${data}`);
    });

    // Wait for server to be ready (poll the URL)
    const url = `http://localhost:${port}`;
    let ready = false;
    for (let i = 0; i < 30; i++) {
        try {
            const res = await fetch(url);
            if (res.ok) {
                ready = true;
                break;
            }
        } catch (e) {}
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (ready) {
        console.log(`Server ready at ${url}. Taking screenshot...`);
        // Give it extra time to render
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        const browser = await chromium.launch();
        const page = await browser.newPage();
        await page.setViewportSize({ width: 1280, height: 720 });
        await page.goto(url, { waitUntil: 'networkidle' });
        await page.screenshot({ path: path.join('to_publish/screenshots', outputName) });
        await browser.close();
        console.log(`Screenshot saved to to_publish/screenshots/${outputName}`);
    } else {
        console.error(`Server failed to start on ${url}`);
    }

    // Kill server
    server.kill();
    // Force kill if needed
    spawn('taskkill', ['/F', '/T', '/PID', server.pid], { shell: true });
}

const task = process.argv[2];
const projectPath = process.argv[3];
const outputName = process.argv[4];
const port = process.argv[5] || '5180';

if (task === 'single') {
    takeScreenshot(projectPath, outputName, port);
}
