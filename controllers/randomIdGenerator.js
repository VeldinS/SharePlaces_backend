//FUNCTION FOR GENERATING RANDOM ID WHEN WORKING WITH DUMMY DATA INSTEAD OF REAL DATABASE
class Random1 {
    static generateRandomId() {
        let s4 = () => {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        const randomId = s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        return randomId;
    }
}

module.exports = Random1;