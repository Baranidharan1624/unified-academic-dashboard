import argparse
import getpass

import bcrypt
import mysql.connector


def is_bcrypt_hash(value: str) -> bool:
    if not value:
        return False
    return value.startswith("$2a$") or value.startswith("$2b$") or value.startswith("$2y$")


def main() -> None:
    parser = argparse.ArgumentParser(description="Backfill non-bcrypt account passwords.")
    parser.add_argument("--host", default="localhost")
    parser.add_argument("--port", type=int, default=3306)
    parser.add_argument("--user", default="root")
    parser.add_argument("--password", default=None, help="DB password. If omitted, prompt.")
    parser.add_argument("--database", default="campusone")
    parser.add_argument("--default-password", default="Campus@123")
    parser.add_argument(
        "--force-all",
        action="store_true",
        help="Reset password for all accounts, even if already bcrypt-hashed.",
    )
    args = parser.parse_args()

    db_password = args.password if args.password is not None else getpass.getpass("DB password: ")

    conn = mysql.connector.connect(
        host=args.host,
        port=args.port,
        user=args.user,
        password=db_password,
        database=args.database,
        autocommit=False,
    )

    try:
        cur = conn.cursor()
        cur.execute("SELECT id, email, password FROM accounts")
        rows = cur.fetchall()

        shared_hash = bcrypt.hashpw(
            args.default_password.encode("utf-8"), bcrypt.gensalt()
        ).decode("utf-8")

        updates = []
        skipped = 0

        for account_id, email, password in rows:
            pwd = (password or "").strip()
            if is_bcrypt_hash(pwd) and not args.force_all:
                skipped += 1
                continue

            updates.append((shared_hash, account_id, email))

        for new_hash, account_id, email in updates:
            cur.execute("UPDATE accounts SET password=%s WHERE id=%s", (new_hash, account_id))
            print(f"Updated password hash for account_id={account_id}, email={email}")

        conn.commit()
        print("---")
        print(f"Total accounts: {len(rows)}")
        print(f"Updated: {len(updates)}")
        print(f"Already hashed (skipped): {skipped}")
        print(f"Default login password for updated accounts: {args.default_password}")

    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    main()
