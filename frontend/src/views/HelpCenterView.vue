<template>
  <PublicPageShell>
    <div class="help-page">
      <section class="help-hero">
        <div class="hero-copy">
          <p class="eyebrow">{{ copy.eyebrow }}</p>
          <h1>{{ copy.title }}</h1>
          <p class="hero-desc">{{ copy.desc }}</p>
          <div class="hero-actions">
            <RouterLink to="/keys" class="primary-link">
              <Icon name="key" size="sm" />
              {{ copy.createKey }}
            </RouterLink>
            <a href="#guides" class="ghost-link" @click.prevent="scrollToGuide('guides')">
              <Icon name="book" size="sm" />
              {{ copy.viewGuides }}
            </a>
          </div>
        </div>

        <aside class="base-panel" aria-label="Current API endpoints">
          <span>{{ copy.currentBaseUrl }}</span>
          <strong>{{ rootBaseUrl }}</strong>
          <div class="endpoint-list">
            <div>
              <small>{{ copy.fieldOpenAiClaudeBase }}</small>
              <code>{{ openAiBaseUrl }}</code>
            </div>
            <div>
              <small>{{ copy.fieldGeminiBase }}</small>
              <code>{{ geminiBaseUrl }}</code>
            </div>
          </div>
          <button class="copy-button" type="button" @click="copyText(rootBaseUrl, 'base')">
            <Icon :name="copiedKey === 'base' ? 'check' : 'copy'" size="sm" />
            {{ copiedKey === 'base' ? copy.copied : copy.copy }}
          </button>
          <p>{{ copy.keyNote }}</p>
        </aside>
      </section>

      <section class="help-layout">
        <aside class="help-sidebar" aria-label="Help guide navigation">
          <strong>{{ copy.quickNav }}</strong>
          <a
            v-for="guide in guides"
            :key="guide.id"
            :href="`#${guide.id}`"
            @click.prevent="scrollToGuide(guide.id)"
          >
            <Icon :name="guide.icon" size="sm" />
            <span>{{ guide.title }}</span>
          </a>
          <div class="sidebar-note">
            <Icon name="infoCircle" size="sm" />
            <p>{{ copy.keyNote }}</p>
          </div>
        </aside>

        <div class="help-content">
          <section class="prep-section">
            <div class="section-head">
              <p>{{ copy.beforeStart }}</p>
              <h2>{{ copy.beforeStartTitle }}</h2>
            </div>

            <div class="prep-grid">
              <article v-for="item in prepItems" :key="item.title" class="prep-card">
                <span>{{ item.index }}</span>
                <strong>{{ item.title }}</strong>
                <p>{{ item.text }}</p>
              </article>
            </div>
          </section>

          <section id="guides" class="guides-section">
            <div class="section-head split">
              <div>
                <p>{{ copy.quickNav }}</p>
                <h2>{{ copy.guidesTitle }}</h2>
              </div>
              <div class="quick-nav">
                <a
                  v-for="guide in guides"
                  :key="guide.id"
                  :href="`#${guide.id}`"
                  @click.prevent="scrollToGuide(guide.id)"
                >
                  {{ guide.title }}
                </a>
              </div>
            </div>

            <article v-for="guide in guides" :id="guide.id" :key="guide.id" class="guide-card">
              <div class="guide-head">
                <div>
                  <span>{{ guide.category }}</span>
                  <h3>
                    <Icon :name="guide.icon" size="md" />
                    {{ guide.title }}
                  </h3>
                  <p>{{ guide.desc }}</p>
                </div>
              </div>

              <div class="field-grid">
                <div v-for="field in guide.fields" :key="`${guide.id}-${field.label}`">
                  <small>{{ field.label }}</small>
                  <code>{{ field.value }}</code>
                </div>
              </div>

              <ol class="step-list">
                <li v-for="step in guide.steps" :key="step">{{ step }}</li>
              </ol>

              <div class="snippet-list">
                <article v-for="block in guide.blocks" :key="`${guide.id}-${block.label}`" class="snippet-card">
                  <div class="snippet-head">
                    <strong>{{ block.label }}</strong>
                    <button
                      class="copy-button tiny"
                      type="button"
                      @click="copyText(block.code, `${guide.id}-${block.label}`)"
                    >
                      <Icon :name="copiedKey === `${guide.id}-${block.label}` ? 'check' : 'copy'" size="sm" />
                      {{ copiedKey === `${guide.id}-${block.label}` ? copy.copied : copy.copy }}
                    </button>
                  </div>
                  <pre class="snippet"><code>{{ block.code }}</code></pre>
                </article>
              </div>
            </article>
          </section>
        </div>
      </section>
    </div>
  </PublicPageShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PublicPageShell from '@/components/public/PublicPageShell.vue'
import Icon from '@/components/icons/Icon.vue'
import { useClipboard } from '@/composables/useClipboard'

type IconName = InstanceType<typeof Icon>['$props']['name']

