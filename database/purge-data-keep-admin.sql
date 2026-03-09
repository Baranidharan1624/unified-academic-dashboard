-- Purge all data but keep table structures and admin login credentials.
-- Works with mixed/legacy schemas by deleting data from every table except `users`.

SET FOREIGN_KEY_CHECKS = 0;

DROP PROCEDURE IF EXISTS purge_non_user_data;
DELIMITER //
CREATE PROCEDURE purge_non_user_data()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE table_name_var VARCHAR(128);
    DECLARE cur CURSOR FOR
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
          AND table_type = 'BASE TABLE'
          AND table_name <> 'users';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO table_name_var;
        IF done = 1 THEN
            LEAVE read_loop;
        END IF;

        SET @sql = CONCAT('DELETE FROM `', table_name_var, '`');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END LOOP;
    CLOSE cur;
END //
DELIMITER ;

CALL purge_non_user_data();
DROP PROCEDURE IF EXISTS purge_non_user_data;

-- Keep only admin accounts in users table.
DELETE FROM users WHERE role <> 'ADMIN';

SET FOREIGN_KEY_CHECKS = 1;
