import * as React from 'react';
import { Counter } from 'features/counter/Counter';

export default function Home() {
  return (
    <main style={{ padding: '1rem 0' }}>
      <h2>Home</h2>
      <Counter />
    </main>
  );
}
