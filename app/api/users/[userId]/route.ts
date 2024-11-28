
import { NextResponse } from 'next/server'

export const GET_RESPONSE = {
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com"
}


export async function GET({ params }: { params: { userId: string } }) {
  return NextResponse.json(GET_RESPONSE)
}
