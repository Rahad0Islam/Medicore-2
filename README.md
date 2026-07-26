**MediCore API Documentation**
==============================

Live application: https://medicore-nu-one.vercel.app/

This document is the contract between the frontend and backend teams for MediCore, and also serves as the general overview for this repository: what the system does, how the services are organized, and how to get everything running on your own machine.

**Project Overview**
--------------------

MediCore is a multi-service platform built to handle authentication, role-based access control (RBAC), patient appointment scheduling, digital prescriptions, pharmacy inventory control, real-time doctor-patient communication, and blood bank coordination.

### **System Roles**

*   **Patient**: Can search for doctors, book appointments, view prescriptions, chat with doctors, and register as blood donors.
    
*   **Doctor**: Can manage appointments, write digital prescriptions, and check historical patient charts. Requires Admin approval before appearing on patient directories.
    
*   **Pharmacist**: Manages medicine stock, prices, and catalog additions.
    
*   **Admin**: Oversees system compliance, specifically approving or rejecting Doctor registration profiles.
    

**Getting Started**
-------------------

If you want to run MediCore on your own machine, fork this repository first rather than cloning it directly. This keeps your local changes and any environment-specific configuration separate from the main project, and makes it easier to open a pull request later if you want to contribute back.

git clone https://github.com//Medicore-2.git

cd Medicore-2

The backend is split into independent services (auth, user, bloodbank, and the others listed in the sections below), sitting behind an API gateway. Each service is a standalone Spring Boot application and needs to be started on its own.

### **Running the services locally**

For each service:

1.  Open the service folder in your IDE (IntelliJ, VS Code with the Java extensions, or similar).
    
2.  Fill in application.properties (or application.yml) with your own values. At minimum you will need to set:
    
    *   Your database connection details (URL, username, password)
        
    *   A JWT signing secret, used to issue and validate access tokens
        
    *   The port the service should run on, if you are not using the default
        
3.  Run the service (./mvnw spring-boot:run, or run the main class directly from your IDE).
    
4.  Repeat for each service, then start the API gateway last, since it depends on the other services being reachable.
    

Since application.properties typically contains secrets and is not committed to the repository, you will need to create your own copy locally. If the repository includes an application.properties.example or similar template, copy it and fill in your own values rather than starting from scratch.

### **Gateway routing**

The API gateway runs on port 8000 and routes incoming requests to each downstream service based on the request path. Its application.properties looks like this:

spring.application.name=apigateway

server.port=3000

spring.cloud.gateway.routes\[0\].id=auth-service

spring.cloud.gateway.routes\[0\].uri=http://localhost:3001

spring.cloud.gateway.routes\[0\].predicates\[0\]=Path=/api/v1/auth/\*\*

spring.cloud.gateway.routes\[1\].id=bloodbank-service

spring.cloud.gateway.routes\[1\].uri=http://localhost:3003

spring.cloud.gateway.routes\[1\].predicates\[0\]=Path=/api/v1/bloodbank/\*\*

spring.cloud.gateway.routes\[2\].id=communication-service

spring.cloud.gateway.routes\[2\].uri=http://localhost:3004

spring.cloud.gateway.routes\[2\].predicates\[0\]=Path=/api/v1/chat/\*\*

spring.cloud.gateway.routes\[3\].id=user-service

spring.cloud.gateway.routes\[3\].uri=http://localhost:3002

spring.cloud.gateway.routes\[3\].predicates\[0\]=Path=/api/v1/\*\*

In short: auth-service runs on 3001, user-service on 3002, bloodbank-service on 3003, and communication-service on 3004, with the gateway itself on 3000 tying them together. Make sure each service's own server.port matches what the gateway expects above, or the routes will fail to resolve.

### **Deployment notes**

The endpoint URLs in this document use http://localhost:3000 as a placeholder for local development. When deploying to a staging or production environment, this needs to be updated to match your actual gateway URL, and the frontend's API base configuration needs to point at the same address. CORS settings on the backend should also be updated to allow requests from your deployed frontend's origin, since localhost will not be reachable from a hosted client.

**Global Authentication and Authorization**
-------------------------------------------

