// No layout for certificate pages — they are standalone public HTML documents
export default function CertificateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
