import { db } from '#config/database';
import { makeBooks } from '../factories/books_factory.ts';

async function seed() {
  console.log('+++++++++++++++++++++++++++++++++++++');
  console.log('+++++++++++++++++++++++++++++++++++++');
  console.log('+++++++++++++++++++++++++++++++++++++');
  console.log('+++++++++++++++++++++++++++++++++++++');
  console.log('Seeding...');

  const books = makeBooks(20);
  await db.insertInto('books').values(books).execute();

  console.log(`${books.length} books`);
  await db.destroy();
}

seed().catch((err) => {
  console.error('Error', err);
  process.exit(1);
});
