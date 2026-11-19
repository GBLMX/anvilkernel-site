export const SITE = {
  name: "Anvil",
  url: "https://anvilkernel.com",
  repo: "https://github.com/GBLMX/Anvil",
  version: "0.6.0",
  phase: "Pre-alpha",
  status: "源码构建优先 · Linux 优先 · 插件市场未开放",
  versionLabel: "0.6.0 基线 · 0.7.x 模块已落地",
  description:
    "Anvil 是 Linux 优先的终端编辑器：选择优先的 Rust 内核、按会话隔离的 Go 策略网关，以及独立插件宿主。",
};

export const NAV = [
  { href: "/install", label: "安装" },
  { href: "/docs", label: "文档" },
  { href: "/releases", label: "发布" },
  { href: "/plugins", label: "插件" },
  { href: "/#architecture", label: "架构" },
];

export const RELEASES = [
  {
    version: "0.6.0",
    label: "内部打磨基线",
    state: "current",
    detail:
      "选择优先内核、会话抽取、P0/P1 功能、多根路由和可选 0.7.x 模块已落地；版本仍处于冻结状态。",
  },
  {
    version: "Unreleased",
    label: "下一公开版本尚未选定",
    state: "unreleased",
    detail:
      "当前工作继续积累在 CHANGELOG 的 Unreleased 下。性能基线、发布签名和 marketplace 信任链完成前不会创建 tag。",
  },
];
