import { describe, it } from "node:test"
import { equal } from "node:assert/strict"
import esmock from "esmock"

describe("Example", async () => {
  it("Mocks scoped module", async () => {
    const { example } = await esmock(
      "../src/example.js",
      import.meta.url,
      {
        "@nestjs/core": {
          NestFactory: {
            create: async () => 'mocked'
          }
        }
      }
    )

    equal(await example(), 'mocked')
  })
})