All protected routes require an HTTP Authorization header containing a JSON Web Token (JWT).

Authorization: Bearer

### **Decoded JWT Access Token Payload Structure**

When the token is decoded on either the client or server, it yields the following payload structure:

{

  "userId": "usr\_67890abcde",

  "name": "Alex Doe",

  "email": "alex.doe@example.com",

  "role": "doctor",

  "approval": false,

  "iat": 1781942400,

  "exp": 1782028800

}

**API Endpoint Specifications**
-------------------------------

### **1\. Auth Service**

#### **Register User**

*   **URL:** http://localhost:3000/api/v1/auth/signup
    
*   **Method:** POST
    
*   **Auth Required:** No
    
*   **Description:** Creates a new user profile. Note that the approval flag defaults to true for all roles except doctor, which defaults to false.
    

**Request Body:**

{

  "name": "Dr. Sarah Jenkins",

  "email": "sarah.jenkins@hospital.com",

  "password": "SecurePassword123!",

  "role": "doctor",

  "phone": "+15550192834",

  "blood\_group": "O+"

}

**Success Response (201 Created):**

{

  "success": true,

  "message": "User registered successfully.",

  "data": {

    "userId": "usr\_98765fghij",

    "name": "Dr. Sarah Jenkins",

    "email": "sarah.jenkins@hospital.com",

    "role": "doctor",

    "phone": "+15550192834",

    "blood\_group": "O+",

    "approval": false,

    "createdAt": "2026-06-19T02:24:54Z",

    "updatedAt": "2026-06-19T02:24:54Z"

  }

}

#### **Login User**

*   **URL:** http://localhost:3000/api/v1/auth/login
    
*   **Method:** POST
    
*   **Auth Required:** No
    
*   **Description:** Validates credentials and returns all user information alongside an RBAC-enabled accessToken.
    

**Request Body:**

{

  "email": "sarah.jenkins@hospital.com",

  "password": "SecurePassword123!"

}

**Success Response (200 OK):**

{

  "success": true,

  "message": "Login successful.",

  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3JfOTg3NjVmZ2hpaiIsIm5hbWUiOiJEci4gU2FyYWggSmVua2lucyIsImVtYWlsIjoic2FyYWguamVua2luc0Bob3NwaXRhbC5jb20iLCJyb2xlIjoiZG9jdG9yIiwiYXBwcm92YWwiOmZhbHNlfQ...",

  "data": {

    "userId": "usr\_98765fghij",

    "name": "Dr. Sarah Jenkins",

    "email": "sarah.jenkins@hospital.com",

    "role": "doctor",

    "phone": "+15550192834",

    "blood\_group": "O+",

    "approval": false,

    "createdAt": "2026-06-19T02:24:54Z",

    "updatedAt": "2026-06-19T02:24:54Z"

  }

}

### **2\. User Service**

#### **Get / Update Role Profiles**

*   **URL:** http://localhost:3000/api/v1/user/profile
    
*   **Method:** PUT
    
*   **Auth Required:** Yes
    
*   **Description:** Updates role-specific profile details. Fields dynamically alter based on your authenticated account type.
    

**Request Body (For Doctors):**

{

  "specialization": "Cardiology",

  "qualification": "MD, FACC",

  "location": "Building A, Clinic Suite 402",

  "visiting\_fee": 150.00

}

**Request Body (For Pharmacists):**

{

  "pharmacy\_name": "Central Metro Pharmacy"

}

**Success Response (200 OK - Doctor Example):**

{

  "success": true,

  "message": "Profile updated successfully.",

  "data": {

    "userId": "usr\_98765fghij",

    "role": "doctor",

    "specialization": "Cardiology",

    "rating": 5.0,

    "qualification": "MD, FACC",

    "location": "Building A, Clinic Suite 402",

    "visiting\_fee": 150.00,

    "updatedAt": "2026-06-19T02:30:00Z"

  }

}

**Note:** For patient and admin roles, updating role profiles returns success but has no additional unique fields.

#### **Get Approved Doctor Directory** _**(Added Supplemental Endpoint)**_

*   **URL:** http://localhost:3000/api/v1/user/doctors
    
