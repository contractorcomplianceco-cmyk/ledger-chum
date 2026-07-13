# ServiceConnect ↔ Ledger Integration API

Phase-1 contract for the Ledger accounting backend consumed by ServiceConnect.

## Authentication

Every request:

- `Authorization: Bearer <api_client_key>` — issued per-organization (`api_clients.key_hash`).
- `Idempotency-Key: <uuid>` — required on all mutations. Duplicate keys return the previously stored response verbatim (safe to retry).
- `Content-Type: application/json`

Responses include `correlation_id` for cross-system tracing and `audit_event_id`
for mutations that write to the ledger.

## Base URL

- Production: `https://project--<project-id>.lovable.app/api/public/integrations`
- Preview:    `https://project--<project-id>-dev.lovable.app/api/public/integrations`

## Endpoints

### `POST /customers` — upsert a customer

```json
{
  "external_id": "sc_cust_9821",
  "name": "Acme HVAC",
  "email": "ap@acme.example",
  "phone": "+1-555-0100",
  "billing_address": { "line1": "1 Main St", "city": "Denver", "state": "CO", "postal": "80202" },
  "status": "active"
}
```

Response `201` (created) or `200` (updated):
```json
{ "id": "uuid", "external_id": "sc_cust_9821", "idempotency_key": "...", "correlation_id": "..." }
```

### `POST /work-orders/completed` — supervisor-approved completed WO → draft invoice

Requires the customer to already exist (send `POST /customers` first).

```json
{
  "external_id": "sc_wo_44210",
  "work_order_ref": "WO-44210",
  "customer_external_id": "sc_cust_9821",
  "issue_date": "2026-07-13",
  "due_date": "2026-08-12",
  "invoice_number": "INV-2026-00042",
  "memo": "AC coil replacement, 08 Jul 2026",
  "lines": [
    { "description": "Labor 3h", "quantity": 3, "unit_price": 145.00, "tax_rate": 0, "account_code": "4100" },
    { "description": "Evaporator coil, part #EC-45", "quantity": 1, "unit_price": 620.00, "tax_rate": 0.0725, "account_code": "4200" }
  ]
}
```

Ledger creates a **draft** invoice — an accountant must post it (`postInvoice`)
before it hits the GL. Response `201`:
```json
{
  "id": "uuid", "invoice_number": "INV-2026-00042",
  "work_order_ref": "WO-44210", "status": "draft",
  "total": 1085.95, "balance": 1085.95,
  "audit_event_id": "uuid", "correlation_id": "uuid"
}
```

Unknown `account_code` falls back to the org's lowest-numbered active revenue account.

### `POST /invoices` — direct invoice push (skips WO path)

Same shape as `/work-orders/completed` minus `work_order_ref` requirement.

### `POST /payments` — record a customer payment, optionally applied to invoices

```json
{
  "external_id": "sc_pay_5501",
  "customer_external_id": "sc_cust_9821",
  "payment_date": "2026-07-20",
  "method": "ach",
  "reference": "NEFCU-ACH-118822",
  "amount": 1085.95,
  "memo": "Payment on INV-2026-00042",
  "apply_to": [
    { "invoice_external_id": "sc_wo_44210", "amount": 1085.95 }
  ]
}
```

Response `201`:
```json
{
  "id": "uuid", "amount": 1085.95, "unapplied_amount": 0,
  "applications": 1, "audit_event_id": "uuid", "correlation_id": "uuid"
}
```

Rules:
- `sum(apply_to.amount) ≤ amount`
- Application amount ≤ invoice balance
- Invoice status transitions: `sent → partial → paid` automatically

### `POST /inventory-consumption` — parts/materials consumed on a WO

```json
{
  "external_id": "sc_cons_88112",
  "work_order_ref": "WO-44210",
  "item_ref": "EC-45",
  "item_description": "Evaporator coil",
  "quantity": 1,
  "unit_cost": 380.00,
  "consumed_at": "2026-07-08T14:32:00Z"
}
```

Response `201`:
```json
{ "id": "uuid", "work_order_ref": "WO-44210", "total_cost": 380.00, "audit_event_id": "uuid", "correlation_id": "uuid" }
```

Phase 1 records consumption for reporting only; COGS journal posting is a
Phase 2 follow-up (once ServiceConnect confirms cost-of-sale accounts per item
category).

## Errors

| Status | Meaning |
| --- | --- |
| 400 | Missing/invalid JSON or `Idempotency-Key` |
| 401 | Missing/invalid/inactive Bearer token |
| 422 | Validation failure or referenced entity missing (customer, invoice) |
| 500 | Server error — safe to retry with the same `Idempotency-Key` |

Error body: `{ "error": "message" }`. Errors are recorded in `sync_history`
with `status = 'error'` for diagnostics; retries use a fresh idempotency key
or the same one (duplicates of failed attempts are allowed).

## Idempotency

- Unique index on `(org_id, idempotency_key)`.
- Successful responses cached for the lifetime of the row (retention TBD).
- Clients SHOULD generate a UUID v4 per logical action and reuse it across retries.
- Different payloads with the same key still return the original response — pick a new key when the semantic action changes.

## API key issuance

Owners will provision ServiceConnect's key via a forthcoming admin route.
For pilot cutover, a key is inserted directly into `api_clients` with:

```
key_prefix: "sc_"
key_hash: sha256(raw_token)
active: true
```

The raw token is stored in ServiceConnect's secret store; Ledger only ever
holds the hash.
