# Cortensor Main Monorepo

A comprehensive monorepo containing the Cortensor ecosystem - a decentralized AI platform that combines blockchain technology with AI-powered search and chat capabilities.

## 🚀 Overview

Cortensor is a decentralized AI platform that provides verifiable, trustless intelligence through a network of distributed miners. This monorepo contains all the components needed to build, deploy, and interact with the Cortensor network.

## 🏗️ Architecture

This monorepo is built with modern technologies and follows a monorepo architecture using:

- **Package Manager**: pnpm with workspace support
- **Build System**: Turborepo for optimized builds
- **Frontend**: Next.js 15 with React 19
- **Styling**: Tailwind CSS with shadcn/ui components
- **AI Integration**: Cortensor OpenAI Provider
- **Blockchain**: Web3 integration with Wagmi and Viem

## 📁 Project Structure

```
cortensor-main-monorepo/
├── apps/
│   ├── web/                 # Main web application (Next.js)
│   ├── extension/           # Browser extension (WXT + React)
│   └── server/              # API server (Next.js)
├── packages/
│   └── ai/                  # AI integration package
├── pnpm-workspace.yaml      # Workspace configuration
├── turbo.json               # Turborepo configuration
└── package.json             # Root package configuration
```

## 🎯 Applications

### 🌐 Web App (`apps/web`)
- **Port**: 3001
- **Purpose**: Main web interface for CortiGPT
- **Features**: AI chat interface, agent showcase, landing page
- **Tech Stack**: Next.js 15, React 19, Tailwind CSS, shadcn/ui

### 🔌 Browser Extension (`apps/extension`)
- **Name**: CortiGPT
- **Purpose**: Browser-side AI assistant with sidepanel interface
- **Features**: Web3 wallet integration, AI chat, content extraction
- **Tech Stack**: WXT, React 19, Tailwind CSS, shadcn/ui

### 🖥️ API Server (`apps/server`)
- **Port**: 3002
- **Purpose**: Backend API for AI services
- **Features**: Chat API endpoints, AI model integration
- **Tech Stack**: Next.js 15, AI SDK integration

## 📦 Packages

### 🤖 AI Package (`packages/ai`)
- **Purpose**: AI integration and agent management
- **Features**: Mastra agent framework, Cortensor provider integration
- **Exports**: AI agents, constants, server utilities

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 10.12.3+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cortensor-main-monorepo
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment files for each app
   cp apps/web/.env.example apps/web/.env.local
   cp apps/extension/.env.example apps/extension/.env.local
   cp apps/server/.env.example apps/server/.env.local
   ```

### Development

```bash
# Start all applications
pnpm dev

# Start specific applications
pnpm dev:web          # Web app only
pnpm dev:extension    # Extension only
pnpm dev:server       # Server only

# Build all applications
pnpm build

# Type checking
pnpm check-types
```

### Environment Variables

Required environment variables for full functionality:

```bash
# Cortensor API
CORTENSOR_API_KEY=your_api_key
CORTENSOR_BASE_URL=https://your_api_url

# Web Search (Tavily)
TAVILY_API_KEY=your_tavily_key

# Web3 Configuration
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL=your_rpc_url


```

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start all applications in development mode |
| `pnpm build` | Build all applications for production |
| `pnpm start` | Start the server application |
| `pnpm check-types` | Run TypeScript type checking across all apps |
| `pnpm dev:web` | Start only the web application |
| `pnpm dev:extension` | Start only the extension |
| `pnpm dev:server` | Start only the server |
| `pnpm mastra:dev` | Start Mastra development server |
| `pnpm mastra:build` | Build Mastra application |

## 🔧 Technology Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **Next.js 15** - Full-stack React framework
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **Framer Motion** - Animation library

### AI & Backend
- **Cortensor OpenAI Provider** - AI model integration
- **Mastra** - AI agent framework
- **Vercel AI SDK** - AI development toolkit
- **Tavily** - Web search integration

### Blockchain & Web3
- **Wagmi** - React hooks for Ethereum
- **Viem** - TypeScript interface for Ethereum
- **RainbowKit** - Wallet connection UI

### Development Tools
- **TypeScript** - Type-safe JavaScript
- **Turborepo** - Monorepo build system
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🌟 Key Features

- **Decentralized AI**: Powered by Cortensor network
- **Web3 Integration**: Blockchain wallet support
- **AI Agents**: Intelligent chat assistants
- **Web Search**: Real-time information retrieval
- **Cross-Platform**: Web app and browser extension
- **Modern UI**: Beautiful, responsive design
- **Type Safety**: Full TypeScript support

## 📚 Documentation

- [Web App Documentation](apps/web/README.md)
- [Extension Documentation](apps/extension/README.md)
- [Server Documentation](apps/server/README.md)
- [AI Package Documentation](packages/ai/README.md)
- [Cortensor Provider Documentation](readmeaboutCortensorOpenaiProvider.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Open an issue on GitHub
- Check the documentation in each app's README
- Review the Cortensor provider documentation

## 🔗 Links

- [Cortensor Network](https://cortensor.network)
- [Cortensor Documentation](https://docs.cortensor.network)
- [Cortensor Provider](https://github.com/cortensor/cortensor-openai-provider)

---

Built with ❤️ by Jatique  using modern web technologies and decentralized AI principles.
