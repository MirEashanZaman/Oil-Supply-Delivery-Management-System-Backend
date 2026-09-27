# Architecture Decision Records (ADRs)

## ADR-001: Adoption of SAGA Pattern for Order Fulfillment
- **Status**: Accepted
- **Context**: The oil supply and delivery system involves multi-step transactions spanning inventory reservation, payment gateway authorization, and logistics depot assignment. A traditional monolithic database lock creates bottleneck latency and distributed consistency failures.
- **Decision**: Implement an Orchestrated SAGA pattern (`OrderFulfillmentSagaOrchestrator`) with automated compensating rollback steps.
- **Consequences**:
  - *Positive*: High throughput, fault tolerance, data consistency without distributed two-phase commit (2PC) locks.
  - *Trade-off*: Eventual consistency requires handling asynchronous state transitions.

---

## ADR-002: Implementation of Strategy Pattern for Multi-Channel Payments
- **Status**: Accepted
- **Context**: The system supports multiple payment channels (Credit Card, Mobile Wallets, Bank Wire Transfers). Hardcoded conditional branches violate the Open/Closed Principle.
- **Decision**: Introduce a polymorphic `PaymentStrategy` contract with dynamic resolution via `PaymentStrategyResolver`.
- **Consequences**:
  - *Positive*: Seamless integration of future payment providers without touching existing service code.

---

## ADR-003: Facade Pattern for Unified Subsystem Boundary
- **Status**: Accepted
- **Context**: Client controllers and application services were directly managing low-level entity repositories, SAGA triggers, and observer notifications.
- **Decision**: Introduce `OrderFulfillmentFacade` to serve as the unified entry point for all high-level business flows.
- **Consequences**:
  - *Positive*: Clean separation of concerns, reduced cognitive complexity, adheres to Law of Demeter.

---

## ADR-004: Three Pillars of Observability (Logs, Metrics, Traces)
- **Status**: Accepted
- **Context**: Need real-time visibility into latency, throughput, and error rates across API endpoints.
- **Decision**: Implement `ObservabilityMiddleware` injecting correlation IDs (`X-Trace-Id`) and collecting memory/response time metrics.
- **Consequences**:
  - *Positive*: Deep system diagnostics and rapid root-cause analysis.

---

## ADR-005: Stateless Cryptographic HMAC-SHA256 Password Reset Engine
- **Status**: Accepted
- **Context**: PRD Feature 1 (Auth & Forgot Password) requires users to verify their identity via email OTP without incurring high database load, table pollution, or orphan cache records.
- **Decision**: Implement an HMAC-SHA256 signed stateless token (`generateStatelessOtp` & `resetPasswordWithStatelessOtp`) combining email, OTP, and timestamp with the user's password hash as the secret.
- **Consequences**:
  - *Positive*: Zero database storage for OTPs, mathematical 5-minute auto-expiry enforcement, automatic invalidation upon password update.
