# Software Engineering Principles & Design Patterns in MediCore

This document summarizes the main **Software Engineering principles** and **design patterns** used in **MediCore**, a multi-service healthcare platform built with **React + Vite** on the frontend and **Spring Boot microservices** on the backend.

MediCore is organized around a single **API gateway** and several specialized services:

- `authservice` — registration, login, JWT-based identity, and user lookup
- `userservice` — patient, doctor, pharmacist, and admin workflows
- `bloodbankservice` — donor registration and donor filtering
- `communicationservice` — secure doctor-patient chat
- `apigateway` — request routing and CORS management
- `frontend` — UI, auth state, route protection, and API communication

The overall design focuses on **separation of concerns**, **role-based access control**, and **service-level independence**.

---

## 1. Core Software Engineering Principles

### Single Responsibility Principle (SRP)

Each module in MediCore tries to do one job well:

- `AuthController` handles auth endpoints such as signup, login, and logout.
- `AuthService` performs registration, authentication, JWT creation, and user data retrieval.
- `PatientController` handles patient-only appointment and prescription workflows.
- `DoctorController` handles doctor-only appointment completion and prescription writing.
- `PharmacistController` handles medicine inventory and prescription lookup.
- `BloodBankController` handles donor registration and donor queries.
- On the frontend, `src/api/client.js` only handles HTTP requests and token storage, while `AuthContext.jsx` only manages authentication state.

This separation keeps the code easier to test, maintain, and extend.

### Open/Closed Principle (OCP)

Several parts of the project are written so new behavior can be added without rewriting the existing core flow:

- `apiRequest()` in `frontend/src/api/client.js` is a reusable request wrapper. New API calls are added by passing different endpoints and options, not by rewriting the request logic.
- The backend exposes new endpoints through controllers without changing the frontend state architecture.
- New UI pages reuse the existing auth and API layers rather than introducing a new fetch or login system.

### Dependency Inversion Principle (DIP)

The higher-level parts of the system depend on abstractions or shared service contracts instead of concrete implementation details:

- Controllers depend on repositories and shared services rather than directly embedding persistence logic everywhere.
- The frontend pages depend on `apiRequest()` and `useAuth()` instead of directly coupling every component to low-level storage and fetch logic.
- The gateway centralizes routing so the frontend does not need to know each microservice internals.

### Separation of Concerns

MediCore is built as a microservice system, so responsibilities are split by business domain:

- identity and access control
- appointments and prescriptions
- blood donor management
- real-time messaging
- medicine inventory
- admin approval and reporting

This is one of the strongest design choices in the project because each service can evolve independently.

### Encapsulation

Internal details are hidden behind small public interfaces:

- `decodeJwt()` in `AuthContext.jsx` is a private helper used only inside that file.
- `ProtectedRoute` hides the route-checking logic from each individual page.
- Backend controllers expose clean JSON responses while hiding the database and service orchestration steps inside helper methods.

---

## 2. Design Patterns Used in MediCore

### Facade Pattern

Several controllers act as a facade over more complex workflows:

- `AuthController` hides registration, password hashing, duplicate-email checks, JWT creation, and cross-service doctor-profile creation behind a small set of endpoints.
- `PatientController` hides booking rules, slot generation, prescription creation, doctor-profile lookup, and response shaping behind one booking endpoint.
- `AdminController` hides doctor approval, role changes, and user deletion behind admin-only routes.

This gives the frontend a simple entry point while the backend performs the detailed work internally.

### Builder Pattern

MediCore uses Lombok’s `@Builder` pattern heavily for clean object creation:

- `User.builder()` in the auth service
- `Appointment.builder()` in the patient workflow
- `Prescription.builder()` in booking and prescription flows
- `ChatMessage.builder()` in the communication service
- `BloodBankDonor.builder()` in blood bank registration

Builder is useful here because many domain objects have optional fields, default values, and a lot of properties.

### Repository Pattern

Spring Data repositories are used throughout the backend:

- `UserRepository`
- `DoctorProfileRepository`
- `AppointmentRepository`
- `PrescriptionRepository`
- `MedicineRepository`
- `BloodBankRepository`
- `ChatMessageRepository`

This pattern keeps persistence logic separate from controller logic and makes the database layer easier to swap or test.

### Singleton Pattern

Spring-managed components such as controllers, services, config classes, and interceptors are singleton-scoped by default. In practice, this means:

- one shared `AuthService` instance
- one shared `RestTemplate` / configuration setup per application context
- one shared `AuthContext` state provider in the frontend tree

This fits well for stateless request handling and shared cross-cutting configuration.

### Guard / Route Protection Pattern

Although not a classic GoF pattern, the frontend uses a clear route-guarding approach:

- `ProtectedRoute.jsx` prevents unauthorized users from entering protected screens.
- It also blocks users with the wrong role from accessing pages meant for another role.

This mirrors the backend’s role checks and keeps the UI and API security rules aligned.

### Adapter-like Integration

The project contains a few places where one layer adapts to another:

