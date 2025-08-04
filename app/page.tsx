import { redirect } from 'next/navigation'

export default async function HomePage() {
  // Since we're using client-side authentication with localStorage,
  // we'll redirect to login and let the client handle the auth check
  redirect('/login')
}
