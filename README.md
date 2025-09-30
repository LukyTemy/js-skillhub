# 📚 Online Course & Workshop Platform  

Platforma umožňuje spravovat kurzy a přihlašovat se do nich. Studenti dostávají **realtime notifikace** přes WebSocket a mohou získat **certifikáty** po dokončení kurzu.  

---

## ✅ Splněné požadavky

- **12+ REST endpointů** (GET, POST, PUT, DELETE)  
- **2 protokoly**: REST API + WebSocket  
- **5 mikroservisů**: Auth, Course, Enrollment, Notification, Mail/Certificate  
- **NoSQL databáze**: MongoDB  
- **Frontend app**: React/Vue, komunikuje přes REST a WebSocket  
- **Validace vstupů**: typy, prázdné hodnoty, rozsahy, enumy  
- **Integrační testy** pro všechny endpointy  
- **Dokumentace**: Swagger
- **Docker-compose** pro všechny služby  
- **Čistý kód**: DRY, metody ≤ 20 řádků, max. 2 vnoření  
- **Verzování**: Bitbucket repo  

---

## 🔹 Mikroservisy

1. **Auth Service** – registrace, login, správa profilu  
2. **Course Service** – správa kurzů a lekcí  
3. **Enrollment Service** – přihlašování a odhlašování z kurzů  
4. **Notification Service** – realtime notifikace přes WebSocket  
5. **Mail Service** – emailová upozornění 
6. **Certificate Service** - Generování PDF certifikátů

---

## 🔹 REST API Endpointy

### Auth Service (4)
- `POST /auth/register` – registrace uživatele  
- `POST /auth/login` – přihlášení 
- `GET /auth/profile` – detail profilu  
- `PUT /auth/profile` – úprava profilu  

### Course Service (5)
- `POST /courses` – vytvoření kurzu (instruktor)  
- `GET /courses` – seznam kurzů (+ filtr/sort)  
- `GET /courses/{id}` – detail kurzu + lekce  
- `PUT /courses/{id}` – úprava kurzu  
- `DELETE /courses/{id}` – smazání kurzu  

### Lesson Management
- `POST /courses/{id}/lessons` – přidání lekce  
- `PUT /courses/{id}/lessons/{lesson_id}` – úprava lekce  
- `DELETE /courses/{id}/lessons/{lesson_id}` – smazání lekce  

### Enrollment Service (3)
- `POST /enrollments` – zapsání do kurzu  
- `GET /enrollments/{user_id}` – seznam přihlášek uživatele  
- `DELETE /enrollments/{id}` – odhlášení z kurzu  

### Notification Service (2)
- `GET /notifications/{user_id}` – historie notifikací (když byl uživatel offline)  
- `PUT /notifications/{id}/read` – označení jako přečtené  

### Mail & Certificate Service (2)
- `POST /mail/send` – odeslání emailu (potvrzení, připomenutí, atd.)  
- `GET /certificates/{user_id}/{course_id}` – stažení PDF certifikátu po dokončení kurzu  

👉 **Celkem: 16+ REST endpointů**  

---

## 🔹 WebSocket Eventy

- `notification` – nová systémová zpráva  
- `course_update` – změny v kurzu (úprava, smazání, nová lekce)  
- `enrollment_update` – potvrzení registrace nebo odhlášení  
- `certificate_ready` – certifikát vygenerován  
- `attendance_update` – aktuální stav přihlášení studentů (volitelné)  

---

## 🔹 Databázové modely

### Users
```json
{
  "_id": "uuid",
  "name": "string",
  "email": "string",
  "passwordHash": "string",
  "role": "student|instructor|admin",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Courses
```json
{
  "_id": "uuid",
  "title": "string",
  "description": "string",
  "category": "string",
  "instructorId": "uuid",
  "createdAt": "date",
  "lessons": [
    {
      "lessonId": "uuid",
      "title": "string",
      "content": [
        { "type": "text", "data": "string" },
        { "type": "code", "data": "string" },
        { "type": "video", "data": "url" }
      ],
      "order": "number"
    }
  ]
}
```

### Enrollments
```json
{
  "_id": "uuid",
  "userId": "uuid",
  "courseId": "uuid",
  "status": "active|cancelled|completed",
  "enrolledAt": "date"
}
```

### Notifications
```json
{
  "_id": "uuid",
  "userId": "uuid",
  "message": "string",
  "read": "boolean",
  "timestamp": "date"
}
```

### Certificates
```json
{
  "_id": "uuid",
  "userId": "uuid",
  "courseId": "uuid",
  "issuedAt": "date",
  "fileUrl": "string"
}
```

## 🔹 Validace vstupů
- Email → validní formát  
- Heslo → min. 8 znaků  
- Capacity (kurz) → > 0  
- Status (enrollment) → jen `active|cancelled|completed`  
- Uživatelské ID a kurzové ID → validní UUID  
- Student se nemůže zapsat 2× do stejného kurzu  
- Lekce musí mít `title` a minimálně jeden `content` blok  

---

## 🔹 Testy
- Registrace + login → validní/invalidní data  
- Vytvoření kurzu → kontrola capacity > 0  
- Přihlášení do kurzu → odmítnutí při plné kapacitě  
- Přidání lekce → jen instruktor může  
- Odhlášení → zápis odstraněn  
- WebSocket → po `POST /enrollments` přijde `notification`  
- Generování certifikátu → jen pokud status = `completed` 