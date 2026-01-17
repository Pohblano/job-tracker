// Entry point redirects to /tv to honor the TV-first product focus.
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/tv')
}
