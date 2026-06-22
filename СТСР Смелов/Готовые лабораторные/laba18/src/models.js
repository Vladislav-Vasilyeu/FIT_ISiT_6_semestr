const { DataTypes } = require('sequelize');
const { sequelize } = require('./db');

const Faculty = sequelize.define('FACULTY', {
  FACULTY: {
    type: DataTypes.STRING(10),
    primaryKey: true,
    allowNull: false
  },
  FACULTY_NAME: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
});

const Pulpit = sequelize.define('PULPIT', {
  PULPIT: {
    type: DataTypes.STRING(20),
    primaryKey: true,
    allowNull: false
  },
  PULPIT_NAME: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  FACULTY: {
    type: DataTypes.STRING(10),
    allowNull: false
  }
});

const Subject = sequelize.define('SUBJECT', {
  SUBJECT: {
    type: DataTypes.STRING(20),
    primaryKey: true,
    allowNull: false
  },
  SUBJECT_NAME: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  PULPIT: {
    type: DataTypes.STRING(20),
    allowNull: false
  }
});

const AuditoriumType = sequelize.define('AUDITORIUM_TYPE', {
  AUDITORIUM_TYPE: {
    type: DataTypes.STRING(20),
    primaryKey: true,
    allowNull: false
  },
  AUDITORIUM_TYPENAME: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
});

const Auditorium = sequelize.define('AUDITORIUM', {
  AUDITORIUM: {
    type: DataTypes.STRING(20),
    primaryKey: true,
    allowNull: false
  },
  AUDITORIUM_NAME: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  AUDITORIUM_CAPACITY: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  AUDITORIUM_TYPE: {
    type: DataTypes.STRING(20),
    allowNull: false
  }
});

Faculty.hasMany(Pulpit, { foreignKey: 'FACULTY', as: 'pulpits' });
Pulpit.belongsTo(Faculty, { foreignKey: 'FACULTY', as: 'facultyData' });

Pulpit.hasMany(Subject, { foreignKey: 'PULPIT', as: 'subjects' });
Subject.belongsTo(Pulpit, { foreignKey: 'PULPIT', as: 'pulpitData' });

AuditoriumType.hasMany(Auditorium, { foreignKey: 'AUDITORIUM_TYPE', as: 'auditoriums' });
Auditorium.belongsTo(AuditoriumType, { foreignKey: 'AUDITORIUM_TYPE', as: 'auditoriumTypeData' });

module.exports = {
  sequelize,
  models: {
    Faculty,
    Pulpit,
    Subject,
    AuditoriumType,
    Auditorium
  }
};
