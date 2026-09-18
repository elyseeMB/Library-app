# Library API & Web

Monorepo de l'application de gestion de bibliothèque, regroupant le **backend API** et l'**interface web** dans une même base de code.

Le projet utilise **pnpm workspaces** et **Turborepo** pour gérer les différentes applications et packages.

## Architecture

```text
.
├── apps/
│   ├── api/              # Backend REST
│   └── frontend/         # Interface web
│
├── packages/             # Packages partagés
├── compose/              # Configuration Docker / services locaux
├── .github/              # Workflows GitHub Actions
├── compose.yaml          # Services de développement
├── template.yaml         # Infrastructure AWS SAM
├── wrangler.json         # Configuration Cloudflare
├── turbo.json            # Configuration Turborepo
├── pnpm-workspace.yaml   # Configuration pnpm workspace
└── package.json          # Configuration racine
```

### Applications

| Application      | Description                                                      | Documentation                                |
| ---------------- | ---------------------------------------------------------------- | -------------------------------------------- |
| `@root/api`      | API backend REST construite avec Express 5, TypeScript et Kysely | [README API](./apps/api/README.md)           |
| `@root/frontend` | Interface web construite avec Lit, Web Components et Web Awesome | [README Frontend](./apps/frontend/README.md) |

## Stack globale

### Backend

* **Runtime** : Node.js
* **Framework** : Express 5
* **Langage** : TypeScript
* **Base de données** : PostgreSQL
* **Query builder** : Kysely
* **Validation** : Vine
* **Logs** : Pino / Pino-http
* **Tests de génération de types DB** : kysely-codegen
* **Conteneurisation** : Docker
* **Déploiement** : AWS Lambda + AWS SAM

La logique métier du backend est organisée autour du pattern **Action**, avec une action représentant un cas d'usage et sa route HTTP.

→ [Voir la documentation complète de l'API](./apps/api/README.md)

### Frontend

* **Web Components** : Lit
* **UI kit** : Web Awesome
* **Routing** : `@lit-labs/router`
* **Build** : Vite
* **Langage** : TypeScript
* **Lint / format** : Biome
* **Hébergement** : Cloudflare Pages

→ [Voir la documentation complète du frontend](./apps/frontend/README.md)

## Gestion du monorepo

Le projet utilise **pnpm workspaces** pour gérer les dépendances et **Turborepo** pour orchestrer les tâches entre les différentes applications et packages.

### Installation

Depuis la racine du projet :

```bash
pnpm install
```

### Exécuter les tâches

Les commandes peuvent être exécutées depuis la racine du monorepo avec les filtres pnpm :

```bash
pnpm --filter @root/api dev
pnpm --filter @root/frontend dev
```

Les tâches communes peuvent également être orchestrées avec Turborepo :

```bash
pnpm turbo build
pnpm turbo lint
```

## Développement local

Le projet utilise Docker Compose pour les services nécessaires au développement local.

```bash
docker compose up -d
```

Puis installer les dépendances :

```bash
pnpm install
```

Chaque application possède son propre environnement et ses propres scripts.

Consulter les documentations correspondantes pour les commandes spécifiques :

* [Backend API](./apps/api/README.md)
* [Frontend](./apps/frontend/README.md)

## Variables d'environnement

Les variables d'environnement sont définies dans un fichier `.env` à la racine du monorepo.

Un fichier `.env.example` est fourni comme référence :

```bash
cp .env.example .env
```

Les variables spécifiques à chaque application sont documentées dans leur README respectif.

## Déploiement

Les deux applications sont déployées indépendamment :

```text
                    Monorepo
                       │
             ┌─────────┴─────────┐
             │                   │
          Backend             Frontend
             │                   │
        AWS Lambda          Cloudflare Pages
        Docker + SAM            Wrangler
             │                   │
        PostgreSQL
```

### API

Le backend est déployé sur **AWS Lambda** sous forme d'image Docker avec **AWS SAM**.

Le pipeline GitHub Actions :

1. applique les migrations Kysely ;
2. authentifie GitHub Actions auprès d'AWS via OIDC ;
3. construit et publie l'image ;
4. déploie la stack AWS SAM.

→ [Documentation du déploiement API](./apps/api/README.md)

### Frontend

Le frontend est buildé avec Vite puis déployé sur **Cloudflare Pages** avec Wrangler.

Le déploiement est déclenché par GitHub Actions sur `main`.

→ [Documentation du frontend](./apps/frontend/README.md)

## Conventions

* Gestionnaire de paquets : **pnpm**
* Orchestration du monorepo : **Turborepo**
* Langage principal : **TypeScript**
* Lint / formatage : **Biome**
* Développement local : **Docker Compose**
* CI/CD : **GitHub Actions**

## Licence

Ce projet est distribué sous licence MIT. Voir [LICENSE](./LICENSE).
