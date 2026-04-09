#!/usr/bin/env python3
"""
Map lab rooms to lab courses and update them with proper assignments
"""

import requests
import json
from collections import defaultdict

BASE_URL = "http://localhost:8080"

print("Fetching lab rooms...")
rooms_response = requests.get(f"{BASE_URL}/admin/rooms")
all_rooms = rooms_response.json()
lab_rooms = [r for r in all_rooms if r.get("roomType") == "LAB"]

print(f"Fetching lab courses...")
courses_response = requests.get(f"{BASE_URL}/courses")
all_courses = courses_response.json()
lab_courses = [c for c in all_courses if c.get("type") == "LAB"]

print(f"\nFound {len(lab_rooms)} lab rooms and {len(lab_courses)} lab courses")

# Group lab courses by department and semester
courses_by_dept_sem = defaultdict(list)
for course in lab_courses:
    key = f"{course.get('departmentCode')}-{course.get('semester')}"
    courses_by_dept_sem[key].append(course)

print(f"\nLab courses grouped by department-semester:")
for key in sorted(courses_by_dept_sem.keys()):
    print(f"  {key}: {len(courses_by_dept_sem[key])} courses")

# Create mapping: for each lab room, assign a lab course
print(f"\nCreating room-to-course mapping...")
updates = []
course_indices = defaultdict(int)  # Track which course to use for each dept-sem

for room in lab_rooms:
    dept = room.get("assignedDepartment")
    sem = room.get("assignedSemester")
    key = f"{dept}-{sem}"
    
    if key in courses_by_dept_sem:
        # Round-robin through available courses for this dept-sem
        course_list = courses_by_dept_sem[key]
        course_idx = course_indices[key] % len(course_list)
        selected_course = course_list[course_idx]
        course_indices[key] += 1
        
        # Prepare update
        room_update = {
            "id": room.get("id"),
            "roomNumber": room.get("roomNumber"),
            "roomType": room.get("roomType"),
            "assignedDepartment": dept,
            "assignedSemester": sem,
            "assignedSection": "A",  # Set section to A
            "assignedCourseCode": selected_course.get("courseCode"),
            "building": room.get("building"),
            "capacity": room.get("capacity"),
            "isAvailable": room.get("isAvailable"),
            "isActive": room.get("isActive"),
            "roomName": room.get("roomName")
        }
        updates.append(room_update)
        print(f"  {room.get('roomNumber')} ({dept}-SEM{sem}) -> {selected_course.get('courseCode')}")
    else:
        print(f"  WARNING: No lab courses found for {dept}-SEM{sem}, skipping {room.get('roomNumber')}")

print(f"\nUpdating {len(updates)} lab rooms via API...")
success_count = 0
error_count = 0

for room_update in updates:
    try:
        response = requests.put(
            f"{BASE_URL}/admin/rooms/{room_update['id']}",
            json=room_update,
            headers={"Content-Type": "application/json"}
        )
        if response.status_code in [200, 201]:
            success_count += 1
        else:
            print(f"  ERROR: Failed to update room {room_update['roomNumber']}: {response.status_code}")
            error_count += 1
    except Exception as e:
        print(f"  ERROR: Failed to update room {room_update['roomNumber']}: {str(e)}")
        error_count += 1

print(f"\nUpdate Results:")
print(f"  Success: {success_count}")
print(f"  Errors: {error_count}")

print(f"\nTriggering timetable generation...")
try:
    gen_response = requests.post(f"{BASE_URL}/admin/timetable/generate")
    if gen_response.status_code == 200:
        generated = gen_response.json()
        print(f"  Generation successful: {len(generated)} entries created")
    else:
        print(f"  Generation failed with status {gen_response.status_code}")
except Exception as e:
    print(f"  Generation error: {str(e)}")

print("\nDone!")