*   **Method:** GET
    
*   **Auth Required:** Yes (Patient/Admin/Pharmacist)
    
*   **Description:** Allows patients to view all active, approved doctors before booking appointments.
    

**Success Response (200 OK):**

{

  "success": true,

  "data": \[

    {

      "doctorId": "usr\_98765fghij",

      "name": "Dr. Sarah Jenkins",

      "specialization": "Cardiology",

      "rating": 4.9,

      "qualification": "MD, FACC",

      "location": "Building A, Clinic Suite 402",

      "visiting\_fee": 150.00

    }

  \]

}

### **3\. Patient API**

#### **Book Appointment**

*   **URL:** http://localhost:3000/api/v1/patient/appointments
    
*   **Method:** POST
    
*   **Auth Required:** Yes (Patient Only)
    
*   **Description:** Files an appointment allocation and prepares an unwritten prescription document container in the database.
    

**Request Body:**

{

  "doctor\_id": "usr\_98765fghij",

  "date": "2026-06-25",

  "symptoms": "Occasional acute chest pains during exercise.",

  "transaction\_id": "tx\_abc123xyz789"

}

**Success Response (201 Created):**

{

  "success": true,

  "message": "Appointment booked successfully.",

  "data": {

    "prescriptionID": "prsc\_00001a2b3c",

    "patient\_id": "usr\_111222patient",

    "doctor\_info": {

      "doctorId": "usr\_98765fghij",

      "name": "Dr. Sarah Jenkins",

      "specialization": "Cardiology"

    },

    "location": "Building A, Clinic Suite 402",

    "date": "2026-06-25",

    "serial\_no": 14,

    "symptoms": "Occasional acute chest pains during exercise."

  }

}

#### **View My Appointments**

*   **URL:** http://localhost:3000/api/v1/patient/myallappointments
    
*   **Method:** GET
    
*   **Auth Required:** Yes (Patient Only)
    
*   **Description:** Returns all booked appointments for the authenticated patient, including queue serial number, appointment date, doctor name, department, and status.
    

**Success Response (200 OK):**

{

  "success": true,

  "data": \[

    {

      "appointmentId": "14",

      "doctorName": "Dr. Sarah Jenkins",

      "department": "Cardiology",

      "date": "2026-06-25",

      "serialNo": 14,

      "serial\_no": 14,

      "status": "CONFIRMED"

    },

    {

      "appointmentId": "9",

      "doctorName": "Dr. John Doe",

      "department": "Neurology",

      "date": "2026-06-19",

      "serialNo": 9,

      "serial\_no": 9,

      "status": "COMPLETED"

    }

  \]

}

#### **View Self Prescriptions**

*   **URL:** http://localhost:3000/api/v1/patient/prescriptions
    
*   **Method:** GET
    
*   **Auth Required:** Yes (Patient Only)
    
*   **Description:** Returns a historical log of all prescriptions issued to the authenticated patient.
    

**Success Response (200 OK):**

{

  "success": true,

  "data": \[

    {

      "prescriptionID": "prsc\_00001a2b3c",

      "patientId": "usr\_111222patient",

      "doctorId": "usr\_98765fghij",

      "symptoms": "Occasional acute chest pains during exercise.",

      "description": "Rest prescribed, limit strenuous activity until test results arrive.",

      "medicine\_details": \[

        {

          "medicine\_name": "Aspirin",

          "dosage": "81mg daily",

          "duration": "30 days"

        }

      \],

      "transaction\_id": "tx\_abc123xyz789"

    }

  \]

}

#### **View Prescriptions by Doctor ID**

*   **URL:** http://localhost:3000/api/v1/patient/prescriptions/doctor/usr\_98765fghij
    
*   **Method:** GET
    
*   **Auth Required:** Yes (Patient Only)
    
*   **Description:** Filters the current patient's historical prescriptions to those issued by a specific doctor.
    

**Success Response (200 OK):**

