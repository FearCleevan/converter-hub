const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function mockConvert(
  file: File,
  outputFormat: string,
  onProgress: (phase: "upload" | "convert", pct: number) => void
): Promise<{ filename: string; size: number; blobUrl: string }> {
  // Upload phase: 0→50% over ~660ms
  for (let i = 0; i <= 10; i++) {
    await delay(60);
    onProgress("upload", i * 5);
  }

  // Convert phase: 50→99% over ~1320ms
  for (let i = 0; i <= 10; i++) {
    await delay(120);
    onProgress("convert", 50 + i * 4.9);
  }

  const stem = file.name.replace(/\.[^.]+$/, "");
  return {
    filename: `${stem}.${outputFormat}`,
    size: Math.round(file.size * 0.72),
    blobUrl: "#mock",
  };
}
