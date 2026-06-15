package com.example.library.service;

import com.example.library.dto.BookRequest;
import com.example.library.entity.Book;
import com.example.library.repository.BookRepository;
import com.example.library.repository.BorrowRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final BorrowRepository borrowRepository;

    public BookService(BookRepository bookRepository, BorrowRepository borrowRepository) {
        this.bookRepository = bookRepository;
        this.borrowRepository = borrowRepository;
    }

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public Optional<Book> getBookById(Long bookId) {
        if (bookId == null || bookId <= 0) {
            return Optional.empty();
        }

        return bookRepository.findById(bookId);
    }

    @Transactional
    public Book addBook(BookRequest request) {
        validateRequiredText(request.getTitle(), "Book title is required");
        validateRequiredText(request.getAuthor(), "Book author is required");

        int totalCopies = request.getTotalCopies() == null ? 1 : request.getTotalCopies();
        int availableCount = request.getAvailableCount() == null ? totalCopies : request.getAvailableCount();
        validateInventory(totalCopies, availableCount);

        Book book = new Book();
        book.setTitle(request.getTitle().trim());
        book.setAuthor(request.getAuthor().trim());
        book.setCategory(normalizeCategory(request.getCategory()));
        book.setPrice(request.getPrice() == null ? 0 : request.getPrice());
        book.setTotalCopies(totalCopies);
        book.setAvailableCount(availableCount);
        return bookRepository.save(book);
    }

    @Transactional
    public Book updateBook(Long bookId, BookRequest request) {
        Book book = bookRepository.findByIdForUpdate(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found"));

        if (request.getTitle() != null) {
            validateRequiredText(request.getTitle(), "Book title cannot be blank");
            book.setTitle(request.getTitle().trim());
        }
        if (request.getAuthor() != null) {
            validateRequiredText(request.getAuthor(), "Book author cannot be blank");
            book.setAuthor(request.getAuthor().trim());
        }
        if (request.getCategory() != null) {
            book.setCategory(normalizeCategory(request.getCategory()));
        }
        if (request.getPrice() != null) {
            book.setPrice(request.getPrice());
        }

        int borrowedCopies = book.getTotalCopies() - book.getAvailableCount();
        int totalCopies = request.getTotalCopies() == null ? book.getTotalCopies() : request.getTotalCopies();
        int availableCount = request.getAvailableCount() == null
                ? totalCopies - borrowedCopies
                : request.getAvailableCount();

        if (totalCopies < borrowedCopies) {
            throw new IllegalArgumentException("Total copies cannot be less than currently borrowed copies");
        }
        validateInventory(totalCopies, availableCount);
        book.setTotalCopies(totalCopies);
        book.setAvailableCount(availableCount);

        return bookRepository.save(book);
    }

    @Transactional
    public boolean deleteBook(Long bookId) {
        if (borrowRepository.existsByBook_BookId(bookId)) {
            throw new IllegalArgumentException("Book cannot be deleted because borrow history exists");
        }
        if (bookRepository.existsById(bookId)) {
            bookRepository.deleteById(bookId);
            return true;
        }
        return false;
    }

    private void validateRequiredText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
    }

    private String normalizeCategory(String category) {
        return category == null || category.isBlank() ? "General" : category.trim();
    }

    private void validateInventory(int totalCopies, int availableCount) {
        if (totalCopies < 1) {
            throw new IllegalArgumentException("Total copies must be at least 1");
        }
        if (availableCount < 0 || availableCount > totalCopies) {
            throw new IllegalArgumentException("Available count must be between 0 and total copies");
        }
    }
}
