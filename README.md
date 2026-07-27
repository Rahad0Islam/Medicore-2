# MediCore API Documentation

Live application: https://medicore-nu-one.vercel.app/

This document is the contract between the frontend and backend teams for MediCore, and also serves as the general overview for this repository: what the system does, how the services are organized, and how to get everything running on your own machine.

## Project Overview

MediCore is a multi-service platform built to handle authentication, role-based access control (RBAC), patient appointment scheduling, digital prescriptions, pharmacy inventory control, real-time doctor-patient communication, and blood bank coordination.

### System Roles

* **Patient**: Can search for doctors, book appointments, view prescriptions, chat with doctors, and register as blood donors.
* **Doctor**: Can manage appointments, write digital prescriptions, and check historical patient charts. Requires Admin approval before appearing on patient directories.
* **Pharmacist**: Manages medicine stock, prices, and catalog additions.
* **Admin**: Oversees system compliance, specifically approving or rejecting Doctor registration profiles.

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Context API for auth state, plain CSS (no UI framework) |
| Backend | Java, Spring Boot, Spring Cloud Gateway for service routing |
| Architecture | Microservices: auth-service, user-service, bloodbank-service, communication-service, behind a single API gateway |
| Authentication | JWT (JSON Web Token), issued on login and passed via `Authorization: Bearer` header |
| Database | PostgreSQL, hosted on Neon (NeonDB) |
| Build tool | Maven |
| Frontend hosting | Vercel |
---

## Getting Started

If you want to run MediCore on your own machine, fork this repository first rather than cloning it directly. This keeps your local changes and any environment-specific configuration separate from the main project, and makes it easier to open a pull request later if you want to contribute back.

1. Fork the repository by clicking "Fork" on the GitHub page.
2. Clone your fork locally:

```bash
git clone https://github.com/<your-username>/Medicore-2.git
cd Medicore-2
```

3. Add the original repository as an upstream remote, so you can pull in changes made by the rest of the team later:

```bash
git remote add upstream https://github.com/Rahad0Islam/Medicore-2.git
```

4. Whenever you want to sync your fork with the latest changes from the main repository:

```bash
git fetch upstream
git merge upstream/main
```

Push your own work to your fork (`git push origin <branch-name>`) and open a pull request against the main repository when you are ready to share it.

The backend is split into independent services (auth, user, bloodbank, and the others listed in the sections below), sitting behind an API gateway. Each service is a standalone Spring Boot application and needs to be started on its own.

### Running the services locally

For each service:

1. Open the service folder in your IDE (IntelliJ, VS Code with the Java extensions, or similar).
2. Fill in `application.properties` (or `application.yml`) with your own values. At minimum you will need to set:
   * Your database connection details (URL, username, password)
   * A JWT signing secret, used to issue and validate access tokens
   * The port the service should run on, if you are not using the default
3. Run the service (`./mvnw spring-boot:run`, or run the main class directly from your IDE).
4. Repeat for each service, then start the API gateway last, since it depends on the other services being reachable.

Since `application.properties` typically contains secrets and is not committed to the repository, you will need to create your own copy locally. If the repository includes an `application.properties.example` or similar template, copy it and fill in your own values rather than starting from scratch.

### Gateway routing

The API gateway runs on port `3000` and routes incoming requests to each downstream service based on the request path. Its `application.properties` looks like this:

```properties
spring.application.name=apigateway
server.port=3000

spring.cloud.gateway.routes[0].id=auth-service
spring.cloud.gateway.routes[0].uri=http://localhost:8001
spring.cloud.gateway.routes[0].predicates[0]=Path=/api/v1/auth/**

spring.cloud.gateway.routes[1].id=bloodbank-service
spring.cloud.gateway.routes[1].uri=http://localhost:8003
spring.cloud.gateway.routes[1].predicates[0]=Path=/api/v1/bloodbank/**

spring.cloud.gateway.routes[2].id=communication-service
spring.cloud.gateway.routes[2].uri=http://localhost:8004
spring.cloud.gateway.routes[2].predicates[0]=Path=/api/v1/chat/**

spring.cloud.gateway.routes[3].id=user-service
spring.cloud.gateway.routes[3].uri=http://localhost:8002
spring.cloud.gateway.routes[3].predicates[0]=Path=/api/v1/**
```

In short: auth-service runs on `8001`, user-service on `8002`, bloodbank-service on `8003`, and communication-service on `8004`, with the gateway itself on `3000` tying them together. Make sure each service's own `server.port` matches what the gateway expects above, or the routes will fail to resolve.

