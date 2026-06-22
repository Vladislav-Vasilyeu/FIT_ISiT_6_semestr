-- 1. Создаём БД
CREATE DATABASE Lab11_Migration;
GO
USE Lab11_Migration;

-- 2. Таблица факультетов
CREATE TABLE Faculties (
    FacultyID INT IDENTITY(1,1) PRIMARY KEY,
    FacultyName NVARCHAR(100) NOT NULL,
    DeanName NVARCHAR(100),
    Budget DECIMAL(15,2) DEFAULT 0.00,
    FoundedYear INT CHECK (FoundedYear >= 1800 AND FoundedYear <= YEAR(GETDATE()))
);

-- 3. Таблица групп
CREATE TABLE Groups (
    GroupID INT IDENTITY(1,1) PRIMARY KEY,
    GroupCode NVARCHAR(20) NOT NULL UNIQUE,
    FacultyID INT NOT NULL,
    Course TINYINT DEFAULT 1 CHECK (Course >= 1 AND Course <= 6),
    CONSTRAINT FK_Groups_Faculties FOREIGN KEY (FacultyID) REFERENCES Faculties(FacultyID)
);

-- 4. Таблица студентов
CREATE TABLE Students (
    StudentID INT IDENTITY(1,1) PRIMARY KEY,
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,
    MiddleName NVARCHAR(50),
    BirthDate DATE NOT NULL,
    Email NVARCHAR(100) UNIQUE,
    Phone NVARCHAR(20),
    GroupID INT,
    GPA FLOAT CHECK (GPA >= 0 AND GPA <= 5),
    Scholarship DECIMAL(10,2) DEFAULT 0.00,
    EnrollmentDate DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Students_Groups FOREIGN KEY (GroupID) REFERENCES Groups(GroupID)
);

-- 5. Индексы
CREATE INDEX IX_Students_LastName ON Students(LastName);
CREATE INDEX IX_Students_GroupID ON Students(GroupID);

-- 6. Хранимая процедура: студенты по факультету
CREATE PROCEDURE GetStudentsByFaculty @FacultyID INT
AS
BEGIN
    SELECT s.StudentID, s.LastName, s.FirstName, g.GroupCode, f.FacultyName
    FROM Students s
    JOIN Groups g ON s.GroupID = g.GroupID
    JOIN Faculties f ON g.FacultyID = f.FacultyID
    WHERE f.FacultyID = @FacultyID
    ORDER BY s.LastName;
END;

-- 7. Функция: полное ФИО
CREATE FUNCTION GetFullName (@StudentID INT)
RETURNS NVARCHAR(152)
AS
BEGIN
    DECLARE @Result NVARCHAR(152);
    SELECT @Result = LastName + ' ' + FirstName + ISNULL(' ' + MiddleName, '')
    FROM Students WHERE StudentID = @StudentID;
    RETURN @Result;
END;

-- 8. Триггер: логирование новых студентов
CREATE TRIGGER trg_Students_LogInsert
ON Students
AFTER INSERT
AS
BEGIN
    INSERT INTO StudentLogs (ActionType, StudentID, ActionDate, Details)
    SELECT 'INSERT', i.StudentID, GETDATE(), 'Added: ' + i.LastName + ' ' + i.FirstName
    FROM inserted i;
END;

-- 9. Таблица логов (для триггера)
CREATE TABLE StudentLogs (
    LogID INT IDENTITY(1,1) PRIMARY KEY,
    ActionType NVARCHAR(20),
    StudentID INT,
    ActionDate DATETIME DEFAULT GETDATE(),
    Details NVARCHAR(255)
);

-- 10. Заполняем тестовые данные
INSERT INTO Faculties (FacultyName, DeanName, Budget, FoundedYear) VALUES
('Информационных технологий', 'Иванов И.И.', 2500000.00, 1995),
('Экономический', 'Петров П.П.', 1800000.50, 1960),
('Юридический', 'Сидоров С.С.', 1200000.00, 1980);

INSERT INTO Groups (GroupCode, FacultyID, Course) VALUES
('ИТ-101', 1, 1),
('ИТ-201', 1, 2),
('ЭК-101', 2, 1),
('ЮР-301', 3, 3);

INSERT INTO Students (FirstName, LastName, MiddleName, BirthDate, Email, Phone, GroupID, GPA, Scholarship) VALUES
('Алексей', 'Смирнов', 'Владимирович', '2005-03-15', 'smirnov@mail.ru', '+79161234567', 1, 4.5, 3000.00),
('Мария', 'Кузнецова', 'Алексеевна', '2004-07-22', 'kuznetsova@mail.ru', '+79169876543', 2, 4.8, 5000.00),
('Дмитрий', 'Попов', NULL, '2005-11-05', 'popov@mail.ru', '+79161112233', 1, 3.2, 0.00),
('Анна', 'Волкова', 'Сергеевна', '2004-01-18', 'volkova@mail.ru', '+79163334455', 3, 4.9, 5000.00),
('Иван', 'Лебедев', 'Петрович', '2003-09-30', 'lebedev@mail.ru', '+79165556677', 4, 3.7, 1500.00);