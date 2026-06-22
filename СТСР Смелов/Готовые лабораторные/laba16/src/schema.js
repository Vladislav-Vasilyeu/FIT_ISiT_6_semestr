const { buildSchema } = require('graphql');

module.exports = buildSchema(`
  type Faculty {
    faculty: String!
    facultyName: String!
  }

  type Pulpit {
    pulpit: String!
    pulpitName: String!
    faculty: String!
  }

  type Teacher {
    teacher: String!
    teacherName: String!
    pulpit: String!
  }

  type Subject {
    subject: String!
    subjectName: String!
    pulpit: String!
  }

  type PulpitWithSubjects {
    pulpit: String!
    pulpitName: String!
    faculty: String!
    subjects: [Subject!]!
  }

  input FacultyInput {
    faculty: String!
    facultyName: String
  }

  input PulpitInput {
    pulpit: String!
    pulpitName: String
    faculty: String
  }

  input TeacherInput {
    teacher: String!
    teacherName: String
    pulpit: String
  }

  input SubjectInput {
    subject: String!
    subjectName: String
    pulpit: String
  }

  type Query {
    getFaculties(faculty: String): [Faculty!]!
    getTeachers(teacher: String): [Teacher!]!
    getPulpits(pulpit: String): [Pulpit!]!
    getSubjects(subject: String): [Subject!]!
    getTeachersByFaculty(faculty: String!): [Teacher!]!
    getSubjectsByFaculties(faculty: String!): [PulpitWithSubjects!]!
  }

  type Mutation {
    setFaculty(faculty: FacultyInput!): Faculty!
    setTeacher(teacher: TeacherInput!): Teacher!
    setPulpit(pulpit: PulpitInput!): Pulpit!
    setSubject(subject: SubjectInput!): Subject!
    delFaculty(faculty: FacultyInput!): Boolean!
    delTeacher(teacher: TeacherInput!): Boolean!
    delPulpit(pulpit: PulpitInput!): Boolean!
    delSubject(subject: SubjectInput!): Boolean!
  }
`);
