// This middleware runs on every request to your Pages Function
export async function onRequest(context) {
  // You can modify the request/response here if needed
  return await context.next();
}
