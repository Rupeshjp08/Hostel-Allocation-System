# Hostel Room Allocation System

College mini project built with the MERN stack: MongoDB, Express.js, React, and Node.js.

## Current status

Phase 3 is complete: hostel, room, application, and allocation APIs are connected to MongoDB.

Dashboards and full UI pages are still pending.

## How to run

```bash
cd backend
npm run seed:warden
npm run dev
```

```bash
cd frontend
npm run dev
```

## Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

## Hostel, room, application, allocation

Students can view hostels/rooms, apply, track applications, and view allocation.

Wardens can manage hostels/rooms, review applications, and allocate beds.

Occupancy is calculated from active allocations. A bed cannot be given to two students.

## Next phase

Phase 4 will add the landing page, auth screens, and student/warden dashboards.
