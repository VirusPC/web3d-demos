import {readdir} from 'fs/promises';
import path from 'path';

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
        {children}
    </>
  )
}

async function getData() {
  const res = await fetch('https://api.example.com/...'); //, {next: {revalidate: 10}});
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.

  // Recommendation: handle errors
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }

  return res.json();
}

