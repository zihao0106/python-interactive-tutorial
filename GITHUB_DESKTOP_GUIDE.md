# GitHub Desktop 部署指南

## 🚀 使用GitHub Desktop快速部署

### 1. 在GitHub上创建仓库
- 打开 GitHub Desktop
- 点击 "File" → "New repository" 或者 Ctrl+N (Windows) / Cmd+N (Mac)
- 填写信息：
  - Name: `python-interactive-tutorial`
  - Description: `Python交互式编程教程 - 基于Web的交互式Python学习平台`
  - Local path: 选择 `/Users/adamhu`（当前项目的父目录）
  - ✅ 勾选 "Initialize this repository with a README"
  - ✅ 选择 "Publish to GitHub.com"
  - ✅ 设为 Public repository

### 2. 发布到GitHub
- 项目创建后，GitHub Desktop会提示发布到GitHub
- 点击 "Publish repository"
- 确保 "Keep this code private" 未勾选（设为公开）
- 点击 "Publish Repository"

### 3. 启用GitHub Pages
- 发布完成后，点击GitHub Desktop中的 "View on GitHub"
- 在GitHub仓库页面，点击 "Settings" 标签
- 滚动到 "Pages" 部分
- Source 选择 "Deploy from a branch"
- Branch 选择 "main"
- 文件夹选择 "/ (root)"
- 点击 "Save"

### 4. 访问你的网站
等待几分钟后，网站将在以下地址可用：
`https://[your-username].github.io/python-interactive-tutorial`

---

⚠️ **重要提醒**：
如果GitHub Desktop提示仓库已存在，请选择现有的项目文件夹而不是创建新的。
