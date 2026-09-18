Library API & Web

Monorepo de l’application de gestion de bibliothèque, regroupant le backend API et l’interface web dans une même base de code.

Le projet utilise pnpm Workspaces pour gérer les applications et packages, et Turborepo pour orchestrer les tâches du monorepo.

Architecture

.
├── apps/
│   ├── api/              # Backend REST
│   └── frontend/         # Interface web
│
├── packages/             # Packages partagés
├── compose/              # Configuration des services locaux
├── .github/              # GitHub Actions
├── compose.yaml          # Services Docker locaux
├── template.yaml         # Infrastructure AWS SAM
├── wrangler.json         # Configuration Cloudflare
├── turbo.json            # Configuration Turborepo
├── pnpm-workspace.yaml   # Configuration pnpm
└── package.json          # Configuration racine

Applications

Application	Description	Documentation
@root/api	Backend REST	README API
@root/frontend	Interface web	README Frontend

Stack

Domaine	Technologies
Backend	Node.js, Express 5, TypeScript, Kysely, PostgreSQL
Frontend	Lit, Web Components, Web Awesome, Vite, TypeScript
Monorepo	pnpm Workspaces, Turborepo
Qualité	Biome
Développement	Docker Compose
Backend — déploiement	AWS Lambda, Docker, AWS SAM
Frontend — déploiement	Cloudflare Pages, Wrangler
CI/CD	GitHub Actions

Installation

Depuis la racine du monorepo :

pnpm install

Les variables d’environnement sont définies dans .env.

Un fichier .env.example est fourni comme référence :

cp .env.example .env

Développement local

Les services nécessaires au développement local sont gérés avec Docker Compose :

docker compose up -d

Pour démarrer une application :

pnpm --filter @root/api dev
pnpm --filter @root/frontend dev

Les commandes et configurations propres à chaque application sont documentées dans leurs README respectifs :

* Backend API
* Frontend

Tâches du monorepo

Les tâches communes peuvent être exécutées depuis la racine avec Turborepo :

pnpm turbo build
pnpm turbo lint

Les filtres pnpm permettent également de cibler une application :

pnpm --filter @root/api <commande>
pnpm --filter @root/frontend <commande>

Déploiement

Les applications sont déployées indépendamment.

                    Monorepo
                       │
             ┌─────────┴─────────┐
             │                   │
          Backend             Frontend
             │                   │
        AWS Lambda          Cloudflare Pages
        Docker + SAM            Wrangler
             │
        PostgreSQL

Backend

L’API est déployée sur AWS Lambda sous forme d’image Docker avec AWS SAM.

Le déploiement est automatisé par GitHub Actions.

→ Documentation API

Frontend

Le frontend est buildé avec Vite puis déployé sur Cloudflare Pages avec Wrangler.

Le déploiement est automatisé par GitHub Actions sur main.

→ Documentation Frontend

Licence

Ce projet est distribué sous licence MIT. Voir LICENSE.