type GuideBlock = {
  label: string
  code: string
}

type Guide = {
  id: string
  icon: IconName
  category: string
  title: string
  desc: string
  fields: Array<{ label: string; value: string }>
  steps: string[]
  blocks: GuideBlock[]
}

const { locale } = useI18n()
const { copyToClipboard } = useClipboard()
const copiedKey = ref('')
let copiedTimer: number | undefined

const isZh = computed(() => locale.value.startsWith('zh'))
const apiKeyPlaceholder = 'YOUR_API_KEY'
const openAiModel = 'gpt-5.5'
const claudeModel = 'anthropic.claude-opus-4-7'
const geminiModel = 'gemini.gemini-3.1-pro-preview'

const rootBaseUrl = computed(() => resolveRootBaseUrl())
const openAiBaseUrl = computed(() => rootBaseUrl.value)
const geminiBaseUrl = computed(() => rootBaseUrl.value)

const copy = computed(() => isZh.value ? {
  eyebrow: '帮助中心',
  title: '工具配置教程',
  desc: '使用当前站点 API 地址和完整 API Key，接入 Claude Code、Gemini CLI、Codex、OpenClaw、OpenCode、Cherry Studio 和 Hermes。',
  createKey: '创建 API Key',
  viewGuides: '查看教程',
  currentBaseUrl: '当前 API 地址',
  quickNav: '教程目录',
  keyNote: '请使用 Key 管理中主动查看到的完整 API Key，列表里的脱敏值只用于展示。',
  beforeStart: '开始前',
  beforeStartTitle: '先准备这三个值',
  prepareKeyTitle: 'API Key',
  prepareKeyDesc: '在 Key 管理中创建 Key，然后主动查看并使用完整 API Key。',
  prepareBaseTitle: 'Base URL',
  prepareBaseDesc: `所有示例都使用 ${rootBaseUrl.value}，不要在客户端配置里额外添加版本路径。`,
  prepareModelTitle: '模型 ID',
  prepareModelDesc: '使用 Key 上展示的模型，或同一供应商通道下已启用的模型。',
  guidesTitle: '按工具接入',
  categoryQuick: '快速开始',
  categoryRecommended: '推荐使用',
  categoryAdvanced: '进阶玩法',
  fieldBaseUrl: 'Base URL',
  fieldOpenAiClaudeBase: 'Claude / GPT 地址',
  fieldGeminiBase: 'Gemini 地址',
  fieldKey: 'API Key',
  fieldModel: '模型',
  blockCli: 'CLI 命令',
  blockConfig: '配置内容',
  blockInstall: '安装命令',
  blockProvider: '服务商字段',
  copy: '复制',
  copied: '已复制',
} : {
  eyebrow: 'Help Center',
  title: 'Tool setup guides',
  desc: 'Use the current API base URL and your full API key to connect Claude Code, Gemini CLI, Codex, OpenClaw, OpenCode, Cherry Studio, and Hermes.',
  createKey: 'Create API Key',
  viewGuides: 'View guides',
  currentBaseUrl: 'Current API base URL',
  quickNav: 'Guides',
  keyNote: 'Use the full API key from Key management. The masked value in the list is only for display.',
  beforeStart: 'Before setup',
  beforeStartTitle: 'Prepare these three values first',
  prepareKeyTitle: 'API Key',
  prepareKeyDesc: 'Create a key in Key management, then reveal and use the full API key.',
  prepareBaseTitle: 'Base URL',
  prepareBaseDesc: `All examples use ${rootBaseUrl.value}. Do not add a version path in client endpoint settings.`,
  prepareModelTitle: 'Model ID',
  prepareModelDesc: 'Use the model shown on the key or one enabled under the same provider channel.',
  guidesTitle: 'Connect by tool',
  categoryQuick: 'Quick start',
  categoryRecommended: 'Recommended',
  categoryAdvanced: 'Advanced',
  fieldBaseUrl: 'Base URL',
  fieldOpenAiClaudeBase: 'Claude / GPT base URL',
  fieldGeminiBase: 'Gemini base URL',
  fieldKey: 'API Key',
  fieldModel: 'Model',
  blockCli: 'CLI commands',
  blockConfig: 'Configuration',
  blockInstall: 'Install',
  blockProvider: 'Provider fields',
  copy: 'Copy',
  copied: 'Copied',
})

const prepItems = computed(() => [
  {
    index: '01',
    title: copy.value.prepareKeyTitle,
    text: copy.value.prepareKeyDesc,
  },
  {
    index: '02',
    title: copy.value.prepareBaseTitle,
    text: copy.value.prepareBaseDesc,
  },
  {
    index: '03',
    title: copy.value.prepareModelTitle,
    text: copy.value.prepareModelDesc,
  },
])

