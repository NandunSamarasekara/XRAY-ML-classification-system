-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.doctors (
  id integer NOT NULL DEFAULT nextval('doctors_id_seq'::regclass),
  first_name character varying NOT NULL,
  last_name character varying NOT NULL,
  username character varying NOT NULL UNIQUE,
  email character varying NOT NULL,
  phone_no character varying NOT NULL,
  qualification character varying NOT NULL,
  hashed_password character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT doctors_pkey PRIMARY KEY (id)
);
CREATE TABLE public.reviews (
  id integer NOT NULL DEFAULT nextval('reviews_id_seq'::regclass),
  doctor_id integer NOT NULL,
  review_type character varying NOT NULL,
  rating integer NOT NULL,
  review_text text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id)
);
CREATE TABLE public.user_otps (
  email character varying NOT NULL,
  otp_code character varying NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_otps_pkey PRIMARY KEY (email)
);