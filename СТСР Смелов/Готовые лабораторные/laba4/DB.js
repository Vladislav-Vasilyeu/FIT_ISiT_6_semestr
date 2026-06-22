const EventEmitter = require('events');
const { resolve } = require('path');

class DB extends EventEmitter {
    constructor(){
        super();
        this.data = [
            {id: 1, name: 'Иванов И.И.', bday: '2001-01-01'},
            {id: 2, name: 'Петров П. П.', bday: '2001-01-03'},
            {id: 3, name: 'Сидоров С. С.', bday: '2001-01-02'}
        ]
        this.nextId = 4;
    }
    async select()  {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.emit('GET', this.data);
                resolve([...this.data]);
            }, 10);
        });
    }
    async insert(row){
        return new Promise( (resolve) => {
            setTimeout( () => {
                const newRow = {
                    id: this.nextId++,
                    name: row.name,
                    bday: row.bday
                };
                this.data.push(newRow);
                this.emit('POST', newRow);
                resolve(newRow);
            }, 10);
        });
    }
    async update(row){
        return new Promise( (resolve, reject) => {
            setTimeout( () => {
                const index = this.data.findIndex(item => item.id === row.id);
                if (index === -1) {
                    reject(new Error(`Запись с id=${row.id} не найдена`));
                    return;
                }
                this.data[index] = { ...row };
                this.emit('PUT', this.data[index]);
                resolve(this.data[index]);
            }, 10);
        });
    }
    async delete(id){
        return new Promise( (resolve, reject) => {
            setTimeout( () => {
                const index = this.data.findIndex(item => item.id === id);
                if (index === -1) {
                    reject(new Error(`Запись с id=${id} не найдена`));
                    return;
                }
                const deletedRow = this.data.splice(index, 1)[0];
                this.emit('DELETE', deletedRow);
                resolve(deletedRow);
            }, 10);
        });
    }
}
module.exports = DB;