- The frontend auth flow decodes the JWT payload and adapts it into app state.
- Backend services use `RestTemplate` to adapt one microservice’s data into another service’s workflow.
- The gateway adapts many internal services into one public API surface.

---

## 3. Feature-by-Feature Architecture Mapping

### 1. User Registration & Login

**Main components:** `AuthController`, `AuthService`, `User`, `AuthContext`, `api/client.js`

- `AuthController` acts as the facade for signup, login, logout, and user lookup.
- `AuthService` performs duplicate-email checks, password hashing, JWT generation, and post-registration doctor profile creation.
- `User` is built with `User.builder()` and uses lifecycle hooks like `@PrePersist` to assign IDs, timestamps, and default approval values.
- `AuthContext` stores the authenticated user and restores session state from local storage.
- `api/client.js` centralizes token storage and authenticated HTTP calls.

**Principles shown:** SRP, OCP, DIP, Encapsulation

**Patterns shown:** Facade, Builder, Repository, Singleton

### 2. Patient Appointment Booking

**Main components:** `PatientController`, `AppointmentRepository`, `PrescriptionRepository`, `DoctorProfileRepository`

- `PatientController` validates the role, creates an appointment, creates a matching prescription shell, and returns a response tailored for the UI.
- Slot timing is computed inside the controller using a dedicated helper method, so the frontend does not have to duplicate business rules.
- Repository access is isolated from the booking flow.

**Principles shown:** SRP, DIP, Separation of Concerns

**Patterns shown:** Facade, Builder, Repository

### 3. Doctor Workflow: Check-In, Completion & Prescription Writing

**Main components:** `DoctorController`, `PrescriptionRepository`, `AppointmentRepository`

- `DoctorController` restricts access to doctors only and handles doctor-specific workflows.
- Appointment completion and prescription writing are handled as separate operations.
- The controller also shapes response data for the frontend appointment queue.

**Principles shown:** SRP, Encapsulation

**Patterns shown:** Facade, Repository

### 4. Pharmacist Inventory and Prescription Search

**Main components:** `PharmacistController`, `MedicineRepository`, `PrescriptionRepository`, `AppointmentRepository`, `RestTemplate`

- Medicine management is isolated from appointment and prescription search logic.
- The controller calls `authservice` to resolve a patient email into a user ID, then combines that with local appointment/prescription data.
- Inventory validation and record updates stay inside the pharmacist service.

**Principles shown:** SRP, DIP, Separation of Concerns

**Patterns shown:** Facade, Repository, Adapter-like service integration

### 5. Admin Approval and User Management

**Main components:** `AdminController`, `DoctorProfileRepository`, `RestTemplate`, `AuthService` internal endpoints

- Admin operations are separated from patient/doctor workflows.
- Doctor approval, disapproval, user role changes, and deletions are grouped under admin-only routes.
- The controller forwards authenticated calls to the auth service to keep the canonical user record in one place.

**Principles shown:** SRP, DIP, Encapsulation

**Patterns shown:** Facade, Repository, Adapter-like microservice integration

### 6. Blood Bank Coordination

**Main components:** `BloodBankController`, `BloodBankRepository`, `UserContext`

- Patients can register themselves as donors, update last-donation dates, and view donor eligibility.
- Admin-only donor management is separated from patient actions.
- Donor eligibility is computed in the service layer so the frontend receives clean filtered data.

**Principles shown:** SRP, Separation of Concerns, Encapsulation

**Patterns shown:** Facade, Builder, Repository

### 7. Doctor-Patient Communication

**Main components:** `ChatController`, `ChatMessage`, `ChatMessageRepository`, `JwtInterceptor`, `WebConfig`

- The chat service is isolated from appointments and prescriptions.
- `WebConfig` registers a JWT interceptor only for chat routes, which keeps access control focused and modular.
- The controller validates roles and conversation ownership before returning message history.

**Principles shown:** SRP, DIP, Encapsulation

**Patterns shown:** Facade, Repository, Singleton, Interceptor-based cross-cutting concern handling

### 8. Frontend Route Protection and Shared Auth State

**Main components:** `AuthContext.jsx`, `ProtectedRoute.jsx`, `api/client.js`, `endpoints.js`

- `AuthContext` is the single source of truth for the logged-in user.
- `ProtectedRoute` blocks unauthenticated users and role-mismatched users.
- `api/client.js` centralizes HTTP calls, error parsing, and token persistence.

**Principles shown:** SRP, OCP, DIP, Encapsulation

**Patterns shown:** Guard/Route protection, Singleton-like provider, Adapter-like token handling

---

## 4. Short Conclusion

In MediCore, the strongest and most clearly visible software engineering ideas are:

- **SRP** through service separation
- **DIP** through repositories, shared API helpers, and gateway-based communication
- **Facade** through controllers
- **Builder** through entity construction
- **Repository** through Spring Data
- **Singleton** through Spring-managed components and the shared auth provider on the frontend

Overall, the project demonstrates a clean microservice architecture with role-based access control, reusable frontend abstractions, and well-structured backend workflows.
