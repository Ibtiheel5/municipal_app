# Application de Gestion Municipale — Module Authentification

## Stack technique
- **Backend** : Spring Boot 3.2 + Spring Security + JWT
- **Frontend** : React 18 + React Router + Axios
- **Base de données** : PostgreSQL
- **ORM** : Spring Data JPA / Hibernate

---

## Structure du projet

```
municipal-app/
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/municipal/auth/
│       ├── MunicipalAuthApplication.java
│       ├── controller/
│       │   └── AuthController.java
│       ├── service/
│       │   └── AuthService.java
│       ├── repository/
│       │   └── UserRepository.java
│       ├── entity/
│       │   ├── User.java
│       │   └── Role.java          (enum: ADMIN, USER)
│       ├── dto/
│       │   ├── request/
│       │   │   ├── LoginRequest.java
│       │   │   └── RegisterRequest.java
│       │   └── response/
│       │       └── AuthResponse.java
│       ├── security/
│       │   ├── jwt/
│       │   │   ├── JwtService.java
│       │   │   └── JwtFilter.java
│       │   └── config/
│       │       └── SecurityConfig.java
│       └── exception/
│           ├── EmailAlreadyExistsException.java
│           └── GlobalExceptionHandler.java
│
└── frontend/
    ├── package.json
    └── src/
        ├── index.js
        ├── App.jsx
        ├── App.css
        ├── context/
        │   └── AuthContext.jsx
        ├── services/
        │   ├── api.js              (Axios + intercepteurs)
        │   └── authService.js
        ├── routes/
        │   └── ProtectedRoute.jsx
        └── pages/
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── DashboardAdmin.jsx
            └── DashboardUser.jsx
```

---

## Démarrage rapide

### Prérequis
- Java 17+
- Node.js 18+
- PostgreSQL

### 1. Base de données
```sql
CREATE DATABASE municipal_db;
```

### 2. Backend
```bash
cd backend
# Configurer src/main/resources/application.properties si nécessaire
mvn spring-boot:run
# Démarre sur http://localhost:8080
```

### 3. Frontend
```bash
cd frontend
npm install
npm start
# Démarre sur http://localhost:3000
```

---

## API Endpoints

| Méthode | URL | Accès | Description |
|---------|-----|-------|-------------|
| POST | `/api/auth/register` | Public | Inscription |
| POST | `/api/auth/login` | Public | Connexion |
| ANY | `/api/admin/**` | ADMIN | Routes admin |
| ANY | `/api/user/**` | USER + ADMIN | Routes utilisateur |

### Exemple login (curl)
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'
```

### Exemple requête protégée
```bash
curl http://localhost:8080/api/admin/users \
  -H "Authorization: Bearer <TOKEN>"
```

---

## Sécurité
- Mots de passe hashés avec **BCrypt**
- Tokens **JWT** signés HS256, expiration 24h
- Routes protégées par rôle (ADMIN / USER)
- CORS configuré pour `http://localhost:3000`
