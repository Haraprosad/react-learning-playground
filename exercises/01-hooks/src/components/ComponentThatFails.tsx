/**
 * ComponentThatFails
 *
 * Intentionally throws an error to demonstrate ErrorBoundary functionality.
 * This component accesses a property on null, which will throw a runtime error.
 */

interface ComponentThatFailsProps {
  shouldFail?: boolean;
}

export function ComponentThatFails({
  shouldFail = true,
}: ComponentThatFailsProps) {
  if (!shouldFail) {
    return (
      <div>
        <h3>✅ Component is working normally</h3>
        <p>No errors thrown</p>
      </div>
    );
  }

  // This will throw: "Cannot read properties of null"
  const data: { property: string } | null = null;

  return (
    <div>
      <h3>This component will crash:</h3>
      <p>{data!.property}</p>
    </div>
  );
}
