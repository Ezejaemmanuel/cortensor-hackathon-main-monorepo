#!/usr/bin/env node

/**
 * 🚀 Cortensor Community Projects Sync Script
 * 
 * This Node.js script syncs the cortigpt-monorepo to the Cortensor community-projects repository
 * with beautiful logging, real-time progress updates, and comprehensive error handling.
 * 
 * @author Jatique (Ezejaemmanuel)
 * @version 2.0.0
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync, exec } = require('child_process');
const chalk = require('chalk');
const ora = require('ora');
const boxen = require('boxen');
const gradient = require('gradient-string');
const figlet = require('figlet');

// 🎨 Configuration and Constants
const CONFIG = {
    workingDirectory: "C:\\Users\\HP\\development\\web-development\\javascript-node\\hackathon-dev\\cortensor-hackathon\\cortensor-community-sync",
    sourceRepo: "https://github.com/Ezejaemmanuel/cortigpt-monorepo.git",
    communityRepo: "https://github.com/cortensor/community-projects.git",
    projectName: "cortigpt-monorepo",
    dryRun: process.argv.includes('--dry-run'),
    verbose: process.argv.includes('--verbose'),
    logFile: null // Will be set during initialization
};

// 🎨 Beautiful Console Styling
const styles = {
    title: gradient(['#00f5ff', '#0099ff']),
    success: chalk.bold.green,
    warning: chalk.bold.yellow,
    error: chalk.bold.red,
    info: chalk.bold.cyan,
    highlight: chalk.bold.magenta,
    dim: chalk.dim,
    bold: chalk.bold
};

// 📊 Progress tracking
let currentStep = 0;
const totalSteps = 10;
let spinner;

/**
 * 🎨 Enhanced logging system with colors, timestamps, and file logging
 */
class Logger {
    constructor(logFilePath) {
        this.logFile = logFilePath;
        this.ensureLogFile();
    }

    ensureLogFile() {
        if (this.logFile) {
            const logDir = path.dirname(this.logFile);
            fs.ensureDirSync(logDir);
        }
    }

    formatMessage(level, message) {
        const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
        return `[${timestamp}] [${level}] ${message}`;
    }

    writeToFile(message) {
        if (this.logFile && !CONFIG.dryRun) {
            fs.appendFileSync(this.logFile, message + '\n', 'utf8');
        }
    }

    success(message, showSpinner = true) {
        const formatted = this.formatMessage('SUCCESS', message);
        console.log(styles.success(`✅ ${message}`));
        this.writeToFile(formatted);
        if (showSpinner && spinner) spinner.succeed(message);
    }

    error(message, showSpinner = true) {
        const formatted = this.formatMessage('ERROR', message);
        console.log(styles.error(`❌ ${message}`));
        this.writeToFile(formatted);
        if (showSpinner && spinner) spinner.fail(message);
    }

    warning(message, showSpinner = true) {
        const formatted = this.formatMessage('WARNING', message);
        console.log(styles.warning(`⚠️  ${message}`));
        this.writeToFile(formatted);
        if (showSpinner && spinner) spinner.warn(message);
    }

    info(message, showSpinner = false) {
        const formatted = this.formatMessage('INFO', message);
        console.log(styles.info(`ℹ️  ${message}`));
        this.writeToFile(formatted);
        if (showSpinner && spinner) spinner.info(message);
    }

    step(message) {
        currentStep++;
        const progress = `[${currentStep}/${totalSteps}]`;
        const fullMessage = `${styles.highlight(progress)} ${message}`;
        console.log(`\n${fullMessage}`);
        this.writeToFile(this.formatMessage('STEP', `${progress} ${message}`));
    }

    startSpinner(message) {
        if (spinner) spinner.stop();
        spinner = ora({
            text: message,
            color: 'cyan',
            spinner: 'dots12'
        }).start();
    }

    updateSpinner(message) {
        if (spinner) spinner.text = message;
    }

    stopSpinner() {
        if (spinner) {
            spinner.stop();
            spinner = null;
        }
    }
}

/**
 * 🛠️ Utility functions for system operations
 */