const snippets = computed(() => ({
  claudeCode: `npm install -g @anthropic-ai/claude-code
claude --version

export ANTHROPIC_BASE_URL="${rootBaseUrl.value}"
export ANTHROPIC_AUTH_TOKEN="${apiKeyPlaceholder}"
claude`,
  geminiCli: `npm install -g @google/gemini-cli
gemini --version

export GOOGLE_GEMINI_BASE_URL="${rootBaseUrl.value}"
export GEMINI_API_KEY="${apiKeyPlaceholder}"
export GEMINI_MODEL="${geminiModel}"
gemini -p "Reply only OK"`,
  ccSwitch: `Recommended CC Switch provider
Name: AllCanCode
Endpoint: ${rootBaseUrl.value}
API Key: ${apiKeyPlaceholder}

Claude app: claude
Gemini app: gemini
Codex app: codex
Usage refresh: 30s`,
  codex: `npm install -g @openai/codex@latest
mkdir -p ~/.codex

cat > ~/.codex/config.toml << 'EOF'
model_provider = "allcancode"
model = "${openAiModel}"
model_reasoning_effort = "high"
disable_response_storage = true
preferred_auth_method = "apikey"

[model_providers.allcancode]
name = "AllCanCode"
base_url = "${rootBaseUrl.value}"
wire_api = "responses"
requires_openai_auth = true
EOF

cat > ~/.codex/auth.json << 'EOF'
{
  "OPENAI_API_KEY": "${apiKeyPlaceholder}"
}
EOF

codex`,
  openClawInstall: `sudo npm install -g openclaw
openclaw onboard`,
  openClawConfig: `"models": {
  "providers": {
    "allcancode-claude": {
      "baseUrl": "${rootBaseUrl.value}",
      "apiKey": "${apiKeyPlaceholder}",
      "api": "anthropic-messages",
      "models": [
        {
          "id": "${claudeModel}",
          "name": "Claude Opus 4.7",
          "reasoning": true,
          "input": ["text", "image"],
          "contextWindow": 200000,
          "maxTokens": 16384
        }
      ]
    }
  }
},
"agents": {
  "defaults": {
    "model": {
      "primary": "allcancode-claude/${claudeModel}"
    }
  }
}

openclaw gateway restart
openclaw gateway status`,
  openCode: `{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "anthropic": {
      "options": {
        "baseURL": "${openAiBaseUrl.value}",
        "apiKey": "${apiKeyPlaceholder}"
      },
      "npm": "@ai-sdk/anthropic"
    },
    "openai": {
      "options": {
        "baseURL": "${openAiBaseUrl.value}",
        "apiKey": "${apiKeyPlaceholder}"
      },
      "models": {
        "${openAiModel}": {
          "name": "GPT 5.5",
          "options": { "store": false }
        }
      }
    },
    "gemini": {
      "options": {
        "baseURL": "${geminiBaseUrl.value}",
        "apiKey": "${apiKeyPlaceholder}"
      },
      "npm": "@ai-sdk/google",
      "models": {
        "${geminiModel}": {
          "name": "Gemini 3.1 Pro Preview",
          "modalities": {
            "input": ["text", "image", "pdf"],
            "output": ["text"]
          }
        }
      }
    }
  }
}`,
  cherryStudio: `Claude provider
Type: Anthropic
API Address: ${rootBaseUrl.value}
API Key: ${apiKeyPlaceholder}
Model: ${claudeModel}

GPT provider
Type: OpenAI
API Address: ${rootBaseUrl.value}
API Key: ${apiKeyPlaceholder}
Model: ${openAiModel}

Gemini provider
Type: Gemini
API Address: ${rootBaseUrl.value}
API Key: ${apiKeyPlaceholder}
Model: ${geminiModel}`,
  hermesInstall: `git clone --depth=1 --recurse-submodules https://github.com/NousResearch/hermes-agent.git "$env:LOCALAPPDATA\\hermes\\hermes-agent"
cd "$env:LOCALAPPDATA\\hermes\\hermes-agent"
uv venv .venv
.venv\\Scripts\\Activate.ps1
uv pip install -e ".[all]"
hermes`,
  hermesConfig: `Codex
Endpoint: ${openAiBaseUrl.value}
API Key: ${apiKeyPlaceholder}
Model: ${openAiModel}

Claude
Endpoint: ${openAiBaseUrl.value}
API Key: ${apiKeyPlaceholder}
Model: ${claudeModel}

Gemini
Endpoint: ${openAiBaseUrl.value}
API Key: ${apiKeyPlaceholder}
Model: ${geminiModel}`,
}))

