export const maxDuration = 30

export async function POST(req: Request) {
  // Client-side calls are now used instead of server-side API
  return Response.json({
    text: "This endpoint is deprecated. Please use client-side API calls.",
    modelUsed: "client-side",
    role: 'assistant'
  })
}
