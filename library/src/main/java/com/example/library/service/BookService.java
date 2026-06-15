package com.example.library.service;

import com.example.library.entity.Book;
import com.example.library.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    // ================= GET ALL BOOKS =================

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    // ================= GET BOOK BY ID =================

    public Optional<Book> getBookById(Long id) {
        return bookRepository.findById(id);
    }

    // ================= SAVE / ADD BOOK =================

    public Book saveBook(Book book) {
        return bookRepository.save(book);
    }

    // ================= UPDATE BOOK =================

    public Book updateBook(Long id, Book updatedBook) {
        Book existing = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));

        existing.setTitle(updatedBook.getTitle());
        existing.setAuthor(updatedBook.getAuthor());
        existing.setCategory(updatedBook.getCategory());
        existing.setPrice(updatedBook.getPrice());
        existing.setTotalCopies(updatedBook.getTotalCopies());
        existing.setAvailableCount(updatedBook.getAvailableCount());
        return bookRepository.save(existing);
    }

    // ================= DELETE BOOK =================

    public void deleteBook(Long id) {
        bookRepository.deleteById(id);
    }
}