# LeadMerlin MCP server

[![LeadMerlin MCP server](https://glama.ai/mcp/servers/HalberdLLC/leadmerlin-mcp/badges/score.svg)](https://glama.ai/mcp/servers/HalberdLLC/leadmerlin-mcp)

Find local businesses by niche and city from any MCP client (Claude, Cursor, VS Code, n8n…), with each one enriched: owner name, emails checked against the mail server, phone line type (mobile / landline / VoIP) and the tech its website runs.

- **Remote server (no install):** `https://api.leadmerlin.com/mcp` (Streamable HTTP)
- **Local stdio bridge:** `npx -y github:HalberdLLC/leadmerlin-mcp` (Node 18+, no dependencies)
- **Auth:** your LeadMerlin API key (`lm_...`) in the `x-api-key` header, or `Authorization: Bearer lm_...`. [Sign up](https://app.leadmerlin.com) for 100 free leads, no card.

## Tools

| Tool | What it does | Cost |
|---|---|---|
| `find_locations` | City / state / country → `location_code` | free |
| `suggest_keywords` | Niche → Google categories and sharper keywords | free |
| `start_search` | Search a niche in up to 5 locations, enrich every business. Returns a `job_id` | 1 credit per business with a website |
| `get_job` | Job status and counts (poll every ~5 s) | free |
| `get_results` | Enriched businesses, paginated | free |
| `enrich_domains` | Enrich up to 100 domains you already have | 1 credit per domain (recently enriched ones are free) |
| `get_usage` | Plan, credit balance, phone lookup allowance | free |
| `check_website_tech` | CMS, analytics, ad pixels, chat and booking tools on one site | free, no key needed |
| `find_website_emails` | Emails published on one site (homepage + contact/about/team pages), with source page and MX check | free, no key needed (daily cap) |

Businesses without a website and off-niche listings (a bar that matched "plumber" by coincidence) are never charged. Always pass `max_leads` to `start_search`.

## Setup

### Claude Code

```bash
claude mcp add --transport http leadmerlin https://api.leadmerlin.com/mcp --header "x-api-key: lm_your_key"
```

### Cursor / VS Code / Windsurf (remote)

```json
{
  "mcpServers": {
    "leadmerlin": {
      "url": "https://api.leadmerlin.com/mcp",
      "headers": { "x-api-key": "lm_your_key" }
    }
  }
}
```

### Claude Desktop and other stdio-only clients

```json
{
  "mcpServers": {
    "leadmerlin": {
      "command": "npx",
      "args": ["-y", "github:HalberdLLC/leadmerlin-mcp"],
      "env": { "LEADMERLIN_API_KEY": "lm_your_key" }
    }
  }
}
```

### n8n

Use the **MCP Client Tool** node with endpoint `https://api.leadmerlin.com/mcp`, transport *HTTP Streamable*, and header auth `x-api-key`.

## Example

> Find 25 roofing contractors in Denver, CO with an owner name and a verified email, and give me a table.

The agent calls `find_locations("Denver")` → `start_search({ keyword: "roofing contractor", location_codes: [1014485], max_leads: 25 })` → polls `get_job` → `get_results`.

## Links

- Docs and REST API: https://leadmerlin.com/docs/
- For agents (skill file, guardrails): https://leadmerlin.com/for-agents/
- OpenAPI: https://api.leadmerlin.com/api/v2/openapi.json
- Claude skill: https://github.com/HalberdLLC/leadmerlin-skill

MIT licensed. The bridge only forwards JSON-RPC to the hosted server; your key never leaves the request header.
