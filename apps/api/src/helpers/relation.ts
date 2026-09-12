import { type ExpressionBuilder, type SelectQueryBuilder, sql } from 'kysely';

export function buildCountSubquery(
  eb: ExpressionBuilder<any, any>,
  relatedTable: string,
  foreignKey: string,
  parentTable: string,
  parentKey: string = 'id',
  filter?: (qb: any) => any,
) {
  let sub = eb
    .selectFrom(relatedTable)
    .select(eb.fn.countAll().as('count'))
    .whereRef(`${relatedTable}.${foreignKey}`, '=', `${parentTable}.${parentKey}`);

  return filter ? filter(sub) : sub;
}

export function buildSumSubquery(
  eb: ExpressionBuilder<any, any>,
  relatedTable: string,
  foreignKey: string,
  column: string,
  parentTable: string,
  parentKey: string = 'id',
  filter?: (qb: any) => any,
) {
  let sub = eb
    .selectFrom(relatedTable)
    .select((qb: any) => qb.fn.sum(column).as('sum'))
    .whereRef(`${relatedTable}.${foreignKey}`, '=', `${parentTable}.${parentKey}`);

  return filter ? filter(sub) : sub;
}

export function buildExistsSubquery(
  eb: ExpressionBuilder<any, any>,
  relatedTable: string,
  foreignKey: string,
  parentTable: string,
  parentKey: string = 'id',
  filter?: (qb: any) => any,
) {
  let sub = eb
    .selectFrom(relatedTable)
    .select('id')
    .whereRef(`${relatedTable}.${foreignKey}`, '=', `${parentTable}.${parentKey}`);

  sub = filter ? filter(sub) : sub;
  return eb.exists(sub);
}

export function applyRelationList(
  query: SelectQueryBuilder<any, any, any>,
  relatedTable: string,
  foreignKey: string,
  parentTable: string,
  alias: string,
  parentKey: string = 'id',
  configure?: (qb: any) => any,
) {
  return query
    .leftJoinLateral(
      (qb: any) => {
        let sub = qb
          .selectFrom(relatedTable)
          .selectAll()
          .whereRef(`${relatedTable}.${foreignKey}`, '=', `${parentTable}.${parentKey}`);
        return (configure ? configure(sub) : sub).as('p');
      },
      (join: any) => join.onTrue(),
    )
    .select((eb: any) => eb.fn.coalesce(sql<object[]>`json_agg(p.*)`, sql`'[]'::json`).as(alias))
    .groupBy(`${parentTable}.${parentKey}`);
}

export function applyHooks<Q>(query: Q, hooks: Map<string, (q: Q) => Q>): Q {
  let q = query;
  hooks.forEach((cb) => {
    q = cb(q);
  });
  return q;
}
