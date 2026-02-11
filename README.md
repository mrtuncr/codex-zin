# codex-zin

ZIN için erken aşama monorepo başlangıcı.

## Documentation

- [ZIN Product Requirements Document](docs/ZIN-PRD.md)

## Workspace

- `apps/web`: Next.js 14 tabanlı web uygulaması (hızlı not yakalama + temel API, yerel JSON persistency, filtreleme, kullanıcı etiketleri ve type-temelli UI format ipuçları, inline etiket ekleme ve not silme).
- `packages/ai`: AI orchestrator için paylaşılabilir temel sınıflandırma iskeleti.
- `packages/database`: PRD şemasını yansıtan temel TypeScript veri tipleri.

## Quick start

```bash
pnpm install
pnpm dev
```
