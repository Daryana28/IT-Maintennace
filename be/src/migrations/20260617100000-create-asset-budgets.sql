IF OBJECT_ID('asset_budgets', 'U') IS NULL
BEGIN
    CREATE TABLE asset_budgets (
        id INT IDENTITY(1,1) PRIMARY KEY,
        budget_code VARCHAR(100) NOT NULL,
        subject VARCHAR(255),
        initial_plan DECIMAL(18, 2),
        review VARCHAR(255),
        item_no VARCHAR(100),
        item_name VARCHAR(255),
        qty INT,
        purchase_price DECIMAL(18, 2),
        rate VARCHAR(50),
        budget DECIMAL(18, 2),
        po_date DATE,
        ship_date DATE,
        estimation_date DATE,
        payment_date DATE,
        payment_amount_1 DECIMAL(18, 2),
        created_at DATETIMEOFFSET DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIMEOFFSET DEFAULT CURRENT_TIMESTAMP
    );
END
GO
