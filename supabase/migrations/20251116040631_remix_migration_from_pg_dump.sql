--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



SET default_table_access_method = heap;

--
-- Name: site_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    cpf text NOT NULL,
    whatsapp text,
    upsell_added boolean DEFAULT false,
    total_value numeric(10,2) DEFAULT 67.00 NOT NULL,
    status text DEFAULT 'pending'::text,
    pix_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: upsell_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.upsell_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text DEFAULT 'Oferta Especial: Consultoria Individual 1h'::text NOT NULL,
    description text DEFAULT 'Tenha 1 sessão por semana, com cronograma de dieta e rotina 100% personalizado.'::text NOT NULL,
    price text DEFAULT '197,00'::text NOT NULL,
    original_price text DEFAULT '297,00'::text NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    image_url text DEFAULT 'https://via.placeholder.com/80x80'::text,
    "order" integer DEFAULT 1,
    active boolean DEFAULT true
);


--
-- Name: site_config site_config_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_config
    ADD CONSTRAINT site_config_key_key UNIQUE (key);


--
-- Name: site_config site_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_config
    ADD CONSTRAINT site_config_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: upsell_config upsell_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.upsell_config
    ADD CONSTRAINT upsell_config_pkey PRIMARY KEY (id);


--
-- Name: idx_transactions_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transactions_created_at ON public.transactions USING btree (created_at);


--
-- Name: idx_transactions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transactions_status ON public.transactions USING btree (status);


--
-- Name: site_config Permitir atualização pública de configurações; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Permitir atualização pública de configurações" ON public.site_config FOR UPDATE USING (true);


--
-- Name: upsell_config Permitir atualização pública de configurações; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Permitir atualização pública de configurações" ON public.upsell_config FOR UPDATE TO anon USING (true);


--
-- Name: transactions Permitir atualização pública de transações; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Permitir atualização pública de transações" ON public.transactions FOR UPDATE TO anon USING (true);


--
-- Name: site_config Permitir inserção pública de configurações; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Permitir inserção pública de configurações" ON public.site_config FOR INSERT WITH CHECK (true);


--
-- Name: transactions Permitir inserção pública de transações; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Permitir inserção pública de transações" ON public.transactions FOR INSERT TO anon WITH CHECK (true);


--
-- Name: site_config Permitir leitura pública de configurações; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Permitir leitura pública de configurações" ON public.site_config FOR SELECT USING (true);


--
-- Name: upsell_config Permitir leitura pública de configurações; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Permitir leitura pública de configurações" ON public.upsell_config FOR SELECT TO anon USING (true);


--
-- Name: transactions Permitir leitura pública de transações; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Permitir leitura pública de transações" ON public.transactions FOR SELECT TO anon USING (true);


--
-- Name: site_config; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

--
-- Name: transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: upsell_config; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.upsell_config ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


