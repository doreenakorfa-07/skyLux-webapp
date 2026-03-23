package com.airline.repository;

import com.airline.entity.Payment;
import com.airline.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface PaymentRepository extends MongoRepository<Payment, String> {
    List<Payment> findByUser(User user);
}
