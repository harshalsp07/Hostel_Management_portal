# Hostel_Management_portal
this is the app where you can see and manage the hostel and make the hostel life easy

#How To Run It 

use 
npm install && npm run dev
```mermaid
flowchart TD
    A[Open Website] --> B[See Login Screen]
    B --> C{Enter Email & Password?}
    C -- No --> B
    C -- Yes --> D[Authentication Check]
    D -->|Success| E[Open Dashboard]
    D -->|Fail| F[Show Error Message]
    F --> B
    E --> G[Use Hostel Features]
    G --> H[Log Out]
    H --> B
```
