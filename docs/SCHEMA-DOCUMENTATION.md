# CR AUDIOVIZ AI - COMPLETE DATABASE DOCUMENTATION
## Enterprise Schema Reference & Disaster Recovery Guide

**Version:** 1.0.0
**Generated:** December 1, 2025 - 3:15 PM EST
**Total Tables:** 289
**Total Estimated Columns:** ~3,500+

---

# CR AUDIOVIZ AI - MASTER SCHEMA DOCUMENTATION
## Enterprise Database Architecture & Disaster Recovery Guide

**Version:** 1.0.0
**Created:** December 1, 2025 - 2:55 PM EST
**Author:** Claude AI (Automated Documentation)
**Database:** Supabase (kteobfyferrukqeolofj)

---

# 📋 TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Module Documentation](#module-documentation)
4. [Data Flow Diagrams](#data-flow-diagrams)
5. [Backup & Recovery](#backup--recovery)
6. [Field-Level Documentation](#field-level-documentation)
7. [App-to-Table Mapping](#app-to-table-mapping)
8. [API Endpoints](#api-endpoints)
9. [Security Model](#security-model)
10. [Disaster Recovery Procedures](#disaster-recovery-procedures)

---

# EXECUTIVE SUMMARY

## Platform Overview
CR AudioViz AI operates a multi-tenant SaaS platform with 15+ distinct modules serving:
- Real estate professionals (CR Realtor Platform)
- Spirits enthusiasts (BarVault)
- Investors (Stock/Crypto tools)
- Developers (Javari AI)
- General consumers (Marketplace, Games, Education)

## Database Statistics
| Metric | Value |
|--------|-------|
| Total Tables | 289 |
| Total Columns | ~3,500+ |
| Active Modules | 15+ |
| Estimated Rows | Variable by module |

## Critical Dependencies
- **Supabase**: Primary database (PostgreSQL 15)
- **Vercel**: Hosting (21 projects)
- **GitHub**: Source control (25 repositories)
- **OpenAI/Anthropic/Google**: AI providers
- **Stripe/PayPal**: Payment processing

---

# SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  Vercel (21 Projects)                                            │
│  ├── cr-realtor-platform (Next.js 14)                           │
│  ├── javari-ai (Next.js 14)                                     │
│  ├── barvault (Next.js 14)                                      │
│  ├── stock-picker (Next.js)                                     │
│  ├── javariverse (Next.js)                                        │
│  └── [16 more projects...]                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│  Next.js API Routes + Supabase Edge Functions                   │
│  ├── /api/auth/* (Authentication)                               │
│  ├── /api/properties/* (Real Estate)                            │
│  ├── /api/javari/* (AI Assistant)                               │
│  ├── /api/payments/* (Stripe/PayPal)                            │
│  └── /api/cron/* (Scheduled Jobs)                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  Supabase PostgreSQL                                             │
│  ├── 289 Tables                                                  │
│  ├── Row Level Security (RLS)                                    │
│  ├── Real-time Subscriptions                                     │
│  ├── Edge Functions                                              │
│  └── Storage Buckets                                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
├─────────────────────────────────────────────────────────────────┤
│  ├── OpenAI API (GPT-4, embeddings)                             │
│  ├── Anthropic API (Claude)                                      │
│  ├── Google AI (Gemini)                                          │
│  ├── Stripe (Payments)                                           │
│  ├── PayPal (Payments)                                           │
│  ├── Resend (Email)                                              │
│  └── Various MLS APIs (Real Estate Data)                        │
└─────────────────────────────────────────────────────────────────┘
```

---

# MODULE DOCUMENTATION INDEX

| Module | Doc File | Tables | Primary App |
|--------|----------|--------|-------------|
| CR Realtor | `01-CR-REALTOR.md` | 37 | cr-realtor-platform |
| Javari AI | `02-JAVARI-AI.md` | 38 | javari-ai |
| Autonomous Bots | `03-BOTS.md` | 12 | admin-dashboard |
| BarVault | `04-BARVAULT.md` | 14 | barvault |
| Stock/Crypto | `05-TRADING.md` | 15 | stock-picker |
| Documentation | `06-DOCS.md` | 18 | docs-system |
| Security | `07-SECURITY.md` | 9 | all apps |
| Marketplace | `08-MARKETPLACE.md` | 18 | marketplace |
| AI/ML | `09-AI-ML.md` | 16 | all apps |
| Javariverse | `10-JAVARIVERSE.md` | 11 | javariverse |
| News/Content | `11-CONTENT.md` | 10 | various |
| Competitor Intel | `12-INTEL.md` | 4 | admin |
| Marketing | `13-MARKETING.md` | 6 | marketing |
| User/Auth | `14-USERS.md` | 14 | all apps |
| Infrastructure | `15-INFRA.md` | 65+ | all apps |

-e 

---


# CR REALTOR PLATFORM - Complete Schema Documentation
## Module: Real Estate Management System

**App:** cr-realtor-platform
**GitHub:** CR-AudioViz-AI/cr-realtor-platform
**Vercel Project:** prj_6hOo9mllBqfJQXl3KOgZ9xoOLw2D
**Status:** ACTIVE (Tony Harvey Pilot)

---

# TABLE DEFINITIONS

## 1. PROPERTIES (47 columns)
**Purpose:** Core property listings database
**Used By:** Agent dashboard, customer portal, public search
**Data Source:** Manual entry, MLS import

| Column | Type | Nullable | Description | Used By |
|--------|------|----------|-------------|---------|
| id | uuid | NO | Primary key | All |
| agent_id | uuid | NO | FK to profiles | Agent dashboard |
| tenant_id | uuid | YES | Multi-tenant support | All |
| address | varchar | NO | Street address | Search, display |
| address_line2 | varchar | YES | Unit/Apt | Display |
| city | varchar | NO | City name | Search, filters |
| state | varchar | NO | State code | Search, filters |
| zip_code | varchar | NO | ZIP code | Search, location |
| county | varchar | YES | County name | Search |
| latitude | decimal | YES | GPS lat | Map display |
| longitude | decimal | YES | GPS long | Map display |
| price | decimal | NO | Listing price | Search, sort |
| original_price | decimal | YES | Original price | Price history |
| price_per_sqft | decimal | YES | Calculated | Display |
| bedrooms | integer | YES | Bed count | Search, filters |
| bathrooms | decimal | YES | Bath count | Search, filters |
| half_baths | integer | YES | Half bath count | Display |
| square_feet | integer | YES | Living area | Search, filters |
| lot_size | decimal | YES | Lot acres | Display |
| lot_size_sqft | integer | YES | Lot sq ft | Display |
| year_built | integer | YES | Year | Search, filters |
| property_type | varchar | NO | Type enum | Search, filters |
| status | varchar | NO | active/pending/sold | Search, filters |
| listing_type | varchar | YES | sale/rent | Search |
| description | text | YES | Full description | Display |
| features | text[] | YES | Feature list | Search, display |
| amenities | text[] | YES | Amenities | Display |
| garage_spaces | integer | YES | Garage count | Display |
| parking_spaces | integer | YES | Total parking | Display |
| stories | integer | YES | Floor count | Display |
| hoa_fee | decimal | YES | Monthly HOA | Display, calc |
| hoa_frequency | varchar | YES | monthly/annual | Display |
| tax_amount | decimal | YES | Annual tax | Display, calc |
| tax_year | integer | YES | Tax year | Display |
| mls_number | varchar | YES | MLS ID | Import, search |
| virtual_tour_url | varchar | YES | 3D tour link | Display |
| video_url | varchar | YES | Video link | Display |
| images | text[] | YES | Image URLs | Display |
| primary_image | varchar | YES | Main image | Thumbnails |
| days_on_market | integer | YES | DOM count | Display |
| listing_date | date | YES | List date | Calc |
| pending_date | date | YES | Pending date | Tracking |
| sold_date | date | YES | Close date | Tracking |
| sold_price | decimal | YES | Final price | Analytics |
| is_featured | boolean | NO | Featured flag | Homepage |
| is_active | boolean | NO | Active flag | All queries |
| created_at | timestamptz | NO | Created | Audit |
| updated_at | timestamptz | NO | Modified | Audit |

**Indexes:**
- PRIMARY KEY (id)
- INDEX on agent_id
- INDEX on tenant_id
- INDEX on city, state
- INDEX on price
- INDEX on status
- INDEX on property_type
- GIN INDEX on features

**RLS Policies:**
- Agents: CRUD own properties
- Customers: SELECT active properties
- Public: SELECT active properties

---

## 2. CUSTOMERS (25 columns)
**Purpose:** Homebuyer/seller customer records
**Used By:** Agent CRM, customer portal
**Data Source:** Agent entry, self-registration

| Column | Type | Nullable | Description | Used By |
|--------|------|----------|-------------|---------|
| id | uuid | NO | Primary key | All |
| assigned_agent_id | uuid | YES | FK to profiles | Agent assignment |
| tenant_id | uuid | YES | Multi-tenant | All |
| user_id | uuid | YES | FK to auth.users | Login |
| full_name | varchar | NO | Customer name | Display |
| email | varchar | NO | Email address | Communication |
| phone | varchar | YES | Phone number | Communication |
| address | varchar | YES | Home address | Display |
| city | varchar | YES | City | Display |
| state | varchar | YES | State | Display |
| zip_code | varchar | YES | ZIP | Display |
| customer_type | varchar | YES | buyer/seller/both | Filtering |
| status | varchar | YES | active/inactive | Filtering |
| source | varchar | YES | Lead source | Analytics |
| budget_min | decimal | YES | Min budget | Matching |
| budget_max | decimal | YES | Max budget | Matching |
| preferred_areas | text[] | YES | Target areas | Matching |
| property_preferences | jsonb | YES | Preferences | Matching |
| notes | text | YES | Agent notes | CRM |
| last_contact_date | date | YES | Last contact | Follow-up |
| next_follow_up | date | YES | Next action | CRM |
| portal_access | boolean | YES | Portal enabled | Auth |
| invitation_sent | boolean | YES | Invite status | Onboarding |
| created_at | timestamptz | NO | Created | Audit |
| updated_at | timestamptz | NO | Modified | Audit |

**Key Relationships:**
- customers.assigned_agent_id → profiles.id
- customers.user_id → auth.users.id (Supabase auth)

---

## 3. AGENTS (23 columns)
**Purpose:** Real estate agent profiles (extended)
**Used By:** Agent dashboard, public profiles
**Note:** Extends base profiles table

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| profile_id | uuid | NO | FK to profiles |
| license_number | varchar | YES | RE license |
| license_state | varchar | YES | License state |
| license_expiry | date | YES | Expiration |
| brokerage_id | uuid | YES | FK to brokerages |
| specialties | text[] | YES | Specializations |
| service_areas | text[] | YES | Service ZIP codes |
| bio | text | YES | Biography |
| years_experience | integer | YES | Experience |
| certifications | text[] | YES | Designations |
| languages | text[] | YES | Languages spoken |
| social_links | jsonb | YES | Social media |
| website | varchar | YES | Personal site |
| headshot_url | varchar | YES | Photo |
| video_intro_url | varchar | YES | Intro video |
| commission_rate | decimal | YES | Default rate |
| is_team_lead | boolean | YES | Team leader |
| team_id | uuid | YES | FK to teams |
| rating | decimal | YES | Avg rating |
| review_count | integer | YES | Total reviews |
| created_at | timestamptz | NO | Created |
| updated_at | timestamptz | NO | Modified |

---

## 4. VENDORS (24 columns) ✅ NEW
**Purpose:** Third-party service provider directory
**Used By:** Agent vendor management, customer directory
**Privacy:** Commission data is AGENT-ONLY

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| agent_id | uuid | NO | FK to profiles (owner) |
| business_name | varchar | NO | Company name |
| contact_name | varchar | YES | Contact person |
| email | varchar | YES | Email |
| phone | varchar | YES | Phone |
| website | varchar | YES | Website URL |
| address_line1 | varchar | YES | Street |
| address_line2 | varchar | YES | Suite/unit |
| city | varchar | YES | City |
| state | varchar | YES | State |
| zip_code | varchar | YES | ZIP |
| category | varchar | NO | Service type |
| description | text | YES | Description |
| logo_url | text | YES | Logo image |
| license_number | varchar | YES | License |
| years_in_business | integer | YES | Years |
| service_area | text[] | YES | Coverage areas |
| agent_rating | integer | YES | Agent's rating (1-5) |
| agent_notes | text | YES | Private notes |
| is_preferred | boolean | NO | Preferred flag |
| is_active | boolean | NO | Active flag |
| created_at | timestamptz | NO | Created |
| updated_at | timestamptz | NO | Modified |

**Category Values:**
- home_inspector, mortgage_lender, title_company
- insurance, appraiser, attorney, contractor
- electrician, plumber, hvac, roofer
- pest_control, landscaper, pool_service
- moving_company, cleaning_service
- photographer, stager, surveyor, other

---

## 5. VENDOR_COMMISSIONS (12 columns) ✅ NEW
**Purpose:** Private commission agreements between agents and vendors
**Privacy:** 100% AGENT-ONLY - Never visible to customers

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| vendor_id | uuid | NO | FK to vendors |
| agent_id | uuid | NO | FK to profiles |
| commission_type | varchar | NO | flat/percentage/per_deal |
| commission_amount | decimal | YES | Amount or % |
| commission_notes | text | YES | Agreement details |
| agreement_date | date | YES | Start date |
| agreement_expires | date | YES | Expiry date |
| agreement_document_url | text | YES | Contract file |
| is_active | boolean | NO | Active flag |
| created_at | timestamptz | NO | Created |
| updated_at | timestamptz | NO | Modified |

---

## 6. SAVED_SEARCHES (14 columns)
**Purpose:** Customer saved property searches with alerts
**Used By:** Customer portal, email alerts cron

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| customer_id | uuid | NO | FK to customers |
| name | varchar | NO | Search name |
| criteria | jsonb | NO | Search filters |
| email_alerts | boolean | NO | Enable alerts |
| alert_frequency | varchar | YES | daily/weekly/instant |
| last_alert_sent_at | timestamptz | YES | Last email |
| new_listings_count | integer | YES | Pending listings |
| match_count | integer | YES | Total matches |
| is_active | boolean | NO | Active flag |
| created_at | timestamptz | NO | Created |
| updated_at | timestamptz | NO | Modified |

**Criteria JSON Structure:**
```json
{
  "cities": ["Fort Myers", "Cape Coral"],
  "min_price": 200000,
  "max_price": 500000,
  "bedrooms": 3,
  "bathrooms": 2,
  "property_types": ["single_family", "condo"],
  "features": ["pool", "garage"]
}
```

---

## 7. AGENT_SHARED_LISTINGS (16 columns)
**Purpose:** Properties pushed by agents to specific customers
**Used By:** Customer portal "Shared with You" section

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| agent_id | uuid | NO | FK to profiles |
| customer_id | uuid | NO | FK to customers |
| property_id | uuid | NO | FK to properties |
| message | text | YES | Agent note |
| priority | varchar | YES | high/medium/low |
| is_highlighted | boolean | NO | Featured flag |
| customer_viewed | boolean | NO | Viewed flag |
| customer_viewed_at | timestamptz | YES | View timestamp |
| customer_rating | integer | YES | Customer rating |
| customer_notes | text | YES | Customer feedback |
| customer_interested | boolean | YES | Interest flag |
| status | varchar | NO | Status enum |
| expires_at | timestamptz | YES | Expiration |
| created_at | timestamptz | NO | Created |
| updated_at | timestamptz | NO | Modified |

---

## 8. MLS_LISTINGS (30 columns)
**Purpose:** Raw MLS feed data storage
**Used By:** MLS import jobs, property sync

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| mls_id | varchar | NO | MLS number |
| mls_source | varchar | NO | MLS board |
| raw_data | jsonb | YES | Full MLS record |
| [... property fields mirror properties table ...] |
| last_sync_at | timestamptz | YES | Last update |
| sync_status | varchar | YES | Status |
| is_imported | boolean | NO | Imported flag |
| created_at | timestamptz | NO | Created |
| updated_at | timestamptz | NO | Modified |

---

## DATA FLOWS

### Agent Creates Property
```
Agent Dashboard → API: POST /api/properties
  → Insert into properties table
  → Trigger: Update agent property count
  → Notify: Send to matching saved_searches
```

### Customer Saves Search
```
Customer Portal → API: POST /api/saved-searches
  → Insert into saved_searches
  → If alerts enabled → Schedule cron check
  → Daily: Check new matching properties
  → If matches → Send email alert
```

### Agent Shares Listing
```
Agent Dashboard → API: POST /api/share-listings
  → Insert into agent_shared_listings
  → Notify customer (email/push)
  → Customer views → Update viewed flags
  → Customer responds → Update interest/rating
```

### Vendor Referral Flow
```
Agent adds vendor → vendors table
Agent sets commission → vendor_commissions (PRIVATE)
Agent refers customer → vendor_referrals
Customer contacts vendor → Update referral status
Deal closes → Record commission_earned
```

-e 

---


# JAVARI AI - Complete Schema Documentation
## Module: AI Development Assistant

**App:** javari-ai
**GitHub:** CR-AudioViz-AI/javari-ai
**Status:** 95% Complete (TypeScript build errors blocking deployment)
**Purpose:** Autonomous AI development assistant that learns and improves

---

# CORE CONCEPT

Javari AI is designed to be a self-improving AI assistant that:
1. Learns from every interaction
2. Maintains context across conversations
3. Tracks its own performance
4. Self-heals from errors
5. Routes tasks to optimal AI providers
6. Builds and deploys code autonomously

---

# TABLE DEFINITIONS

## 1. JAVARI_CHAT_SESSIONS (30 columns)
**Purpose:** Store all chat conversations with full context
**Critical:** This is the primary interaction log

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to profiles |
| session_id | varchar | Unique session |
| title | varchar | Chat title |
| messages | jsonb | Message array |
| context | jsonb | Accumulated context |
| project_id | uuid | Associated project |
| sub_project_id | uuid | Sub-project |
| provider_used | varchar | AI provider |
| model_used | varchar | Model name |
| total_tokens | integer | Token usage |
| total_cost | decimal | Cost tracking |
| sentiment_score | decimal | User satisfaction |
| error_count | integer | Errors in session |
| resolution_count | integer | Problems solved |
| code_generated | integer | Lines of code |
| files_modified | integer | Files changed |
| deployments | integer | Deployments made |
| learning_extracted | boolean | Learned from chat |
| is_active | boolean | Active session |
| last_message_at | timestamptz | Last activity |
| summary | text | AI summary |
| tags | text[] | Topic tags |
| related_sessions | uuid[] | Related chats |
| created_at | timestamptz | Created |
| updated_at | timestamptz | Modified |
| started_at | timestamptz | Start time |
| ended_at | timestamptz | End time |
| duration_seconds | integer | Duration |
| metadata | jsonb | Extra data |

**Message Structure:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Build me a landing page",
      "timestamp": "2025-12-01T10:00:00Z"
    },
    {
      "role": "assistant", 
      "content": "I'll create a landing page...",
      "timestamp": "2025-12-01T10:00:05Z",
      "tokens_used": 450,
      "provider": "openai",
      "model": "gpt-4-turbo"
    }
  ]
}
```

---

## 2. JAVARI_KNOWLEDGE (23 columns)
**Purpose:** Javari's learned knowledge base
**Critical:** Powers intelligent responses and code generation

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| category | varchar | Knowledge type |
| subcategory | varchar | Subcategory |
| title | varchar | Entry title |
| content | text | Knowledge content |
| code_examples | jsonb | Code snippets |
| best_practices | text[] | Best practices |
| anti_patterns | text[] | What to avoid |
| related_concepts | text[] | Related topics |
| source | varchar | Source (chat/doc/web) |
| source_id | uuid | Source reference |
| confidence_score | decimal | Confidence 0-1 |
| usage_count | integer | Times used |
| success_rate | decimal | Success when used |
| last_used_at | timestamptz | Last used |
| validated | boolean | Human validated |
| validated_by | uuid | Validator |
| version | integer | Version number |
| embedding | vector | For semantic search |
| tags | text[] | Tags |
| is_active | boolean | Active |
| created_at | timestamptz | Created |
| updated_at | timestamptz | Modified |

**Categories:**
- `code_pattern` - Reusable code patterns
- `error_fix` - Known error solutions
- `best_practice` - Best practices
- `project_context` - Project-specific knowledge
- `user_preference` - User preferences
- `api_reference` - API documentation
- `deployment` - Deployment procedures

---

## 3. JAVARI_PROJECTS (21 columns)
**Purpose:** Projects Javari is working on
**Links:** Maps to Vercel projects and GitHub repos

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner |
| name | varchar | Project name |
| description | text | Description |
| github_repo | varchar | GitHub repo URL |
| github_owner | varchar | GitHub org/user |
| github_token_id | uuid | FK to credentials |
| vercel_project_id | varchar | Vercel project ID |
| vercel_team_id | varchar | Vercel team |
| framework | varchar | next/react/node |
| language | varchar | ts/js/python |
| status | varchar | active/paused |
| last_deployment | timestamptz | Last deploy |
| last_commit | varchar | Last commit SHA |
| health_status | varchar | healthy/degraded |
| error_count | integer | Current errors |
| settings | jsonb | Project settings |
| dependencies | jsonb | Package deps |
| is_active | boolean | Active |
| created_at | timestamptz | Created |
| updated_at | timestamptz | Modified |

---

## 4. JAVARI_PROVIDERS (14 columns)
**Purpose:** AI provider configuration and routing
**Used By:** Smart routing system

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | varchar | Provider name |
| api_endpoint | varchar | API URL |
| api_key_id | uuid | FK to credentials |
| is_active | boolean | Enabled |
| priority | integer | Routing priority |
| rate_limit | integer | Requests/min |
| current_usage | integer | Current usage |
| cost_per_1k_input | decimal | Input cost |
| cost_per_1k_output | decimal | Output cost |
| supported_features | text[] | Capabilities |
| health_status | varchar | Status |
| last_check | timestamptz | Health check |
| metadata | jsonb | Extra config |

**Providers:**
- OpenAI (GPT-4, GPT-4-turbo)
- Anthropic (Claude 3.5 Sonnet, Opus)
- Google (Gemini Pro)
- Local models (future)

---

## 5. JAVARI_BUILD_HEALTH_TRACKING (18 columns)
**Purpose:** Track build health across all projects
**Critical:** Powers self-healing capabilities

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| project_id | uuid | FK to projects |
| deployment_id | varchar | Vercel deploy ID |
| commit_sha | varchar | Git commit |
| build_status | varchar | success/error |
| error_type | varchar | Error category |
| error_message | text | Full error |
| error_file | varchar | File with error |
| error_line | integer | Line number |
| attempted_fixes | integer | Fix attempts |
| fix_successful | boolean | Fixed? |
| fix_method | varchar | How fixed |
| time_to_fix | integer | Seconds to fix |
| related_errors | uuid[] | Related issues |
| root_cause | text | Root cause |
| prevention | text | How to prevent |
| created_at | timestamptz | Created |
| resolved_at | timestamptz | Resolved |

---

## 6. JAVARI_AUTO_HEALING_INCIDENTS (13 columns)
**Purpose:** Log of automatic self-healing attempts
**Critical:** Tracks autonomous fixes

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| project_id | uuid | Project |
| error_hash | varchar | Error signature |
| error_type | varchar | Error category |
| original_error | text | Original error |
| healing_strategy | varchar | Strategy used |
| code_before | text | Code before fix |
| code_after | text | Code after fix |
| success | boolean | Fix worked? |
| rollback_required | boolean | Rolled back? |
| learning_captured | boolean | Learned from it |
| created_at | timestamptz | Created |
| completed_at | timestamptz | Completed |

---

## 7. JAVARI_COST_TRACKING (12 columns)
**Purpose:** Track AI API costs
**Used By:** Budget management, optimization

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | User |
| provider | varchar | AI provider |
| model | varchar | Model used |
| input_tokens | integer | Input tokens |
| output_tokens | integer | Output tokens |
| total_cost | decimal | Total cost |
| session_id | uuid | Chat session |
| task_type | varchar | Task type |
| timestamp | timestamptz | When |
| billing_period | varchar | Billing period |
| metadata | jsonb | Extra data |

---

## DATA FLOWS

### Chat Session Flow
```
User message → javari_chat_sessions (new message)
  → Select provider (javari_providers routing)
  → Call AI API
  → Track cost (javari_cost_tracking)
  → Store response
  → Extract learning (javari_knowledge)
  → Update context
```

### Self-Healing Flow
```
Build fails → javari_build_health_tracking
  → Analyze error
  → Search javari_knowledge for solution
  → If found → Apply fix → javari_auto_healing_incidents
  → If success → Redeploy
  → If fail → Alert user
  → Learn from outcome
```

### Provider Routing
```
Task received → Analyze task type
  → Check javari_provider_performance
  → Select best provider for task
  → Fallback chain if primary fails
  → Track performance
```

---

# JAVARI FEEDS DATA TO:

1. **All CR AudioViz Apps** - Provides development assistance
2. **Bot System** - Receives bot findings for analysis
3. **Error Tracking** - Aggregates errors from all apps
4. **Documentation** - Auto-generates docs from code
5. **Knowledge Base** - Self-populates from interactions

-e 

---


# APP-TO-TABLE MAPPING
## Complete Reference: Which App Uses Which Tables

**Purpose:** This document maps every application to its database tables.
**For:** Javari AI, developers, disaster recovery

---

# 1. CR-REALTOR-PLATFORM

**GitHub:** CR-AudioViz-AI/cr-realtor-platform
**Vercel:** prj_6hOo9mllBqfJQXl3KOgZ9xoOLw2D
**URL:** https://crrealtor.com (production TBD)

## Tables Used (37)

### Primary Tables (Core Functionality)
| Table | Read | Write | Purpose |
|-------|------|-------|---------|
| properties | ✅ | ✅ | Property listings |
| customers | ✅ | ✅ | Customer records |
| profiles | ✅ | ✅ | User profiles |
| agents | ✅ | ✅ | Agent profiles |
| leads | ✅ | ✅ | Lead capture |
| transactions | ✅ | ✅ | Deal tracking |
| vendors | ✅ | ✅ | Service providers |
| vendor_services | ✅ | ✅ | Vendor offerings |
| vendor_commissions | ✅ | ✅ | Commission tracking |
| vendor_referrals | ✅ | ✅ | Referral tracking |

### Customer Portal Tables
| Table | Read | Write | Purpose |
|-------|------|-------|---------|
| saved_properties | ✅ | ✅ | Favorites |
| saved_searches | ✅ | ✅ | Saved searches |
| customer_documents | ✅ | ✅ | Shared docs |
| customer_messages | ✅ | ✅ | Messaging |
| agent_shared_listings | ✅ | ✅ | Shared properties |
| customer_activity | ✅ | ✅ | Activity log |

### Agent Dashboard Tables
| Table | Read | Write | Purpose |
|-------|------|-------|---------|
| agent_availability | ✅ | ✅ | Schedule |
| agent_feedback | ✅ | ✅ | Reviews |
| agent_property_notes | ✅ | ✅ | Private notes |
| showings | ✅ | ✅ | Showing schedule |
| tour_requests | ✅ | ✅ | Tour requests |
| appointments | ✅ | ✅ | Calendar |

### Supporting Tables
| Table | Read | Write | Purpose |
|-------|------|-------|---------|
| brokerages | ✅ | ✅ | Brokerage info |
| commission_records | ✅ | ✅ | Commissions |
| customer_invitations | ✅ | ✅ | Invite system |
| customer_feedback | ✅ | ✅ | Feedback |
| lead_activities | ✅ | ✅ | Lead tracking |
| lead_submissions | ✅ | ✅ | Form submissions |
| property_images | ✅ | ✅ | Images |
| property_views | ✅ | ✅ | Analytics |

### Mortgage/Lender Tables
| Table | Read | Write | Purpose |
|-------|------|-------|---------|
| lenders | ✅ | ❌ | Lender list |
| lender_service_areas | ✅ | ❌ | Coverage |
| mortgage_rates | ✅ | ❌ | Rate data |
| mortgage_rate_alerts | ✅ | ✅ | Rate alerts |

### MLS Integration
| Table | Read | Write | Purpose |
|-------|------|-------|---------|
| mls_listings | ✅ | ✅ | Raw MLS data |

---

# 2. JAVARI-AI

**GitHub:** CR-AudioViz-AI/javari-ai
**Status:** 95% complete (build errors)

## Tables Used (38)

### Core AI Tables
| Table | Purpose |
|-------|---------|
| javari_chat_sessions | Conversation history |
| javari_knowledge | Knowledge base |
| javari_projects | Project tracking |
| javari_sub_projects | Sub-project tracking |
| javari_providers | AI provider config |
| javari_provider_models | Model configurations |
| javari_provider_performance | Performance tracking |

### Learning & Intelligence
| Table | Purpose |
|-------|---------|
| javari_learning | Learning data |
| javari_learning_analytics | Learning metrics |
| javari_learning_log | Learning history |
| javari_learning_feedback | User feedback |
| javari_knowledge_base | KB entries |
| javari_self_answers | Self-training data |
| javari_anti_patterns | Bad patterns |
| javari_smart_suggestions | AI suggestions |

### Build & Deploy
| Table | Purpose |
|-------|---------|
| javari_builds | Build history |
| javari_build_health_tracking | Build monitoring |
| javari_file_operations | File changes |
| javari_dependency_tracking | Dependencies |
| javari_code_review_queue | Code reviews |

### Self-Healing
| Table | Purpose |
|-------|---------|
| javari_auto_healing_incidents | Healing log |
| javari_healing_history | Healing history |
| javari_optimization_recommendations | Recommendations |

### Security
| Table | Purpose |
|-------|---------|
| javari_security_tickets | Security issues |
| javari_security_learning | Security patterns |
| javari_security_actions | Security actions |

### Documents & Web
| Table | Purpose |
|-------|---------|
| javari_documents | Document store |
| javari_document_chunks | RAG chunks |
| javari_document_queue | Processing queue |
| javari_web_crawls | Web scraping |

### Cost & Usage
| Table | Purpose |
|-------|---------|
| javari_cost_tracking | API costs |
| javari_usage_logs | Usage tracking |
| javari_daily_usage_stats | Daily stats |
| javari_user_activity_summary | User activity |
| javari_telemetry | Performance data |
| javari_settings | User settings |
| javari_task_routes | Task routing |

---

# 3. BARVAULT

**GitHub:** CR-AudioViz-AI/barvault
**Purpose:** Spirits collection & education platform

## Tables Used (14)

| Table | Read | Write | Purpose |
|-------|------|-------|---------|
| bv_spirits | ✅ | ✅ | Spirit database |
| bv_profiles | ✅ | ✅ | User profiles |
| bv_reviews | ✅ | ✅ | Spirit reviews |
| bv_user_collection | ✅ | ✅ | User collections |
| bv_courses | ✅ | ✅ | Education courses |
| bv_user_course_progress | ✅ | ✅ | Course progress |
| bv_trivia_questions | ✅ | ✅ | Trivia content |
| bv_trivia_progress | ✅ | ✅ | Trivia scores |
| bv_game_sessions | ✅ | ✅ | Game sessions |
| bv_leaderboards | ✅ | ✅ | Rankings |
| bv_rewards | ✅ | ✅ | Reward system |
| bv_user_rewards | ✅ | ✅ | User rewards |
| bv_proof_transactions | ✅ | ✅ | Token transactions |

---

# 4. AUTONOMOUS BOTS

**GitHub:** CR-AudioViz-AI/admin-dashboard
**Purpose:** 24/7 monitoring bots

## Tables Used (12)

| Table | Purpose |
|-------|---------|
| bots | Bot configurations |
| autonomous_bots | Auto-bot configs |
| bot_runs | Run history |
| bot_executions | Execution logs |
| bot_actions | Action history |
| bot_findings | Discovery results |
| bot_issues | Issue tracking |
| bot_alerts | Alert management |
| bot_health_checks | Health monitoring |
| bot_health_metrics | Performance metrics |
| bot_knowledge | Bot learning |
| bot_activity | Activity logs |

---

# 5. STOCK/CRYPTO PLATFORM

**GitHub:** CR-AudioViz-AI/stock-picker

## Tables Used (15)

| Table | Purpose |
|-------|---------|
| stocks | Stock database |
| stock_quotes | Real-time quotes |
| stock_fundamentals | Company data |
| stock_picks | AI stock picks |
| stock_technical_indicators | TA indicators |
| stock_data_cache | Data cache |
| crypto_prices | Crypto data |
| user_portfolios | User portfolios |
| watchlists | Watchlists |
| price_alerts | Price alerts |
| price_history | Historical prices |
| paper_trades | Paper trading |
| pick_results | Pick performance |
| weekly_performance | Weekly stats |
| backtesting_results | Strategy testing |

---

# 6. SHARED INFRASTRUCTURE TABLES

**Used By:** ALL APPS

## Authentication & Users
| Table | All Apps Use |
|-------|--------------|
| profiles | ✅ |
| users | ✅ |
| user_profiles | Some |
| user_settings | ✅ |
| user_preferences | ✅ |
| user_credits | ✅ |
| subscriptions | ✅ |

## Security
| Table | All Apps Use |
|-------|--------------|
| security_events | ✅ |
| security_threats | ✅ |
| security_rate_limits | ✅ |
| security_ip_blocklist | ✅ |

## Notifications
| Table | All Apps Use |
|-------|--------------|
| notifications | ✅ |
| notifications_log | ✅ |

## Payments
| Table | All Apps Use |
|-------|--------------|
| payment_transactions | ✅ |
| subscriptions | ✅ |
| paypal_subscriptions | ✅ |

## API & Infrastructure
| Table | All Apps Use |
|-------|--------------|
| api_keys | ✅ |
| api_usage | ✅ |
| api_usage_logs | ✅ |
| credentials | ✅ |
| credential_vault | ✅ |
| error_logs | ✅ |
| error_tracking | ✅ |
| health_checks | ✅ |
| system_settings | ✅ |

---

# VERCEL PROJECT MAPPING

| Vercel Project | GitHub Repo | Primary Tables |
|----------------|-------------|----------------|
| cr-realtor-platform | cr-realtor-platform | properties, customers, agents |
| javari-ai | javari-ai | javari_* (38 tables) |
| barvault | barvault | bv_* (14 tables) |
| admin-dashboard | admin-dashboard | bots, system_* |
| stock-picker | stock-picker | stock_*, crypto_* |
| [17 more projects...] | | |

-e 

---


# FIELD GLOSSARY
## Standard Field Definitions Across All Tables

**Purpose:** Standardize field naming and provide definitions for Javari AI
**Used By:** Javari knowledge base, developers, documentation

---

# STANDARD FIELDS (Present in most tables)

## Identity Fields
| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Primary key, auto-generated |
| `uuid` | uuid | Alternative primary key |
| `user_id` | uuid | FK to auth.users (Supabase auth) |
| `profile_id` | uuid | FK to profiles table |
| `tenant_id` | uuid | Multi-tenant identifier |

## Timestamp Fields
| Field | Type | Description |
|-------|------|-------------|
| `created_at` | timestamptz | Record creation time (UTC) |
| `updated_at` | timestamptz | Last modification time (UTC) |
| `deleted_at` | timestamptz | Soft delete timestamp |
| `started_at` | timestamptz | Process start time |
| `ended_at` | timestamptz | Process end time |
| `expires_at` | timestamptz | Expiration timestamp |
| `last_used_at` | timestamptz | Last access time |
| `last_sync_at` | timestamptz | Last synchronization |

## Status Fields
| Field | Type | Values | Description |
|-------|------|--------|-------------|
| `status` | varchar | varies | Current state |
| `is_active` | boolean | true/false | Active record |
| `is_deleted` | boolean | true/false | Soft deleted |
| `is_featured` | boolean | true/false | Featured/highlighted |
| `is_verified` | boolean | true/false | Verified/validated |
| `is_public` | boolean | true/false | Publicly visible |

## Audit Fields
| Field | Type | Description |
|-------|------|-------------|
| `created_by` | uuid | User who created |
| `updated_by` | uuid | User who modified |
| `deleted_by` | uuid | User who deleted |
| `version` | integer | Record version number |

---

# DOMAIN-SPECIFIC FIELDS

## Real Estate Fields
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `address` | varchar | Street address | "123 Main St" |
| `address_line2` | varchar | Unit/Apt | "Unit 4B" |
| `city` | varchar | City name | "Fort Myers" |
| `state` | varchar | State code | "FL" |
| `zip_code` | varchar | ZIP/Postal | "33901" |
| `county` | varchar | County name | "Lee" |
| `latitude` | decimal | GPS latitude | 26.6406 |
| `longitude` | decimal | GPS longitude | -81.8723 |
| `price` | decimal | Listing price | 450000.00 |
| `bedrooms` | integer | Bedroom count | 3 |
| `bathrooms` | decimal | Full + half baths | 2.5 |
| `square_feet` | integer | Living area | 2400 |
| `lot_size` | decimal | Lot in acres | 0.25 |
| `year_built` | integer | Construction year | 2015 |
| `property_type` | varchar | Type enum | "single_family" |
| `mls_number` | varchar | MLS listing ID | "C7512345" |
| `days_on_market` | integer | DOM count | 45 |

### Property Type Values
```
single_family, condo, townhouse, multi_family, 
land, commercial, mobile_home, other
```

### Property Status Values
```
active, pending, sold, withdrawn, expired, 
coming_soon, off_market
```

## Customer/Lead Fields
| Field | Type | Description |
|-------|------|-------------|
| `full_name` | varchar | Full name |
| `first_name` | varchar | First name |
| `last_name` | varchar | Last name |
| `email` | varchar | Email address |
| `phone` | varchar | Phone number |
| `customer_type` | varchar | buyer/seller/both |
| `budget_min` | decimal | Minimum budget |
| `budget_max` | decimal | Maximum budget |
| `source` | varchar | Lead source |
| `assigned_agent_id` | uuid | Assigned agent |

## Financial Fields
| Field | Type | Description |
|-------|------|-------------|
| `amount` | decimal | Monetary amount |
| `currency` | varchar | Currency code (USD) |
| `commission_rate` | decimal | Commission percentage |
| `commission_amount` | decimal | Commission dollars |
| `price_per_sqft` | decimal | Calculated price/sqft |
| `hoa_fee` | decimal | Monthly HOA |
| `tax_amount` | decimal | Annual property tax |

## AI/ML Fields
| Field | Type | Description |
|-------|------|-------------|
| `provider` | varchar | AI provider name |
| `model` | varchar | Model identifier |
| `tokens_used` | integer | Token count |
| `input_tokens` | integer | Input tokens |
| `output_tokens` | integer | Output tokens |
| `total_cost` | decimal | API cost |
| `confidence_score` | decimal | AI confidence (0-1) |
| `embedding` | vector | Vector embedding |
| `sentiment_score` | decimal | Sentiment (-1 to 1) |

## Performance/Metrics Fields
| Field | Type | Description |
|-------|------|-------------|
| `success_rate` | decimal | Success percentage |
| `error_count` | integer | Error count |
| `retry_count` | integer | Retry attempts |
| `duration_ms` | integer | Duration milliseconds |
| `response_time` | integer | Response time ms |
| `health_status` | varchar | healthy/degraded/down |

---

# JSON/JSONB STRUCTURES

## Property Criteria (saved_searches)
```json
{
  "cities": ["Fort Myers", "Cape Coral"],
  "min_price": 200000,
  "max_price": 500000,
  "bedrooms": 3,
  "bathrooms": 2,
  "property_types": ["single_family", "condo"],
  "features": ["pool", "garage"],
  "min_sqft": 1500,
  "max_sqft": 3000,
  "year_built_min": 2000
}
```

## Chat Messages (javari_chat_sessions)
```json
{
  "messages": [
    {
      "id": "msg_123",
      "role": "user",
      "content": "Help me...",
      "timestamp": "2025-12-01T10:00:00Z"
    },
    {
      "role": "assistant",
      "content": "I can help...",
      "timestamp": "2025-12-01T10:00:05Z",
      "tokens_used": 450,
      "provider": "openai",
      "model": "gpt-4-turbo"
    }
  ]
}
```

## AI Provider Config (javari_providers)
```json
{
  "metadata": {
    "max_tokens": 4096,
    "temperature": 0.7,
    "top_p": 1.0,
    "frequency_penalty": 0,
    "presence_penalty": 0,
    "supported_tasks": ["chat", "code", "analysis"]
  }
}
```

## Error Tracking (error_tracking)
```json
{
  "stack_trace": "Error at line 45...",
  "context": {
    "file": "page.tsx",
    "function": "handleSubmit",
    "user_id": "uuid",
    "request_id": "req_123"
  },
  "environment": {
    "node_version": "20.x",
    "next_version": "14.2.33"
  }
}
```

---

# ENUM VALUES REFERENCE

## User Roles
```
admin, agent, broker, customer, guest, developer
```

## Lead Status
```
new, contacted, qualified, nurturing, 
appointment_set, showing, offer_made, 
under_contract, closed, lost
```

## Transaction Status
```
draft, active, pending, under_contract,
contingent, closing, closed, cancelled
```

## Alert Priority
```
low, medium, high, critical
```

## Vendor Categories
```
home_inspector, mortgage_lender, title_company,
insurance, appraiser, attorney, contractor,
electrician, plumber, hvac, roofer, pest_control,
landscaper, pool_service, moving_company,
cleaning_service, photographer, stager, surveyor, other
```

## Commission Types
```
flat, percentage, per_deal
```

## Bot Status
```
active, paused, stopped, error, maintenance
```

---

# NAMING CONVENTIONS

## Tables
- Plural form: `customers`, `properties`
- Underscore separation: `saved_searches`
- Prefix for modules: `javari_`, `bv_`, `bot_`

## Columns
- Snake_case: `created_at`, `is_active`
- FK suffix: `_id` for foreign keys
- Boolean prefix: `is_`, `has_`, `can_`

## Indexes
- Format: `idx_{table}_{column(s)}`
- Example: `idx_properties_city_state`

## Constraints
- Primary: `{table}_pkey`
- Foreign: `{table}_{column}_fkey`
- Unique: `{table}_{column}_key`

-e 

---


# BACKUP & DISASTER RECOVERY GUIDE
## CR AudioViz AI Platform

**CRITICAL DOCUMENT - Review Monthly**
**Last Updated:** December 1, 2025 - 3:00 PM EST

---

# 🚨 CURRENT BACKUP STATUS

## Supabase Database

| Backup Type | Status | Frequency | Retention |
|-------------|--------|-----------|-----------|
| **Point-in-Time Recovery** | ⚠️ CHECK | Continuous | 7 days (Pro plan) |
| **Daily Backups** | ⚠️ CHECK | Daily | 7 days |
| **Manual Exports** | ❌ NOT SET UP | Manual | N/A |
| **Cross-Region Replica** | ❌ NOT SET UP | Real-time | N/A |

### ⚠️ ACTION REQUIRED: Verify Supabase Backup Settings
1. Go to: https://supabase.com/dashboard/project/kteobfyferrukqeolofj/settings/database
2. Check "Backups" section
3. Verify Point-in-Time Recovery is enabled
4. Note retention period (depends on plan)

---

## GitHub Repositories

| Backup Type | Status | Notes |
|-------------|--------|-------|
| **Git History** | ✅ YES | Full commit history preserved |
| **GitHub Native** | ✅ YES | GitHub maintains replicas |
| **Local Clones** | ⚠️ MANUAL | Should clone regularly |
| **Mirror Repos** | ❌ NOT SET UP | No secondary backup |

### Repositories to Backup (25 total):
```
CR-AudioViz-AI/cr-realtor-platform
CR-AudioViz-AI/javari-ai
CR-AudioViz-AI/barvault
CR-AudioViz-AI/javariverse
CR-AudioViz-AI/admin-dashboard
[... 20 more ...]
```

---

## Vercel Projects

| Backup Type | Status | Notes |
|-------------|--------|-------|
| **Deployment History** | ✅ YES | Vercel keeps all deployments |
| **Environment Variables** | ⚠️ MANUAL | Document separately |
| **Project Config** | ✅ YES | In vercel.json |

---

# 🔴 CRITICAL GAPS IDENTIFIED

## 1. No Automated Database Export
**Risk:** High - If Supabase account is compromised, all data lost
**Solution:** Set up automated pg_dump to cloud storage

## 2. No Cross-Region Database Replica
**Risk:** High - Regional outage = downtime
**Solution:** Enable Supabase read replica in different region

## 3. Environment Variables Not Documented
**Risk:** Medium - Account lockout = cannot redeploy
**Solution:** Document all env vars securely

## 4. No DR Testing
**Risk:** High - Untested recovery = unknown recovery time
**Solution:** Quarterly DR drills

---

# 📋 RECOMMENDED BACKUP STRATEGY

## Tier 1: Database (Critical)

### Automated Daily Export
```bash
#!/bin/bash
# backup-database.sh
# Run daily via cron or GitHub Actions

DATE=$(date +%Y-%m-%d)
BACKUP_FILE="cr-audioviz-backup-$DATE.sql"

# Export from Supabase
pg_dump "$SUPABASE_DB_URL" > $BACKUP_FILE

# Compress
gzip $BACKUP_FILE

# Upload to S3/GCS/Azure
aws s3 cp $BACKUP_FILE.gz s3://cr-audioviz-backups/daily/
```

### Weekly Full Export with Schema
```bash
# Include schema, data, and functions
pg_dump --format=custom \
  --no-owner \
  --no-privileges \
  "$SUPABASE_DB_URL" > full-backup-$(date +%Y-%m-%d).dump
```

## Tier 2: Code Repositories

### Daily Mirror to Secondary Git
```bash
# Mirror all repos to backup location
for repo in $(cat repos.txt); do
  git clone --mirror git@github.com:CR-AudioViz-AI/$repo.git
  cd $repo.git
  git push --mirror git@backup.example.com:$repo.git
  cd ..
done
```

## Tier 3: Credentials & Secrets

### Secure Credential Backup
All credentials should be stored in:
1. **Primary:** Supabase `credential_vault` table (encrypted)
2. **Secondary:** 1Password/Bitwarden vault
3. **Tertiary:** Encrypted local backup

---

# 🔧 DISASTER RECOVERY PROCEDURES

## Scenario 1: Database Corruption
**RTO:** 1-4 hours | **RPO:** Up to 7 days

1. Access Supabase dashboard
2. Navigate to Settings → Backups
3. Select recovery point
4. Initiate Point-in-Time Recovery
5. Verify data integrity
6. Update DNS if needed

## Scenario 2: Supabase Account Compromised
**RTO:** 4-24 hours | **RPO:** Last manual backup

1. Contact Supabase support immediately
2. Revoke all API keys
3. Provision new Supabase project
4. Restore from manual backup
5. Update all application configs
6. Rotate all credentials

## Scenario 3: GitHub Organization Deleted
**RTO:** 2-8 hours | **RPO:** Last clone/mirror

1. Restore from local clones
2. Create new GitHub org
3. Push all repos
4. Update Vercel connections
5. Update CI/CD pipelines

## Scenario 4: Vercel Account Issue
**RTO:** 1-2 hours | **RPO:** None (code in GitHub)

1. Create new Vercel account/team
2. Import projects from GitHub
3. Restore environment variables
4. Update DNS records
5. Verify deployments

## Scenario 5: Complete Platform Rebuild
**RTO:** 24-72 hours | **RPO:** Last full backup

1. Provision new infrastructure:
   - New Supabase project
   - New Vercel team
   - New domain registrations
2. Restore database from backup
3. Import all GitHub repos
4. Configure environment variables
5. Deploy all applications
6. Verify integrations
7. Update DNS
8. Test all functionality

---

# 📊 RECOVERY PRIORITY ORDER

| Priority | System | Max Downtime |
|----------|--------|--------------|
| 1 | Database (Supabase) | 1 hour |
| 2 | Authentication | 2 hours |
| 3 | CR Realtor Platform | 4 hours |
| 4 | Payment Processing | 4 hours |
| 5 | Javari AI | 8 hours |
| 6 | Other Apps | 24 hours |

---

# 🔐 CREDENTIAL MASTER LIST

## Required for Recovery

| Service | Credential Type | Storage Location |
|---------|----------------|------------------|
| Supabase | Project URL + Keys | Credential Vault |
| GitHub | Personal Access Token | Credential Vault |
| Vercel | API Token | Credential Vault |
| OpenAI | API Key | Credential Vault |
| Anthropic | API Key | Credential Vault |
| Stripe | Secret Key | Credential Vault |
| PayPal | Client ID + Secret | Credential Vault |
| Resend | API Key | Credential Vault |
| Domain Registrar | Login | Password Manager |

---

# 📅 BACKUP SCHEDULE

| Task | Frequency | Owner | Verification |
|------|-----------|-------|--------------|
| Database PITR | Continuous | Supabase | Monthly check |
| Manual DB Export | Weekly | Admin | After export |
| Code Mirror | Daily | Automated | Weekly verify |
| Credential Audit | Monthly | Admin | After audit |
| DR Drill | Quarterly | Team | After drill |

---

# ⚡ QUICK RECOVERY COMMANDS

## Export Current Database
```bash
# Get connection string from Supabase dashboard
pg_dump "postgresql://postgres:[PASSWORD]@db.kteobfyferrukqeolofj.supabase.co:5432/postgres" > backup.sql
```

## Clone All Repositories
```bash
# Clone all 25 repos
gh repo list CR-AudioViz-AI --limit 100 --json name -q '.[].name' | while read repo; do
  git clone git@github.com:CR-AudioViz-AI/$repo.git
done
```

## Export Vercel Environment Variables
```bash
# For each project
vercel env pull .env.local --environment production
```

---

# ✅ MONTHLY CHECKLIST

- [ ] Verify Supabase PITR is enabled
- [ ] Test database restore from backup
- [ ] Verify all repos are cloned locally
- [ ] Audit credential vault
- [ ] Review access logs for anomalies
- [ ] Update this document if needed

-e 

---


# GAPS ANALYSIS & RECOMMENDATIONS
## What's Missing, What Needs Fixing

**Date:** December 1, 2025
**Status:** Comprehensive Review Complete

---

# 🔴 CRITICAL GAPS

## 1. NO AUTOMATED EXTERNAL BACKUP
**Risk Level:** 🔴 CRITICAL
**Impact:** Total data loss if Supabase account compromised

**Current State:**
- Relying solely on Supabase's built-in backups
- No external backup copies
- No cross-region replication

**Recommendation:**
```bash
# Set up automated daily backup to AWS S3
# GitHub Action: .github/workflows/backup-database.yml

name: Daily Database Backup
on:
  schedule:
    - cron: '0 4 * * *'  # 4 AM UTC daily
jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Backup Supabase
        run: |
          pg_dump ${{ secrets.SUPABASE_DB_URL }} | gzip > backup-$(date +%Y%m%d).sql.gz
          aws s3 cp backup-*.gz s3://cr-audioviz-backups/
```

**Cost:** ~$5/month for S3 storage

---

## 2. DUPLICATE/REDUNDANT TABLES
**Risk Level:** 🟡 MEDIUM
**Impact:** Confusion, data inconsistency, wasted storage

**Identified Duplicates:**
| Tables | Recommendation |
|--------|----------------|
| `activity_log` vs `activity_logs` | Consolidate to one |
| `users` vs `profiles` vs `user_profiles` | Define clear purpose |
| `documentation` vs `documents` | Clarify separation |
| `agents` vs `profiles` | Agents should extend profiles |

**Action:** Create migration to consolidate

---

## 3. JAVARI AI BUILD ERRORS
**Risk Level:** 🔴 CRITICAL
**Impact:** Primary AI assistant non-functional

**Current State:**
- 75 files with TypeScript errors
- Cannot deploy to Vercel
- Blocking autonomous development

**Root Cause:** 
- Type mismatches
- Missing imports
- Strict mode violations

**Action:** Systematic file-by-file fix (next priority)

---

## 4. NO RATE LIMITING ON ALL ENDPOINTS
**Risk Level:** 🟡 MEDIUM
**Impact:** API abuse, cost overruns

**Missing From:**
- Public property search
- Lead submission forms
- Some customer portal endpoints

**Action:** Add rate limiting middleware

---

## 5. INCOMPLETE RLS POLICIES
**Risk Level:** 🟡 MEDIUM
**Impact:** Potential data leakage

**Tables to Review:**
- Older tables may have weak/missing policies
- Some policies reference non-existent columns

**Action:** Full RLS audit

---

# 🟡 MEDIUM GAPS

## 6. NO EMAIL SERVICE CONNECTED
**Impact:** Saved search alerts don't send

**Status:** Cron job created, but email sending commented out
**Action:** Connect Resend or SendGrid, uncomment code

---

## 7. MISSING INDEXES ON LARGE TABLES
**Impact:** Slow queries as data grows

**Tables Needing Indexes:**
- `properties` - city, state, price, status (may exist)
- `javari_chat_sessions` - user_id, created_at
- `transactions` - status, created_at

**Action:** Run EXPLAIN ANALYZE, add missing indexes

---

## 8. NO MONITORING DASHBOARD
**Impact:** Can't see system health at a glance

**Missing:**
- Unified health dashboard
- Alert thresholds
- Cost monitoring

**Action:** Build admin monitoring page or integrate Datadog

---

## 9. ORPHANED/UNUSED TABLES
**Impact:** Wasted storage, confusion

**Suspicious Tables:**
- `resorts` - What is this for?
- `games` / `game_scores` - Which app?
- `spatial_ref_sys` - PostGIS default, can ignore

**Action:** Audit and archive/delete unused tables

---

## 10. CREDENTIAL ROTATION
**Impact:** Security risk if keys compromised

**Missing:**
- Automated key rotation
- Key usage tracking
- Expiration alerts

**Action:** Implement rotation schedule

---

# 🟢 LOW PRIORITY

## 11. Documentation Gaps
- Some modules undocumented
- API endpoints not fully documented
- No OpenAPI/Swagger spec

## 12. Test Coverage
- No automated tests visible
- No integration tests
- No load testing

## 13. Logging Standardization
- Different logging formats across apps
- No centralized log aggregation

---

# 📋 PRIORITIZED ACTION PLAN

## This Week
1. ✅ Complete vendor rolodex (DONE)
2. 🔄 Fix Javari AI build errors
3. ⬜ Set up automated database backup
4. ⬜ Verify Supabase backup settings

## Next Week
5. ⬜ Connect email service for alerts
6. ⬜ Audit and fix RLS policies
7. ⬜ Add missing indexes
8. ⬜ Consolidate duplicate tables

## This Month
9. ⬜ Build monitoring dashboard
10. ⬜ Implement credential rotation
11. ⬜ Archive unused tables
12. ⬜ Add rate limiting everywhere

## Next Quarter
13. ⬜ Automated testing
14. ⬜ API documentation (OpenAPI)
15. ⬜ Centralized logging
16. ⬜ DR drill

---

# 💰 COST IMPLICATIONS

| Action | Monthly Cost |
|--------|--------------|
| S3 Backup Storage | ~$5 |
| Email Service (Resend) | ~$20 |
| Monitoring (Datadog) | ~$50-100 |
| Additional Supabase (if needed) | ~$25 |
| **Total Infrastructure Add** | **~$100-150/mo** |

---

# ✅ WHAT'S WORKING WELL

1. **Database Structure** - Well-organized, normalized
2. **RLS on Critical Tables** - Properties, customers secured
3. **Multi-tenant Ready** - tenant_id in place
4. **Comprehensive Javari Schema** - 38 tables for AI learning
5. **Bot Infrastructure** - 9 bots running 24/7
6. **Payment Integration** - Stripe + PayPal ready
7. **Vendor System** - Just deployed, fully functional