class SystemUtils {
    static async execCommand(command, options = {}) {
        return new Promise((resolve, reject) => {
            const defaultOptions = {
                cwd: process.cwd(),
                encoding: 'utf8',
                ...options
            };

            if (CONFIG.verbose) {
                logger.info(`Executing: ${command}`);
            }

            exec(command, defaultOptions, (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(`Command failed: ${command}\n${error.message}`));
                    return;
                }
                resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
            });
        });
    }

    static execCommandSync(command, options = {}) {
        try {
            if (CONFIG.verbose) {
                logger.info(`Executing (sync): ${command}`);
            }
            
            return execSync(command, {
                encoding: 'utf8',
                stdio: CONFIG.verbose ? 'inherit' : 'pipe',
                ...options
            });
        } catch (error) {
            throw new Error(`Command failed: ${command}\n${error.message}`);
        }
    }

    static async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * 🎯 Main sync orchestrator
 */
class CortensorSync {
    constructor() {
        this.communityPath = path.join(CONFIG.workingDirectory, 'community-projects');
        this.tempPath = path.join(CONFIG.workingDirectory, `temp-${CONFIG.projectName}`);
        this.projectPath = path.join(this.communityPath, 'apps', CONFIG.projectName);
    }

    async initialize() {
        // Initialize logger
        CONFIG.logFile = path.join(CONFIG.workingDirectory, 'sync.log');
        global.logger = new Logger(CONFIG.logFile);

        // Display beautiful header
        await this.displayHeader();
        
        // Validate prerequisites
        await this.validatePrerequisites();
    }

    async displayHeader() {
        console.clear();
        
        const title = figlet.textSync('CortiGPT Sync', {
            font: 'ANSI Regular',
            horizontalLayout: 'default',
            verticalLayout: 'default'
        });

        console.log(styles.title(title));
        
        const subtitle = boxen(
            styles.bold('🚀 Cortensor Community Projects Sync Tool v2.0.0\n') +
            styles.dim('Syncing your monorepo to the community projects repository\n') +
            styles.dim('Built with ❤️  by Jatique using Node.js'),
            {
                padding: 1,
                margin: 1,
                borderStyle: 'round',
                borderColor: 'cyan',
                backgroundColor: '#1a1a1a'
            }
        );

        console.log(subtitle);

        // Display configuration
        const configBox = boxen(
            `${styles.info('📁 Working Directory:')} ${styles.dim(CONFIG.workingDirectory)}\n` +
            `${styles.info('📦 Source Repository:')} ${styles.dim(CONFIG.sourceRepo)}\n` +
            `${styles.info('🏠 Community Repository:')} ${styles.dim(CONFIG.communityRepo)}\n` +
            `${styles.info('🎯 Project Name:')} ${styles.dim(CONFIG.projectName)}\n` +
            `${styles.info('🔍 Dry Run:')} ${CONFIG.dryRun ? styles.warning('Yes') : styles.success('No')}\n` +
            `${styles.info('📝 Verbose:')} ${CONFIG.verbose ? styles.success('Yes') : styles.dim('No')}`,
            {
                title: ' Configuration ',
                padding: 1,
                margin: { top: 0, bottom: 1, left: 1, right: 1 },
                borderStyle: 'single',
                borderColor: 'blue'
            }
        );

        console.log(configBox);

        if (CONFIG.dryRun) {
            console.log(styles.warning('🔍 DRY RUN MODE - No changes will be made\n'));
        }
    }

    async validatePrerequisites() {
        logger.step('Validating prerequisites');
        logger.startSpinner('Checking system requirements...');

        try {
            // Check if git is installed
            await SystemUtils.execCommand('git --version');
            logger.updateSpinner('Git found ✓');
            await SystemUtils.delay(500);

            // Check if Node.js is available
            const nodeVersion = process.version;
            logger.updateSpinner(`Node.js ${nodeVersion} found ✓`);
            await SystemUtils.delay(500);

            logger.success('All prerequisites satisfied');
        } catch (error) {
            logger.error(`Prerequisites check failed: ${error.message}`);
            process.exit(1);
        }
    }

    async setupWorkingDirectory() {
        logger.step('Setting up working directory');
        logger.startSpinner('Creating working directory...');

        try {
            if (!fs.existsSync(CONFIG.workingDirectory)) {
                if (!CONFIG.dryRun) {
                    await fs.ensureDir(CONFIG.workingDirectory);
                }
                logger.success(`Created working directory: ${CONFIG.workingDirectory}`);
            } else {
                logger.success('Working directory already exists');
            }

            if (!CONFIG.dryRun) {
                process.chdir(CONFIG.workingDirectory);
            }
        } catch (error) {
            logger.error(`Failed to setup working directory: ${error.message}`);
            throw error;
        }
    }

