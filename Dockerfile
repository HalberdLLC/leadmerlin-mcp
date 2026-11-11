# stdio bridge to the hosted LeadMerlin MCP server. No dependencies.
# initialize / tools/list work without a key; set LEADMERLIN_API_KEY for tool calls.
FROM node:22-alpine
WORKDIR /app
COPY package.json ./
COPY bin ./bin
ENTRYPOINT ["node", "bin/leadmerlin-mcp.mjs"]
