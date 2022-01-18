var request = require('request')

describe("calc", () => {
    it("should Multiply 2 and 2", () => {
        expect(2*2).toBe(4)
    })
})

describe("get messages", () => {
    it("return status 200", (done) => { //debemos usar done para cuando son asincronas
        request.get("http://localhost:3000/messages", (err, res) => {
            let result = res.statusCode
            expect(result).toEqual(200)
            done()
        })
    })
})