    async handleCommunityRepository() {
        logger.step('Managing community-projects repository');
        
        if (fs.existsSync(this.communityPath)) {
            logger.startSpinner('Updating existing community-projects repository...');
            
            if (!CONFIG.dryRun) {
                process.chdir(this.communityPath);
                await SystemUtils.execCommand('git fetch origin');
                await SystemUtils.execCommand('git reset --hard origin/main');
            }
            
            logger.success('Updated community-projects repository');
        } else {
            logger.startSpinner('Cloning community-projects repository (sparse checkout for apps only)...');
            
            if (!CONFIG.dryRun) {
                // Clone with sparse checkout for apps folder only
                await SystemUtils.execCommand(`git clone --no-checkout ${CONFIG.communityRepo} ${this.communityPath}`);
                process.chdir(this.communityPath);
                await SystemUtils.execCommand('git sparse-checkout init --cone');
                await SystemUtils.execCommand('git sparse-checkout set apps');
                await SystemUtils.execCommand('git checkout main');
            }
            
            logger.success('Cloned community-projects repository with sparse checkout');
        }
    }

    async cloneSourceRepository() {
        logger.step('Cloning source monorepo');
        
        if (fs.existsSync(this.tempPath)) {
            logger.startSpinner('Removing existing temporary directory...');
            if (!CONFIG.dryRun) {
                await fs.remove(this.tempPath);
            }
            logger.updateSpinner('Temporary directory removed');
        }

        logger.startSpinner('Cloning source monorepo...');
        
        if (!CONFIG.dryRun) {
            await SystemUtils.execCommand(`git clone ${CONFIG.sourceRepo} ${this.tempPath}`);
        }
        
        logger.success('Cloned source repository to temporary directory');
    }

    async prepareProjectDirectory() {
        logger.step('Preparing project directory');
        logger.startSpinner('Setting up project directory...');

        if (fs.existsSync(this.projectPath)) {
            logger.updateSpinner('Removing existing project directory...');
            if (!CONFIG.dryRun) {
                await fs.remove(this.projectPath);
            }
        }

        if (!CONFIG.dryRun) {
            await fs.ensureDir(this.projectPath);
        }

        logger.success('Project directory prepared');
    }

    async copyProjectFiles() {
        logger.step('Copying project files');
        logger.startSpinner('Copying all project files (excluding .git)...');

        if (!CONFIG.dryRun) {
            const items = await fs.readdir(this.tempPath);
            let copiedItems = 0;
            
            for (const item of items) {
                if (item === '.git') continue;
                
                const sourcePath = path.join(this.tempPath, item);
                const destPath = path.join(this.projectPath, item);
                
                logger.updateSpinner(`Copying ${item}... (${++copiedItems}/${items.length - 1})`);
                await fs.copy(sourcePath, destPath);
                await SystemUtils.delay(100); // Small delay for visual feedback
            }
        }

        logger.success('Copied all project files (excluding .git)');
    }

