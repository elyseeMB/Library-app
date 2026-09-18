# @root/frontend

Interface web de l'application, construite avec **Lit** et **Web Awesome**, buildée avec **Vite**.

## Stack technique

- **Framework** : [Lit](https://lit.dev/) (web components)
- **UI kit** : [Web Awesome](https://webawesome.com/) (`@awesome.me/webawesome`)
- **Routing** : `@lit-labs/router`, pinné en version exacte (`0.1.4`, sans `^`) car les packages `@lit-labs/*` sont expérimentaux et ne suivent pas de semver strict — une montée de version doit être testée manuellement.
- **Build** : Vite
- **Langage** : TypeScript
- **Lint / format** : Biome
- **Hébergement** : Cloudflare Pages via `wrangler`

## Structure du projet

```
apps/frontend/src/
├── api/          # Appels vers l'API backend
├── components/   # Web components réutilisables (app-dialog, app-drawer, app-field...)
├── css/          # Styles partagés
├── helpers/      # Fonctions utilitaires
├── layout/       # Composants de mise en page
├── pages/        # Pages de l'application (une par route)
├── styles/       # Feuilles de style additionnelles
├── main.ts       # Point d'entrée de l'application
└── types.ts      # Types TypeScript partagés
```

### Description des dossiers

| Dossier       | Rôle                                                        |
|---------------|---------------------------------------------------------------|
| `api`         | Client HTTP et fonctions d'appel à l'API backend               |
| `components`  | Web components génériques, utilisés à travers plusieurs pages  |
| `css`         | Styles globaux ou partagés entre composants                    |
| `helpers`     | Fonctions transverses (formatage, validation, etc.)            |
| `layout`      | Structure visuelle commune (header, navigation, etc.)          |
| `pages`       | Une page par entité métier (`authors`, `books`, `loans`, `members`, `dashboard`) |
| `styles`      | Styles spécifiques additionnels                                 |

## Installation

```bash
pnpm install
```

## Scripts disponibles

| Commande        | Description                                  |
|-----------------|-----------------------------------------------|
| `pnpm dev`      | Démarre le serveur de développement Vite      |
| `pnpm build`    | Vérifie les types puis build l'app pour la prod |
| `pnpm preview`  | Prévisualise le build de production            |
| `pnpm check`    | Vérifie les types sans build                   |
| `pnpm lint`     | Vérifie le code avec Biome                     |

## Déploiement

Déploiement sur **Cloudflare Pages** via `wrangler`, avec un pipeline **GitHub Actions** déclenché sur push `main`
