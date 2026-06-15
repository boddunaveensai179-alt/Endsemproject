package com.example.library.service;

import com.example.library.entity.Book;
import com.example.library.entity.Borrow;
import com.example.library.entity.Borrow.BorrowStatus;
import com.example.library.entity.User;
import com.example.library.dto.BorrowRequest;
import com.example.library.repository.BookRepository;
import com.example.library.repository.BorrowRepository;
import com.example.library.repository.UserRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BorrowService {

    private final BorrowRepository borrowRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    public BorrowService(
            BorrowRepository borrowRepository,
            BookRepository bookRepository,
            UserRepository userRepository
    ) {
        this.borrowRepository = borrowRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
    }

    public List<Borrow> getAllBorrows() {
        return borrowRepository.findAllByOrderByBorrowDateDescIdDesc();
    }

    public List<Borrow> getBorrowsByUser(Long userId) {
        return borrowRepository.findByUser_IdOrderByBorrowDateDescIdDesc(userId);
    }

    public Borrow getBorrowById(Long id) {
        return borrowRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Borrow record not found"));
    }

    @Transactional
    public Borrow createBorrow(Long userId, Long bookId) {
        if (bookId == null) {
            throw new IllegalArgumentException("Book id is required");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Book book = bookRepository.findByIdForUpdate(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found"));

        borrowRepository.findFirstByUser_IdAndBook_BookIdAndStatus(
                userId,
                bookId,
                BorrowStatus.BORROWED
        ).ifPresent(existing -> {
            throw new IllegalArgumentException("This book is already borrowed by the user");
        });

        if (book.getAvailableCount() <= 0) {
            throw new IllegalArgumentException("Book is not available for borrowing");
        }

        book.setAvailableCount(book.getAvailableCount() - 1);
        bookRepository.save(book);

        Borrow borrow = new Borrow();
        borrow.setUser(user);
        borrow.setBook(book);
        borrow.setBorrowDate(LocalDate.now());
        borrow.setStatus(BorrowStatus.BORROWED);
        borrow.setReturnDate(null);

        return borrowRepository.save(borrow);
    }

    @Transactional
    public Borrow returnBorrow(Long id, LocalDate requestedReturnDate) {
        Borrow borrow = getBorrowById(id);
        if (borrow.getStatus() == BorrowStatus.RETURNED) {
            return borrow;
        }

        markReturned(borrow, requestedReturnDate);
        return borrowRepository.save(borrow);
    }

    @Transactional
    public Borrow updateBorrow(Long id, BorrowRequest request) {
        Borrow borrow = getBorrowById(id);

        if (request.getStatus() != null && request.getStatus() != borrow.getStatus()) {
            if (request.getStatus() == BorrowStatus.RETURNED) {
                markReturned(borrow, request.getReturnDate());
            } else {
                markBorrowedAgain(borrow);
            }
        }

        if (request.getBorrowDate() != null) {
            borrow.setBorrowDate(request.getBorrowDate());
        }
        if (request.getReturnDate() != null && borrow.getStatus() == BorrowStatus.RETURNED) {
            borrow.setReturnDate(request.getReturnDate());
        }
        validateDates(borrow);

        return borrowRepository.save(borrow);
    }

    @Transactional
    public void deleteBorrow(Long id) {
        Borrow borrow = getBorrowById(id);
        if (borrow.getStatus() == BorrowStatus.BORROWED) {
            Book book = bookRepository.findByIdForUpdate(borrow.getBookId())
                    .orElseThrow(() -> new IllegalArgumentException("Book not found"));
            book.setAvailableCount(Math.min(book.getAvailableCount() + 1, book.getTotalCopies()));
            bookRepository.save(book);
        }
        borrowRepository.deleteById(id);
    }

    private void markReturned(Borrow borrow, LocalDate requestedReturnDate) {
        LocalDate returnDate = requestedReturnDate != null ? requestedReturnDate : LocalDate.now();
        if (returnDate.isBefore(borrow.getBorrowDate())) {
            throw new IllegalArgumentException("Return date cannot be before borrow date");
        }

        Book book = bookRepository.findByIdForUpdate(borrow.getBookId())
                .orElseThrow(() -> new IllegalArgumentException("Book not found"));
        book.setAvailableCount(Math.min(book.getAvailableCount() + 1, book.getTotalCopies()));
        bookRepository.save(book);

        borrow.setStatus(BorrowStatus.RETURNED);
        borrow.setReturnDate(returnDate);
    }

    private void markBorrowedAgain(Borrow borrow) {
        Book book = bookRepository.findByIdForUpdate(borrow.getBookId())
                .orElseThrow(() -> new IllegalArgumentException("Book not found"));
        if (book.getAvailableCount() <= 0) {
            throw new IllegalArgumentException("Book is not available for borrowing");
        }
        book.setAvailableCount(book.getAvailableCount() - 1);
        bookRepository.save(book);

        borrow.setStatus(BorrowStatus.BORROWED);
        borrow.setReturnDate(null);
    }

    private void validateDates(Borrow borrow) {
        if (borrow.getReturnDate() != null && borrow.getReturnDate().isBefore(borrow.getBorrowDate())) {
            throw new IllegalArgumentException("Return date cannot be before borrow date");
        }
    }
}
