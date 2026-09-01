# Stage 6 — Specification Drift & Consistency Analysis

## 6.1 Diff Analysis: Hand-Written (`03_openapi_original.yaml`) vs Implementation (`/openapi.json`)

| Discrepancy / Drift Point | Origin / Classification | Explanation & Resolution |
|---|---|---|
| **Nested Sub-resource Payment Route** (`/api/bookings/{id}/payments` vs `/api/payments`) | **Spec Drift (Design Refinement)** | The original hand-written specification exposed `/api/payments` with `booking_id` in the body. The implementation adopted the RESTful sub-resource `/api/bookings/{id}/payments` to enforce strict URL-level object binding and RBAC check on the parent booking. |
| **Nested Review Route** (`/api/bookings/{id}/review` vs `/api/reviews`) | **Spec Drift (Design Refinement)** | Reconciled to bind the post-stay review action directly to the stay identifier (`/bookings/{id}/review`). |
| **Error Response Envelope Definition** | **Implementation Refinement** | FastAPI's automatic validation errors (`422 Unprocessable Entity`) use Pydantic's default `{"detail": [...]}` format unless intercepted. Consolidated via a global custom exception handler in `errors.py` to ensure all 4xx/5xx responses adhere to the standard `{"error": {...}}` envelope. |
| **409 Conflict Declaration in OpenAPI Decorators** | **Spec Correction** | Added explicit `responses={409: {"model": ErrorEnvelope}}` decorators to mutation routes (`POST /bookings`, `PATCH /bookings/{id}`) so that `/docs` Swagger UI accurately documents relational constraint violation responses. |
| **Query Parameter Whitelisting & Optional Filters** | **Implementation Refinement** | Refined `/api/rooms/availability` and `/api/bookings` query parameters to match Pydantic schema types and ISO date constraints. |

---

## 6.12 The Authoritative Source of Truth & Drift Prevention Strategy

### The Three API Artifacts:
1. `05_openapi_final.yaml` (Contract Specification)
2. FastAPI Auto-Generated Schema (`/openapi.json`) (Code Implementation)
3. Postman Collection (`06_postman_collection.json`) (Consumer / Test Harness)

### Which one is Authoritative?
**`05_openapi_final.yaml` is the Authoritative Contract (Design-First Source of Truth).**

### Mechanisms to Prevent Specification Drift:
1. **Automated CI Contract Testing (Spectral / Dredd / Schemathesis):**
   - Integrate `schemathesis` or `dredd` into the GitHub Actions CI pipeline.
   - On every pull request, the test runner boots the FastAPI test server and executes property-based testing directly against `05_openapi_final.yaml`. Any missing field, undocumented status code, or modified response model fails the CI build.
2. **Schema-Generated Code / Pydantic Model Generation:**
   - Use `datamodel-code-generator` or OpenAPI Generator to derive Pydantic schemas directly from the OpenAPI YAML spec, preventing manual drift in Python code.
3. **Automated Postman Collection Synchronization via Newman:**
   - Use `openapi-to-postmanv2` CLI in CI to automatically generate and validate the Postman collection from `05_openapi_final.yaml`, ensuring test assertions and environments never fall out of sync.
