const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

function shouldExcludeFile(relativePath, excludePatterns) {
    return excludePatterns.some(pattern => {
        if (pattern.endsWith('/**')) {
            const dir = pattern.replace('/**', '');
            return relativePath.startsWith(dir + '/') || relativePath === dir;
        } else if (pattern.startsWith('*')) {
            return relativePath.endsWith(pattern.substring(1));
        } else {
            return relativePath === pattern;
        }
    });
}

function addFilesToArchive(archive, sourceDir, excludePatterns, choice) {
    function processDirectory(dirPath, zipPath = '') {
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const zipItemPath = zipPath ? `${zipPath}/${item}` : item;
            const relativePath = path.relative(sourceDir, itemPath).replace(/\\/g, '/');
            
            // Skip excluded files/directories
            if (shouldExcludeFile(relativePath, excludePatterns)) {
                console.log(`⏭️  Skipping: ${zipItemPath}`);
                continue;
            }
            
            const stats = fs.statSync(itemPath);
            
            if (stats.isDirectory()) {
                // Special handling for Obsidian Plugin
                if (choice === '1' && zipPath === '' && item !== 'src') {
                    continue; // Skip root directories except src for Obsidian
                }
                console.log(`📂 Adding directory: ${zipItemPath}`);
                processDirectory(itemPath, zipItemPath);
            } else if (stats.isFile()) {
                // Special handling for Obsidian Plugin root files
                if (choice === '1' && zipPath === '') {
                    const essentialFiles = ['manifest.json', 'package.json', 'tsconfig.json', 'styles.css', 'README.md'];
                    if (!essentialFiles.includes(item)) {
                        continue;
                    }
                }
                console.log(`� Adding file: ${zipItemPath}`);
                archive.file(itemPath, { name: zipItemPath });
            }
        }
    }
    
    processDirectory(sourceDir);
}

async function createZip() {
    console.log('📦 Zip Creator');
    console.log('1. Obsidian Plugin (src folder + essential files)');
    console.log('2. Blog (excluding node_modules, hexo, etc.)');
    
    const choice = await question('\nWhat would you like to zip? (1 or 2): ');
    
    // Create zips directory
    const zipsDir = path.join(__dirname, 'zips');
    if (!fs.existsSync(zipsDir)) {
        fs.mkdirSync(zipsDir, { recursive: true });
    }
    
    // Generate filename with date and time
    const now = new Date();
    const dateTime = now.toISOString()
        .replace(/T/, '_')
        .replace(/:/g, '-')
        .replace(/\..+/, '');
    
    let sourceDir, outputName, excludePatterns;
    
    if (choice === '1') {
        sourceDir = path.join(__dirname, 'Obsidian Plugin');
        outputName = `obsidian-plugin_${dateTime}.zip`;
        excludePatterns = ['node_modules/**', '.git/**', '*.zip', 'main.js', '.gitignore'];
        console.log('\n🔧 Zipping Obsidian Plugin...');
    } else if (choice === '2') {
        sourceDir = path.join(__dirname, 'Blog');
        outputName = `blog_${dateTime}.zip`;
        excludePatterns = ['node_modules/**', 'hexo/**', 'rename to hexo/**', 'package-lock.json', '.git/**', '*.zip'];
        console.log('\n� Zipping Blog...');
    } else {
        console.log('❌ Invalid choice. Please run again and select 1 or 2.');
        rl.close();
        return;
    }
    
    if (!fs.existsSync(sourceDir)) {
        console.error(`❌ Source directory not found: ${sourceDir}`);
        rl.close();
        return;
    }
    
    const outputPath = path.join(zipsDir, outputName);
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    output.on('close', () => {
        console.log(`✅ Archive created successfully!`);
        console.log(`📁 Location: ${outputPath}`);
        console.log(`📊 Size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
        rl.close();
    });
    
    archive.on('error', (err) => {
        console.error('❌ Archive error:', err);
        rl.close();
    });
    
    archive.pipe(output);
    addFilesToArchive(archive, sourceDir, excludePatterns, choice);
    archive.finalize();
}

process.on('SIGINT', () => {
    console.log('\n👋 Goodbye!');
    rl.close();
    process.exit(0);
});

createZip().catch(err => {
    console.error('❌ Error:', err);
    rl.close();
});
