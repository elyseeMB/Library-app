#!/bin/sh
# Script d'initialisation de la base de données en local, exécuté dans le shell
# du conteneur Docker Postgres depuis /docker-entrypoint-initdb.d/.
#
# Variables :
#   - POSTGRES_USER : admin
#   - DB_USER       : utilisateur applicatif
#   - DB_PASSWORD   : mot de passe de l'utilisateur
#   - DB_NAME       : nom de la DB

set -eu

psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" <<-EOF
CREATE USER $DB_USER;
ALTER USER $DB_USER WITH SUPERUSER;
ALTER USER $DB_USER PASSWORD '$DB_PASSWORD';
CREATE DATABASE $DB_NAME;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOF

psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$DB_NAME" <<-EOF
ALTER SCHEMA public OWNER TO $DB_USER;
GRANT ALL ON SCHEMA public TO $DB_USER;
EOF