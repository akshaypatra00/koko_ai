
import React, { useState, useMemo } from "react";
import {
  Copy,
  Check,
  Code2,
  FileText,
  Terminal,
  Download,
  Sparkles,
  Eye,
  Brain,
} from "lucide-react";

/* ──────────────────────────────────────────────
   SYNTAX HIGHLIGHTER
   ────────────────────────────────────────────── */

function highlightCodeLine(line) {
  let out = line
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Comments
  out = out.replace(
    /(\/\/.*$|#.*$|\/\*[\s\S]*?\*\/)/g,
    '<span class="text-zinc-500 italic">$1</span>'
  );

  // Strings
  out = out.replace(
    /(['"`](?:\\.|[^\\])*?['"`])/g,
    '<span class="text-emerald-400">$1</span>'
  );

  // Keywords
  out = out.replace(
    /\b(const|let|var|function|return|import|export|from|default|class|extends|async|await|try|catch|finally|if|else|switch|case|break|for|while|do|new|this|typeof|instanceof|interface|type|enum|def|public|private|protected|static|abstract|readonly|yield|super|delete|in|of|throw|void)\b/g,
    '<span class="text-purple-400 font-semibold">$1</span>'
  );

  // Values
  out = out.replace(
    /\b(true|false|null|undefined|None|True|False|\d+(?:\.\d+)?)\b/g,
    '<span class="text-amber-400">$1</span>'
  );

  // Types
  out = out.replace(
    /\b(string|number|boolean|any|void|never|object|Promise|Array|Record|Map|Set|Object|Function|Error|Date|T|K|V)\b/g,
    '<span class="text-sky-300">$1</span>'
  );

  return out;
}

/* ──────────────────────────────────────────────
   INLINE MARKDOWN
   ────────────────────────────────────────────── */

function formatInlineMarkdown(text) {
  if (!text) return "";

  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

    // Inline code
    .replace(
      /`([^`]+)`/g,
      '<code class="px-1.5 py-0.5 rounded-md bg-white/10 text-emerald-300 font-mono text-[11px] border border-white/10">$1</code>'
    )

    // Bold
    .replace(
      /\*\*([^*]+)\*\*/g,
      '<strong class="font-bold text-white">$1</strong>'
    )

    // Italic
    .replace(
      /\*([^*]+)\*/g,
      '<em class="italic text-white/80">$1</em>'
    )

    // Strikethrough
    .replace(
      /~~([^~]+)~~/g,
      '<del class="line-through text-white/40">$1</del>'
    )

    // Links
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noreferrer" class="text-blue-400 hover:text-blue-300 underline underline-offset-2">$1</a>'
    );
}

/* ──────────────────────────────────────────────
   CODE BLOCK COMPONENT
   ────────────────────────────────────────────── */

export function CodeBlock({
  language = "javascript",
  code,
  title,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const lines = useMemo(
    () => (code || "").trim().split("\n"),
    [code]
  );

  const lang = (language || "code").toLowerCase();

  const langColor =
    {
      javascript: "text-yellow-400",
      js: "text-yellow-400",
      typescript: "text-blue-400",
      ts: "text-blue-400",
      python: "text-sky-400",
      py: "text-sky-400",
      html: "text-orange-400",
      css: "text-pink-400",
      json: "text-emerald-400",
      bash: "text-green-400",
      sh: "text-green-400",
      sql: "text-purple-400",
      rust: "text-orange-500",
      go: "text-cyan-400",
    }[lang] || "text-blue-300";

  return (
    <div className="my-4 rounded-2xl border border-white/10 bg-[#060a12] overflow-hidden shadow-2xl group">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.07] bg-white/[0.03]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
          </div>

          <div className="flex items-center gap-1.5">
            <Terminal className="w-3 h-3 text-white/30" />

            <span
              className={`text-[11px] font-mono font-bold uppercase tracking-wider ${langColor}`}
            >
              {lang}
            </span>

            {title && (
              <span className="text-[10px] font-mono text-white/30 ml-1">
                · {title}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono bg-white/[0.04] hover:bg-blue-600/20 border border-white/[0.08] hover:border-blue-500/40 text-white/60 hover:text-white transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">
                Copied!
              </span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <div className="overflow-x-auto p-4 text-xs font-mono leading-[1.7] custom-scroll">
        <table className="w-full border-collapse min-w-0">
          <tbody>
            {lines.map((line, idx) => (
              <tr
                key={idx}
                className="hover:bg-white/[0.015] group/row"
              >
                <td className="select-none pr-5 text-right text-white/20 font-mono text-[10px] w-8 shrink-0 align-top pt-px group-hover/row:text-white/40 transition-colors">
                  {idx + 1}
                </td>

                <td
                  className="text-white/90 whitespace-pre font-mono"
                  dangerouslySetInnerHTML={{
                    __html: highlightCodeLine(line),
                  }}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   MARKDOWN TABLE
   ────────────────────────────────────────────── */

function MarkdownTable({ lines }) {
  const rows = lines
    .filter((l) => l.trim().startsWith("|"))
    .map((l) =>
      l
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim())
    );

  if (rows.length < 2) return null;

  const header = rows[0];
  const body = rows.slice(2);

  return (
    <div className="my-4 overflow-x-auto rounded-xl border border-white/10 bg-black/40 shadow-md">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-white/15 bg-white/[0.04]">
            {header.map((col, idx) => (
              <th
                key={idx}
                className="p-3 font-semibold text-white font-mono text-[11px]"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {body.map((row, rIdx) => (
            <tr
              key={rIdx}
              className="border-b border-white/5 hover:bg-white/[0.02]"
            >
              {row.map((cell, cIdx) => (
                <td
                  key={cIdx}
                  className="p-3 text-white/80 text-[11px]"
                  dangerouslySetInnerHTML={{
                    __html: formatInlineMarkdown(cell),
                  }}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ──────────────────────────────────────────────
   PROMPTIMIZATION INSPECTOR
   ────────────────────────────────────────────── */

export function PromptimizationInspector({
  telemetry,
}) {
  const data =
    telemetry && telemetry.promptOptimization;

  if (!data) return null;

  return (
    <div className="mt-3 p-4 rounded-2xl bg-[#060913] border border-emerald-500/25 text-xs text-left space-y-3.5 shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          </div>

          <div>
            <div className="font-semibold text-white flex items-center gap-1.5">
              <span>
                Promptimization Engine
              </span>

              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase tracking-wider">
                Active
              </span>
            </div>

            <div className="text-[10px] text-white/40 mt-0.5">
              Intent vectors decomposed and
              constraints injected
            </div>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-white/60">
          Complexity:{" "}
          <strong className="text-emerald-300 uppercase">
            {data.complexity || "Standard"}
          </strong>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-black/50 border border-red-500/20 space-y-1.5">
          <div className="text-[10px] font-mono text-red-400 font-semibold uppercase tracking-wider">
            Raw Human Query
          </div>

          <div className="text-xs text-white/80 font-mono leading-relaxed">
            "{data.rawInput || "User query"}"
          </div>
        </div>

        <div className="p-3 rounded-xl bg-black/50 border border-emerald-500/25 space-y-1.5">
          <div className="text-[10px] font-mono text-emerald-400 font-semibold uppercase tracking-wider">
            Optimized System Context
          </div>

          <div className="text-xs text-white/80 font-mono leading-relaxed max-h-24 overflow-y-auto custom-scroll whitespace-pre-wrap">
            {data.systemInstruction ||
              "Enterprise constraints injected"}
          </div>
        </div>
      </div>

      {data.inferredVectors &&
        data.inferredVectors.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-0.5">
            <span className="text-[10px] font-mono text-white/35">
              Vectors:
            </span>

            {data.inferredVectors.map(
              (v, i) => (
                <span
                  key={i}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/25 text-blue-300"
                >
                  +{v}
                </span>
              )
            )}
          </div>
        )}

      {data.injectedMemories &&
        data.injectedMemories.length > 0 && (
          <div className="pt-1 border-t border-white/5 text-[11px] text-purple-300 font-mono flex items-center gap-2">
            <Brain className="w-3.5 h-3.5 text-purple-400 shrink-0" />

            <span>
              Injected memory:{" "}
              {data.injectedMemories.join(" · ")}
            </span>
          </div>
        )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   DOCUMENT RENDERER
   ────────────────────────────────────────────── */

function renderDocument(content) {
  const blocks = [];

  const codeRegex =
    /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;

  let lastIndex = 0;
  let match;

  while ((match = codeRegex.exec(content)) !== null) {
    const textBefore = content.slice(
      lastIndex,
      match.index
    );

    if (textBefore.trim()) {
      blocks.push({
        type: "text",
        text: textBefore,
      });
    }

    blocks.push({
      type: "code",
      language: match[1] || "javascript",
      code: match[2].trim(),
    });

    lastIndex =
      match.index + match[0].length;
  }

  const remaining =
    content.slice(lastIndex);

  if (remaining.trim()) {
    blocks.push({
      type: "text",
      text: remaining,
    });
  }

  if (blocks.length === 0) {
    blocks.push({
      type: "text",
      text: content,
    });
  }

  return (
    <div className="space-y-2">
      {blocks.map((b, i) => {
        if (b.type === "code") {
          return (
            <CodeBlock
              key={i}
              language={b.language}
              code={b.code}
            />
          );
        }

        const lines = b.text.split("\n");
        const elements = [];
        let tableBuffer = [];

        for (
          let idx = 0;
          idx < lines.length;
          idx++
        ) {
          const line = lines[idx];

          if (
            line.trim().startsWith("|") &&
            line.trim().endsWith("|")
          ) {
            tableBuffer.push(line);
            continue;
          } else if (
            tableBuffer.length > 0
          ) {
            elements.push(
              <MarkdownTable
                key={`tbl-${idx}`}
                lines={tableBuffer}
              />
            );

            tableBuffer = [];
          }

          if (line.startsWith("### ")) {
            elements.push(
              <h3
                key={idx}
                className="text-sm font-semibold text-white pt-3 pb-1 flex items-center gap-1.5"
              >
                <span className="w-1 h-4 rounded-full bg-blue-500 shrink-0" />

                <span
                  dangerouslySetInnerHTML={{
                    __html:
                      formatInlineMarkdown(
                        line.slice(4)
                      ),
                  }}
                />
              </h3>
            );
          } else if (
            line.startsWith("## ")
          ) {
            elements.push(
              <h2
                key={idx}
                className="text-base font-bold text-white pt-4 pb-1.5 border-b border-white/10 flex items-center gap-2"
              >
                <span className="w-1.5 h-5 rounded-full bg-blue-400 shrink-0" />

                <span
                  dangerouslySetInnerHTML={{
                    __html:
                      formatInlineMarkdown(
                        line.slice(3)
                      ),
                  }}
                />
              </h2>
            );
          } else if (
            line.startsWith("# ")
          ) {
            elements.push(
              <h1
                key={idx}
                className="text-lg font-bold text-white pt-4 pb-2 border-b border-blue-500/30"
                dangerouslySetInnerHTML={{
                  __html:
                    formatInlineMarkdown(
                      line.slice(2)
                    ),
                }}
              />
            );
          } else if (
            line.startsWith("> ")
          ) {
            elements.push(
              <blockquote
                key={idx}
                className="pl-3.5 py-1.5 my-2 border-l-2 border-blue-500/60 bg-blue-950/20 rounded-r-xl text-white/80 italic text-xs"
                dangerouslySetInnerHTML={{
                  __html:
                    formatInlineMarkdown(
                      line.slice(2)
                    ),
                }}
              />
            );
          } else if (
            line.startsWith("- ") ||
            line.startsWith("* ")
          ) {
            elements.push(
              <div
                key={idx}
                className="flex items-start gap-2 text-sm text-white/90 pl-1 my-1"
              >
                <span className="text-blue-400 font-bold mt-1.5 shrink-0 text-xs">
                  •
                </span>

                <span
                  dangerouslySetInnerHTML={{
                    __html:
                      formatInlineMarkdown(
                        line.slice(2)
                      ),
                  }}
                />
              </div>
            );
          } else if (
            /^\d+\.\s/.test(line)
          ) {
            const numMatch =
              line.match(
                /^(\d+)\.\s(.*)/
              );

            if (numMatch) {
              elements.push(
                <div
                  key={idx}
                  className="flex items-start gap-2.5 text-sm text-white/90 pl-1 my-1.5"
                >
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-bold shrink-0 mt-0.5 min-w-[20px] text-center">
                    {numMatch[1]}
                  </span>

                  <span
                    dangerouslySetInnerHTML={{
                      __html:
                        formatInlineMarkdown(
                          numMatch[2]
                        ),
                    }}
                  />
                </div>
              );
            }
          } else if (
            line.trim() === "---" ||
            line.trim() === "***"
          ) {
            elements.push(
              <hr
                key={idx}
                className="border-white/[0.08] my-4"
              />
            );
          } else if (line.trim()) {
            elements.push(
              <p
                key={idx}
                className="text-sm text-white/90 leading-relaxed my-1"
                dangerouslySetInnerHTML={{
                  __html:
                    formatInlineMarkdown(line),
                }}
              />
            );
          } else {
            elements.push(
              <div
                key={idx}
                className="h-2"
              />
            );
          }
        }

        if (tableBuffer.length > 0) {
          elements.push(
            <MarkdownTable
              key="tbl-end"
              lines={tableBuffer}
            />
          );
        }

        return (
          <div key={i}>
            {elements}
          </div>
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────
   MAIN MESSAGE CONTENT
   ────────────────────────────────────────────── */

export function MessageContent({
  message,
  role,
  onSaveMemory,
}) {
  const content = message.content || "";

  const isAssistant =
    role === "assistant" ||
    message.role === "assistant";

  const codeSnippets = useMemo(() => {
    const snippets = [];

    const regex =
      /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;

    let m;

    while ((m = regex.exec(content)) !== null) {
      snippets.push({
        language: m[1] || "javascript",
        code: m[2].trim(),
      });
    }

    return snippets;
  }, [content]);

  const hasCode =
    codeSnippets.length > 0;

  const defaultTab = (() => {
    if (!hasCode) {
      return "document";
    }

    const codeLen =
      codeSnippets.reduce(
        (acc, s) =>
          acc + s.code.length,
        0
      );

    if (
      message.response_type ===
      "code" ||
      codeLen > content.length * 0.35
    ) {
      return "code";
    }

    return "document";
  })();

  const [activeTab, setActiveTab] =
    useState(defaultTab);

  const [
    showPromptimization,
    setShowPromptimization,
  ] = useState(false);

  const [copiedAll, setCopiedAll] =
    useState(false);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(
      content
    );

    setCopiedAll(true);

    setTimeout(() => {
      setCopiedAll(false);
    }, 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], {
      type: "text/markdown",
    });

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;
    a.download = `koko-${Date.now()}.md`;

    a.click();

    URL.revokeObjectURL(url);
  };

  const tabs = [
    {
      id: "document",
      label: "Document",
      icon: FileText,
    },

    ...(hasCode
      ? [
        {
          id: "code",
          label: `Code (${codeSnippets.length})`,
          icon: Code2,
        },
      ]
      : []),

    {
      id: "raw",
      label: "Raw",
      icon: Eye,
    },
  ];

  return (
    <div className="space-y-2 w-full">
      {isAssistant && (
        <>
          <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] pb-2.5 mb-3">
            <div className="flex items-center gap-0.5 bg-white/[0.03] p-0.5 rounded-xl border border-white/[0.08]">
              {tabs.map(
                ({
                  id,
                  label,
                  icon: Icon,
                }) => (
                  <button
                    key={id}
                    onClick={() =>
                      setActiveTab(id)
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all cursor-pointer ${activeTab === id
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-white/50 hover:text-white/80 hover:bg-white/[0.05]"
                      }`}
                  >
                    <Icon className="w-3 h-3" />

                    <span>
                      {label}
                    </span>
                  </button>
                )
              )}
            </div>

            <div className="flex items-center gap-1">
              {message.telemetry &&
                message.telemetry
                  .promptOptimization && (
                  <button
                    onClick={() =>
                      setShowPromptimization(
                        !showPromptimization
                      )
                    }
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-mono text-[10px] transition-all cursor-pointer border ${showPromptimization
                        ? "bg-emerald-600/25 border-emerald-500/50 text-emerald-300 font-semibold"
                        : "bg-white/[0.03] border-white/[0.08] text-emerald-400/80 hover:text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-500/30"
                      }`}
                    title="Toggle Promptimization Inspector"
                  >
                    <Sparkles className="w-3 h-3" />

                    <span>
                      Promptimized
                    </span>
                  </button>
                )}

              <button
                onClick={handleCopyAll}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.07] transition-colors"
                title="Copy entire response"
              >
                {copiedAll ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                onClick={handleDownload}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.07] transition-colors"
                title="Download as Markdown"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {showPromptimization && (
            <PromptimizationInspector
              telemetry={message.telemetry}
            />
          )}
        </>
      )}

      {activeTab === "code" &&
        hasCode ? (
        <div className="space-y-4">
          <div className="text-[11px] font-mono text-white/35 flex items-center gap-1.5 pb-1">
            <Code2 className="w-3.5 h-3.5 text-blue-400" />

            <span className="text-blue-400">
              {codeSnippets.length} code{" "}
              {codeSnippets.length === 1
                ? "block"
                : "blocks"}{" "}
              —
            </span>

            <span>
              syntax highlighted,
              production-ready
            </span>
          </div>

          {codeSnippets.map(
            (snippet, idx) => (
              <CodeBlock
                key={idx}
                language={
                  snippet.language
                }
                code={snippet.code}
                title={
                  codeSnippets.length > 1
                    ? `${idx + 1} of ${codeSnippets.length}`
                    : undefined
                }
              />
            )
          )}
        </div>
      ) : activeTab === "raw" ? (
        <div className="p-4 rounded-xl bg-black/50 border border-white/[0.08] font-mono text-xs text-white/75 whitespace-pre-wrap leading-relaxed overflow-x-auto">
          {content}
        </div>
      ) : (
        renderDocument(content)
      )}
    </div>
  );
}

