'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

/**
 * Swagger UI page for API documentation
 * Access at: /api-docs
 */
export default function ApiDocsPage() {
  return (
    <div className="swagger-container">
      <SwaggerUI url="/api/docs" />
      <style jsx global>{`
        .swagger-container {
          min-height: 100vh;
          background: #fafafa;
        }
        .swagger-ui .topbar {
          display: none;
        }
        .swagger-ui .info {
          margin: 20px 0;
        }
        .swagger-ui .info .title {
          font-size: 2rem;
          font-weight: bold;
        }
        .swagger-ui .opblock-tag {
          font-size: 1.25rem;
        }
      `}</style>
    </div>
  );
}
