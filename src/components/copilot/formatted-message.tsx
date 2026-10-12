"use client";

import React from "react";

/**
 * Sanitizes raw bot messages:
 * 1. Normalizes accidental **** or empty asterisks into valid markdown or removes them
 * 2. Cleans up excessive or consecutive emojis to maintain a professional, clean tone
 */
export function sanitizeBotMessage(raw: string): string {
  if (!raw) return "";

  let cleaned = raw;

  // Normalize ****text**** to **text**
  cleaned = cleaned.replace(/\*{4,}(.*?)\*{4,}/g, "**$1**");

  // Remove leftover empty 4+ asterisks (e.g. **** or ******)
  cleaned = cleaned.replace(/\*{4,}/g, "");

  // Remove empty double asterisks (e.g. ** **)
  cleaned = cleaned.replace(/\*\*\s*\*\*/g, "");

  // Emoji regex covering main unicode blocks
  const emojiRegex =
    /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1FA00}-\u{1FAFF}]/gu;

  // Collapse consecutive emojis (e.g. 🚀🔥💰 -> 🚀)
  cleaned = cleaned.replace(
    /([\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1FA00}-\u{1FAFF}]\s*){2,}/gu,
    (match) => {
      const firstEmoji = match.match(emojiRegex);
      return firstEmoji ? `${firstEmoji[0]} ` : "";
    }
  );

  // Limit total emojis to at most 2 across the entire message
  let emojiCount = 0;
  cleaned = cleaned.replace(emojiRegex, (match) => {
    emojiCount += 1;
    if (emojiCount <= 2) {
      return match;
    }
    return "";
  });

  // Clean redundant whitespace
  cleaned = cleaned.replace(/ {2,}/g, " ");

  return cleaned.trim();
}

/**
 * Parses inline markdown tokens (bold, italic, code) into React elements.
 * Supports partial streaming without showing raw asterisks.
 */
export function parseInlineMarkdown(text: string, isStreaming = false): React.ReactNode[] {
  if (!text) return [];

  let workingText = text;
  let hasIncompleteBold = false;

  // Check for unclosed ** during streaming
  const boldMarkers = workingText.match(/\*\*/g);
  if (isStreaming && boldMarkers && boldMarkers.length % 2 === 1) {
    hasIncompleteBold = true;
  }

  let tailBoldContent: string | null = null;
  if (hasIncompleteBold) {
    const lastBoldIndex = workingText.lastIndexOf("**");
    tailBoldContent = workingText.slice(lastBoldIndex + 2);
    workingText = workingText.slice(0, lastBoldIndex);
  }

  const parts: React.ReactNode[] = [];
  const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(workingText)) !== null) {
    if (match.index > lastIndex) {
      parts.push(workingText.slice(lastIndex, match.index));
    }

    const token = match[0];
    const key = `inline-${match.index}`;

    if (token.startsWith("**") && token.endsWith("**")) {
      const inner = token.slice(2, -2);
      parts.push(
        <strong key={key} className="font-bold text-slate-900 dark:text-white">
          {inner}
        </strong>
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      const inner = token.slice(1, -1);
      parts.push(
        <code
          key={key}
          className="px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-700/60 text-xs font-mono text-blue-600 dark:text-blue-400"
        >
          {inner}
        </code>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      const inner = token.slice(1, -1);
      parts.push(
        <em key={key} className="italic font-medium">
          {inner}
        </em>
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < workingText.length) {
    parts.push(workingText.slice(lastIndex));
  }

  if (tailBoldContent !== null && tailBoldContent.length > 0) {
    parts.push(
      <strong key="tail-bold" className="font-bold text-slate-900 dark:text-white">
        {tailBoldContent}
      </strong>
    );
  }

  return parts;
}

/**
 * Renders full markdown text (lines, bullet points, numbered lists, inline formatting).
 */
export function renderFormattedMarkdown(text: string, isStreaming = false): React.ReactNode {
  if (!text) return null;

  const lines = text.split("\n");

  return (
    <div className="space-y-1">
      {lines.map((line, lineIndex) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={`spacer-${lineIndex}`} className="h-1" />;
        }

        // Bullet point check (- item, * item, • item)
        const bulletMatch = line.match(/^(\s*)([-*•])\s+(.+)$/);
        if (bulletMatch) {
          const content = bulletMatch[3];
          return (
            <div key={`bullet-${lineIndex}`} className="flex items-start gap-2 my-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 mt-2 shrink-0" />
              <div className="flex-1 min-w-0 leading-relaxed">
                {parseInlineMarkdown(content, isStreaming)}
              </div>
            </div>
          );
        }

        // Numbered list check (1. item)
        const numberedMatch = line.match(/^(\s*)(\d+)\.\s+(.+)$/);
        if (numberedMatch) {
          const num = numberedMatch[2];
          const content = numberedMatch[3];
          return (
            <div key={`num-${lineIndex}`} className="flex items-start gap-2 my-0.5">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5 shrink-0">
                {num}.
              </span>
              <div className="flex-1 min-w-0 leading-relaxed">
                {parseInlineMarkdown(content, isStreaming)}
              </div>
            </div>
          );
        }

        // Standard paragraph line
        return (
          <p key={`p-${lineIndex}`} className="leading-relaxed">
            {parseInlineMarkdown(line, isStreaming)}
          </p>
        );
      })}
    </div>
  );
}

export interface FormattedBotMessageProps {
  text: string;
  isStreaming?: boolean;
  className?: string;
}

/**
 * React Component for presenting cleanly parsed, professional Bot messages.
 */
export function FormattedBotMessage({
  text,
  isStreaming = false,
  className = "",
}: FormattedBotMessageProps) {
  const sanitized = React.useMemo(() => sanitizeBotMessage(text), [text]);
  const content = React.useMemo(
    () => renderFormattedMarkdown(sanitized, isStreaming),
    [sanitized, isStreaming]
  );

  return <div className={className}>{content}</div>;
}
