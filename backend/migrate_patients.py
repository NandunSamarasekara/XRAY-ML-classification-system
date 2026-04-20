import psycopg2
import uuid
import random

# Source database configuration
SRC_DSN = "dbname=patient_portfolio user=postgres password=1234 host=localhost port=5432"

# Destination database configuration
DST_DSN = "dbname=xraydb user=postgres password=1234 host=localhost port=5432"

def migrate():
    try:
        src_conn = psycopg2.connect(SRC_DSN)
        src_cur = src_conn.cursor()
        
        dst_conn = psycopg2.connect(DST_DSN)
        dst_cur = dst_conn.cursor()
        
        print("Connected to both databases.")
        
        # Get doctor_id to assign
        dst_cur.execute("SELECT id FROM doctors LIMIT 1")
        doctor_row = dst_cur.fetchone()
        
        if not doctor_row:
            print("No doctor found in xraydb. Cannot migrate patients.")
            return
            
        doctor_id = str(doctor_row[0])
        print(f"Using doctor_id: {doctor_id}")
        
        # Read patients from old db
        src_cur.execute("SELECT id, first_name, last_name, dob, gender, phone, email, address, notes, is_active, otp FROM patients")
        patients = src_cur.fetchall()
        print(f"Found {len(patients)} patients to migrate.")
        
        for patient in patients:
            id, first_name, last_name, dob, gender, phone, email, address, notes, is_active, otp = patient
            # check if patient exists in destination
            dst_cur.execute("SELECT id FROM patients WHERE id = %s", (id,))
            if dst_cur.fetchone():
                print(f"Patient {id} already exists. Skipping.")
                continue

            username = f"P_{first_name}{last_name}_{random.randint(1000, 9999)}"
            gender_enum = gender.upper() if gender else None
            
            # The UUID in python psycopg2 translates well or we can typecast to string
            dst_cur.execute(
                """
                INSERT INTO patients 
                (id, first_name, last_name, dob, gender, phone, email, address, notes, is_active, otp, doctor_id, username, nic) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (id, first_name, last_name, dob, gender_enum, phone, email, address, notes, is_active, otp, doctor_id, username, None)
            )
        
        dst_conn.commit()
        print(f"Successfully migrated {len(patients)} patients.")
        
        src_cur.close()
        src_conn.close()
        dst_cur.close()
        dst_conn.close()
        
    except Exception as e:
        print(f"Error migrating: {e}")

if __name__ == "__main__":
    migrate()
