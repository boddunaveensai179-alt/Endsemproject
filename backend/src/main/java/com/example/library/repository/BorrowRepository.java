package com.example.library.repository;

import com.example.library.entity.Borrow;
import com.example.library.entity.Borrow.BorrowStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BorrowRepository extends JpaRepository<Borrow, Long> {
    List<Borrow> findAllByOrderByBorrowDateDescIdDesc();

    List<Borrow> findByUser_IdOrderByBorrowDateDescIdDesc(Long userId);

    Optional<Borrow> findFirstByUser_IdAndBook_BookIdAndStatus(
            Long userId,
            Long bookId,
            BorrowStatus status
    );

    boolean existsByBook_BookId(Long bookId);
}
