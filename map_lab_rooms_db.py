#!/usr/bin/env python3
"""
Map lab rooms to lab courses via direct database update and regenerate timetable
"""

import mysql.connector
import requests
from collections import defaultdict

# Database connection
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="12345",
    database="campusone"
)

cursor = db.cursor(dictionary=True)

print("Fetching lab courses...")

# Get lab courses from API
courses_response = requests.get("http://localhost:8080/courses")
all_courses = courses_response.json()
lab_courses = [c for c in all_courses if c.get("type") == "LAB"]

print(f"Found {len(lab_courses)} lab courses")

# Group lab courses by department and semester
courses_by_dept_sem = defaultdict(list)
for course in lab_courses:
    key = f"{course.get('departmentCode')}-{course.get('semester')}"
    courses_by_dept_sem[key].append(course)

print(f"Lab courses grouped by department-semester")

# Get lab rooms from database
print("\nFetching lab rooms from database...")
cursor.execute("SELECT * FROM rooms WHERE room_type='lab' ORDER BY id")
lab_rooms = cursor.fetchall()

print(f"Found {len(lab_rooms)} lab rooms")

# Create mapping and update database
print("\nUpdating lab rooms...")
updates_made = 0
course_indices = defaultdict(int)

for room in lab_rooms:
    dept = room["assigned_department"]
    sem = room["assigned_semester"]
    key = f"{dept}-{sem}"
    
    if key in courses_by_dept_sem:
        # Round-robin through available courses for this dept-sem
        course_list = courses_by_dept_sem[key]
        course_idx = course_indices[key] % len(course_list)
        selected_course = course_list[course_idx]
        course_indices[key] += 1
        
        # Update database
        course_code = selected_course.get("courseCode")
        room_id = room["id"]
        room_num = room["room_number"]
        
        cursor.execute(
            "UPDATE rooms SET assigned_section='A', assigned_course_code=%s WHERE id=%s",
            (course_code, room_id)
        )
        updates_made += 1
        print(f"  {room_num} ({dept}-SEM{sem}) -> {course_code}")
    else:
        print(f"  WARNING: No lab courses found for {dept}-SEM{sem}, skipping {room['room_number']}")

# Commit changes
db.commit()
print(f"\n✓ Updated {updates_made} lab rooms in database")

# Verify updates
cursor.execute("SELECT COUNT(*) as count FROM rooms WHERE room_type='lab' AND assigned_course_code IS NOT NULL")
result = cursor.fetchone()
assigned_count = result["count"]
print(f"✓ Verification: {assigned_count}/{len(lab_rooms)} lab rooms now have course assignments")

cursor.close()
db.close()

print(f"\nTriggering timetable generation...")
try:
    gen_response = requests.post("http://localhost:8080/admin/timetable/generate")
    if gen_response.status_code == 200:
        generated = gen_response.json()
        print(f"✓ Generation successful: {len(generated)} entries created")
        
        # Get a summary of what was generated
        if isinstance(generated, list) and len(generated) > 0:
            print(f"\nTimetable Summary:")
            print(f"  Total entries: {len(generated)}")
            
            # Group by department to see distribution
            by_dept = defaultdict(int)
            for entry in generated:
                if isinstance(entry, dict):
                    dept = entry.get("department") or entry.get("roomDepartment", "Unknown")
                    by_dept[dept] += 1
            
            print(f"  Distribution by department:")
            for dept in sorted(by_dept.keys()):
                print(f"    {dept}: {by_dept[dept]} entries")
    
    else:
        print(f"  Generation failed with status {gen_response.status_code}")
        print(f"  Response: {gen_response.text}")
except Exception as e:
    print(f"  Generation error: {str(e)}")

print("\n✓ Done! Your timetable is now ready.")
