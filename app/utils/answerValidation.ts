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