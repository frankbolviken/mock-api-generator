
import { NextResponse } from 'next/server'

export const POST_RESPONSE = {
  "id": 1,
  "name": "John Doe"
}

export const GET_RESPONSE = {
  "users": [
    {
      "id": 1,
      "name": "John Doe"
    },
    {
      "id": 2,
      "name": "Jane Doe"
    }
  ]
}


export async function POST(request: Request) {
  return NextResponse.json(POST_RESPONSE)
}


export async function GET(request: Request) {
  return NextResponse.json(GET_RESPONSE)
}
