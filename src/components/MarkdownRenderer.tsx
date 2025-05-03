"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import ReactMarkdown from "react-markdown";
import CodeBlock from "./CodeBlock";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Enhanced processor for think tags that works directly with HTML
  return (
    <div
      className="prose prose-slate prose-p:text-gray-800 prose-headings:text-gray-900 prose-strong:font-semibold max-w-none"
      suppressHydrationWarning
    >
      {/* Pre-process the content to replace <think> tags with styled divs */}
      {content.split(/<think>|<\/think>/).map((part, index) => {
        // Even indices are regular content, odd indices are think content
        if (index % 2 === 0) {
          // Regular content - render with markdown
          return part ? (
            <ReactMarkdown
              key={`content-${index}`}
              components={{
                code({ inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  const language = match && match[1] ? match[1] : "";

                  if (!inline && language) {
                    return (
                      <CodeBlock
                        language={language}
                        value={String(children).replace(/\n$/, "")}
                        {...props}
                      />
                    );
                  }

                  return inline ? (
                    <code
                      className="bg-gray-100 text-blue-700 rounded px-1.5 py-0.5 text-sm font-medium"
                      suppressHydrationWarning
                      {...props}
                    >
                      {children}
                    </code>
                  ) : (
                    <CodeBlock
                      language="text"
                      value={String(children).replace(/\n$/, "")}
                      {...props}
                    />
                  );
                },
                p({ children }: any) {
                  const containsCodeBlock = React.Children.toArray(
                    children
                  ).some(
                    (child) =>
                      React.isValidElement(child) &&
                      (child.type === CodeBlock ||
                        (typeof child.type === "function" &&
                          child.type.name === "CodeBlock"))
                  );

                  if (containsCodeBlock) {
                    return <>{children}</>;
                  }

                  return (
                    <p
                      className="mb-4 text-gray-800 leading-relaxed"
                      suppressHydrationWarning
                    >
                      {children}
                    </p>
                  );
                },
                h1({ children }: any) {
                  return (
                    <h1
                      className="text-2xl font-bold mb-4 text-gray-900"
                      suppressHydrationWarning
                    >
                      {children}
                    </h1>
                  );
                },
                h2({ children }: any) {
                  return (
                    <h2
                      className="text-xl font-bold mb-3 text-gray-900"
                      suppressHydrationWarning
                    >
                      {children}
                    </h2>
                  );
                },
                h3({ children }: any) {
                  return (
                    <h3
                      className="text-lg font-bold mb-2 text-gray-900"
                      suppressHydrationWarning
                    >
                      {children}
                    </h3>
                  );
                },
                ul({ children }: any) {
                  return (
                    <ul
                      className="list-disc pl-5 mb-4 text-gray-800"
                      suppressHydrationWarning
                    >
                      {children}
                    </ul>
                  );
                },
                ol({ children }: any) {
                  return (
                    <ol
                      className="list-decimal pl-5 mb-4 text-gray-800"
                      suppressHydrationWarning
                    >
                      {children}
                    </ol>
                  );
                },
                li({ children }: any) {
                  return (
                    <li className="mb-1 text-gray-800" suppressHydrationWarning>
                      {children}
                    </li>
                  );
                },
                blockquote({ children }: any) {
                  return (
                    <blockquote
                      className="border-l-4 border-blue-300 pl-4 italic my-4 text-gray-700"
                      suppressHydrationWarning
                    >
                      {children}
                    </blockquote>
                  );
                },
                a({ href, children }: any) {
                  return (
                    <a
                      href={href}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      suppressHydrationWarning
                    >
                      {children}
                    </a>
                  );
                },
                pre({ children }: any) {
                  return <div suppressHydrationWarning>{children}</div>;
                },
              }}
            >
              {part}
            </ReactMarkdown>
          ) : null;
        } else {
          // Think content - render in a styled div
          return (
            <div
              key={`think-${index}`}
              className="bg-gray-100 p-4 rounded-md my-4 text-gray-600 text-sm font-mono leading-relaxed"
              suppressHydrationWarning
            >
              <div
                className="font-semibold text-gray-700 mb-2"
                suppressHydrationWarning
              >
                AI Thinking Process:
              </div>
              {part.split("\n").map((line: string, i: number) => (
                <p key={i} className="mb-2 last:mb-0" suppressHydrationWarning>
                  {line}
                </p>
              ))}
            </div>
          );
        }
      })}
    </div>
  );
}
