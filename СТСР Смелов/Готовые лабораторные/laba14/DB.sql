-- =============================================
-- 1. FACULTY (Факультет)
-- =============================================
CREATE TABLE FACULTY (
    FACULTY       VARCHAR(10)  NOT NULL PRIMARY KEY,
    FACULTY_NAME  NVARCHAR(100) NOT NULL
);
GO

-- =============================================
-- 2. PULPIT (Кафедра)
-- =============================================
CREATE TABLE PULPIT (
    PULPIT       VARCHAR(10)  NOT NULL PRIMARY KEY,
    PULPIT_NAME  NVARCHAR(100) NOT NULL,
    FACULTY      VARCHAR(10)  NOT NULL,
    
    CONSTRAINT FK_PULPIT_FACULTY FOREIGN KEY (FACULTY) 
        REFERENCES FACULTY(FACULTY)
        ON DELETE CASCADE
);
GO

-- =============================================
-- 3. SUBJECT (Дисциплина)
-- =============================================
CREATE TABLE SUBJECT (
    SUBJECT       VARCHAR(10)  NOT NULL PRIMARY KEY,
    SUBJECT_NAME  NVARCHAR(150) NOT NULL,
    PULPIT        VARCHAR(10)  NOT NULL,
    
    CONSTRAINT FK_SUBJECT_PULPIT FOREIGN KEY (PULPIT) 
        REFERENCES PULPIT(PULPIT)
        ON DELETE CASCADE
);
GO

-- =============================================
-- 4. AUDITORIUM_TYPE (Тип аудитории)
-- =============================================
CREATE TABLE AUDITORIUM_TYPE (
    AUDITORIUM_TYPE    VARCHAR(10)  NOT NULL PRIMARY KEY,
    AUDITORIUM_TYPENAME NVARCHAR(50) NOT NULL
);
GO

-- =============================================
-- 5. AUDITORIUM (Аудитория)
-- =============================================
CREATE TABLE AUDITORIUM (
    AUDITORIUM          VARCHAR(10) NOT NULL PRIMARY KEY,
    AUDITORIUM_NAME     NVARCHAR(50) NOT NULL,
    AUDITORIUM_CAPACITY INT         NOT NULL,
    AUDITORIUM_TYPE     VARCHAR(10) NOT NULL,
    
    CONSTRAINT FK_AUDITORIUM_TYPE FOREIGN KEY (AUDITORIUM_TYPE) 
        REFERENCES AUDITORIUM_TYPE(AUDITORIUM_TYPE)
        ON DELETE NO ACTION
);
GO

-- =============================================
-- (Опционально) TEACHER — если нужно
-- =============================================
CREATE TABLE TEACHER (
    TEACHER       VARCHAR(10)  NOT NULL PRIMARY KEY,
    TEACHER_NAME  NVARCHAR(100) NOT NULL,
    PULPIT        VARCHAR(10)  NOT NULL,
    
    CONSTRAINT FK_TEACHER_PULPIT FOREIGN KEY (PULPIT) 
        REFERENCES PULPIT(PULPIT)
        ON DELETE CASCADE
);
GO

PRINT 'База данных и таблицы успешно созданы!';


-- =============================================
-- 1. FACULTY (Факультеты)
-- =============================================
INSERT INTO FACULTY (FACULTY, FACULTY_NAME) VALUES
('ИТ', 'Факультет информационных технологий'),
('ЭК', 'Факультет экономики'),
('МТ', 'Факультет математики и технологий'),
('ПС', 'Факультет прикладной математики');
GO

-- =============================================
-- 2. PULPIT (Кафедры)
-- =============================================
INSERT INTO PULPIT (PULPIT, PULPIT_NAME, FACULTY) VALUES
('ИТиС', 'Кафедра информационных технологий и систем', 'ИТ'),
('ПОИТ', 'Кафедра программного обеспечения информационных технологий', 'ИТ'),
('ИСиТ', 'Кафедра интеллектуальных систем и технологий', 'ИТ'),
('ЭиФ', 'Кафедра экономики и финансов', 'ЭК'),
('ВМ', 'Кафедра высшей математики', 'МТ');
GO

-- =============================================
-- 3. SUBJECT (Дисциплины)
-- =============================================
INSERT INTO SUBJECT (SUBJECT, SUBJECT_NAME, PULPIT) VALUES
('БД', 'Базы данных', 'ПОИТ'),
('ПРОГ', 'Программирование на Java', 'ПОИТ'),
('ВЕБ', 'Web-технологии', 'ИТиС'),
('ОС', 'Операционные системы', 'ИТиС'),
('ИИ', 'Искусственный интеллект', 'ИСиТ'),
('ЭКОН', 'Экономика предприятия', 'ЭиФ'),
('МАТ', 'Математический анализ', 'ВМ');
GO

-- =============================================
-- 4. AUDITORIUM_TYPE (Типы аудиторий)
-- =============================================
INSERT INTO AUDITORIUM_TYPE (AUDITORIUM_TYPE, AUDITORIUM_TYPENAME) VALUES
('ЛК', 'Лекционная'),
('ПР', 'Практическая'),
('ЛБ', 'Лабораторная'),
('КМП', 'Компьютерный класс'),
('СПОРТ', 'Спортивный зал');
GO

-- =============================================
-- 5. AUDITORIUM (Аудитории)
-- =============================================
INSERT INTO AUDITORIUM (AUDITORIUM, AUDITORIUM_NAME, AUDITORIUM_CAPACITY, AUDITORIUM_TYPE) VALUES
('101', '101а (Большая лекционная)', 120, 'ЛК'),
('102', '102 (Компьютерный класс)', 25, 'КМП'),
('201', '201 (Лаборатория программирования)', 20, 'ЛБ'),
('202', '202 (Практическая)', 30, 'ПР'),
('301', '301 (Лекционная)', 80, 'ЛК'),
('А1', 'Спортивный зал А1', 50, 'СПОРТ');
GO

-- =============================================
-- 6. TEACHER (Преподаватели) — опционально, но рекомендуется
-- =============================================
INSERT INTO TEACHER (TEACHER, TEACHER_NAME, PULPIT) VALUES
('СИД', 'Сидоров Иван Петрович', 'ПОИТ'),
('ИВН', 'Иванов Алексей Сергеевич', 'ПОИТ'),
('ПЕТ', 'Петрова Анна Викторовна', 'ИТиС'),
('КЗЛ', 'Козлов Дмитрий Александрович', 'ИСиТ'),
('СМИ', 'Смирнова Ольга Николаевна', 'ЭиФ');
GO

PRINT '✅ Данные успешно добавлены!';
