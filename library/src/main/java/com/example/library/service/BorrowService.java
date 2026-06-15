package com.example.library.service;

import com.example.library.entity.Book;
import com.example.library.entity.Borrow;
import com.example.library.entity.User;
import com.example.library.repository.BookRepository;
import com.example.library.repository.BorrowRepository;
import com.example.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class BorrowService {

    @Autowired
    private BorrowRepository borrowRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    // ================= GET ALL BORROWS =================

    public List<Borrow> getAllBorrows() {
        return borrowRepository.findAll();
    }

    // ================= GET BORROW BY ID =================

    public Optional<Borrow> getBorrowById(Long id) {
        return borrowRepository.findById(id);
    }

    // ================= CREATE BORROW =================

    public Borrow createBorrow(Long userId, Long bookId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + bookId));

        if (book.getAvailableCount() <= 0) {
            throw new RuntimeException("No copies available for book: " + book.getTitle());
        }

        // Decrement available count
        book.setAvailableCount(book.getAvailableCount() - 1);
        bookRepository.save(book);

        Borrow borrow = new Borrow(user, book, LocalDate.now());
        return borrowRepository.save(borrow);
    }

    // ================= UPDATE BORROW =================

    public Borrow updateBorrow(Long id, Borrow updatedBorrow) {
        Borrow existing = borrowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Borrow record not found with id: " + id));

        existing.setBorrowDate(updatedBorrow.getBorrowDate());
        existing.setReturnDate(updatedBorrow.getReturnDate());
        existing.setReturned(updatedBorrow.isReturned());
        return borrowRepository.save(existing);
    }

    // ================= RETURN BOOK =================

    public Borrow returnBook(Long borrowId) {
        Borrow borrow = borrowRepository.findById(borrowId)
                .orElseThrow(() -> new RuntimeException("Borrow record not found with id: " + borrowId));

        if (borrow.isReturned()) {
            throw new RuntimeException("Book already returned for borrow id: " + borrowId);
        }

        // Mark as returned
        borrow.setReturned(true);
        borrow.setReturnDate(LocalDate.now());

        // Increment available count
        Book book = borrow.getBook();
        book.setAvailableCount(book.getAvailableCount() + 1);
        bookRepository.save(book);

        return borrowRepository.save(borrow);
    }

    // ================= DELETE BORROW =================

    public void deleteBorrow(Long id) {
        Borrow borrow = borrowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Borrow record not found with id: " + id));

        // If not returned yet, restore available count
        if (!borrow.isReturned()) {
            Book book = borrow.getBook();
            book.setAvailableCount(book.getAvailableCount() + 1);
            bookRepository.save(book);
        }

        borrowRepository.deleteById(id);
    }

    // ================= GET BORROWS BY USER =================

    public List<Borrow> getBorrowsByUser(Long userId) {
        return borrowRepository.findByUser_Id(userId);
    }

    // ================= ADMIN UPDATE BORROW =================

    public Borrow adminUpdateBorrow(Long id, java.util.Map<String, Object> request) {
        Borrow existing = borrowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Borrow record not found with id: " + id));

        if (request.containsKey("returned")) {
            boolean ret = Boolean.parseBoolean(request.get("returned").toString());
            if (ret && !existing.isReturned()) {
                existing.setReturned(true);
                existing.setReturnDate(java.time.LocalDate.now());
                Book book = existing.getBook();
                book.setAvailableCount(book.getAvailableCount() + 1);
                bookRepository.save(book);
            } else {
                existing.setReturned(ret);
            }
        }
        if (request.containsKey("returnDate") && request.get("returnDate") != null) {
            existing.setReturnDate(java.time.LocalDate.parse(request.get("returnDate").toString()));
        }
        return borrowRepository.save(existing);
    }
}
