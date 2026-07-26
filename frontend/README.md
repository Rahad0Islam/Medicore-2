# MediCore Frontend

Live app: https://medicore-nu-one.vercel.app/
Backend and API documentation: https://github.com/Rahad0Islam/Medicore-2

MediCore is a healthcare platform connecting patients, doctors, pharmacists, and admins in a single system. This repository contains the frontend: a React application that communicates with the Spring Boot microservices in the backend repository linked above.

## Stack

- **React 18** with **Vite** as the build tool and dev server
- **React Router** for client-side routing and role-based route protection
- **Plain CSS**, no UI framework. The project uses a small custom design system defined in `index.css` (cards, buttons, badges, modals, tables, form controls) that all pages are built on top of, keeping the visual language consistent across roles
- **JWT-based authentication**. On login, the backend issues an access token that is stored client side and attached to the Authorization header of every protected request
- **Context API** for global auth state, avoiding the need for an external state management library
- Communicates with a **Spring Boot microservices backend** through an API gateway, covering auth, user management, appointments, prescriptions, pharmacy inventory, chat, and blood bank services

## What it does

The application supports four roles, each with its own dashboard and set of tools.

**Patients** can browse the doctor directory, book an appointment in a few clicks, message their doctor, view their prescriptions, and register as a blood donor or search for one.

**Doctors** receive a queue of their booked patients, can write prescriptions, and can pull up a patient's history. New doctor accounts must complete their specialization, qualification, location, and consultation fee before becoming visible to patients.

**Pharmacists** manage the medicine stock, including adding new items and updating price and quantity.

**Admins** can approve doctor registrations and view basic statistics on how many users of each role exist in the system.

## Running it locally

```bash
npm install
npm run dev
```

The backend services need to be running as well (see the backend repository for setup). The frontend expects an API gateway to be reachable, so check `src/api/client.js` for the base URL and point it at your gateway instance.

To build for production:

```bash
npm run build
```

## Project layout

```
src/
  api/          request helper and endpoint constants
  components/   Navbar, ProtectedRoute, shared components
  context/      AuthContext, holding the logged in user and token
  pages/
    patient/     directory, booking, prescriptions, chat, blood donor
    doctor/      dashboard, write prescription, patient history
    pharmacist/  inventory management
    admin/       doctor approvals, user stats
```

Routes are role-gated through `ProtectedRoute`, so a patient cannot reach `/admin` even by typing the URL directly.

## Design notes

The visual direction is meant to stay minimal: white cards, a single accent color per role, no unnecessary shadows or gradients. Before adding a new page, check `index.css` for an existing class rather than writing new styles. Most patterns already used across the app, such as list pages, forms, modals, and card grids, are meant to be reused rather than recreated for each new page.

##Deployment

This project is deployed on Vercel.
