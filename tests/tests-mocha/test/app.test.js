import chai from 'chai'
import chaiHttp from 'chai-http'
import esmock from 'esmock'

chai.use(chaiHttp)
chai.should()

const app = await esmock('../src/app.js', {
  passport: {
    use: bearerStrategy => `mocked${bearerStrategy}`
  }
}, {})

describe('/', () => {
  it('should work', done => {
    try {
      chai
        .request(app.default)
        .get('/')
        .end((err, res) => {
          app.close()
          res.should.have.status(200)
        })
      done()
    } catch (e) {
      console.log(e)
    }
  })
})
