import Link from "next/link";

export default function NotFound() {
  return (
    <div className="error-page">
      <h1>Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link href="/">← Go home</Link>
    </div>
  );
}