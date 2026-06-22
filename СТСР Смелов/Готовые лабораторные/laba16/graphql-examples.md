# Примеры GraphQL-запросов

Адрес сервера:

```text
http://localhost:3000/graphql
```

## Получение данных

```graphql
query {
  getFaculties {
    faculty
    facultyName
  }
}
```

```graphql
query {
  getFaculties(faculty: "ИД") {
    faculty
    facultyName
  }
}
```

```graphql
query {
  getTeachers {
    teacher
    teacherName
    pulpit
  }
}
```

```graphql
query {
  getPulpits {
    pulpit
    pulpitName
    faculty
  }
}
```

```graphql
query {
  getSubjects {
    subject
    subjectName
    pulpit
  }
}
```

```graphql
query {
  getTeachersByFaculty(faculty: "ИД") {
    teacher
    teacherName
    pulpit
  }
}
```

```graphql
query {
  getSubjectsByFaculties(faculty: "ИД") {
    pulpit
    pulpitName
    faculty
    subjects {
      subject
      subjectName
      pulpit
    }
  }
}
```

## Добавление и изменение

```graphql
mutation {
  setFaculty(faculty: { faculty: "ТСТ", facultyName: "Тестовый факультет" }) {
    faculty
    facultyName
  }
}
```

```graphql
mutation {
  setPulpit(pulpit: { pulpit: "ТК", pulpitName: "Тестовая кафедра", faculty: "ТСТ" }) {
    pulpit
    pulpitName
    faculty
  }
}
```

```graphql
mutation {
  setTeacher(teacher: { teacher: "ТЕСТ", teacherName: "Тестовый преподаватель", pulpit: "ТК" }) {
    teacher
    teacherName
    pulpit
  }
}
```

```graphql
mutation {
  setSubject(subject: { subject: "ТД", subjectName: "Тестовая дисциплина", pulpit: "ТК" }) {
    subject
    subjectName
    pulpit
  }
}
```

## Удаление

Удалять лучше в порядке зависимостей: дисциплины, преподаватели, кафедры, факультеты.

```graphql
mutation {
  delSubject(subject: { subject: "ТД" })
}
```

```graphql
mutation {
  delTeacher(teacher: { teacher: "ТЕСТ" })
}
```

```graphql
mutation {
  delPulpit(pulpit: { pulpit: "ТК" })
}
```

```graphql
mutation {
  delFaculty(faculty: { faculty: "ТСТ" })
}
```
