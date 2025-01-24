import OpenAI from 'openai'

export const analyze = () => {
  const openai = new OpenAI({ apiKey: '111' })

  return openai
}