    async createCommunityReadme() {
        logger.step('Creating community-specific README');
        logger.startSpinner('Generating community README...');

        const communityReadmePath = path.join(this.projectPath, 'COMMUNITY_README.md');
        const communityReadmeContent = `# CortiGPT - Decentralized AI Platform

> **A comprehensive monorepo for decentralized AI chat and search capabilities powered by the Cortensor network**

## 🚀 Quick Overview

CortiGPT is a complete AI platform that combines blockchain technology with AI-powered search and chat capabilities. This project is part of the [Cortensor Community Projects](https://github.com/cortensor/community-projects).

### What's Included

- **🌐 Web Application** - Full-featured AI chat interface with Web3 integration
- **🔌 Browser Extension** - Cross-browser AI assistant with sidepanel interface  
- **🖥️ API Server** - Scalable backend for AI services and chat management
- **🤖 AI Package** - Shared AI integration library with Mastra framework

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS, shadcn/ui
- **AI Integration**: Cortensor OpenAI Provider, Mastra Framework
- **Blockchain**: Wagmi, Viem, RainbowKit
- **Development**: TypeScript, Turborepo, pnpm

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm 10.12.3+
- Git

### Installation

1. **Clone and install dependencies**
   \`\`\`bash
   git clone https://github.com/cortensor/community-projects.git
   cd community-projects/apps/cortigpt-monorepo
   pnpm install
   \`\`\`

2. **Set up environment variables**
   \`\`\`bash
   # Copy environment files for each app
   cp apps/web/.env.example apps/web/.env.local
   cp apps/extension/.env.example apps/extension/.env.local
   cp apps/server/.env.example apps/server/.env.local
   \`\`\`

3. **Configure your API keys**
   - Get your Cortensor API key from [Cortensor Network](https://cortensor.network)
   - Get Tavily API key for web search
   - Set up WalletConnect project ID for Web3 features

4. **Start development**
   \`\`\`bash
   pnpm dev
   \`\`\`

## 🌐 Live Demo

- **Website**: [cortigpt.jatique.dev](https://cortigpt.jatique.dev)
- **Original Repository**: [github.com/Ezejaemmanuel/cortigpt-monorepo](https://github.com/Ezejaemmanuel/cortigpt-monorepo)

## 📱 Applications

| App | Port | Description |
|-----|------|-------------|
| Web App | 3001 | Main web interface with AI chat |
| API Server | 3002 | Backend API for AI services |
| Extension | - | Browser extension (build and load) |

## 🔑 Key Features

- **🤖 Decentralized AI**: Powered by Cortensor network for verifiable intelligence
- **🔗 Web3 Integration**: Full blockchain wallet support
- **🧠 AI Agents**: Intelligent chat assistants with context awareness
- **🌐 Web Search**: Real-time information retrieval
- **📱 Cross-Platform**: Web app and browser extension
- **🎨 Modern UI**: Beautiful, responsive design

## 📚 Documentation

For detailed documentation, setup instructions, and API reference, see the main [README.md](./README.md) file.

## 🤝 Contributing

This project is actively maintained. For contributions:

1. Check the [original repository](https://github.com/Ezejaemmanuel/cortigpt-monorepo) for the latest updates
2. Follow the contribution guidelines in the main README
3. Test your changes across all applications

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🔗 Links

- **Original Repository**: [Ezejaemmanuel/cortigpt-monorepo](https://github.com/Ezejaemmanuel/cortigpt-monorepo)
- **Cortensor Network**: [cortensor.network](https://cortensor.network)
- **Documentation**: [docs.cortensor.network](https://docs.cortensor.network)
- **Community Projects**: [cortensor/community-projects](https://github.com/cortensor/community-projects)

---

*This project is part of the Cortensor community ecosystem, bringing decentralized AI to everyone.*
`;

        if (!CONFIG.dryRun) {
            await fs.writeFile(communityReadmePath, communityReadmeContent, 'utf8');
        }

        logger.success('Created community-specific README');
    }

    async createSyncMetadata() {
        logger.step('Creating sync metadata');
        logger.startSpinner('Generating sync metadata...');

        const metadataPath = path.join(this.projectPath, '.sync-metadata.json');
        const metadata = {
            sourceRepository: CONFIG.sourceRepo,
            lastSync: new Date().toISOString(),
            syncedBy: process.env.USERNAME || process.env.USER || 'unknown',
            projectName: CONFIG.projectName,
            version: "2.0.0",
            syncTool: "Node.js",
            nodeVersion: process.version
        };

        if (!CONFIG.dryRun) {
            await fs.writeJson(metadataPath, metadata, { spaces: 2 });
        }

        logger.success('Created sync metadata file');
    }

    async cleanupTemporaryFiles() {
        logger.step('Cleaning up temporary files');
        logger.startSpinner('Removing temporary files...');

        if (!CONFIG.dryRun && fs.existsSync(this.tempPath)) {
            await fs.remove(this.tempPath);
        }

        logger.success('Cleaned up temporary directory');
    }

