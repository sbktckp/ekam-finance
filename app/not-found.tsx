import Link from 'next/link'

export default function NotFound() {
  return (
    &lt;div className="min-h-screen flex items-center justify-center bg-gray-50"&gt;
      &lt;div className="text-center"&gt;
        &lt;h1 className="text-6xl font-bold text-gray-200"&gt;404&lt;/h1&gt;
        &lt;p className="text-gray-500 mt-4 mb-6"&gt;This page does not exist&lt;/p&gt;
        &lt;Link
          href="/dashboard"
          className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        &gt;
          Go to dashboard
        &lt;/Link&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  )
}