{

  "success": true,

  "data": \[

    {

      "prescriptionID": "prsc\_00001a2b3c",

      "patientId": "usr\_111222patient",

      "doctorId": "usr\_98765fghij",

      "symptoms": "Occasional acute chest pains during exercise.",

      "description": "Rest prescribed, limit strenuous activity until test results arrive.",

      "medicine\_details": \[

        {

          "medicine\_name": "Aspirin",

          "dosage": "81mg daily",

          "duration": "30 days"

        }

      \],

      "transaction\_id": "tx\_abc123xyz789"

    }

  \]

}

### **4\. Doctor API**

#### **Write Prescription**

*   **URL:** http://localhost:3000/api/v1/doctor/prescriptions/prsc\_00001a2b3c
    
*   **Method:** PUT
    
*   **Auth Required:** Yes (Doctor Only)
    
*   **Description:** Updates and fills the detailed description and medicine properties for a pre-existing appointment/prescription slot.
    

**Request Body:**

{

  "description": "Patient exhibits minor hypertension. Reduce dietary sodium intake.",

  "medicine\_details": \[

    {

      "medicine\_name": "Lisinopril",

      "dosage": "10mg daily",

      "duration": "90 days"

    }

  \]

}

**Success Response (200 OK):**

{

  "success": true,

  "message": "Prescription successfully issued.",

  "data": {

    "prescriptionID": "prsc\_00001a2b3c",

    "patientId": "usr\_111222patient",

    "doctorId": "usr\_98765fghij",

    "symptoms": "Occasional acute chest pains during exercise.",

    "description": "Patient exhibits minor hypertension. Reduce dietary sodium intake.",

    "medicine\_details": \[

      {

        "medicine\_name": "Lisinopril",

        "dosage": "10mg daily",

        "duration": "90 days"

      }

    \],

    "transaction\_id": "tx\_abc123xyz789"

  }

}

#### **View Prescriptions by Patient ID**

*   **URL:** http://localhost:3000/api/v1/doctor/prescriptions/patient/usr\_111222patient
    
*   **Method:** GET
    
*   **Auth Required:** Yes (Doctor Only)
    
*   **Description:** Pulls up medical history logs belonging to a single patient for verification.
    

**Success Response (200 OK):**

{

  "success": true,

  "data": \[

    {

      "prescriptionID": "prsc\_00001a2b3c",

      "patientId": "usr\_111222patient",

      "doctorId": "usr\_98765fghij",

      "symptoms": "Occasional acute chest pains during exercise.",

      "description": "Patient exhibits minor hypertension. Reduce dietary sodium intake.",

      "medicine\_details": \[

        {

          "medicine\_name": "Lisinopril",

          "dosage": "10mg daily",

          "duration": "90 days"

        }

      \],

      "transaction\_id": "tx\_abc123xyz789"

    }

  \]

}

#### **Show Appointed Patient List**

*   **URL:** http://localhost:3000/api/v1/doctor/appointments
    
*   **Method:** GET
    
*   **Auth Required:** Yes (Doctor Only)
    
*   **Description:** Returns structural information on all queues mapped to the logged-in Doctor, highlighting status classifications (complete vs incomplete).
    

**Success Response (200 OK):**

{

  "success": true,

  "data": {

    "incomplete": \[

      {

        "serial\_no": 14,

        "date": "2026-06-25",

        "patient\_id": "usr\_111222patient",

        "name": "Jane Miller",

        "phone": "+15559876543",

        "symptoms": "Occasional acute chest pains during exercise."

      }

    \],

    "complete": \[

      {

        "serial\_no": 13,

        "date": "2026-06-19",

        "patient\_id": "usr\_000999patient",

        "name": "Bob Vance",

        "phone": "+15551234567",

        "symptoms": "Follow up consultation post-surgery."

      }

    \]

  }

}

### **5\. Admin API**

#### **Approve Doctor**

*   **URL:** http://localhost:3000/api/v1/admin/approve-doctor/usr\_98765fghij
    
*   **Method:** PATCH
    
*   **Auth Required:** Yes (Admin Only)
    
*   **Description:** Switches the approval database Boolean flag to true for a doctor, permitting them to join patient search listings.
    

**Success Response (200 OK):**

