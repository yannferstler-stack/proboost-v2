'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ImporterPdfRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/dashboard/importer?mode=pdf') }, [router])
  return null
}
