-- Sample Data
INSERT INTO markets VALUES (
    'SOL-USDC', 'SOL', 'USDC', 
    100, 100000000, 100000000000, 
    10, 20, 'active', NOW()
);

INSERT INTO user_balances VALUES
('user_1', 'SOL', 10000000000, 0, NOW()),
('user_1', 'USDC', 100000000000, 0, NOW()),
('user_2', 'SOL', 10000000000, 0, NOW()),
('user_2', 'USDC', 100000000000, 0, NOW());