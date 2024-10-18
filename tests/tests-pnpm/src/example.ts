import { NestFactory } from "@nestjs/core"

export const example = async () => {
  const test = await NestFactory.create({} as any)
  console.log(test)
}
