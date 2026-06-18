# Graph Report - .  (2026-06-17)

## Corpus Check
- Corpus is ~14,768 words - fits in a single context window. You may not need a graph.

## Summary
- 58 nodes · 28 edges · 37 communities (5 shown, 32 thin omitted)
- Extraction: 64% EXTRACTED · 36% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_System Architecture|System Architecture]]
- [[_COMMUNITY_Module Patterns|Module Patterns]]
- [[_COMMUNITY_Access Control|Access Control]]
- [[_COMMUNITY_Storage Provider|Storage Provider]]
- [[_COMMUNITY_Brand Assets|Brand Assets]]
- [[_COMMUNITY_Activity Logging|Activity Logging]]
- [[_COMMUNITY_Error Handling|Error Handling]]
- [[_COMMUNITY_Loading States|Loading States]]
- [[_COMMUNITY_Not Found|Not Found]]
- [[_COMMUNITY_Auth Route|Auth Route]]
- [[_COMMUNITY_OAuth Callback|OAuth Callback]]
- [[_COMMUNITY_Channel UI|Channel UI]]
- [[_COMMUNITY_Channel Card|Channel Card]]
- [[_COMMUNITY_Dashboard Layout|Dashboard Layout]]
- [[_COMMUNITY_Dashboard Home|Dashboard Home]]
- [[_COMMUNITY_Review Request|Review Request]]
- [[_COMMUNITY_Sidebar Navigation|Sidebar Navigation]]
- [[_COMMUNITY_Utility Functions|Utility Functions]]
- [[_COMMUNITY_Proxy Handler|Proxy Handler]]
- [[_COMMUNITY_File Icon|File Icon]]
- [[_COMMUNITY_Globe Icon|Globe Icon]]
- [[_COMMUNITY_Public Layout|Public Layout]]
- [[_COMMUNITY_Public Home|Public Home]]
- [[_COMMUNITY_Window Icon|Window Icon]]
- [[_COMMUNITY_Channel Repository|Channel Repository]]
- [[_COMMUNITY_Upload Request Repository|Upload Request Repository]]
- [[_COMMUNITY_Uploader Assignment Repository|Uploader Assignment Repository]]
- [[_COMMUNITY_Channel Service|Channel Service]]
- [[_COMMUNITY_Upload Request Service|Upload Request Service]]
- [[_COMMUNITY_Uploader Service|Uploader Service]]
- [[_COMMUNITY_Video Metadata|Video Metadata]]
- [[_COMMUNITY_Settings Page|Settings Page]]
- [[_COMMUNITY_Upload Options|Upload Options]]
- [[_COMMUNITY_File Upload Handler|File Upload Handler]]
- [[_COMMUNITY_Uploader Table|Uploader Table]]
- [[_COMMUNITY_Uploads Route|Uploads Route]]

## God Nodes (most connected - your core abstractions)
1. `Upload Pipeline` - 7 edges
2. `Modular Monolith` - 4 edges
3. `Upload Request Lifecycle` - 3 edges
4. `Service Layer` - 3 edges
5. `IStorageProvider` - 2 edges
6. `Owner Role` - 2 edges
7. `Uploader Role` - 2 edges
8. `Permission Model` - 2 edges
9. `Repository Layer` - 2 edges
10. `Validation Layer` - 2 edges

## Surprising Connections (you probably didn't know these)
- `LocalStorageProvider` --implements--> `IStorageProvider`  [EXTRACTED]
  modules/storage/providers/local-provider.ts → modules/storage/types.ts
- `StorageService` --references--> `IStorageProvider`  [EXTRACTED]
  modules/storage/services/storage.service.ts → modules/storage/types.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Upload Flow Participants** — concept_owner_role, concept_uploader_role, concept_permission_model, concept_upload_request_lifecycle, concept_upload_pipeline, concept_tus_protocol, concept_cloudflare_r2, concept_video_processing [EXTRACTED 0.95]
- **Module Architecture Layers** — concept_modular_monolith, concept_service_layer, concept_repository_layer, concept_validation_layer, concept_multi_file_prisma [EXTRACTED 0.95]
- **Async & Notification Infrastructure** — concept_event_driven_design, concept_notification_system, concept_audit_log, concept_activity_log, concept_rate_limiting [INFERRED 0.85]

## Communities (37 total, 32 thin omitted)

### Community 0 - "System Architecture"
Cohesion: 0.32
Nodes (8): Authentication Architecture, Cloudflare R2 Storage, Event Driven Design, Notification System, Rate Limiting, TUS Upload Protocol, Upload Pipeline, Video Processing (FFmpeg/FFprobe)

### Community 1 - "Module Patterns"
Cohesion: 0.60
Nodes (5): Modular Monolith, Multi-File Prisma Architecture, Repository Layer, Service Layer, Validation Layer

### Community 2 - "Access Control"
Cohesion: 0.67
Nodes (4): Owner Role, Permission Model, Upload Request Lifecycle, Uploader Role

### Community 4 - "Storage Provider"
Cohesion: 0.67
Nodes (3): LocalStorageProvider, StorageService, IStorageProvider

## Knowledge Gaps
- **38 isolated node(s):** `DashboardHomePage`, `DashboardLayout`, `ReviewRequestDetailPage`, `SettingsPage`, `PublicLayout` (+33 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Upload Pipeline` connect `System Architecture` to `Access Control`, `Brand Assets`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `Upload Request Lifecycle` connect `Access Control` to `System Architecture`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Upload Pipeline` (e.g. with `Authentication Architecture` and `README.md`) actually correct?**
  _`Upload Pipeline` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `Modular Monolith` (e.g. with `Multi-File Prisma Architecture` and `Repository Layer`) actually correct?**
  _`Modular Monolith` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `DashboardHomePage`, `DashboardLayout`, `ReviewRequestDetailPage` to the rest of the system?**
  _38 weakly-connected nodes found - possible documentation gaps or missing edges._