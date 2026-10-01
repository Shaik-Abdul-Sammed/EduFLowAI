# EduFlow AI OS — Database Schema & Entity Relationships

## 1. Complete Entity-Relationship Diagram

```mermaid
erDiagram
    institutions ||--o{ users : "enrolls"
    institutions ||--o{ audit_logs : "tracks"
    users ||--o{ refresh_tokens : "authenticates"
    users ||--o{ audit_logs : "initiates"
    leads ||--o{ delivered_reports : "associated_with"

    institutions {
        int id PK
        varchar name
        varchar short_code UK
        varchar subscription_tier
        varchar primary_color
        varchar secondary_color
        varchar logo_url
        timestamp created_at
    }

    users {
        int id PK
        int institution_id FK
        varchar role
        varchar email UK
        varchar password_hash
        varchar first_name
        varchar last_name
        timestamp created_at
    }

    refresh_tokens {
        int id PK
        int user_id FK
        varchar token_hash
        timestamp expires_at
        bool revoked
        timestamp created_at
    }

    audit_logs {
        int id PK
        int institution_id FK
        int user_id FK
        varchar action
        varchar ip_address
        text user_agent
        jsonb metadata
        timestamp created_at
    }

    leads {
        int id PK
        varchar college_name
        varchar contact_name
        varchar designation
        varchar email
        varchar phone
        varchar city_state
        int student_count
        varchar naac_cycle
        text message
        varchar status
        varchar source
        text notes
        bool is_deleted
        timestamp created_at
        timestamp updated_at
    }

    delivered_reports {
        int id PK
        int lead_id FK
        varchar token UK
        varchar college_name
        varchar contact_email
        varchar report_type
        varchar title
        text report_content
        jsonb criteria_scores
        int views_count
        timestamp last_viewed_at
        timestamp created_at
        timestamp updated_at
    }

    invoices {
        int id PK
        varchar invoice_number UK
        varchar institution_name
        varchar contact_person
        varchar contact_email
        text address
        varchar gst_number
        jsonb items
        numeric subtotal
        numeric tax_percent
        numeric tax_amount
        numeric total_amount
        varchar currency
        varchar status
        text bank_details
        varchar company_gst
        text notes
        timestamp paid_at
        timestamp created_at
        timestamp updated_at
    }
```

## 2. Table Definitions & Multi-Tenant Strategy

### Multi-Tenancy Design Pattern
- **Current Architecture:** Application-level multi-tenancy. Every tenant query explicitly scopes against `institution_id` extracted from verified JWT claims.
- **Future Roadmap:** Migration to native PostgreSQL Row-Level Security (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`) with connection-scoped session variables (`SET app.current_institution_id = ...`).
