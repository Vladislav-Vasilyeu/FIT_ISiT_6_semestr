var util = require('util')
var events = require('events')

var db_data = [
	{ id: 1, name: 'Иванов И. И.', bday: '2001-01-01' },
	{ id: 2, name: 'Иванов А. А.', bday: '2001-01-02' },
	{ id: 3, name: 'Иванов О. О.', bday: '2001-01-03' },
]

function DB() {
	this.select = () => {
		return db_data
	}

	this.insert = row => {
		db_data.push(row)
	}

	this.update = row => {
		const index = db_data.findIndex(item => item.id == row.id)
		if (index === -1) {
			return false
		}

		db_data[index] = row
		return true
	}

	this.delete = id => {
		const index = db_data.findIndex(item => item.id == id)
		if (index === -1) {
			return false
		}

		const deletedRow = db_data.splice(index, 1)[0]
		return deletedRow
	}
}

util.inherits(DB, events.EventEmitter)

exports.DB = DB