const guides = computed<Guide[]>(() => {
  const c = copy.value
  const s = snippets.value

  return isZh.value ? [
    {
      id: 'ccswitch',
      icon: 'swap',
      category: c.categoryRecommended,
      title: 'CC Switch',
      desc: '推荐优先使用 CC Switch 管理 AllCanCode 的 Claude、Gemini 和 Codex 配置，后续切换模型和查看用量更方便。',
      fields: fields(c.fieldBaseUrl, rootBaseUrl.value, c.fieldKey, apiKeyPlaceholder, c.fieldModel, `${claudeModel} / ${openAiModel} / ${geminiModel}`),
      steps: [
        '先在控制台 Key 管理中创建或查看完整 API Key。',
        '点击 Key 管理里的“导入到 CC Switch”，浏览器会打开 ccswitch 导入配置。',
        '在 CC Switch 中确认 Endpoint、API Key、App 类型和模型后保存。',
        '后续在 Claude Code、Gemini CLI 或 Codex 中选择 CC Switch 管理的 provider 使用。',
      ],
      blocks: [{ label: c.blockConfig, code: s.ccSwitch }],
    },
    {
      id: 'claude-code',
      icon: 'terminal',
      category: c.categoryQuick,
      title: 'Claude Code',
      desc: '安装 Anthropic CLI，并用 ANTHROPIC_BASE_URL 和 ANTHROPIC_AUTH_TOKEN 指向本站。',
      fields: fields(c.fieldBaseUrl, rootBaseUrl.value, c.fieldKey, apiKeyPlaceholder, c.fieldModel, claudeModel),
      steps: [
        '安装 Claude Code，并确认 claude 命令能正常返回版本。',
        '把 ANTHROPIC_BASE_URL 设置为当前 API 地址，把 ANTHROPIC_AUTH_TOKEN 设置为完整 API Key。',
        '在项目目录运行 claude，并选择当前 Key 允许的模型。',
      ],
      blocks: [{ label: c.blockCli, code: s.claudeCode }],
    },
    {
      id: 'gemini-cli',
      icon: 'terminal',
      category: c.categoryQuick,
      title: 'Gemini CLI',
      desc: '安装 Google Gemini CLI，并通过环境变量写入网关地址、API Key 和模型。',
      fields: fields(c.fieldBaseUrl, rootBaseUrl.value, c.fieldKey, apiKeyPlaceholder, c.fieldModel, geminiModel),
      steps: [
        '安装 Gemini CLI，并确认 gemini --version 能返回版本。',
        '设置 GOOGLE_GEMINI_BASE_URL、GEMINI_API_KEY 和 GEMINI_MODEL。',
        '先执行一次 gemini -p 短测试，再在项目里正式使用。',
      ],
      blocks: [{ label: c.blockCli, code: s.geminiCli }],
    },
    {
      id: 'codex',
      icon: 'cpu',
      category: c.categoryQuick,
      title: 'Codex',
      desc: '安装 Codex CLI，并写入 config.toml 与 auth.json，让 Codex 使用本站 GPT Key。',
      fields: fields(c.fieldBaseUrl, rootBaseUrl.value, c.fieldKey, apiKeyPlaceholder, c.fieldModel, openAiModel),
      steps: [
        '安装最新 Codex CLI。',
        '创建 ~/.codex/config.toml 和 ~/.codex/auth.json，写入当前 API 地址和 API Key。',
        '在目标工作目录运行 codex，并用短问题确认能正常返回。',
      ],
      blocks: [{ label: c.blockConfig, code: s.codex }],
    },
    {
      id: 'openclaw',
      icon: 'cloud',
      category: c.categoryAdvanced,
      title: 'OpenClaw',
      desc: '部署 OpenClaw，初始化时先跳过内置模型供应商，随后手动注入本站 provider 配置。',
      fields: fields(c.fieldBaseUrl, rootBaseUrl.value, c.fieldKey, apiKeyPlaceholder, c.fieldModel, claudeModel),
      steps: [
        '安装 OpenClaw，并完成 Telegram 或其他通道的 onboarding。',
        '初始化询问模型供应商时先跳过，后续手动配置。',
        '编辑 ~/.openclaw/openclaw.json，加入 provider 配置后重启 gateway 服务。',
      ],
      blocks: [
        { label: c.blockInstall, code: s.openClawInstall },
        { label: c.blockConfig, code: s.openClawConfig },
      ],
    },
    {
      id: 'opencode',
      icon: 'document',
      category: c.categoryAdvanced,
      title: 'OpenCode',
      desc: '按模型族配置原生 provider，Claude、GPT 和 Gemini 都填写本站根地址。',
      fields: [
        { label: c.fieldOpenAiClaudeBase, value: openAiBaseUrl.value },
        { label: c.fieldGeminiBase, value: geminiBaseUrl.value },
        { label: c.fieldKey, value: apiKeyPlaceholder },
      ],
      steps: [
        '编辑 ~/.config/opencode/opencode.jsonc。',
        'Claude、GPT、Gemini provider 都填写本站根地址。',
        '如果 API Key 已写在 provider options 里，auth.json 保持空对象即可。',
      ],
      blocks: [{ label: c.blockConfig, code: s.openCode }],
    },
    {
      id: 'cherry-studio',
      icon: 'grid',
      category: c.categoryAdvanced,
      title: 'Cherry Studio',
      desc: '按模型族分别创建自定义服务商，让 Cherry Studio 自己拼接正确请求路径。',
      fields: fields(c.fieldBaseUrl, rootBaseUrl.value, c.fieldKey, apiKeyPlaceholder, c.fieldModel, `${claudeModel} / ${openAiModel} / ${geminiModel}`),
      steps: [
        '打开设置 -> 模型服务 -> 添加。',
        '分别创建 Anthropic、OpenAI、Gemini 服务商，API 地址都填根地址。',
        '添加 Key 管理里展示的模型 ID，打开服务商开关，并执行内置测试。',
      ],
      blocks: [{ label: c.blockProvider, code: s.cherryStudio }],
    },
    {
      id: 'hermes',
      icon: 'sparkles',
      category: c.categoryAdvanced,
      title: 'Hermes',
      desc: '在 Windows 上安装 Hermes，然后为每个模型族选择 Custom endpoint，填入对应 Key 和模型。',
      fields: fields(c.fieldOpenAiClaudeBase, openAiBaseUrl.value, c.fieldKey, apiKeyPlaceholder, c.fieldModel, `${openAiModel} / ${claudeModel} / ${geminiModel}`),
      steps: [
        '拉取 Hermes，创建 uv 虚拟环境，安装依赖并启动 hermes。',
        '选择 Full setup，然后选择 Custom endpoint。',
        'Codex、Claude 和 Hermes 自定义 endpoint 配置都使用根地址，完成后用 /model 切换模型。',
      ],
      blocks: [
        { label: c.blockInstall, code: s.hermesInstall },
        { label: c.blockConfig, code: s.hermesConfig },
      ],
    },
  ] : [
    {
      id: 'ccswitch',
      icon: 'swap',
      category: c.categoryRecommended,
      title: 'CC Switch',
      desc: 'Use CC Switch first to manage AllCanCode Claude, Gemini, and Codex providers. It makes model switching and usage checks easier.',
      fields: fields(c.fieldBaseUrl, rootBaseUrl.value, c.fieldKey, apiKeyPlaceholder, c.fieldModel, `${claudeModel} / ${openAiModel} / ${geminiModel}`),
      steps: [
        'Create or reveal the full API key in Key management.',
        'Click “Import to CC Switch” in Key management to open the ccswitch import flow.',
        'Confirm Endpoint, API Key, App type, and model in CC Switch, then save the provider.',
        'Use the CC Switch managed provider from Claude Code, Gemini CLI, or Codex.',
      ],
      blocks: [{ label: c.blockConfig, code: s.ccSwitch }],
    },
    {
      id: 'claude-code',
      icon: 'terminal',
      category: c.categoryQuick,
      title: 'Claude Code',
      desc: 'Install Anthropic CLI and point it to this site with ANTHROPIC_BASE_URL and ANTHROPIC_AUTH_TOKEN.',
      fields: fields(c.fieldBaseUrl, rootBaseUrl.value, c.fieldKey, apiKeyPlaceholder, c.fieldModel, claudeModel),
      steps: [
        'Install Claude Code and verify the claude command works.',
        'Set ANTHROPIC_BASE_URL to the current API base URL and ANTHROPIC_AUTH_TOKEN to your full API key.',
        'Run claude inside your project directory and select the model allowed by the key.',
      ],
      blocks: [{ label: c.blockCli, code: s.claudeCode }],
    },
    {
      id: 'gemini-cli',
      icon: 'terminal',
      category: c.categoryQuick,
      title: 'Gemini CLI',
      desc: 'Install Google Gemini CLI and provide the gateway address, API key, and model through environment variables.',
      fields: fields(c.fieldBaseUrl, rootBaseUrl.value, c.fieldKey, apiKeyPlaceholder, c.fieldModel, geminiModel),
      steps: [
        'Install Gemini CLI and confirm gemini --version returns a version.',
        'Set GOOGLE_GEMINI_BASE_URL, GEMINI_API_KEY, and GEMINI_MODEL.',
        'Run a short gemini -p smoke test before using it in a project.',
      ],
      blocks: [{ label: c.blockCli, code: s.geminiCli }],
    },
    {
      id: 'codex',
      icon: 'cpu',
      category: c.categoryQuick,
      title: 'Codex',
      desc: 'Install Codex CLI and write config.toml plus auth.json so the CLI uses this site GPT key.',
      fields: fields(c.fieldBaseUrl, rootBaseUrl.value, c.fieldKey, apiKeyPlaceholder, c.fieldModel, openAiModel),
      steps: [
        'Install the latest Codex CLI.',
        'Create ~/.codex/config.toml and ~/.codex/auth.json with the current base URL and API key.',
        'Run codex in the target workspace and verify it can answer a short prompt.',
      ],
      blocks: [{ label: c.blockConfig, code: s.codex }],
    },
    {
      id: 'openclaw',
      icon: 'cloud',
      category: c.categoryAdvanced,
      title: 'OpenClaw',
      desc: 'Deploy OpenClaw, skip built-in model provider setup during onboarding, then inject this site provider config.',
      fields: fields(c.fieldBaseUrl, rootBaseUrl.value, c.fieldKey, apiKeyPlaceholder, c.fieldModel, claudeModel),
      steps: [
        'Install OpenClaw and complete onboarding with Telegram or your preferred channel.',
        'When asked for model provider during onboarding, skip it and configure the provider manually later.',
        'Edit ~/.openclaw/openclaw.json, add the provider config, and restart the gateway service.',
      ],
      blocks: [
        { label: c.blockInstall, code: s.openClawInstall },
        { label: c.blockConfig, code: s.openClawConfig },
      ],
    },
    {
      id: 'opencode',
      icon: 'document',
      category: c.categoryAdvanced,
      title: 'OpenCode',
      desc: 'Configure native provider blocks for Anthropic, OpenAI, and Gemini. Use the site root URL for every model family.',
      fields: [
        { label: c.fieldOpenAiClaudeBase, value: openAiBaseUrl.value },
        { label: c.fieldGeminiBase, value: geminiBaseUrl.value },
        { label: c.fieldKey, value: apiKeyPlaceholder },
      ],
      steps: [
        'Edit ~/.config/opencode/opencode.jsonc.',
        'Use the site root URL for Claude, GPT, and Gemini providers.',
        'Keep auth.json empty if the API key is already written in provider options.',
      ],
      blocks: [{ label: c.blockConfig, code: s.openCode }],
    },
    {
      id: 'cherry-studio',
      icon: 'grid',
      category: c.categoryAdvanced,
      title: 'Cherry Studio',
      desc: 'Create separate custom providers by model family so Cherry Studio can append the correct request path itself.',
      fields: fields(c.fieldBaseUrl, rootBaseUrl.value, c.fieldKey, apiKeyPlaceholder, c.fieldModel, `${claudeModel} / ${openAiModel} / ${geminiModel}`),
      steps: [
        'Open Settings -> Model Services -> Add.',
        'Create Anthropic, OpenAI, and Gemini providers separately, all using the root API address.',
        'Add the exact model ID from Key management, enable the provider switch, and run the built-in test.',
      ],
      blocks: [{ label: c.blockProvider, code: s.cherryStudio }],
    },
    {
      id: 'hermes',
      icon: 'sparkles',
      category: c.categoryAdvanced,
      title: 'Hermes',
      desc: 'Install Hermes on Windows, then choose Custom endpoint for each model family and enter the matching key and model.',
      fields: fields(c.fieldOpenAiClaudeBase, openAiBaseUrl.value, c.fieldKey, apiKeyPlaceholder, c.fieldModel, `${openAiModel} / ${claudeModel} / ${geminiModel}`),
      steps: [
        'Clone Hermes, create the uv virtual environment, install dependencies, and start hermes.',
        'Choose Full setup, then Custom endpoint.',
        'Use root endpoint values for Codex, Claude, and Hermes custom endpoint setup, then switch models with /model.',
      ],
      blocks: [
        { label: c.blockInstall, code: s.hermesInstall },
        { label: c.blockConfig, code: s.hermesConfig },
      ],
    },
  ]
})

