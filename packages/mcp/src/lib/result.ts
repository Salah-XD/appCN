import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

/** Wrap a value as a pretty-printed JSON tool result (the form agents parse best). */
export function json(data: unknown): CallToolResult {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

/** A tool error result with a human-readable message. */
export function errorResult(message: string): CallToolResult {
  return { content: [{ type: "text", text: message }], isError: true };
}
