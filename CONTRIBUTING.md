# Contributing to Gifted CDN

First off, thank you for considering contributing to Gifted CDN! It's people like you that make this project better for everyone.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to support@giftedtech.co.ke.

### Our Standards

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (code snippets, screenshots, etc.)
- **Describe the behavior you observed** and what you expected
- **Include your environment details** (OS, Node.js version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **List any alternative solutions** you've considered

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:
- `good first issue` - Simple issues for beginners
- `help wanted` - Issues that need attention

## Development Setup

### Prerequisites

- Node.js v14 or higher
- npm or yarn
- MongoDB (local or cloud)
- Git

### Setup Steps

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/gifted-cdn.git
   cd gifted-cdn
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/GiftedTech-Nexus/gifted-cdn.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

### Project Structure

```
gifted-cdn/
├── api/
│   ├── index.js           # Main Express application
│   ├── client/            # Cloudflare R2 client
│   ├── db/                # Database connection
│   └── models/            # Mongoose models
├── public/                # Frontend files
├── logs/                  # Application logs
├── config.js              # Configuration
└── package.json           # Dependencies
```

## Coding Standards

### JavaScript Style Guide

We follow standard JavaScript conventions with some specific rules:

#### General Rules

- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Use camelCase for variables and functions
- Use PascalCase for classes and constructors
- Use UPPER_CASE for constants

#### Example

```javascript
// Good
const userName = 'John Doe';
const MAX_FILE_SIZE = 100 * 1024 * 1024;

function uploadFile(fileName, fileBuffer) {
  // Implementation
}

// Bad
const user_name = "John Doe";
const maxFileSize = 100 * 1024 * 1024;

function upload_file(fileName, fileBuffer) {
  // Implementation
}
```

### Code Quality

- Write clear, self-documenting code
- Add comments for complex logic
- Keep functions small and focused
- Avoid deep nesting (max 3 levels)
- Handle errors appropriately
- Write meaningful variable names

### Testing

Before submitting a pull request:

```bash
# Run linter
npm run lint

# Format code
npm run format

# Run tests (when available)
npm test
```

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
# Feature
git commit -m "feat(upload): add support for video files"

# Bug fix
git commit -m "fix(delete): resolve delete key validation issue"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Refactoring
git commit -m "refactor(client): simplify file upload logic"
```

### Commit Message Guidelines

- Use the present tense ("add feature" not "added feature")
- Use the imperative mood ("move cursor to..." not "moves cursor to...")
- Limit the first line to 72 characters
- Reference issues and pull requests in the footer

## Pull Request Process

### Before Submitting

1. **Update your fork**
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write clean, documented code
   - Follow coding standards
   - Test your changes thoroughly

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

### Submitting the Pull Request

1. Go to the original repository on GitHub
2. Click "New Pull Request"
3. Select your fork and branch
4. Fill in the PR template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested your changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated (if applicable)
```

### Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, your PR will be merged

### After Merge

1. Delete your feature branch
   ```bash
   git branch -d feature/your-feature-name
   git push origin --delete feature/your-feature-name
   ```

2. Update your main branch
   ```bash
   git checkout main
   git pull upstream main
   ```

## Specific Contribution Areas

### Adding New Features

When adding new features:

1. Discuss the feature in an issue first
2. Ensure it aligns with project goals
3. Update documentation
4. Add tests if applicable
5. Update API.md if adding API endpoints

### Fixing Bugs

When fixing bugs:

1. Reference the issue number in your commit
2. Add a test case that reproduces the bug
3. Ensure the fix doesn't break existing functionality
4. Update documentation if needed

### Improving Documentation

Documentation improvements are always welcome:

- Fix typos and grammatical errors
- Clarify confusing sections
- Add examples
- Update outdated information
- Translate documentation

### Code Review Guidelines

When reviewing code:

- Be respectful and constructive
- Focus on the code, not the person
- Explain your reasoning
- Suggest improvements, don't demand them
- Approve when satisfied

## Development Tips

### Debugging

Enable debug mode:
```bash
export DEBUG=*
npm run dev
```

### Testing Locally

Test file upload:
```bash
curl -X POST http://localhost:5000/api/upload.php \
  -F "file=@test.jpg" \
  -F "deleteKey=test123"
```

### Database Management

Access MongoDB:
```bash
# Local MongoDB
mongo gifted-cdn

# View collections
show collections

# Query files
db.files.find().pretty()
```

### Logging

Check application logs:
```bash
# Error logs
tail -f logs/error.log

# Combined logs
tail -f logs/combined.log
```

## Questions?

If you have questions:

- Check existing documentation
- Search closed issues
- Ask in a new issue
- Email: support@giftedtech.co.ke

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to Gifted CDN! 🎉

---

Made with ❤️ by [Gifted Tech](https://github.com/GiftedTech-Nexus)
