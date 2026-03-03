-- 1. 营地表
CREATE TABLE IF NOT EXISTS camps (
    id SERIAL PRIMARY KEY,
    camp_id INTEGER UNIQUE,
    camp_name VARCHAR(100),
    address TEXT,
    capacity INTEGER,
    current_num INTEGER,
    contact_person VARCHAR(50),
    contact_phone VARCHAR(20),
    status INTEGER,
    create_date DATE,
    open_date DATE,
    close_date DATE,
    remark TEXT,
    create_time TIMESTAMP WITH TIME ZONE,
    update_time TIMESTAMP WITH TIME ZONE
);

-- 2. 员工表
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    emp_id VARCHAR(50) UNIQUE,
    name VARCHAR(50),
    gender VARCHAR(10),
    phone VARCHAR(20),
    role VARCHAR(50),
    camp_id INTEGER,
    qualification TEXT,
    duty_area TEXT,
    hire_date DATE,
    status INTEGER,
    base_salary NUMERIC(10, 2),
    allow_commission BOOLEAN,
    commission_rates JSONB,
    create_time TIMESTAMP WITH TIME ZONE,
    update_time TIMESTAMP WITH TIME ZONE
);

-- 3. 房间类型表 (对应 campRoomType.ts)
CREATE TABLE IF NOT EXISTS room_types (
    id SERIAL PRIMARY KEY,
    room_type_id INTEGER UNIQUE,
    camp_id INTEGER,
    room_name VARCHAR(100),
    bed_count INTEGER,
    bed_type INTEGER,
    room_status INTEGER,
    price NUMERIC(10, 2),
    upper_price NUMERIC(10, 2),
    lower_price NUMERIC(10, 2),
    create_time TIMESTAMP WITH TIME ZONE,
    update_time TIMESTAMP WITH TIME ZONE
);

-- 4. 房间表 (对应 room.ts)
CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    room_id INTEGER UNIQUE,
    camp_id INTEGER,
    type_id INTEGER,
    room_num VARCHAR(50),
    bed_count INTEGER,
    status INTEGER,
    create_time TIMESTAMP WITH TIME ZONE,
    update_time TIMESTAMP WITH TIME ZONE
);

-- 5. 床位表 (对应 bed.ts)
CREATE TABLE IF NOT EXISTS beds (
    id SERIAL PRIMARY KEY,
    bed_id INTEGER UNIQUE,
    room_id INTEGER,
    room_type_id INTEGER,
    bed_num VARCHAR(50),
    stu_id INTEGER,
    status INTEGER,
    create_time TIMESTAMP WITH TIME ZONE,
    update_time TIMESTAMP WITH TIME ZONE
);

-- 6. 学员表
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    stu_id INTEGER UNIQUE,
    name VARCHAR(50),
    gender VARCHAR(10),
    id_card VARCHAR(20),
    phone VARCHAR(20),
    camp_id INTEGER,
    bed_id INTEGER,
    checkin_date DATE,
    checkout_date DATE,
    diet_taboo TEXT,
    payment_status INTEGER,
    status INTEGER,
    initial_weight NUMERIC(5, 2),
    current_weight NUMERIC(5, 2),
    initial_fat_rate NUMERIC(5, 2),
    current_fat_rate NUMERIC(5, 2),
    coach_id VARCHAR(50),
    coach_name VARCHAR(50),
    create_time TIMESTAMP WITH TIME ZONE,
    update_time TIMESTAMP WITH TIME ZONE
);

-- 7. 私教课配置表 (对应 privateCourse.ts)
CREATE TABLE IF NOT EXISTS private_course_configs (
    id SERIAL PRIMARY KEY,
    course_id INTEGER UNIQUE,
    camp_id INTEGER,
    type VARCHAR(50),
    payment_type VARCHAR(100),
    price NUMERIC(10, 2),
    monthly_price NUMERIC(10, 2),
    monthly_sessions INTEGER,
    duration INTEGER,
    status INTEGER,
    create_time TIMESTAMP WITH TIME ZONE,
    update_time TIMESTAMP WITH TIME ZONE
);

-- 8. 公共课表 (对应 course.ts)
CREATE TABLE IF NOT EXISTS public_courses (
    id SERIAL PRIMARY KEY,
    course_id INTEGER UNIQUE,
    title VARCHAR(100),
    camp_id INTEGER,
    coach_id VARCHAR(50),
    schedule VARCHAR(100),
    location VARCHAR(100),
    status INTEGER,
    create_time TIMESTAMP WITH TIME ZONE,
    update_time TIMESTAMP WITH TIME ZONE
);

