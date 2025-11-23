# 将项目上传到 GitHub 的指南

## 方案一：使用 Git 命令行（推荐）

### 步骤 1：安装 Git
如果您的系统没有安装 Git，请：
1. 访问 https://git-scm.com/download/win
2. 下载并安装 Git for Windows
3. 安装完成后重启终端

### 步骤 2：初始化 Git 仓库
在项目目录中运行以下命令：

```bash
cd "d:\AA Limen_work\Limen-AI-Content-Creation-Hub-main"
git init
git add .
git commit -m "Initial commit: ContentForge AI project"
```

### 步骤 3：在 GitHub 创建仓库
1. 访问 https://github.com/new
2. 输入仓库名称（例如：Limen-AI-Content-Creation-Hub）
3. 选择 Public 或 Private
4. **不要**勾选 "Initialize this repository with a README"
5. 点击 "Create repository"

### 步骤 4：推送代码到 GitHub
在 GitHub 创建仓库后，会显示推送命令，类似：

```bash
git remote add origin https://github.com/你的用户名/仓库名.git
git branch -M main
git push -u origin main
```

## 方案二：使用 GitHub 网页直接上传（无需 Git）

### 步骤 1：创建 GitHub 仓库
1. 访问 https://github.com/new
2. 输入仓库名称
3. 选择 Public 或 Private
4. 点击 "Create repository"

### 步骤 2：上传文件
1. 在新建的仓库页面，点击 "uploading an existing file"
2. 将项目文件夹中的所有文件拖拽到浏览器中
3. 注意：**不要上传** `node_modules` 文件夹（已在 .gitignore 中排除）
4. 输入提交信息，点击 "Commit changes"

## 方案三：使用 GitHub Desktop（图形界面）

1. 下载 GitHub Desktop：https://desktop.github.com/
2. 安装并登录您的 GitHub 账户
3. 点击 "File" -> "Add Local Repository"
4. 选择项目文件夹
5. 点击 "Publish repository" 上传到 GitHub

## 重要提示

- **不要上传** `.env.local` 文件（包含 API 密钥）
- **不要上传** `node_modules` 文件夹（太大且可以重新安装）
- 确保 `.gitignore` 文件已正确配置

## 上传后访问

上传完成后，您的仓库地址将是：
`https://github.com/您的用户名/仓库名`


