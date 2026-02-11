# codex-zin

ZIN için erken aşama monorepo başlangıcı.

## Documentation

- [ZIN Product Requirements Document](docs/ZIN-PRD.md)

## Workspace

- `apps/web`: Next.js 14 tabanlı web uygulaması (hızlı not yakalama + temel API, yerel JSON persistency, filtreleme, kullanıcı etiketleri ve type-temelli UI format ipuçları, inline etiket ekleme, not silme ve not istatistik kartları ve tarih aralığı filtreleme ve JSON yedek içe/dışa aktarma (birleştir/değiştir modları)).
- `packages/ai`: AI orchestrator için paylaşılabilir temel sınıflandırma iskeleti.
- `packages/database`: PRD şemasını yansıtan temel TypeScript veri tipleri.

## Quick start

```bash
pnpm install
pnpm dev
```

## Production notes

- Health check endpoint: `GET /api/health`
- Readiness check endpoint: `GET /api/ready` (storage write/read probe)
- Docker build:

```bash
docker build -t zin-web .
docker run --rm -p 3000:3000 zin-web
```

- Environment template: `.env.example`
- Opsiyonel admin koruması: `ADMIN_API_TOKEN` set edilirse silme ve backup import endpointleri `x-admin-token` header ister


## CI

- GitHub Actions workflow: `.github/workflows/ci.yml` (install, typecheck, build)
