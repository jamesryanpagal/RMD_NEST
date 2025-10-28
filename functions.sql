CREATE OR REPLACE FUNCTION set_receipt_number_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
	receipt_no VARCHAR(220);
BEGIN

	receipt_no := generate_receipt_number();
	NEW."receiptNo" := receipt_no;
	RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION generate_receipt_number() RETURNS text
    LANGUAGE plpgsql
    AS $$BEGIN
	RETURN 'RCP-' || to_char(NOW(), 'YYYYMMDDHH24MISSUS');
END;$$;