CREATE OR REPLACE FUNCTION generate_receipt_number() RETURNS text
    LANGUAGE plpgsql
    AS $$BEGIN
	RETURN 'RCP-' || to_char(NOW(), 'YYYYMMDDHH24MISSUS');
END;$$;