# Claude Code MCP 安装笔记（Windows）

## 一、核心概念：MCP 三种作用域（Scope）

| Scope | 文件位置 | 生效范围 | 命令参数 |
|-------|---------|---------|---------|
| **local**（默认） | `~/.claude.json` | 仅自己 + 当前项目 | `--scope local`（可省略） |
| **project** | `项目根目录/.mcp.json` | 团队所有人 + 当前项目 | `--scope project` |
| **user** | `~/.claude.json` | 仅自己 + 所有项目 | `--scope user` |

**优先级**：local > project > user

---

## 二、Windows 关键注意事项

> ⚠️ **Windows 上所有用 `npx` 的 MCP 服务器，必须加 `cmd /c` 包装！**

```
# ❌ 错误（Windows 上 npx 无法直接执行）
claude mcp add xxx -- npx @some/package

# ✅ 正确
claude mcp add xxx -- cmd /c npx @some/package
```

手动编辑 `.mcp.json` 时同理：
```json
{
  "mcpServers": {
    "xxx": {
      "command": "cmd",
      "args": ["/c", "npx", "@some/package"],
      "env": { ... }
    }
  }
}
```

---

## 三、常用命令

```bash
# 添加 MCP 服务器
claude mcp add <名称> --scope <scope> -- <命令>

# 查看所有已配置的 MCP
claude mcp list

# 删除 MCP 服务器
claude mcp remove --scope <scope> <名称>

# 在 Claude Code 内部检查连接状态
/mcp

# 诊断问题
/doctor
```

---

## 四、已安装的 MCP 服务器

### 1. MySQL MCP（项目级）

```bash
claude mcp add --scope project mcp_server_mysql \
  -e MYSQL_HOST="127.0.0.1" \
  -e MYSQL_PORT="3306" \
  -e MYSQL_USER="root" \
  -e MYSQL_PASS="your_password" \
  -e MYSQL_DB="your_database" \
  -e ALLOW_INSERT_OPERATION="false" \
  -e ALLOW_UPDATE_OPERATION="false" \
  -e ALLOW_DELETE_OPERATION="false" \
  -- cmd /c npx @benborla29/mcp-server-mysql
```

用途：用自然语言查询和操作 MySQL 数据库。

### 2. Playwright MCP（用户级，所有项目可用）

```bash
claude mcp add playwright --scope user \
  -- cmd /c npx -y @playwright/mcp@latest
```

用途：浏览器自动化，可导航、点击、填表、截图、测试。

---

## 五、推荐的其他 MCP 工具

### 代码与项目管理

| 工具 | 安装命令 | 用途 |
|------|---------|------|
| **GitHub MCP** | `claude mcp add github --scope user -- docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server` | 管理仓库、PR、Issues |
| **Linear MCP** | `claude mcp add linear --scope user --transport http https://mcp.linear.app/mcp` | 项目管理、工单 |

### 数据库

| 工具 | 安装命令 | 用途 |
|------|---------|------|
| **PostgreSQL MCP** | `claude mcp add postgres --scope user -- cmd /c npx -y @modelcontextprotocol/server-postgres "连接字符串"` | PostgreSQL 操作 |
| **SQLite MCP** | `claude mcp add sqlite --scope user -- cmd /c npx -y @modelcontextprotocol/server-sqlite` | SQLite 管理 |

### 设计协作

| 工具 | 安装命令 | 用途 |
|------|---------|------|
| **Figma MCP** | `claude mcp add figma --scope user --transport http https://mcp.figma.com/mcp` | 设计稿转代码 |

### AI 增强

| 工具 | 说明 |
|------|------|
| **Context7 MCP** | 获取最新官方文档，避免生成过时代码 |
| **Sequential Thinking MCP** | 结构化推理，适合复杂架构决策 |
| **Memory MCP** | 跨会话持久化记忆 |

### 文件与沟通

| 工具 | 说明 |
|------|------|
| **Filesystem MCP** | 访问项目目录之外的文件 |
| **Slack MCP** | 连接 Slack 工作区 |
| **Notion MCP** | 同步文档与代码 |

---

## 六、排查问题

1. **`/doctor`** — 查看 MCP 诊断信息
2. **`claude mcp list`** — 检查连接状态（✓ Connected / ✗ Failed）
3. **Windows 报 Failed to connect** — 检查是否加了 `cmd /c`
4. **包名错误** — 确认 npm 包名正确（如 Playwright 官方包是 `@playwright/mcp`）
5. **配置修改后** — 必须重启 Claude Code 才生效
6. **密码安全** — `.mcp.json` 提交到 Git 时，用 `${VAR}` 环境变量代替明文密码
