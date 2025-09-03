DO
$$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename <> '_prisma_migrations'
    LOOP
        EXECUTE 'TRUNCATE TABLE public.' || quote_ident(tbl) || ' RESTART IDENTITY CASCADE;';
    END LOOP;
END;
$$;