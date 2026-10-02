# Oil Supply & Delivery Management System (Backend ERP)

An enterprise-grade, distributed backend system engineered with NestJS, PostgreSQL, TypeORM, and advanced software architecture patterns for petroleum refining, bulk fuel logistics, terminal distribution, and retail dealer management.

---

## Architectural & Design Patterns Suite

The backend implements a comprehensive suite of enterprise design patterns located under `src/patterns/`, validated with a dedicated automated test suite:

### 1. SAGA Pattern Orchestrator (`src/patterns/saga/`)
- Orchestrates multi-step distributed order fulfillment transactions (Inventory Reservation, Escrow Authorization, Depot Allocation, Route Scheduling).
- Implements 2-Phase Commit compensation protocols to guarantee automatic rollback and state consistency upon downstream failures.

### 2. Strategy Pattern (`src/patterns/strategy/`)
- Provides pluggable payment gateway resolution supporting:
  - Commercial Petroleum Credit Card Strategy
  - Mobile Wallet Escrow Strategy (bKash / Nagad)
  - ISO-20022 Swift Bank Wire Transfer Strategy

### 3. Builder Pattern (`src/patterns/builder/`)
- Constructs complex, validated petroleum order aggregates enforcing constraints on volume, HazMat certifications, and destination depot routing.

### 4. Adapter Pattern (`src/patterns/adapter/`)
- Interfaces modern REST/JSON microservices with legacy SWIFT MT103 / ISO-20022 interbank petroleum clearing messages.

### 5. Factory Method Pattern (`src/patterns/factory/`)
- Instantiates system actors (Customers, Wholesale Dealers, Refinery Suppliers, Tanker Deliverymen, and Platform Admins) with role-specific permissions and default capabilities.

### 6. Singleton Pattern (`src/patterns/singleton/`)
- Manages global system environment, Platts pricing benchmark constants, and refinery operational thresholds with thread-safe singleton state.

### 7. Cache-Aside Performance Pattern (`src/patterns/caching/`)
- Implements high-throughput in-memory caching with automatic TTL eviction for high-frequency pricing and product catalog reads.

### 8. Observer Pattern (`src/patterns/observer/`)
- Dispatches event-driven notifications across supply chain milestones (Order Placed, Tanker Dispatched, e-POD Verified).

### 9. IoT Pub/Sub Telemetry Broker (`src/patterns/iot/`)
- Ingests real-time road tanker telemetry: cargo temperature (Celsius), tank pressure (Bar), Coriolis flowmeter discharge (LPM), and GPS coordinates.

### 10. Geo-Proximity Haversine Engine (`src/patterns/geo/`)
- Computes spherical distance matrices between destination depots and supply terminals, sorting nearest available suppliers and dealers.

### 11. Enterprise Load Balancer (`src/patterns/load-balancer/`)
- High-availability traffic balancing across backend cluster nodes supporting:
  - Round Robin
  - Weighted Round Robin
  - Least Connections
  - Deterministic IP Hash routing
  - Dynamic health-check eviction

### 12. Tamper-Evident Cryptographic Audit Trail (`src/patterns/audit/`)
- Implements SHA-256 block-linked audit records for regulatory compliance (SAGA transactions, e-POD PIN verifications, HazMat road transport approvals).
- Provides instant cryptographic chain verification to detect unauthorized log mutation.

### 13. Petroleum RAG AI Knowledge Agent (`src/patterns/ai/`)
- Domain-specific Retrieval-Augmented Generation pipeline retrieving ASTM / API fuel standards and HazMat road transport guidelines.

---

## Installation & Setup

```bash
# Install dependencies
$ npm install

# Start development server
$ npm run start:dev

# Run automated patterns test suite (25/25 passing)
$ npm test -- src/patterns/patterns.spec.ts
```

---

## Test Results

```
PASS src/patterns/patterns.spec.ts
  Enterprise Software Architecture & Design Patterns Suite
    SAGA Pattern Orchestrator (2 tests)
    Strategy Pattern (4 tests)
    Builder Pattern (2 tests)
    Adapter Pattern (1 test)
    Singleton Pattern (1 test)
    Factory Method Pattern (2 tests)
    Cache-Aside Performance Manager (1 test)
    Observer Pattern (1 test)
    IoT Pub/Sub Broker (1 test)
    Petroleum RAG Agent Pipeline (1 test)
    Geo-Proximity Supplier & Dealer Detection (3 tests)
    Enterprise Load Balancer Pattern (4 tests)
    Enterprise Audit Trail & Cryptographic Chain Pattern (2 tests)

Test Suites: 1 passed, 1 total
Tests:       25 passed, 25 total
```
