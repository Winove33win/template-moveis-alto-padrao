# Catalog seed helpers

This directory contains the Prisma schema, migrations, and automation helpers for the catalog database.

## Dump SQL populado

Para gerar um dump SQL com os dados atuais do catálogo (categorias, produtos e tabelas auxiliares), execute:

```bash
cd server
npm run generate:sql
```

O comando lê os arquivos em `src/data/products.js` e cria `prisma/catalog_seed.sql` com instruções `INSERT` prontas para popular as tabelas necessárias. Antes dos inserts o arquivo inclui `TRUNCATE TABLE` para garantir que a carga seja idempotente em bancos de desenvolvimento.

Aplicação do dump em uma instância MariaDB/MySQL:

```bash
mysql moveis < prisma/catalog_seed.sql
```

> 💡 Sempre regenere o arquivo após alterações em `src/data/products.js` para manter o dump sincronizado com o seed automatizado.
