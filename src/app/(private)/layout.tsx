import Header from '@/components/Header'

export default function PrivateLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <Header />
      {children}
    </div>
  )
}