{

  "success": true,

  "message": "Doctor status has been updated to Approved.",

  "data": {

    "doctorId": "usr\_98765fghij",

    "name": "Dr. Sarah Jenkins",

    "role": "doctor",

    "approval": true,

    "updatedAt": "2026-06-19T02:45:00Z"

  }

}

### **6\. Pharmacist API**

#### **View Medicine Stock**

*   **URL:** http://localhost:3000/api/v1/pharmacist/medicines
    
*   **Method:** GET
    
*   **Auth Required:** Yes (Pharmacist/Doctor/Patient)
    
*   **Description:** Retrieves a complete view of the current pharmacy stock catalog data.
    

**Success Response (200 OK):**

{

  "success": true,

  "data": \[

    {

      "medicine\_id": "med\_abc123",

      "medicine\_name": "Lisinopril",

      "price": 12.50,

      "quantity": 450

    },

    {

      "medicine\_id": "med\_xyz789",

      "medicine\_name": "Aspirin",

      "price": 4.99,

      "quantity": 1200

    }

  \]

}

#### **Update Medicine Stock**

*   **URL:** http://localhost:3000/api/v1/pharmacist/medicines/med\_abc123
    
*   **Method:** PUT
    
*   **Auth Required:** Yes (Pharmacist Only)
    
*   **Description:** Modifies unit pricing or shifts structural volume stock inventories for a specific item identifier.
    

**Request Body:**

{

  "price": 14.00,

  "quantity": 600

}

**Success Response (200 OK):**

{

  "success": true,

  "message": "Medicine inventory details altered successfully.",

  "data": {

    "medicine\_id": "med\_abc123",

    "medicine\_name": "Lisinopril",

    "price": 14.00,

    "quantity": 600

  }

}

#### **Add Medicine**

*   **URL:** http://localhost:3000/api/v1/pharmacist/medicines
    
*   **Method:** POST
    
*   **Auth Required:** Yes (Pharmacist Only)
    
*   **Description:** Appends a brand-new component record into the systems database ledger.
    

**Request Body:**

{

  "medicine\_name": "Ibuprofen 400mg",

  "price": 6.25,

  "quantity": 350

}

**Success Response (201 Created):**

{

  "success": true,

  "message": "Medicine added successfully to catalog.",

  "data": {

    "medicine\_id": "med\_new555",

    "medicine\_name": "Ibuprofen 400mg",

    "price": 6.25,

    "quantity": 350

  }

}

#### **System Users Statistics Dashboard**

*   **URL:** http://localhost:3000/api/v1/user/admin/dashboard/stats
    
*   **Method:** GET
    
*   **Auth Required:** Yes (Admin Only)
    
*   **Description:** Generates aggregate registration numbers divided across roles to assist system reporting.
    

**Success Response (200 OK):**

{

    "data": {

        "breakdown": {

            "pharmacists": 2,

            "patients": 5,

            "doctors\_approved": 5,

            "doctors\_pending": 9

        },

        "total\_users": 21

    },

    "success": true

}

### **Patient Experience and Discovery Extensions**

#### **Filter Doctors by Specialty or Location**

*   **URL:** http://localhost:8002/api/v1/user/doctors/search?specialization=Cardiology&location=Building A
    
*   **Method:** GET
    
*   **Auth Required:** Yes (Patient Only)
    
*   **Description:** Extends your basic static doctor directory by introducing dynamic parameters to help patients pinpoint exactly who they need.
    

**Success Response (200 OK):**

{

    "data": \[

        {

            "qualification": "MD, FACC",

            "doctorId": "usr\_9b8e7afbad",

            "rating": 5.0,

            "name": "Dr. Sarah Jenkins",

            "specialization": "Cardiology",

            "location": "Building A, Clinic Suite 402",

            "visiting\_fee": 150.0

        },

        {

            "qualification": "MD, FACC",

            "doctorId": "usr\_b9e82c295b",

            "rating": 5.0,

            "name": "Dr. Sarah Jenkins",

            "specialization": "Cardiology",

            "location": "Building A, Clinic Suite 402",

            "visiting\_fee": 150.0

        },

        {

            "qualification": "MD, FACC",

            "doctorId": "usr\_60ace5b3f5",

            "rating": 5.0,

            "name": "Dr. Sarah Jenkins",

            "specialization": "Cardiology",

            "location": "Building A, Clinic Suite 402",

            "visiting\_fee": 150.0

        }

    \],

    "success": true,

    "filters\_applied": {

        "specialization": "Cardiology",

        "location": "Building A"

    }

}

