import { createSwaggerSpec } from 'next-swagger-doc';

/**
 * OpenAPI specification for POS Switch AI Agent APIs
 */
export function getApiDocs() {
  const spec = createSwaggerSpec({
    apiFolder: 'app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'POS Switch AI Agent API',
        version: '1.0.0',
        description: `
POS 系統 API 文件

## 認證
API 使用雙 Token 機制：
- **Access Token**: 有效期 15 分鐘，用於 API 認證
- **Refresh Token**: 有效期 7 天，用於刷新 Access Token

Tokens 儲存於 HttpOnly Cookie 中，登入後自動設置。

## 權限
| 權限代碼 | 說明 |
|---------|------|
| product_management | 商品維護 |
| checkout | 結帳操作 |
| order_history | 訂單查詢 |
| statistics | 統計報表 |
| system_settings | 系統設定 |
        `,
      },
      servers: [
        {
          url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
          description: 'Development Server',
        },
      ],
      tags: [
        { name: 'Auth', description: '認證相關' },
        { name: 'Products', description: '商品管理' },
        { name: 'Categories', description: '分類管理' },
        { name: 'Orders', description: '訂單管理' },
        { name: 'Payments', description: '付款處理' },
        { name: 'Settings', description: '系統設定' },
      ],
      components: {
        securitySchemes: {
          cookieAuth: {
            type: 'apiKey',
            in: 'cookie',
            name: 'access_token',
            description: 'Access Token (HttpOnly Cookie)',
          },
        },
        schemas: {
          Error: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
          User: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              email: { type: 'string', format: 'email' },
              name: { type: 'string' },
              role: { type: 'string' },
              permissions: { type: 'array', items: { type: 'string' } },
            },
          },
          Product: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              categoryId: { type: 'integer' },
              name: { type: 'string' },
              description: { type: 'string', nullable: true },
              price: { type: 'number' },
              sku: { type: 'string', nullable: true },
              barcode: { type: 'string', nullable: true },
              imageUrl: { type: 'string', nullable: true },
              stock: { type: 'integer', nullable: true },
              trackStock: { type: 'boolean' },
              isActive: { type: 'boolean' },
              sortOrder: { type: 'integer' },
            },
          },
          Category: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              description: { type: 'string', nullable: true },
              sortOrder: { type: 'integer' },
              isActive: { type: 'boolean' },
            },
          },
          Order: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              orderNumber: { type: 'string' },
              storeId: { type: 'integer', nullable: true },
              userId: { type: 'integer', nullable: true },
              tableNumber: { type: 'string', nullable: true },
              subtotal: { type: 'number' },
              tax: { type: 'number' },
              discount: { type: 'number' },
              total: { type: 'number' },
              status: { 
                type: 'string',
                enum: ['draft', 'in_progress', 'pending', 'completed', 'cancelled', 'refunded'],
              },
              checkoutMode: { type: 'string', enum: ['pre_pay', 'post_pay'] },
              notes: { type: 'string', nullable: true },
            },
          },
          OrderItem: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              orderId: { type: 'integer' },
              productId: { type: 'integer' },
              productName: { type: 'string' },
              unitPrice: { type: 'number' },
              quantity: { type: 'integer' },
              subtotal: { type: 'number' },
              notes: { type: 'string', nullable: true },
            },
          },
          Payment: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              orderId: { type: 'integer' },
              method: { type: 'string', enum: ['cash', 'credit_card', 'mobile_pay', 'other'] },
              amount: { type: 'number' },
              receivedAmount: { type: 'number', nullable: true },
              change: { type: 'number', nullable: true },
              status: { type: 'string', enum: ['pending', 'completed', 'failed', 'refunded'] },
            },
          },
        },
      },
      paths: {
        // Auth endpoints
        '/api/auth/login': {
          post: {
            tags: ['Auth'],
            summary: '登入',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                      email: { type: 'string', format: 'email' },
                      password: { type: 'string' },
                    },
                  },
                },
              },
            },
            responses: {
              '200': { description: '登入成功' },
              '401': { description: '帳號或密碼錯誤' },
            },
          },
        },
        '/api/auth/logout': {
          post: {
            tags: ['Auth'],
            summary: '登出',
            security: [{ cookieAuth: [] }],
            responses: {
              '200': { description: '登出成功' },
            },
          },
        },
        '/api/auth/refresh': {
          post: {
            tags: ['Auth'],
            summary: '刷新 Token',
            responses: {
              '200': { description: 'Token 已刷新' },
              '401': { description: 'Refresh Token 無效' },
            },
          },
        },
        '/api/auth/me': {
          get: {
            tags: ['Auth'],
            summary: '取得當前用戶資訊',
            security: [{ cookieAuth: [] }],
            responses: {
              '200': { description: '成功', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
              '401': { description: '未登入' },
            },
          },
        },
        // Products endpoints
        '/api/products': {
          get: {
            tags: ['Products'],
            summary: '商品列表',
            parameters: [
              { name: 'categoryId', in: 'query', schema: { type: 'integer' }, description: '分類 ID' },
              { name: 'isActive', in: 'query', schema: { type: 'boolean' }, description: '是否啟用' },
            ],
            responses: { '200': { description: '成功' } },
          },
          post: {
            tags: ['Products'],
            summary: '新增商品',
            security: [{ cookieAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['categoryId', 'name', 'price'],
                    properties: {
                      categoryId: { type: 'integer' },
                      name: { type: 'string' },
                      description: { type: 'string' },
                      price: { type: 'number' },
                      sku: { type: 'string' },
                      barcode: { type: 'string' },
                      imageUrl: { type: 'string' },
                      stock: { type: 'integer' },
                      trackStock: { type: 'boolean' },
                      sortOrder: { type: 'integer' },
                    },
                  },
                },
              },
            },
            responses: { '201': { description: '建立成功' }, '403': { description: '權限不足' } },
          },
        },
        '/api/products/{id}': {
          get: {
            tags: ['Products'],
            summary: '商品詳情',
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
            responses: { '200': { description: '成功' }, '404': { description: '商品不存在' } },
          },
          put: {
            tags: ['Products'],
            summary: '更新商品',
            security: [{ cookieAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
            responses: { '200': { description: '更新成功' }, '403': { description: '權限不足' } },
          },
          delete: {
            tags: ['Products'],
            summary: '刪除商品',
            security: [{ cookieAuth: [] }],
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
            responses: { '200': { description: '刪除成功' }, '403': { description: '權限不足' } },
          },
        },
        // Categories endpoints
        '/api/categories': {
          get: {
            tags: ['Categories'],
            summary: '分類列表',
            responses: { '200': { description: '成功' } },
          },
          post: {
            tags: ['Categories'],
            summary: '新增分類',
            security: [{ cookieAuth: [] }],
            responses: { '201': { description: '建立成功' }, '403': { description: '權限不足' } },
          },
        },
        '/api/categories/{id}': {
          get: { tags: ['Categories'], summary: '分類詳情', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: '成功' } } },
          put: { tags: ['Categories'], summary: '更新分類', security: [{ cookieAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: '更新成功' } } },
          delete: { tags: ['Categories'], summary: '刪除分類', security: [{ cookieAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: '刪除成功' } } },
        },
        // Orders endpoints
        '/api/orders': {
          get: {
            tags: ['Orders'],
            summary: '訂單列表',
            security: [{ cookieAuth: [] }],
            parameters: [
              { name: 'status', in: 'query', schema: { type: 'string' } },
              { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
              { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
              { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
              { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
            ],
            responses: { '200': { description: '成功' } },
          },
          post: {
            tags: ['Orders'],
            summary: '建立訂單',
            security: [{ cookieAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['items'],
                    properties: {
                      storeId: { type: 'integer' },
                      tableNumber: { type: 'string' },
                      checkoutMode: { type: 'string', enum: ['pre_pay', 'post_pay'] },
                      notes: { type: 'string' },
                      items: {
                        type: 'array',
                        items: {
                          type: 'object',
                          required: ['productId'],
                          properties: {
                            productId: { type: 'integer' },
                            quantity: { type: 'integer', default: 1 },
                            notes: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            responses: { '201': { description: '建立成功' } },
          },
        },
        '/api/orders/{id}': {
          get: { tags: ['Orders'], summary: '訂單詳情', security: [{ cookieAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: '成功' } } },
          put: { tags: ['Orders'], summary: '更新訂單', security: [{ cookieAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: '更新成功' } } },
          delete: { tags: ['Orders'], summary: '取消訂單', security: [{ cookieAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: '取消成功' } } },
        },
        '/api/orders/{id}/items': {
          post: { tags: ['Orders'], summary: '新增訂單品項', security: [{ cookieAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '201': { description: '新增成功' } } },
          delete: { tags: ['Orders'], summary: '移除訂單品項', security: [{ cookieAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: '移除成功' } } },
        },
        // Payments
        '/api/payments': {
          post: {
            tags: ['Payments'],
            summary: '建立付款',
            security: [{ cookieAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['orderId', 'method', 'amount'],
                    properties: {
                      orderId: { type: 'integer' },
                      method: { type: 'string', enum: ['cash', 'credit_card', 'mobile_pay', 'other'] },
                      amount: { type: 'number' },
                      receivedAmount: { type: 'number' },
                    },
                  },
                },
              },
            },
            responses: { '201': { description: '付款成功' } },
          },
        },
        // Settings
        '/api/settings': {
          get: { tags: ['Settings'], summary: '取得設定', parameters: [{ name: 'storeId', in: 'query', schema: { type: 'integer' } }, { name: 'key', in: 'query', schema: { type: 'string' } }], responses: { '200': { description: '成功' } } },
          put: { tags: ['Settings'], summary: '更新設定', security: [{ cookieAuth: [] }], responses: { '200': { description: '更新成功' } } },
        },
      },
    },
  });
  return spec;
}
