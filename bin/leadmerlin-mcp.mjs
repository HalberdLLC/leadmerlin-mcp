#!/usr/bin/env node
// stdio <-> Streamable HTTP bridge for the LeadMerlin MCP server.
// Reads newline-delimited JSON-RPC from stdin, forwards each message to
// https://api.leadmerlin.com/mcp with your API key, writes replies to stdout.
// No dependencies. Needs Node 18+ and LEADMERLIN_API_KEY (lm_...).

import { createInterface } from 'node:readline';

const URL_ = process.env.LEADMERLIN_MCP_URL || 'https://api.leadmerlin.com/mcp';
const KEY = process.env.LEADMERLIN_API_KEY || '';
if (!KEY) console.error('[leadmerlin-mcp] LEADMERLIN_API_KEY is not set: tools/list works, tool calls will ask for a key. Get one (100 free leads) at https://app.leadmerlin.com');

const write = (msg) => process.stdout.write(JSON.stringify(msg) + '\n');
const errorFor = (msg, text) =>
  msg && msg.id !== undefined && msg.id !== null ? { jsonrpc: '2.0', id: msg.id, error: { code: -32603, message: text } } : null;

async function forward(line) {
  let msg;
  try {
    msg = JSON.parse(line);
  } catch {
    write({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } });
    return;
  }
  try {
    const res = await fetch(URL_, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream',
        ...(KEY ? { 'x-api-key': KEY } : {}),
      },
      body: JSON.stringify(msg),
    });
    if (res.status === 202) return; // notification accepted
    const text = await res.text();
    if (!text) return;
    try {
      write(JSON.parse(text));
    } catch {
      const e = errorFor(msg, `Unexpected response (HTTP ${res.status}): ${text.slice(0, 300)}`);
      if (e) write(e);
    }
  } catch (err) {
    const e = errorFor(msg, `Could not reach ${URL_}: ${err.message}`);
    if (e) write(e);
  }
}

// Keep replies in request order.
let chain = Promise.resolve();
createInterface({ input: process.stdin }).on('line', (line) => {
  if (!line.trim()) return;
  chain = chain.then(() => forward(line));
});
