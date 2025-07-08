import Constants from "./constants"
import { getToken } from "./token"

export async function validateFreeText(question: string, answer: string) {
  const token = await getToken()
  
  const response = await fetch(`${Constants.api}/api/ai/validate-answer/free-text`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question: question,
      answer: answer
    })
  })

  const result = await response.json()
  return result.correct
}

export async function validateTranslation(text: string, translation: string, from_language: string, to_language: string) {
  const token = await getToken()

  const response = await fetch(`${Constants.api}/api/ai/validate-answer/translation`, {
   method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: text,
      translation: translation,
      from_language: from_language,
      to_language: to_language 
    }) 
  })

  const result = await response.json()
  console.log(result)
  return result.correct
}