function fields(baseLabel: string, base: string, keyLabel: string, key: string, modelLabel: string, model: string) {
  return [
    { label: baseLabel, value: base },
    { label: keyLabel, value: key },
    { label: modelLabel, value: model },
  ]
}

function stripApiSuffix(value: string): string {
  return value
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/api\/v1$/i, '')
    .replace(/\/api$/i, '')
}

function resolveRootBaseUrl(): string {
  const configured = stripApiSuffix(String(import.meta.env.VITE_PUBLIC_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || ''))
  if (/^https?:\/\//i.test(configured)) {
    return configured
  }
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin
  }
  return 'https://www.allcancode.dev'
}

async function copyText(text: string, key: string): Promise<void> {
  const ok = await copyToClipboard(text, copy.value.copied)
  if (!ok) return
  copiedKey.value = key
  window.clearTimeout(copiedTimer)
  copiedTimer = window.setTimeout(() => {
    copiedKey.value = ''
  }, 1600)
}

function scrollToGuide(id: string): void {
  if (typeof window === 'undefined') return

  const target = document.getElementById(id)
  if (!target) return

  const top = Math.max(target.getBoundingClientRect().top + window.scrollY - 92, 0)
  window.scrollTo({ top, behavior: 'smooth' })
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${id}`)
}
</script>

<style scoped>
.help-page {
  position: relative;
  z-index: 1;
  max-width: 1460px;
  margin: 0 auto;
  padding: 64px 40px 84px;
}

.help-page::before {
  position: absolute;
  z-index: -1;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 100vw;
  content: "";
  transform: translateX(-50%);
  background:
    radial-gradient(circle at 10% 0%, rgba(125, 211, 252, 0.13), transparent 30%),
    radial-gradient(circle at 88% 12%, rgba(246, 200, 95, 0.11), transparent 28%),
    linear-gradient(180deg, #040607 0%, #091017 52%, #050607 100%);
}

.help-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.06fr) minmax(360px, 0.94fr);
  gap: 28px;
  align-items: end;
  margin-bottom: 22px;
}

.eyebrow,
.section-head p,
.guide-head span {
  margin: 0;
  color: #7dd3fc;
  font-size: 12px;
  font-weight: 850;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.help-hero h1 {
  max-width: 760px;
  margin: 14px 0 0;
  background: linear-gradient(270deg, #fff 62%, rgba(125, 211, 252, 0.62) 100%);
  background-clip: text;
  color: #fff;
  font-size: clamp(42px, 6vw, 86px);
  font-weight: 560;
  line-height: 1.04;
  -webkit-text-fill-color: transparent;
}

.hero-desc {
  max-width: 680px;
  margin: 18px 0 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 17px;
  line-height: 1.75;
}

.hero-actions,
.copy-button,
.help-sidebar a,
.guide-head h3,
.snippet-head {
  display: flex;
  align-items: center;
}

.hero-actions {
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

.primary-link,
.ghost-link,
.copy-button {
  border-radius: 999px;
  font-size: 14px;
  font-weight: 900;
}

.primary-link,
.ghost-link {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 18px;
}

.primary-link {
  border: 1px solid #7dd3fc;
  background: #7dd3fc;
  color: #03131b;
}

.ghost-link,
.copy-button {
  border: 1px solid rgba(255, 255, 255, 0.26);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.copy-button {
  min-height: 36px;
  cursor: pointer;
  justify-content: center;
  gap: 7px;
  padding: 0 13px;
}

.copy-button.tiny {
  min-height: 32px;
  padding: 0 11px;
  font-size: 12px;
}

.base-panel,
.help-sidebar,
.prep-card,
.guide-card {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 8px;
  background: rgba(10, 17, 24, 0.74);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(14px);
}

.base-panel {
  padding: 22px;
}

.base-panel > span,
.base-panel p,
.field-grid small,
.guide-head p,
.step-list,
.prep-card p,
.sidebar-note,
.help-sidebar strong {
  color: rgba(255, 255, 255, 0.68);
}

.base-panel strong {
  display: block;
  margin-top: 10px;
  color: #fff;
  font-size: 24px;
  font-weight: 950;
  word-break: break-all;
}

.base-panel p {
  margin: 14px 0 0;
  line-height: 1.65;
}

.endpoint-list,
.field-grid,
.snippet-list {
  display: grid;
  gap: 10px;
}

.endpoint-list {
  margin: 18px 0;
}

.endpoint-list div,
.field-grid div {
  display: grid;
  gap: 6px;
  min-width: 0;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 8px;
  background: rgba(2, 7, 12, 0.48);
  padding: 12px;
}

code {
  color: #b8e7ff;
  font-family: "JetBrains Mono", "Fira Code", Consolas, monospace;
  font-size: 12px;
  word-break: break-all;
}

.help-layout {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}

.help-sidebar {
  position: sticky;
  top: 92px;
  display: grid;
  gap: 8px;
  padding: 16px;
}

.help-sidebar strong {
  display: block;
  margin-bottom: 4px;
  color: #fff;
  font-size: 14px;
  font-weight: 950;
}

.help-sidebar a {
  gap: 8px;
  border: 1px solid transparent;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.74);
  padding: 9px 10px;
  font-size: 13px;
  font-weight: 850;
}

.help-sidebar a:hover {
  border-color: rgba(125, 211, 252, 0.34);
  background: rgba(125, 211, 252, 0.12);
  color: #fff;
}

.sidebar-note {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  padding-top: 14px;
  font-size: 12px;
  line-height: 1.55;
}

.sidebar-note p {
  margin: 0;
}

.prep-section,
.guides-section {
  margin-top: 0;
}

.guides-section {
  display: grid;
  gap: 14px;
  margin-top: 16px;
}

.section-head {
  margin-bottom: 16px;
}

.section-head.split {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 18px;
}

.section-head h2 {
  margin: 6px 0 0;
  color: #fff;
  font-size: 30px;
  font-weight: 950;
}

.prep-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.prep-card {
  padding: 20px;
}

.prep-card span {
  color: #f6c85f;
  font-size: 13px;
  font-weight: 950;
}

.prep-card strong {
  display: block;
  margin-top: 16px;
  color: #fff;
  font-size: 22px;
  font-weight: 950;
}

.prep-card p {
  margin: 10px 0 0;
  line-height: 1.65;
}

.quick-nav {
  display: flex;
  max-width: 640px;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.quick-nav a {
  border: 1px solid rgba(125, 211, 252, 0.34);
  border-radius: 999px;
  background: rgba(125, 211, 252, 0.12);
  color: #b8e7ff;
  padding: 7px 10px;
  font-size: 12px;
  font-weight: 850;
}

.guide-card {
  scroll-margin-top: 92px;
  padding: 22px;
}

.guide-head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
}

.guide-head h3 {
  gap: 8px;
  margin: 6px 0 0;
  color: #fff;
  font-size: 24px;
  font-weight: 950;
}

.guide-head p {
  max-width: 780px;
  margin: 14px 0 0;
  line-height: 1.65;
}

.field-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 16px;
}

.step-list {
  display: grid;
  gap: 8px;
  margin: 16px 0 0;
  padding-left: 18px;
  line-height: 1.65;
}

.snippet-list {
  margin-top: 16px;
}

.snippet-card {
  overflow: hidden;
  border: 1px solid rgba(125, 211, 252, 0.22);
  border-radius: 8px;
  background: rgba(2, 7, 12, 0.52);
}

.snippet-head {
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 10px 12px;
}

.snippet-head strong {
  color: #fff;
  font-size: 13px;
  font-weight: 950;
}

.snippet {
  overflow: auto;
  max-height: 520px;
  margin: 0;
  background: rgba(0, 0, 0, 0.24);
  padding: 14px;
}

.snippet code {
  color: #e4f6ff;
  white-space: pre;
}

:global(.public-style-light .help-hero h1){
  background: none;
  color: #07140d;
  -webkit-text-fill-color: currentColor;
}

:global(.public-style-light .help-page::before){
  background:
    radial-gradient(circle at 8% 0%, rgba(96, 165, 250, 0.12), transparent 30%),
    radial-gradient(circle at 88% 12%, rgba(246, 200, 95, 0.14), transparent 28%),
    linear-gradient(180deg, #f8fafc 0%, #eef3f8 52%, #f8fafc 100%);
}

:global(.public-style-light .hero-desc),
:global(.public-style-light .base-panel > span),
:global(.public-style-light .base-panel p),
:global(.public-style-light .field-grid small),
:global(.public-style-light .guide-head p),
:global(.public-style-light .step-list),
:global(.public-style-light .prep-card p),
:global(.public-style-light .sidebar-note),
:global(.public-style-light .help-sidebar a),
:global(.public-style-light .help-sidebar strong){
  color: #475569;
}

:global(.public-style-light .base-panel),
:global(.public-style-light .help-sidebar),
:global(.public-style-light .prep-card),
:global(.public-style-light .guide-card){
  border-color: rgba(30, 64, 175, 0.14);
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow:
    0 18px 60px rgba(15, 23, 42, 0.12),
    inset 0 1px rgba(255, 255, 255, 0.9);
}

:global(.public-style-light .base-panel strong),
:global(.public-style-light .section-head h2),
:global(.public-style-light .prep-card strong),
:global(.public-style-light .guide-head h3),
:global(.public-style-light .snippet-head strong){
  color: #0f172a;
}

:global(.public-style-light .eyebrow),
:global(.public-style-light .section-head p),
:global(.public-style-light .guide-head span),
:global(.public-style-light .prep-card span){
  color: #1d4ed8;
}

:global(.public-style-light .ghost-link),
:global(.public-style-light .copy-button),
:global(.public-style-light .quick-nav a),
:global(.public-style-light .help-sidebar a:hover){
  border-color: rgba(30, 64, 175, 0.2);
  background: #eff6ff;
  color: #1d4ed8;
}

:global(.public-style-light .primary-link){
  border-color: #2563eb;
  background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%);
  color: #fff;
}

:global(.public-style-light .endpoint-list div),
:global(.public-style-light .field-grid div){
  border-color: rgba(30, 64, 175, 0.12);
  background: rgba(255, 255, 255, 0.88);
}

:global(.public-style-light code){
  color: #1d4ed8;
}

:global(.public-style-light .sidebar-note),
:global(.public-style-light .snippet-head){
  border-color: rgba(30, 64, 175, 0.16);
}

:global(.public-style-light .snippet-card){
  border-color: rgba(30, 64, 175, 0.18);
  background: #111827;
}

:global(.public-style-light .snippet){
  background: #111827;
}

:global(.public-style-light .snippet code){
  color: #e4f6ff;
  -webkit-text-fill-color: currentColor;
}

@media (max-width: 1080px) {
  .help-layout {
    grid-template-columns: 1fr;
  }

  .help-sidebar {
    position: static;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .help-sidebar strong,
  .sidebar-note {
    grid-column: 1 / -1;
  }
}

@media (max-width: 980px) {
  .help-hero {
    grid-template-columns: 1fr;
  }

  .section-head.split {
    align-items: flex-start;
    flex-direction: column;
  }

  .quick-nav {
    justify-content: flex-start;
  }
}

@media (max-width: 720px) {
  .help-page {
    padding: 42px 16px 64px;
  }

  .prep-grid,
  .field-grid,
  .help-sidebar {
    grid-template-columns: 1fr;
  }

  .guide-head {
    flex-direction: column;
  }
}
</style>
