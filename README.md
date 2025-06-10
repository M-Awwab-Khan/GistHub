# 🚀 GistHub - Share, Collaborate, Code Better

> **The modern platform for sharing code snippets with real-time collaboration, AI-powered autocompletions, and a powerful online IDE supporting 10 programming languages.**

GistHub is a comprehensive code snippet sharing platform that combines the simplicity of GitHub Gists with the power of a full-featured online IDE. Built with Next.js 15, it offers real-time collaboration, AI autocompletions, and seamless code execution capabilities.

## ✨ Features

### 🖥️ **Powerful Online IDE**

- **Multi-language Support**: 10 programming languages (JavaScript, TypeScript, Python, Java, C++, Ruby, Go, PHP, Rust, C#)
- **Monaco Editor Integration**: VSCode-like editing experience with syntax highlighting
- **Real-time Code Execution**: Execute code instantly using Piston API
- **Custom Themes**: 5 VSCode themes (VS Dark, VS Light, GitHub Dark, Monokai, Solarized Dark)
- **Font Customization**: Adjustable font sizes (12px-24px) with ligature support

### 🤝 **Real-time Collaboration**

- **Live Collaborative Editing**: Multiple users can edit the same snippet simultaneously
- **Live Cursors**: See where other collaborators are working in real-time
- **User Avatars**: Visual indicators of active collaborators
- **Collaborative Permissions**: Owner and collaborator role management
- **Instant Synchronization**: Changes sync across all connected clients

### 🧠 **AI-Powered Features**

- **Intelligent Autocompletions**: AI-powered code suggestions via Monacopilot
- **Context-aware Suggestions**: Smart completions based on current code context
- **Multi-language AI Support**: AI assistance across all supported programming languages

### 📝 **Snippet Management**

- **Public & Private Snippets**: Control visibility of your code snippets
- **Snippet Sharing**: Easy sharing with public URLs
- **Star System**: Save and organize favorite snippets
- **Search & Filter**: Advanced search with language and text filtering
- **Grid/List Views**: Flexible viewing options for snippet discovery

### 💬 **Community Features**

- **Comments System**: Rich text comments with code block support
- **User Profiles**: Comprehensive user dashboards with statistics
- **Execution History**: Track and view code execution history
- **Community Discovery**: Explore public snippets from other developers

### 🔒 **Authentication & Security**

- **Clerk Authentication**: Secure user authentication and management
- **Role-based Access**: Owner and collaborator permissions
- **Private Snippets**: Secure private code storage

## 🏗️ Architecture & Technology Stack

### **Frontend**

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with custom components
- **Animations**: Framer Motion for smooth interactions
- **State Management**: Zustand for client-side state

### **Backend & Database**

- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Clerk for user management
- **Real-time**: Liveblocks for collaborative features
- **Code Execution**: Piston API for multi-language code execution

### **Development Tools**

- **Editor**: Monaco Editor (VSCode engine)
- **Collaboration**: Yjs with Monaco bindings
- **AI Integration**: Monacopilot for code completions
- **Syntax Highlighting**: React Syntax Highlighter
- **Type Safety**: Full TypeScript coverage

### **Deployment & Infrastructure**

- **Hosting**: Vercel-ready deployment
- **Database**: PostgreSQL (compatible with Supabase, Neon, etc.)
- **Environment**: Docker support for local development

## 🚀 Getting Started

### Prerequisites

```bash
# Required versions
Node.js >= 18.0.0
npm >= 8.0.0
PostgreSQL >= 13.0
```

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/gisthub.git
cd gisthub
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/gisthub"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# Liveblocks (for real-time collaboration)
LIVEBLOCKS_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY="pk_test_..."

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. **Database Setup**

```bash
# Generate database schema
npx drizzle-kit generate

# Push schema to database
npx drizzle-kit push
```

5. **Run the development server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📁 Project Structure

```
gisthub/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── code-completion/      # AI code completion endpoint
│   │   ├── liveblocks-auth/      # Liveblocks authentication
│   │   └── webhooks/             # Webhook handlers
│   ├── profile/                  # User profile pages
│   ├── sign-in/                  # Authentication pages
│   ├── sign-up/
│   └── snippets/                 # Snippet-related pages
│       ├── [id]/                 # Individual snippet pages
│       │   └── edit/             # Collaborative editing
│       ├── create/               # Snippet creation
│       └── page.tsx              # Snippet discovery
├── components/                   # React components
│   ├── chat/                     # Chat functionality
│   ├── create-snippet/           # Snippet creation & editing
│   │   ├── AIEditor.tsx          # AI-powered editor
│   │   ├── CollaborativeEditor.tsx # Real-time collaborative editor
│   │   ├── EditorPanel.tsx       # Main editor interface
│   │   ├── OutputPanel.tsx       # Code execution output
│   │   └── ...                   # Other editor components
│   ├── discover-snippets/        # Snippet discovery
│   ├── landing/                  # Landing page components
│   ├── profile/                  # User profile components
│   ├── snippet/                  # Snippet viewing components
│   └── ui/                       # Reusable UI components
├── db/                           # Database configuration
│   ├── index.ts                  # Database connection
│   └── schema.ts                 # Database schema
├── lib/                          # Utility functions
│   ├── actions.ts                # Server actions
│   └── utils.ts                  # Helper utilities
├── store/                        # State management
│   └── useCodeEditorStore.ts     # Editor state management
├── types/                        # TypeScript type definitions
└── constants.ts                  # Application constants
```

## 🔧 Key Features Deep Dive

### Real-time Collaboration

GistHub uses **Liveblocks** and **Yjs** to provide seamless real-time collaboration:

- Live cursor tracking with user names
- Operational transforms for conflict resolution
- Real-time awareness of active collaborators
- Synchronized code changes across all clients

### AI Code Completion

Powered by **Monacopilot**, the AI system provides:

- Context-aware code suggestions
- Multi-language support
- Real-time completion as you type
- Integration with Monaco Editor

### Code Execution

The platform supports code execution for all 10 languages:

- **Execution Engine**: Piston API for secure code execution
- **Output Handling**: Real-time output display with error handling
- **Execution History**: Track and save execution results
- **Multiple Languages**: Support for popular programming languages

### Snippet Management

Comprehensive snippet management system:

- **CRUD Operations**: Create, read, update, delete snippets
- **Visibility Control**: Public/private snippet settings
- **Collaboration**: Add/remove collaborators with email invitations
- **Metadata**: Title editing, language selection, timestamps

## 🎨 Supported Programming Languages

| Language   | Version | Logo | Execution |
| ---------- | ------- | ---- | --------- |
| JavaScript | 18.15.0 | ✅   | ✅        |
| TypeScript | 5.0.3   | ✅   | ✅        |
| Python     | 3.10.0  | ✅   | ✅        |
| Java       | 15.0.2  | ✅   | ✅        |
| C++        | 10.2.0  | ✅   | ✅        |
| Ruby       | 3.0.1   | ✅   | ✅        |
| Go         | 1.16.2  | ✅   | ✅        |
| PHP        | 8.2.3   | ✅   | ✅        |
| Rust       | 1.68.2  | ✅   | ✅        |
| C#         | 6.12.0  | ✅   | ✅        |

## 🎨 Available Themes

- **VS Dark** - Classic Visual Studio Code dark theme
- **VS Light** - Clean light theme for daytime coding
- **GitHub Dark** - GitHub's signature dark theme
- **Monokai** - Popular high-contrast theme
- **Solarized Dark** - Eye-friendly low-contrast theme

## 📊 Database Schema

The application uses a PostgreSQL database with the following main entities:

- **users** - User profile information
- **snippets** - Code snippet storage with metadata
- **snippet_comments** - Comment system for snippets
- **snippet_collaborators** - Collaboration permissions
- **stars** - User favorites system
- **code_executions** - Execution history tracking

## 🔐 Authentication Flow

GistHub uses Clerk for authentication with the following features:

- **Multiple Sign-in Methods**: Email, social providers
- **User Management**: Profile management and preferences
- **Security**: Secure session management
- **Role-based Access**: Different permissions for owners and collaborators

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy to Vercel**

- Connect your GitHub repository to Vercel
- Set environment variables in Vercel dashboard
- Deploy automatically on every push

3. **Database Setup**

- Set up PostgreSQL database (Supabase, Neon, or Vercel Postgres)
- Update `DATABASE_URL` in Vercel environment variables
- Run migrations in Vercel

### Environment Variables for Production

```env
# Database
DATABASE_URL="postgresql://..."

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."

# Liveblocks
LIVEBLOCKS_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY="pk_live_..."

# Application
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Follow the existing code style
4. **Add tests**: Ensure your changes are tested
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Code Style

- **TypeScript**: Full type safety required
- **ESLint**: Follow the configured linting rules
- **Prettier**: Code formatting is enforced
- **Components**: Use functional components with hooks
- **Styling**: Tailwind CSS with consistent design patterns

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Issues**

```bash
# Check database URL format
# Ensure database is running
# Verify credentials
```

2. **Liveblocks Connection Issues**

```bash
# Verify API keys
# Check network connectivity
# Ensure proper environment variables
```

3. **Code Execution Issues**

```bash
# Piston API might be down
# Check network connectivity
# Verify language support
```

## 📚 Learn More

### Documentation Links

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Liveblocks Documentation](https://liveblocks.io/docs) - Real-time collaboration features
- [Monaco Editor Documentation](https://microsoft.github.io/monaco-editor/) - Editor customization
- [Clerk Documentation](https://clerk.com/docs) - Authentication setup
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Styling guidelines

### API References

- [Piston API](https://github.com/engineer-man/piston) - Code execution engine
- [Drizzle ORM](https://orm.drizzle.team/) - Database operations

## 🙏 Acknowledgments

- **Monaco Editor** - For the powerful code editing experience
- **Liveblocks** - For real-time collaboration infrastructure
- **Piston** - For secure code execution capabilities
- **Clerk** - For seamless authentication
- **Vercel** - For deployment and hosting platform

## 📞 Support

If you have any questions or need help, please:

- Open an issue on GitHub
- Contact us at mawwabkhank2006@gmail.com

---

<div align="center">
  <p>Built with ❤️ by Awwab</p>
  <p>
    <a href="https://github.com/M-Awwab-Khan/gisthub">GitHub</a> •
    <a href="https://gisthub-sepia.vercel.app/">Website</a>
  </p>
</div>
