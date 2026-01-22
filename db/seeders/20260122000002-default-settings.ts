import { QueryInterface } from "sequelize";

export async function up(queryInterface: QueryInterface) {
  await queryInterface.bulkInsert("settings", [
    {
      store_id: null,
      key: "store_name",
      value: "POS Switch",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      store_id: null,
      key: "store_address",
      value: "台北市信義區信義路五段7號",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      store_id: null,
      key: "store_phone",
      value: "02-1234-5678",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      store_id: null,
      key: "tax_rate",
      value: "5",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      store_id: null,
      key: "tax_included",
      value: "true",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      store_id: null,
      key: "receipt_message",
      value: "感謝光臨，歡迎再次光臨！",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      store_id: null,
      key: "currency",
      value: "TWD",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      store_id: null,
      key: "timezone",
      value: "Asia/Taipei",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.bulkDelete("settings", {
    store_id: null,
  });
}
