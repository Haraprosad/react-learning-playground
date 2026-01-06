/**
 * ComponentThatFails
 *
 * Intentionally throws an error to demonstrate ErrorBoundary functionality.
 * This component accesses a property on null, which will throw a runtime error.
 */
export function ComponentThatFails() {
  // This will throw: "Cannot read properties of null"
  const data: { property: string } | null = null;

  return (
    <div>
      <h3>This component will crash:</h3>
      <p>{data!.property}</p>
    </div>
  );
}
