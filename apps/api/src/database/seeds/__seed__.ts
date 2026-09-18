import '#config/env';
import { db } from '#config/database';
import { authorsFactory } from '#database/factories/authors_factory';
import { booksFactory } from '#database/factories/books_factory';
import { loanHistoriesFactory } from '#database/factories/loan_history_factory';
import { loansFactory } from '#database/factories/loans_factory';
import { membersFactory } from '#database/factories/members_factory';
import { BookStatus, BooksStatusText } from '#enums/books_status';
import { LoanHistoryAction } from '#enums/loan_history_action';

async function seed() {
  console.log('+++++++++++++++++++++++++++++++++++++');
  console.log('+++++++++++++++++++++++++++++++++++++');
  console.log('+++++++++++++++++++++++++++++++++++++');
  console.log('+++++++++++++++++++++++++++++++++++++');
  console.log('Seeding...');

  await db.transaction().execute(async (trx) => {
    // Authors
    const authors = authorsFactory(50);
    const insertedAuthors = await trx
      .insertInto('authors')
      .values(authors)
      .returningAll()
      .execute();
    console.log(`${insertedAuthors.length} authors`);

    // Books
    const books = insertedAuthors.flatMap((author) => booksFactory(author.id, 2));
    const insertedBooks = await trx.insertInto('books').values(books).returningAll().execute();
    console.log(`${insertedBooks.length} books`);

    // Members
    const members = membersFactory(50);
    const insertedMembers = await trx
      .insertInto('members')
      .values(members)
      .returningAll()
      .execute();
    console.log(`${insertedMembers.length} members`);

    // Loans
    const loans = insertedBooks
      .slice(0, 50)
      .map((book, index) => loansFactory(insertedMembers[index].id, book.id, 1)[0]);
    const insertedLoans = await trx.insertInto('loans').values(loans).returningAll().execute();
    console.log(`${insertedLoans.length} loans`);

    // Update borrowed books
    await trx
      .updateTable('books')
      .set({
        status: BooksStatusText[BookStatus.Borrowed],
      })
      .where(
        'id',
        'in',
        insertedBooks.slice(0, 50).map((book) => book.id),
      )
      .execute();

    // Loan history
    const loanHistories = insertedLoans.flatMap((loan) =>
      loanHistoriesFactory(loan.id, LoanHistoryAction.Borrowed, 1),
    );
    const insertedLoanHistories = await trx
      .insertInto('loan_history')
      .values(loanHistories)
      .returningAll()
      .execute();
    console.log(`${insertedLoanHistories.length} loan history records`);
  });

  await db.destroy();
}

seed().catch((err) => {
  console.error('Error', err);
  process.exit(1);
});
