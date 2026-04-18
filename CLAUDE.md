@AGENTS.md

# Crymad Cash — Dashboard Platform

## Knowledge Graph
- A graphify knowledge graph exists at `graphify-out/graph.json`
- Check the graph BEFORE manually searching the codebase
- Use `/graphify query "question"` to search the graph
- Use `/graphify path "X" "Y"` to find connections between code entities
- The graph auto-updates on git commit via `.git/hooks/post-commit`
- Current graph: ~83 nodes, ~59 edges across 36 source files

## Project Structure
- Next.js App Router (no Tailwind — all styling via inline styles + globals.css)
- CSS theme system: `data-theme="dark"` (Emerald Pulse) and `data-theme="light"` (Arctic Light)
- All CSS variables defined in `src/app/globals.css` from HYBRID-FINAL.html design
- Dashboard layout at `src/app/(dashboard)/layout.tsx` — includes TopNav, TabBar, LivingBackground
- Auth layout at `src/app/(auth)/layout.tsx` — centered glass card
- Reusable components: `src/components/dashboard/TabBar.tsx`, `src/components/ui/FilterDropdown.tsx`

## API (Future)
- Backend: TygaBank/TygaPay API (74 endpoints)
- Postman collection at: `C:\Users\HP\Downloads\APIs.postman_collection.json`
- API proxy routes will go in `src/app/api/` to keep api-secret server-side
- Deploy via Railway for secure env var management
