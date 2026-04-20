-- Supabase Schema for XRAY ML System
-- This script includes all models defined in the backend SQLAlchemy application.

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Enums
DO $$ BEGIN
    CREATE TYPE gender_enum AS ENUM ('MALE', 'FEMALE', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Tables

-- Doctors Table
CREATE TABLE IF NOT EXISTS public.doctors (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    username VARCHAR(200) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_no VARCHAR(20) NOT NULL,
    qualification VARCHAR(100) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doctors_email ON public.doctors(email);

-- Patient Portfolios Table
CREATE TABLE IF NOT EXISTS public.patient_portfolios (
    portfolio_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id INTEGER REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
    username VARCHAR(200) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    dob DATE NOT NULL,
    gender gender_enum,
    phone VARCHAR(50),
    email VARCHAR(255) UNIQUE NOT NULL,
    address TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT FALSE NOT NULL,
    otp VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_patients_username ON public.patient_portfolios(username);

-- Images Table
CREATE TABLE IF NOT EXISTS public.images (
    image_id SERIAL PRIMARY KEY,
    doctor_id INTEGER REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
    patient_name VARCHAR(200) NOT NULL,
    patient_age INTEGER,
    gender gender_enum,
    x_ray_view VARCHAR(100),
    created_date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_time TIME DEFAULT CURRENT_TIME NOT NULL
);

-- Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
    report_id SERIAL PRIMARY KEY,
    doctor_id INTEGER REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Draft' NOT NULL, -- 'Draft' or 'Finalized'
    diagnosis TEXT,
    clinical_observations TEXT,
    treatment_plan TEXT,
    additional_comments TEXT,
    created_date DATE DEFAULT CURRENT_DATE NOT NULL
);

-- Comparisons Table
CREATE TABLE IF NOT EXISTS public.comparisons (
    case_id SERIAL PRIMARY KEY,
    doctor_id INTEGER REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
    patient_name VARCHAR(200) NOT NULL,
    condition VARCHAR(200),
    disease VARCHAR(200),
    doctor_note TEXT,
    created_date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_time TIME DEFAULT CURRENT_TIME NOT NULL
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    review_id SERIAL PRIMARY KEY,
    doctor_id INTEGER REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES public.patient_portfolios(portfolio_id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    rating INTEGER,
    created_date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_time TIME DEFAULT CURRENT_TIME NOT NULL
);

-- User OTPs Table (Internal/System Auth)
CREATE TABLE IF NOT EXISTS public.user_otps (
    email VARCHAR(255) PRIMARY KEY,
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_otps_email ON public.user_otps(email);