-- 9. 财务记录表
CREATE TABLE IF NOT EXISTS tuition (
    id SERIAL PRIMARY KEY,
    stu_id INTEGER,
    student_name VARCHAR(50),
    camp_id INTEGER,
    amount NUMERIC(10, 2),
    type VARCHAR(20),
    source VARCHAR(100),
    date DATE,
    status VARCHAR(20),
    description TEXT,
    salesperson_id VARCHAR(50),
    create_time TIMESTAMP WITH TIME ZONE,
    update_time TIMESTAMP WITH TIME ZONE
);

-- 10. 菜谱表
CREATE TABLE IF NOT EXISTS recipes (
    id VARCHAR(50) PRIMARY KEY,
    camp_id INTEGER,
    name VARCHAR(100),
    category VARCHAR(50),
    ingredients TEXT,
    instructions TEXT,
    calories INTEGER,
    protein NUMERIC(6, 2),
    carbs NUMERIC(6, 2),
    fat NUMERIC(6, 2),
    status INTEGER,
    create_time TIMESTAMP WITH TIME ZONE,
    update_time TIMESTAMP WITH TIME ZONE
);

-- 11. 私教订单表
CREATE TABLE IF NOT EXISTS stu_private_orders (
    id SERIAL PRIMARY KEY,
    stu_id INTEGER,
    order_id VARCHAR(50) UNIQUE,
    course_id INTEGER,
    course_type VARCHAR(50),
    payment_type VARCHAR(50),
    original_price NUMERIC(10, 2),
    discount_price NUMERIC(10, 2),
    total_sessions INTEGER,
    used_sessions INTEGER,
    status VARCHAR(20),
    order_time TIMESTAMP WITH TIME ZONE,
    close_time TIMESTAMP WITH TIME ZONE,
    total_price NUMERIC(10, 2),
    booking_coach VARCHAR(50),
    booking_coach_id VARCHAR(50),
    start_date DATE,
    end_date DATE,
    create_time TIMESTAMP WITH TIME ZONE,
    update_time TIMESTAMP WITH TIME ZONE
);

-- 12. 私教消课记录表
CREATE TABLE IF NOT EXISTS stu_class_records (
    id SERIAL PRIMARY KEY,
    record_id VARCHAR(50) UNIQUE,
    stu_id INTEGER,
    order_id VARCHAR(50),
    teaching_coach VARCHAR(50),
    teaching_coach_id VARCHAR(50),
    location TEXT,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    photo_url TEXT,
    create_time TIMESTAMP WITH TIME ZONE,
    update_time TIMESTAMP WITH TIME ZONE
);

-- 13. 学员体测数据表
CREATE TABLE IF NOT EXISTS stu_body_data (
    id SERIAL PRIMARY KEY,
    stu_id INTEGER,
    date DATE,
    weight NUMERIC(5, 2),
    body_fat NUMERIC(5, 2),
    waist NUMERIC(5, 2),
    hip NUMERIC(5, 2),
    chest NUMERIC(5, 2),
    bmi NUMERIC(5, 2),
    muscle_rate NUMERIC(5, 2),
    basal_metabolism INTEGER,
    photo_url TEXT,
    create_time TIMESTAMP WITH TIME ZONE,
    update_time TIMESTAMP WITH TIME ZONE
);

-- 14. 业绩目标表
CREATE TABLE IF NOT EXISTS performance_goals (
    id SERIAL PRIMARY KEY,
    camp_id INTEGER,
    coach_id VARCHAR(50),
    coach_name VARCHAR(50),
    month VARCHAR(7),
    recruitment_goal NUMERIC(12, 2),
    private_coaching_goal NUMERIC(12, 2),
    renewal_goal NUMERIC(12, 2),
    renewal_type VARCHAR(20),
    create_time TIMESTAMP WITH TIME ZONE,
    update_time TIMESTAMP WITH TIME ZONE
);

-- 15. 教练-学员关联表 (对应 coachStudent.ts)
CREATE TABLE IF NOT EXISTS coach_student_relations (
    id SERIAL PRIMARY KEY,
    camp_id INTEGER,
    coach_id VARCHAR(50),
    coach_name VARCHAR(50),
    student_id INTEGER,
    student_name VARCHAR(50),
    start_date DATE,
    end_date DATE,
    status VARCHAR(20),
    create_time TIMESTAMP WITH TIME ZONE,
    update_time TIMESTAMP WITH TIME ZONE
);
