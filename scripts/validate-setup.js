#!/usr/bin/env node
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
const mysql = require('mysql2/promise');
const axios = require('axios');

const REQUIRED_TABLES = [
  'admin_users',
  'catalog_categories',
  'category_highlights',
  'products',
  'product_customizations',
  'product_finish_options',
  'product_materials',
  'product_media'
];

const ENDPOINTS = [
  '/api/catalog/categories',
  '/api/products',
  '/api/admin/login'
];

async function validateDatabase(connection) {
  console.log('\n🔎 Validando tabelas essenciais...');
  for (const table of REQUIRED_TABLES) {
    const [rows] = await connection.execute('SHOW TABLES LIKE ?', [table]);
    if (rows.length === 0) {
      throw new Error(`Tabela ausente: ${table}`);
    }
    console.log(`  • ${table}`);
  }
  console.log('✅ Todas as tabelas obrigatórias existem');

  console.log('\n🔎 Testando queries básicas...');
  const [produtos] = await connection.execute('SELECT id, name FROM products LIMIT 5');
  const [categorias] = await connection.execute('SELECT id, name FROM catalog_categories LIMIT 5');

  if (produtos.length === 0) throw new Error('Nenhum produto retornado da tabela products');
  if (categorias.length === 0) throw new Error('Nenhuma categoria retornada da tabela catalog_categories');

  console.log(`✅ Consulta de produtos retornou ${produtos.length} registros`);
  console.log(`✅ Consulta de categorias retornou ${categorias.length} registros`);
}

async function validateApiRoutes(baseUrl) {
  console.log('\n🔎 Validando rotas da API...');
  for (const endpoint of ENDPOINTS) {
    const url = `${baseUrl}${endpoint}`;
    try {
      const response = await axios.get(url);
      if (response.status !== 200) {
        throw new Error(`Status inesperado (${response.status})`);
      }
      console.log(`✅ Rota funcionando: ${endpoint}`);
    } catch (error) {
      console.error(`❌ Erro ao acessar ${url}: ${error.message}`);
    }
  }
}

async function main() {
  console.log('🔧 Iniciando verificação de consistência do ambiente...');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'winove-online',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'moveis'
  });

  console.log('✅ Conexão com banco de dados bem-sucedida');

  try {
    await validateDatabase(connection);
    await validateApiRoutes(process.env.VITE_API_BASE_URL || 'http://localhost:4000');
    console.log('\n🎉 Testes de consistência completos');
    process.exitCode = 0;
  } catch (error) {
    console.error(`\n❌ Falha na validação: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(`❌ Erro inesperado: ${error.message}`);
  process.exit(1);
});
