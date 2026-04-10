"use client";

export default function PrintButton() {
  return (
    <button className="button ghost" onClick={() => window.print()}>
      Print / Export PDF
    </button>
  );
}