### **7\. Communication Service**

#### **Send Message**

*   **URL:** http://localhost:3000/api/v1/chat/send
    
*   **Method:** POST
    
*   **Auth Required:** Yes (Patient/Doctor Only)
    
*   **Description:** Submits a chat message between a patient and a doctor.
    

**Request Body:**

{

  "doctorId": "usr\_98765fghij",

  "patientId": "usr\_111222patient",

  "message": "Hello Dr. Jenkins, I have a quick follow-up question regarding my dosage."

}

**Success Response (201 Created):**

{

  "success": true,

  "data": {

    "messageId": "msg\_0123456",

    "doctorId": "usr\_98765fghij",

    "patientId": "usr\_111222patient",

    "message": "Hello Dr. Jenkins, I have a quick follow-up question regarding my dosage.",

    "created\_at": "2026-06-19T02:24:54Z",

    "updated\_at": "2026-06-19T02:24:54Z"

  }

}

#### **Show All Messages**

*   **URL:** http://localhost:3000/api/v1/chat/messages?doctorId=usr\_98765fghij&patientId=usr\_111222patient
    
*   **Method:** GET
    
*   **Auth Required:** Yes (Patient/Doctor Only)
    
*   **Description:** Fetches historical messaging interaction logs between the specified doctor and patient parameters.
    

**Success Response (200 OK):**

{

  "success": true,

  "data": \[

    {

      "messageId": "msg\_0123456",

      "doctorId": "usr\_98765fghij",

      "patientId": "usr\_111222patient",

      "message": "Hello Dr. Jenkins, I have a quick follow-up question regarding my dosage.",

      "created\_at": "2026-06-19T02:24:54Z",

      "updated\_at": "2026-06-19T02:24:54Z"

    }

  \]

}

### **8\. Bloodbank Service**

#### **Register Donor**

*   **URL:** http://localhost:3000/api/v1/bloodbank/donor/register
    
*   **Method:** POST
    
*   **Auth Required:** Yes (Patient Only)
    
*   **Description:** Registers the authenticated user as a donor in the system database. Uses the user's registered name, profile details, and blood group.
    

**Request Body:**

{

  "lastdate": "2026-03-15"

}

**Success Response (201 Created):**

{

  "success": true,

  "message": "Donor profile registered successfully.",

  "data": {

    "bloodBankId": "bb\_donor\_999",

    "name": "Jane Miller",

    "contactNo": "+15559876543",

    "donorId": "usr\_111222patient",

    "lastdate": "2026-03-15",

    "bloodgroup": "O+"

  }

}

#### **Show Donor List by Blood Group**

*   **URL:** http://localhost:3000/api/v1/bloodbank/donors?bloodGroup=O+
    
*   **Method:** GET
    
*   **Auth Required:** Yes
    
*   **Description:** Queries the donation ledger indexes to return all matching donors filtered by the required blood group. Use standard URL encoding for signs (e.g., O+ becomes O+).
    

**Success Response (200 OK):**

{

  "success": true,

  "bloodgroup\_filtered": "O+",

  "data": \[

    {

      "bloodBankId": "bb\_donor\_999",

      "name": "Jane Miller",

      "contactNo": "+15559876543",

      "donorId": "usr\_111222patient",

      "lastdate": "2026-03-15",

      "bloodgroup": "O+"

    }

  \]

}

### **Standard Error Code Responses Reference**

#### **401 Unauthorized**

Returned when the Authorization bearer token is missing, invalid, or expired.

{

  "success": false,

  "error": "Unauthorized",

  "message": "Access token is missing or has expired."

}

#### **403 Forbidden**

Returned when the user's RBAC role does not possess the permissions necessary to access the resource (e.g., a patient accessing Admin routes).

{

  "success": false,

  "error": "Forbidden",

  "message": "You do not have permission to access this resource."

}