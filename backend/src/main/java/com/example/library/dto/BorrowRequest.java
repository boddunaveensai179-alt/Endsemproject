package com.example.library.dto;

import com.example.library.entity.Borrow.BorrowStatus;
import java.time.LocalDate;

public class BorrowRequest {

    // bookId is only required for creating a borrow; optional for updates
    private Long bookId;

    private LocalDate borrowDate;
    private LocalDate returnDate;
    private BorrowStatus status;

    public Long getBookId() {
        return bookId;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }

    public LocalDate getBorrowDate() {
        return borrowDate;
    }

    public void setBorrowDate(LocalDate borrowDate) {
        this.borrowDate = borrowDate;
    }

    public LocalDate getReturnDate() {
        return returnDate;
    }

    public void setReturnDate(LocalDate returnDate) {
        this.returnDate = returnDate;
    }

    public BorrowStatus getStatus() {
        return status;
    }

    public void setStatus(BorrowStatus status) {
        this.status = status;
    }
}
