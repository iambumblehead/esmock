import chai from 'chai'
import chaiHttp from 'chai-http'
import esmock from 'esmock'

chai.use(chaiHttp)
chai.should()

const app = await esmock('../src/app.js', {
  passport: {
    use: function (bearerStrategy) {
      console.log(bearerStrategy)
    }
  }
}, {})

describe('/', () => {
  it('should work', done => {
    try {
      chai
        .request(app.default)
        .get('/')
        .end((err, res) => {
          try {
            res.should.have.status(200)
          } catch (err) {
            console.error(res.text)
            throw err
          }
          done()
        })
    } catch (e) {
      console.log(e)
    }
  })
})
