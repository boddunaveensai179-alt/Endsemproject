package com.example.library.repository;

import com.example.library.entity.Borrow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BorrowRepository extends JpaRepository<Borrow, Long> {

    // Navigate through the 'user' relationship to its 'id' field
    List<Borrow> findByUser_Id(Long userId);

    List<Borrow> findByBook_BookId(Long bookId);

    List<Borrow> findByReturnedFalse();

    // JPQL query for finding active (not returned) borrows for a specific user+book
    @Query("SELECT b FROM Borrow b WHERE b.user.id = :userId AND b.book.bookId = :bookId AND b.returned = false")
    List<Borrow> findActiveByUserAndBook(@Param("userId") Long userId, @Param("bookId") Long bookId);
}
