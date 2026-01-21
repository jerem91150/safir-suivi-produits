# SAFIR - Plateforme de Suivi Produits

Application web interne pour tracer les évolutions de produits/composants sur les matricules de portes SAFIR.

## Prérequis

- Node.js 18+
- Docker et Docker Compose
- PostgreSQL (via Docker)

## Installation

### 1. Démarrer PostgreSQL avec Docker

```bash
docker compose up -d postgres
```

### 2. Backend

```bash
cd backend

# Installer les dépendances
npm install

# Générer le client Prisma
npm run prisma:generate

# Appliquer les migrations (créer les tables)
npm run prisma:migrate

# Initialiser les données (utilisateur admin + données de démo)
npm run seed

# Démarrer le serveur de développement
npm run dev
```

### 3. Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

## Accès

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3001

## Utilisateurs de test

| Login    | Mot de passe | Rôle    |
|----------|--------------|---------|
| admin    | admin123     | Admin   |
| editeur  | editeur123   | Éditeur |
| lecteur  | lecteur123   | Lecteur |

## Structure du projet

```
safir-suivi-produits/
├── backend/           # API Node.js + Express
│   ├── src/
│   │   ├── routes/    # Endpoints REST
│   │   └── middleware/ # Auth JWT
│   └── prisma/        # Schéma BDD
├── frontend/          # React + TypeScript
│   └── src/
│       ├── pages/     # Pages principales
│       └── contexts/  # État global (auth)
├── uploads/           # Fichiers uploadés
└── docker-compose.yml # Configuration Docker
```

## Technologies

- **Frontend** : React, TypeScript, Ant Design, Vite
- **Backend** : Node.js, Express, TypeScript, Prisma
- **Base de données** : PostgreSQL
- **Auth** : JWT