### Deployment notes

The endpoint URLs in this document point at `http://localhost:3000`, which matches the API gateway's port in local development. When deploying to a staging or production environment, these need to be updated to match your actual gateway URL, and the frontend's API base configuration needs to point at the same address. CORS settings on the backend should also be updated to allow requests from your deployed frontend's origin, since `localhost` will not be reachable from a hosted client.

---

## API Reference

All endpoints are prefixed with `/api/v1`. Authenticated routes require an `Authorization: Bearer <access_token>` header.

**Roles:** PATIENT · DOCTOR · PHARMACIST · ADMIN

Decoded JWT payload:

| Field | Description |
|---|---|
| userId | Unique identifier of the authenticated user |
| name | Full name of the user |
| email | Email address used at signup |
| role | One of `patient`, `doctor`, `pharmacist`, `admin` |
| approval | Whether the account is approved (only meaningful for doctors) |
| iat | Token issued-at timestamp |
| exp | Token expiry timestamp |

### Auth — /api/v1/auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /signup | Public | Register a new user. `approval` defaults to `true` for every role except `doctor`, which defaults to `false` |
| POST | /login | Public | Login, returns an `accessToken` and the user's profile data |

### User — /api/v1/user

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| PUT | /profile | Any role | Update role-specific profile fields (doctor fields, pharmacist fields, etc.) |
| GET | /doctors | Patient, Admin, Pharmacist | List all approved doctors |
| GET | /doctors/search | Patient | Filter doctors by `specialization` and/or `location` query params |
| GET | /admin/dashboard/stats | Admin | Aggregate registration counts by role |

### Patient — /api/v1/patient

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /appointments | Patient | Book an appointment with a doctor |
| GET | /myallappointments | Patient | List all of the authenticated patient's booked appointments |
| GET | /prescriptions | Patient | List all prescriptions issued to the authenticated patient |
| GET | /prescriptions/doctor/:doctorId | Patient | Filter the patient's own prescriptions by a specific doctor |

### Doctor — /api/v1/doctor

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| PUT | /prescriptions/:prescriptionId | Doctor | Fill in the description and medicine details for a prescription |
| GET | /prescriptions/patient/:patientId | Doctor | View a specific patient's prescription history |
| GET | /appointments | Doctor | List the doctor's own appointment queue, split into `complete` and `incomplete` |

### Admin — /api/v1/admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| PATCH | /approve-doctor/:doctorId | Admin | Approve a pending doctor registration |

### Pharmacist — /api/v1/pharmacist

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /medicines | Pharmacist, Doctor, Patient | List the current medicine stock catalog |
| PUT | /medicines/:id | Pharmacist | Update the price and/or quantity of a medicine |
| POST | /medicines | Pharmacist | Add a new medicine to the catalog |

### Communication — /api/v1/chat

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /send | Patient, Doctor | Send a chat message between a patient and a doctor |
| GET | /messages | Patient, Doctor | Fetch message history between a doctor and patient, via `doctorId` and `patientId` query params |

### Bloodbank — /api/v1/bloodbank

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /donor/register | Patient | Register the authenticated user as a blood donor |
| GET | /donors | Any role | List donors filtered by `bloodGroup` query param (URL-encoded, e.g. `O%2B` for `O+`) |

### Error responses

| Status | When it happens |
|---|---|
| 401 Unauthorized | The bearer token is missing, invalid, or expired |
| 403 Forbidden | The authenticated user's role does not permit access to that route |

---

### A note on newer additions

A handful of endpoints in this document, such as the doctor directory search, the admin dashboard stats, and the "view my appointments" route, were not part of the original contract and were added later as the frontend needed them. If you notice a route here that behaves slightly differently from what you expected, it is worth checking whether it was one of these later additions rather than assuming the original spec is out of date. As the project grows, new endpoints will keep getting added here as they come up, so treat this document as a living reference rather than a fixed one.

---

## Architecture

![MediCore architecture diagram](./docs/architecture.svg)

The frontend talks to a single API gateway, which forwards each request to the appropriate microservice based on the request path. Every service reads from and writes to the same PostgreSQL database, hosted on Neon.

## Contributors

| Registration No. | Name | Role |
|---|---|---|
| 2022331053 | Autanu Datta | Backend |
| 2022331089 | Taposh Ghosh | Backend |
| 2022331097 | Rahad Islam | Backend |
| 2022331033 | Shyamali Das | Frontend |
| 2022331063 | Jannat Bhuiyan | Frontend |
| 2022331099 | Afia Farzana | Frontend |