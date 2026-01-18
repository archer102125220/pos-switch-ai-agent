import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  // Exclude Sequelize and database drivers from bundling (they're server-only)
  serverExternalPackages: [
    'sequelize',
    'mysql2',
    'pg',
    'pg-hstore',
    'tedious',
    'sqlite3',
    'better-sqlite3',
    'oracledb',
    'mariadb',
  ],
};

export default withNextIntl(nextConfig);