    async handleGitOperations() {
        logger.step('Handling Git operations');
        logger.startSpinner('Checking git status...');

        if (!CONFIG.dryRun) {
            process.chdir(this.communityPath);
            
            try {
                const { stdout } = await SystemUtils.execCommand('git status --porcelain');
                
                if (stdout.trim()) {
                    logger.updateSpinner('Adding changes to git...');
                    await SystemUtils.execCommand(`git add apps/${CONFIG.projectName}`);
                    
                    const commitMessage = `Add/Update ${CONFIG.projectName} - Cortensor AI Platform

Synced from: ${CONFIG.sourceRepo}
Sync date: ${new Date().toISOString().slice(0, 19).replace('T', ' ')}
Includes: Web app, Browser extension, API server, AI package
Sync tool: Node.js v${process.version}`;

                    await SystemUtils.execCommand(`git commit -m "${commitMessage}"`);
                    logger.success('Created git commit with changes');
                    
                    logger.warning('📤 Ready to push changes. Use "git push origin main" to push to your forked repository.');
                } else {
                    logger.info('No changes detected in git status');
                }
            } catch (error) {
                logger.error(`Git operations failed: ${error.message}`);
                throw error;
            }
        } else {
            logger.success('Git operations completed (dry run)');
        }
    }

    async displaySummary() {
        logger.stopSpinner();
        
        const summaryBox = boxen(
            `${styles.success('✅ Sync completed successfully!')}\n\n` +
            `${styles.info('📋 Summary:')}\n` +
            `  • Project synced to: ${styles.dim(this.projectPath)}\n` +
            `  • Community README created: ${styles.dim(path.join(this.projectPath, 'COMMUNITY_README.md'))}\n` +
            `  • Sync metadata created: ${styles.dim(path.join(this.projectPath, '.sync-metadata.json'))}\n` +
            `  • Git changes committed (ready to push)\n\n` +
            `${styles.info('🚀 Next Steps:')}\n` +
            `  1. Review the changes in: ${styles.highlight(this.projectPath)}\n` +
            `  2. Push to your forked repository: ${styles.bold('git push origin main')}\n` +
            `  3. Create a Pull Request to cortensor/community-projects\n` +
            `  4. Run this script again anytime to re-sync with updates\n\n` +
            `${styles.info('📁 Working directory:')} ${styles.dim(CONFIG.workingDirectory)}\n` +
            `${styles.info('📝 Log file:')} ${styles.dim(CONFIG.logFile)}`,
            {
                title: ' 🎉 Sync Complete ',
                padding: 1,
                margin: 1,
                borderStyle: 'double',
                borderColor: 'green',
                backgroundColor: '#0a0a0a'
            }
        );

        console.log('\n' + summaryBox);

        if (CONFIG.dryRun) {
            console.log(styles.warning('\n🔍 This was a dry run. No actual changes were made.'));
        }
    }

    async run() {
        try {
            await this.initialize();
            await this.setupWorkingDirectory();
            await this.handleCommunityRepository();
            await this.cloneSourceRepository();
            await this.prepareProjectDirectory();
            await this.copyProjectFiles();
            await this.createCommunityReadme();
            await this.createSyncMetadata();
            await this.cleanupTemporaryFiles();
            await this.handleGitOperations();
            await this.displaySummary();

        } catch (error) {
            logger.error(`Sync failed: ${error.message}`);
            
            if (CONFIG.verbose) {
                console.error('\n' + styles.error('Full error details:'));
                console.error(error.stack);
            }
            
            console.log('\n' + boxen(
                styles.error('❌ Sync Failed\n\n') +
                `Error: ${error.message}\n\n` +
                `Check the log file for details: ${CONFIG.logFile}\n` +
                `Run with --verbose for more information`,
                {
                    padding: 1,
                    margin: 1,
                    borderStyle: 'round',
                    borderColor: 'red'
                }
            ));
            
            process.exit(1);
        }
    }
}

// 🏃‍♂️ Script execution
if (require.main === module) {
    // Display help if requested
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        console.log(`
${styles.title('CortiGPT Community Sync Tool')}

${styles.bold('Usage:')}
  node sync-to-community-projects.js [options]

${styles.bold('Options:')}
  --dry-run     Perform a dry run without making changes
  --verbose     Show detailed output and command execution
  --help, -h    Show this help message

${styles.bold('Examples:')}
  node sync-to-community-projects.js
  node sync-to-community-projects.js --dry-run
  node sync-to-community-projects.js --verbose --dry-run
`);
        process.exit(0);
    }

    // Run the sync
    const sync = new CortensorSync();
    sync.run();
}

module.exports = CortensorSync;
